import { serviceClient, sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { contactAdminEmail, contactAutoReplyEmail } from "../_shared/email-templates.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) return json({ error: "Missing fields" }, 400);

    const supabase = serviceClient();
    await supabase.from("contact_messages").insert({ name, email, subject, message });

    const inbox = Deno.env.get("CONTACT_INBOX") ?? "kellyinkspired@gmail.com";
    const admin = contactAdminEmail({ name, email, subject, message });
    await sendEmail({ to: inbox, subject: admin.subject, html: admin.html, replyTo: email });

    const reply = contactAutoReplyEmail(name);
    await sendEmail({ to: email, subject: reply.subject, html: reply.html });

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
