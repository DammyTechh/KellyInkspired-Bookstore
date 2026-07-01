// Supabase Auth "Send Email" hook (HTTPS type).
// Renders our branded OTP template and delivers it through Resend, so customers
// get a styled passwordless code instead of Supabase's default email.
//
// Setup:
//   1. Deploy:  supabase functions deploy send-auth-email
//   2. Auth -> Hooks -> Send Email hook -> HTTPS
//        URL:    https://<project>.supabase.co/functions/v1/send-auth-email
//        Secret: the value Supabase generates (starts with v1,whsec_...)
//   3. Store that same secret so this function can verify the request:
//        supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_xxxxx"
//
// The hook signs requests using the Standard Webhooks scheme. We verify the
// signature when the secret is configured; if it isn't set, we skip verification
// (handy for a first test, but set it for production).
import { sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { otpEmail } from "../_shared/email-templates.ts";

// Verify a Standard Webhooks signature.
// Header "webhook-signature" looks like: "v1,<base64sig> v1,<base64sig>"
// Signed content is: `${id}.${timestamp}.${body}` using the base64 secret
// (the part after "whsec_").
async function verifySignature(
  secret: string, id: string, timestamp: string, body: string, sigHeader: string,
): Promise<boolean> {
  try {
    const base64Secret = secret.replace(/^v1,?whsec_/, "").replace(/^whsec_/, "");
    const keyBytes = Uint8Array.from(atob(base64Secret), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const signed = `${id}.${timestamp}.${body}`;
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
    const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
    // The header may carry multiple space-separated signatures; accept any match.
    return sigHeader.split(" ").some((part) => {
      const value = part.includes(",") ? part.split(",")[1] : part;
      return value === expected;
    });
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const raw = await req.text();
    const secret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

    if (secret) {
      const id = req.headers.get("webhook-id") ?? "";
      const ts = req.headers.get("webhook-timestamp") ?? "";
      const sig = req.headers.get("webhook-signature") ?? "";
      const ok = await verifySignature(secret, id, ts, raw, sig);
      if (!ok) return json({ error: "Invalid signature" }, 401);
    }

    const payload = JSON.parse(raw);
    // Payload shape: { user, email_data: { token, token_hash, email_action_type, ... } }
    const email = payload?.user?.email;
    const token = payload?.email_data?.token;
    if (!email || !token) return json({ error: "Invalid hook payload" }, 400);

    const { subject, html } = otpEmail(token);
    await sendEmail({ to: email, subject, html });

    // Returning an empty object tells Auth the email was handled by us.
    return json({});
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
