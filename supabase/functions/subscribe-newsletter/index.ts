import { serviceClient, sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { newsletterWelcomeEmail } from "../_shared/email-templates.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { email, name } = await req.json();
    if (!email) return json({ error: "Email is required" }, 400);

    const supabase = serviceClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, name, unsubscribed: false }, { onConflict: "email" });
    if (error) throw error;

    const { subject, html } = newsletterWelcomeEmail(name);
    await sendEmail({ to: email, subject, html });
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
