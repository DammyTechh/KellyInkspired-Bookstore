import { serviceClient, json, corsHeaders } from "../_shared/utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) return json({ error: "PAYSTACK_SECRET_KEY not set" }, 500);

    const supabase = serviceClient();
    const authHeader = req.headers.get("Authorization") ?? "";
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { items, callbackUrl } = await req.json();
    // items: [{ book_id, title, price, quantity }]
    if (!Array.isArray(items) || items.length === 0) return json({ error: "Empty cart" }, 400);

    const total = items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ user_id: user.id, email: user.email, subtotal: total, total,
                currency: "NGN", payment_provider: "paystack", status: "pending" })
      .select().single();
    if (orderErr) throw orderErr;

    await supabase.from("order_items").insert(
      items.map((it) => ({ order_id: order.id, book_id: it.book_id,
                           title: it.title, price: it.price, quantity: it.quantity })),
    );

    const init = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(total * 100),       // kobo
        currency: "NGN",
        reference: order.id,
        callback_url: callbackUrl,
        metadata: { order_id: order.id },
      }),
    });
    const result = await init.json();
    if (!result.status) return json({ error: result.message ?? "Init failed" }, 400);

    await supabase.from("orders").update({ payment_reference: result.data.reference })
      .eq("id", order.id);

    return json({ authorization_url: result.data.authorization_url,
                  reference: result.data.reference, order_id: order.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
