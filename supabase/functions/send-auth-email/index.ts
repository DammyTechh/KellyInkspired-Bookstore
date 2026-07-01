// Supabase Auth "Send Email" hook (HTTPS type).
// Renders our branded OTP template and delivers it through Resend.
//
// Setup:
//   1. Deploy WITHOUT jwt verification (the hook calls us with a signature,
//      not a user token):
//        supabase functions deploy send-auth-email --no-verify-jwt
//   2. Auth -> Hooks -> Send Email hook -> HTTPS
//        URL:    https://<project>.supabase.co/functions/v1/send-auth-email
//        Secret: the value Supabase shows (starts with v1,whsec_...)
//   3. Store that same secret so we can verify the request:
//        supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_xxxxx"
//      (If SEND_EMAIL_HOOK_SECRET is unset, verification is skipped — handy to
//       isolate problems during first setup.)
import { sendEmail, json, corsHeaders } from "../_shared/utils.ts";
import { otpEmail } from "../_shared/email-templates.ts";

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
    return sigHeader.split(" ").some((part) => {
      const value = part.includes(",") ? part.split(",")[1] : part;
      return value === expected;
    });
  } catch (e) {
    console.error("signature verify threw:", String(e));
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
      if (!ok) {
        console.error("Signature check FAILED. Check SEND_EMAIL_HOOK_SECRET matches the hook's secret.");
        return json({ error: "Invalid signature" }, 401);
      }
    } else {
      console.log("No SEND_EMAIL_HOOK_SECRET set — skipping signature verification.");
    }

    const payload = JSON.parse(raw);
    const email = payload?.user?.email;
    const token = payload?.email_data?.token;
    console.log("hook invoked:", {
      hasEmail: !!email,
      hasToken: !!token,
      action: payload?.email_data?.email_action_type,
    });

    if (!email || !token) {
      console.error("Unexpected payload shape:", JSON.stringify(payload).slice(0, 500));
      return json({ error: "Invalid hook payload" }, 400);
    }

    const { subject, html } = otpEmail(token);
    try {
      await sendEmail({ to: email, subject, html });
    } catch (e) {
      console.error("Resend send FAILED:", String(e));
      return json({ error: "Email send failed", detail: String(e) }, 500);
    }

    console.log("OTP email sent to", email);
    return json({});
  } catch (e) {
    console.error("hook error:", String(e));
    return json({ error: String(e) }, 500);
  }
});
