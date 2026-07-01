// ============================================================================
// KellyInkspired — Transactional email templates (peach / rose brand)
// Imported by the edge functions. Every template shares one responsive,
// email-client-safe layout (inline styles, table-based where it matters).
// ============================================================================

const BRAND = {
  name: "KellyInkspired",
  tagline: "Stories that inspire faith, purpose & growth",
  peach: "#ef6c3d",
  peachDark: "#e0552a",
  rose: "#ec4899",
  cream: "#fff5f0",
  ink: "#3a2a23",
  muted: "#8a7a72",
  site: Deno.env.get("SITE_URL") ?? "https://kellyinkspired.com",
  instagram: "https://www.instagram.com/truth.by.lens",
  facebook: "https://www.facebook.com/share/1JJbXGHFPz/",
  whatsapp: "https://wa.me/2347048475128",
  email: "kellyinkspired@gmail.com",
};

function layout(opts: { preheader?: string; heading: string; body: string; footerNote?: string }) {
  const { preheader = "", heading, body, footerNote = "" } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(239,108,61,0.12);">
        <!-- header -->
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.peach} 0%,${BRAND.rose} 100%);padding:30px 36px;">
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:.3px;">${BRAND.name}</div>
            <div style="font-size:13px;color:#ffe9df;margin-top:4px;">${BRAND.tagline}</div>
          </td>
        </tr>
        <!-- body -->
        <tr>
          <td style="padding:36px 36px 12px 36px;">
            <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:${BRAND.ink};">${heading}</h1>
            ${body}
          </td>
        </tr>
        <!-- socials -->
        <tr>
          <td style="padding:8px 36px 28px 36px;">
            <div style="border-top:1px solid #f2e3da;padding-top:18px;font-size:13px;color:${BRAND.muted};">
              Stay connected:
              <a href="${BRAND.instagram}" style="color:${BRAND.peachDark};text-decoration:none;font-weight:600;">Instagram</a> &nbsp;·&nbsp;
              <a href="${BRAND.facebook}" style="color:${BRAND.peachDark};text-decoration:none;font-weight:600;">Facebook</a> &nbsp;·&nbsp;
              <a href="${BRAND.whatsapp}" style="color:${BRAND.peachDark};text-decoration:none;font-weight:600;">WhatsApp</a>
            </div>
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="background:${BRAND.cream};padding:22px 36px;text-align:center;font-size:12px;color:${BRAND.muted};">
            ${footerNote ? `<div style="margin-bottom:8px;">${footerNote}</div>` : ""}
            <div>&copy; ${new Date().getFullYear()} ${BRAND.name}. Made with love in Nigeria.</div>
            <div style="margin-top:6px;">
              <a href="mailto:${BRAND.email}" style="color:${BRAND.muted};text-decoration:underline;">${BRAND.email}</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.peach};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 28px;border-radius:10px;">${label}</a>`;
}

const naira = (n: number) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── OTP / verification ──────────────────────────────────────────────────
export function otpEmail(code: string) {
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 20px 0;">
      Use the verification code below to sign in to your ${BRAND.name} account.
      This code expires in 10 minutes.
    </p>
    <div style="text-align:center;margin:8px 0 22px 0;">
      <div style="display:inline-block;background:${BRAND.cream};border:1px dashed ${BRAND.peach};border-radius:14px;padding:18px 34px;font-size:34px;font-weight:700;letter-spacing:10px;color:${BRAND.peachDark};">
        ${code}
      </div>
    </div>
    <p style="font-size:13px;line-height:1.6;color:${BRAND.muted};margin:0;">
      Didn't request this? You can safely ignore this email — no one can access your account without this code.
    </p>`;
  return { subject: `Your ${BRAND.name} verification code: ${code}`,
           html: layout({ preheader: `Your code is ${code}`, heading: "Verify it's you", body }) };
}

// ─── Welcome (first sign-up) ─────────────────────────────────────────────
export function welcomeEmail(name?: string) {
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 18px 0;">
      ${name ? `Hi ${name},` : "Hello,"} welcome to <strong>${BRAND.name}</strong> 🌿
    </p>
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 22px 0;">
      You'll be the first to hear about new releases, upcoming titles, and writings from
      Awokunle M. Kelechi — award-winning writer, storyteller and teenage coach behind
      <em>Hearts and Purpose</em>.
    </p>
    <div style="text-align:center;margin:6px 0 8px 0;">${button(BRAND.site + "/books", "Explore the bookshelf")}</div>`;
  return { subject: `Welcome to ${BRAND.name} 🌸`,
           html: layout({ preheader: "Welcome to the family", heading: "We're so glad you're here", body }) };
}

// ─── Newsletter confirmation ─────────────────────────────────────────────
export function newsletterWelcomeEmail(name?: string) {
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 18px 0;">
      ${name ? `Hi ${name},` : "Hello,"} you're subscribed! 💌
    </p>
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 22px 0;">
      Expect gentle, meaningful updates — new books, coming-soon reveals, and inspiration
      straight to your inbox. No spam, ever.
    </p>
    <div style="text-align:center;">${button(BRAND.site, "Visit the website")}</div>`;
  return { subject: `You're subscribed to ${BRAND.name} 💌`,
           html: layout({ preheader: "Subscription confirmed", heading: "Welcome to the newsletter",
                          body, footerNote: "You're receiving this because you subscribed on our website." }) };
}

// ─── New release broadcast ───────────────────────────────────────────────
export function newReleaseEmail(book: { title: string; description?: string; cover_url?: string; price?: number; slug?: string }) {
  const link = `${BRAND.site}/books/${book.slug ?? ""}`;
  const body = `
    <p style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.rose};margin:0 0 10px 0;">✨ New Release</p>
    ${book.cover_url ? `<img src="${book.cover_url}" alt="${book.title}" width="100%" style="max-width:488px;border-radius:14px;margin-bottom:18px;" />` : ""}
    <h2 style="margin:0 0 10px 0;font-size:20px;color:${BRAND.ink};">${book.title}</h2>
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 14px 0;">${book.description ?? ""}</p>
    ${book.price ? `<p style="font-size:16px;font-weight:700;color:${BRAND.peachDark};margin:0 0 22px 0;">${naira(book.price)}</p>` : ""}
    <div style="text-align:center;">${button(link, "Read more & get your copy")}</div>`;
  return { subject: `📖 New release: ${book.title}`,
           html: layout({ preheader: `${book.title} is now available`, heading: "A new book just landed", body,
                          footerNote: "You're receiving this as a member / subscriber of KellyInkspired." }) };
}

// ─── Coming soon broadcast ───────────────────────────────────────────────
export function comingSoonEmail(book: { title: string; description?: string; cover_url?: string; release_date?: string; slug?: string }) {
  const link = `${BRAND.site}/books/${book.slug ?? ""}`;
  const body = `
    <p style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${BRAND.peach};margin:0 0 10px 0;">⏳ Coming Soon — Stay Tuned</p>
    ${book.cover_url ? `<img src="${book.cover_url}" alt="${book.title}" width="100%" style="max-width:488px;border-radius:14px;margin-bottom:18px;" />` : ""}
    <h2 style="margin:0 0 10px 0;font-size:20px;color:${BRAND.ink};">${book.title}</h2>
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 14px 0;">${book.description ?? ""}</p>
    ${book.release_date ? `<p style="font-size:15px;color:${BRAND.muted};margin:0 0 22px 0;">Expected: <strong style="color:${BRAND.ink};">${book.release_date}</strong></p>` : ""}
    <div style="text-align:center;">${button(link, "Preview the title")}</div>`;
  return { subject: `⏳ Coming soon: ${book.title}`,
           html: layout({ preheader: `${book.title} is on the way`, heading: "Something new is on the way", body,
                          footerNote: "We'll email you the moment it's available." }) };
}

// ─── Order receipt / delivery ────────────────────────────────────────────
export function orderReceiptEmail(order: {
  reference: string;
  total: number;
  items: { title: string; price: number; quantity: number; download_url?: string }[];
}) {
  const rows = order.items.map((it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f2e3da;font-size:14px;color:${BRAND.ink};">
        ${it.title} <span style="color:${BRAND.muted};">× ${it.quantity}</span>
        ${it.download_url ? `<br/><a href="${it.download_url}" style="font-size:13px;color:${BRAND.peachDark};text-decoration:underline;">Download your copy</a>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f2e3da;font-size:14px;color:${BRAND.ink};text-align:right;white-space:nowrap;">${naira(it.price * it.quantity)}</td>
    </tr>`).join("");
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 6px 0;">Thank you for your purchase! Your payment was successful.</p>
    <p style="font-size:13px;color:${BRAND.muted};margin:0 0 20px 0;">Reference: ${order.reference}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
      <tr>
        <td style="padding:14px 0 0 0;font-size:16px;font-weight:700;color:${BRAND.ink};">Total</td>
        <td style="padding:14px 0 0 0;font-size:16px;font-weight:700;color:${BRAND.peachDark};text-align:right;">${naira(order.total)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:${BRAND.muted};margin:22px 0 0 0;">Your download links are also available any time from your account.</p>`;
  return { subject: `Your ${BRAND.name} order is confirmed 🧾`,
           html: layout({ preheader: "Payment received — here are your books", heading: "Order confirmed", body }) };
}

// ─── Contact: admin notification ─────────────────────────────────────────
export function contactAdminEmail(msg: { name: string; email: string; subject?: string; message: string }) {
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 16px 0;">New message from the website contact form:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${BRAND.ink};">
      <tr><td style="padding:6px 0;color:${BRAND.muted};width:90px;">From</td><td style="padding:6px 0;">${msg.name}</td></tr>
      <tr><td style="padding:6px 0;color:${BRAND.muted};">Email</td><td style="padding:6px 0;"><a href="mailto:${msg.email}" style="color:${BRAND.peachDark};">${msg.email}</a></td></tr>
      <tr><td style="padding:6px 0;color:${BRAND.muted};">Subject</td><td style="padding:6px 0;">${msg.subject ?? "—"}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:${BRAND.cream};border-radius:12px;font-size:14px;line-height:1.6;color:${BRAND.ink};white-space:pre-wrap;">${msg.message}</div>`;
  return { subject: `📨 Contact form: ${msg.subject ?? msg.name}`,
           html: layout({ preheader: msg.message.slice(0, 80), heading: "New contact message", body }) };
}

// ─── Contact: auto-reply to sender ───────────────────────────────────────
export function contactAutoReplyEmail(name: string) {
  const body = `
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 18px 0;">Hi ${name}, thank you for reaching out 💛</p>
    <p style="font-size:15px;line-height:1.6;color:#5a4a42;margin:0 0 22px 0;">
      We've received your message and will get back to you as soon as possible. In the meantime,
      feel free to explore the latest books and writings.
    </p>
    <div style="text-align:center;">${button(BRAND.site, "Back to the website")}</div>`;
  return { subject: `We received your message — ${BRAND.name}`,
           html: layout({ preheader: "Thanks for contacting us", heading: "Thanks for reaching out", body }) };
}

export { naira };
