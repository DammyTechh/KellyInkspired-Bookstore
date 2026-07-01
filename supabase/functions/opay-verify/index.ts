import { serviceClient, sendEmail, json, corsHeaders, hmacSha512 } from "../_shared/utils.ts";
import { orderReceiptEmail } from "../_shared/email-templates.ts";

/**
 * Opay International Cashier — query payment status.
 *
 * Required secrets:
 *   OPAY_SECRET_KEY    — private key (OPAYPRV...), used to sign backend requests
 *   OPAY_MERCHANT_ID   — your merchant id
 *   OPAY_BASE_URL      — sandbox / live base url (same as opay-init)
 *
 * The status call is authenticated with an HMAC-SHA512 signature of the JSON body,
 * created with your private/secret key, sent as `Authorization: Bearer <signature>`.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const secretKey = Deno.env.get("OPAY_SECRET_KEY");
    const merchantId = Deno.env.get("OPAY_MERCHANT_ID");
    const baseUrl = Deno.env.get("OPAY_BASE_URL") ?? "https://sandboxapi.opaycheckout.com";
    if (!secretKey || !merchantId) {
      return json({ error: "OPAY_SECRET_KEY / OPAY_MERCHANT_ID not set" }, 500);
    }

    const supabase = serviceClient();
    const { reference } = await req.json();
    if (!reference) return json({ error: "reference required" }, 400);

    const { data: order } = await supabase.from("orders").select("*").eq("id", reference).single();
    if (!order) return json({ error: "Order not found" }, 404);

    const payload = {
      country: "NG",
      reference,                                   // our merchant reference (order id)
      orderNo: order.payment_reference ?? reference, // Opay's order number saved at init
    };
    const bodyStr = JSON.stringify(payload);
    const signature = await hmacSha512(bodyStr, secretKey);

    const res = await fetch(`${baseUrl}/api/v1/international/cashier/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${signature}`,
        MerchantId: merchantId,
        "Content-Type": "application/json",
      },
      body: bodyStr,
    });
    const result = await res.json();
    const status = String(result?.data?.status ?? "").toUpperCase();
    const ok = result?.code === "00000" && (status === "SUCCESS" || status === "SUCCESSFUL");

    if (!ok) {
      // Leave pending if Opay still reports pending; otherwise mark failed.
      const newStatus = status === "PENDING" || status === "INITIAL" ? "pending" : "failed";
      await supabase.from("orders").update({ status: newStatus }).eq("id", reference);
      return json({ status: newStatus === "pending" ? "pending" : "failed" });
    }

    await supabase.from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", reference);

    // Build receipt with download links.
    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", reference);
    const withLinks = await Promise.all((items ?? []).map(async (it) => {
      let download_url: string | undefined;
      if (it.book_id) {
        const { data: book } = await supabase.from("books").select("download_url").eq("id", it.book_id).single();
        download_url = book?.download_url ?? undefined;
      }
      return { title: it.title, price: Number(it.price), quantity: it.quantity, download_url };
    }));

    const tpl = orderReceiptEmail({ reference, total: Number(order.total), items: withLinks });
    await sendEmail({ to: order.email, subject: tpl.subject, html: tpl.html });

    return json({ status: "paid" });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
