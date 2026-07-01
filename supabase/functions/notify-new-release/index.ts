// Admin-only. Emails every customer + newsletter subscriber about a new
// release (or a coming-soon title) using the branded templates, then logs it.
import { serviceClient, sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { newReleaseEmail, comingSoonEmail } from "../_shared/email-templates.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = serviceClient();

    // Verify caller is an admin.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const uid = userData?.user?.id;
    if (!uid) return json({ error: "Unauthorized" }, 401);
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", uid).single();
    if (prof?.role !== "admin") return json({ error: "Admin only" }, 403);

    const { bookId, type } = await req.json(); // type: 'new_release' | 'coming_soon'
    const { data: book, error: bookErr } = await supabase
      .from("books").select("*").eq("id", bookId).single();
    if (bookErr || !book) return json({ error: "Book not found" }, 404);

    // Recipients: confirmed subscribers + all customer accounts (deduped).
    const [{ data: subs }, { data: profiles }] = await Promise.all([
      supabase.from("newsletter_subscribers").select("email").eq("unsubscribed", false),
      supabase.from("profiles").select("email").eq("role", "customer"),
    ]);
    const emails = Array.from(new Set([
      ...(subs ?? []).map((s) => s.email),
      ...(profiles ?? []).map((p) => p.email),
    ].filter(Boolean)));

    const tpl = type === "coming_soon" ? comingSoonEmail(book) : newReleaseEmail(book);

    // Send in small batches to stay friendly to rate limits.
    let sent = 0;
    for (let i = 0; i < emails.length; i += 40) {
      const batch = emails.slice(i, i + 40);
      await Promise.allSettled(
        batch.map((to) => sendEmail({ to, subject: tpl.subject, html: tpl.html })),
      );
      sent += batch.length;
    }

    await supabase.from("broadcasts").insert({
      type, book_id: bookId, subject: tpl.subject, recipients: sent,
    });

    return json({ ok: true, recipients: sent });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
