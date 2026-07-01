import { serviceClient, sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { orderReceiptEmail } from "../_shared/email-templates.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secret) return json({ error: "PAYSTACK_SECRET_KEY not set" }, 500);
    const supabase = serviceClient();

    const { reference } = await req.json();
    if (!reference) return json({ error: "reference required" }, 400);

    const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const result = await verify.json();
    const ok = result?.data?.status === "success";

    const { data: order } = await supabase.from("orders").select("*").eq("id", reference).single();
    if (!order) return json({ error: "Order not found" }, 404);

    if (!ok) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", reference);
      return json({ status: "failed" });
    }

    await supabase.from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", reference);

    // Attach download links to each item for the receipt.
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
