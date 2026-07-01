import { serviceClient, json, corsHeaders } from "../_shared/utils.ts";

/**
 * Opay International Cashier — create checkout.
 * Docs: https://documentation.opaycheckout.com  (Cashier / Checkout product)
 *
 * Required secrets (set with `supabase secrets set ...`):
 *   OPAY_PUBLIC_KEY    — public key (OPAYPUB...), used as Bearer for the create call
 *   OPAY_MERCHANT_ID   — your merchant id
 *   OPAY_BASE_URL      — https://sandboxapi.opaycheckout.com  (test)
 *                        https://liveapi.opaycheckout.com      (live)
 *
 * Returns { authorization_url, reference, order_id } — same shape as paystack-init,
 * so the frontend handles both providers identically.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const publicKey = Deno.env.get("OPAY_PUBLIC_KEY");
    const merchantId = Deno.env.get("OPAY_MERCHANT_ID");
    const baseUrl = Deno.env.get("OPAY_BASE_URL") ?? "https://sandboxapi.opaycheckout.com";
    if (!publicKey || !merchantId) {
      return json({ error: "OPAY_PUBLIC_KEY / OPAY_MERCHANT_ID not set" }, 500);
    }

    const supabase = serviceClient();
    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { items, callbackUrl } = await req.json();
    if (!Array.isArray(items) || items.length === 0) return json({ error: "Empty cart" }, 400);

    const total = items.reduce(
      (s: number, it: { price: number; quantity: number }) =>
        s + Number(it.price) * Number(it.quantity),
      0,
    );

    // Create the pending order first (reference = order id).
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id, email: user.email, subtotal: total, total,
        currency: "NGN", payment_provider: "opay", status: "pending",
      })
      .select().single();
    if (orderErr) throw orderErr;

    const productName = items.length === 1 ? items[0].title : `KellyInkspired order (${items.length} items)`;

    const body = {
      country: "NG",
      reference: order.id,                 // our merchant reference
      amount: { total: Math.round(total * 100), currency: "NGN" }, // minor units (kobo)
      returnUrl: callbackUrl,              // browser comes back here
      callbackUrl,                         // server-to-server notify (optional)
      cancelUrl: callbackUrl,
      expireAt: 30,                        // minutes
      userInfo: {
        userEmail: user.email,
        userId: user.id,
        userName: (user.user_metadata?.full_name as string) ?? user.email,
        userMobile: "",
      },
      product: { name: productName, description: productName },
      payMethod: "",                       // empty = let Opay show all methods
    };

    const res = await fetch(`${baseUrl}/api/v1/international/cashier/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${publicKey}`,
        MerchantId: merchantId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result = await res.json();

    // Opay success code is "00000".
    if (result?.code !== "00000" || !result?.data?.cashierUrl) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return json({ error: result?.message ?? "Opay init failed", detail: result }, 400);
    }

    // Save Opay's orderNo so the verify step can query status.
    await supabase.from("orders")
      .update({ payment_reference: result.data.orderNo ?? order.id })
      .eq("id", order.id);

    return json({
      authorization_url: result.data.cashierUrl,
      reference: order.id,
      order_id: order.id,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
