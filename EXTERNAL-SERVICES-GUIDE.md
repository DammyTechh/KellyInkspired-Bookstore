# KellyInkspired — External Services & Keys Guide

This is the complete list of **everything you need to sign up for and collect** to make the
site fully live: customer login emails, the contact form, the newsletter, and **both payment
options (Paystack and Opay)**.

You do **not** need to write any code. You just create accounts, copy a few keys, and paste
them into Supabase. Each section tells you exactly which key goes to which setting name.

There are two places keys live:

1. **`.env`** (in the website code) — only **2** public values for the frontend.
2. **Supabase secrets** — everything sensitive (email + payment keys). These never touch the
   browser. You set them with the Supabase CLI or in the dashboard.

At the very end there's a **one-glance checklist table** of every value and where it comes from.

---

## 1. Supabase (database, login, file storage) — REQUIRED

This is the backbone: it stores books, blogs, orders, users, and files, and it sends login codes.

**Get an account**
1. Go to https://supabase.com and sign up (free tier is fine to start).
2. Create a new project. Choose a region close to Nigeria (e.g. EU West) and set a strong
   database password (save it somewhere safe).

**Collect these keys** — Project → **Settings → API**:
- **Project URL** → goes in `.env` as `VITE_SUPABASE_URL`
- **anon public key** → goes in `.env` as `VITE_SUPABASE_ANON_KEY`
- **service_role key** (secret!) → used by the server functions as `SUPABASE_SERVICE_ROLE_KEY`
  - *Note:* when you deploy functions with the Supabase CLI, `SUPABASE_URL` and
    `SUPABASE_SERVICE_ROLE_KEY` are usually injected automatically. Only set them by hand if
    a function complains they're missing.

**Apply the database**
- Install the CLI: https://supabase.com/docs/guides/cli
- Then run (from the project folder):
  ```bash
  supabase link --project-ref YOUR_PROJECT_REF
  supabase db push
  ```
  (Or open `supabase/migrations/00000000000000_init.sql` and paste it into the Supabase SQL editor.)

**Admin login** is created automatically by that file:
- Email: `kellyinkspired@gmail.com`  · Password: `ChangeMe!2025`
- **Change this password immediately** in Supabase → Authentication → Users.

---

## 2. Resend (sends all emails) — REQUIRED

Resend delivers your branded emails: login codes, the welcome email, new-release alerts,
order receipts, contact-form notifications.

**Get an account**
1. Go to https://resend.com and sign up.
2. **Add & verify a domain** (recommended) — e.g. `mail.yourdomain.com`. Resend shows you a few
   DNS records (TXT/CNAME) to add at your domain registrar. This lets emails come from your own
   address and not land in spam.
   - If you don't have a domain yet, you can test using Resend's `onboarding@resend.dev`
     sender, but real delivery needs your own verified domain.
3. **API Keys → Create API Key.** Copy it (starts with `re_`).

**Collect these:**
- **API key** → Supabase secret `RESEND_API_KEY`
- **From address** → Supabase secret `RESEND_FROM`, e.g. `KellyInkspired <hello@yourdomain.com>`
- **Inbox that should receive contact-form messages** → Supabase secret `CONTACT_INBOX`
  (you can just use `kellyinkspired@gmail.com`).

**Turn on branded login emails**
After deploying functions (section 6), go to **Supabase → Authentication → Emails → Send Email
hook** and point it at the `send-auth-email` function. This makes the 6-digit login codes use
your branded template through Resend.

---

## 3. A domain name (recommended, not strictly required)

Used for: a professional email sender (section 2) and your live website address.
- Buy one from Namecheap, GoDaddy, Google Domains, etc.
- You'll use it as your site address and set it as the Supabase secret `SITE_URL`
  (e.g. `https://kellyinkspired.com`). Emails use `SITE_URL` to build links back to the site.

---

## 4. Paystack (payment option 1) — REQUIRED for card/bank/USSD

**Get an account**
1. Go to https://paystack.com and create a business account.
2. You'll start in **Test Mode** — perfect for trying everything safely.
3. **Settings → API Keys & Webhooks.** Copy the **Secret Key**:
   - Test key looks like `sk_test_...`
   - Live key looks like `sk_live_...` (use after your business is approved)

**Collect this:**
- **Secret key** → Supabase secret `PAYSTACK_SECRET_KEY`

That's all Paystack needs — the site creates the payment and verifies it automatically.
Test cards for trying it out: https://paystack.com/docs/payments/test-payments

---

## 5. Opay (payment option 2) — REQUIRED for Opay wallet/card/bank

Opay sends customers to Opay's own secure checkout page, then back to your site.

**Get a merchant account**
1. Go to the OPay merchant site: https://merchant.opayweb.com (OPay Business / Merchant).
   You'll register your business and complete their KYC/verification.
2. Once approved, open the **merchant dashboard** and look for the **API / Developer / Keys**
   section (sometimes labelled "Open API", "Cashier", or "Checkout").
3. Collect three things:
   - **Merchant ID** (a long number)
   - **Public Key** (usually starts with `OPAYPUB`)
   - **Private/Secret Key** (usually starts with `OPAYPRV`) — keep this secret
4. Note which environment you're in:
   - **Sandbox/test base URL:** `https://sandboxapi.opaycheckout.com`
   - **Live base URL:** `https://liveapi.opaycheckout.com`

**Collect these (Supabase secrets):**
- **Public key** → `OPAY_PUBLIC_KEY`
- **Private/secret key** → `OPAY_SECRET_KEY`
- **Merchant ID** → `OPAY_MERCHANT_ID`
- **Base URL** → `OPAY_BASE_URL` (start with the sandbox one, switch to live when ready)

> **One thing to confirm with Opay support / your dashboard:** Opay has more than one product
> (e.g. "Cashier/Checkout" vs other APIs) and they occasionally differ in the exact endpoint
> path or how the request is signed. This site uses Opay's **International Cashier** endpoints:
> `…/api/v1/international/cashier/create` (start payment) and `…/cashier/status` (verify),
> with the public key as the bearer token on create and a signature on status. If your
> dashboard shows a different product, tell me the product name and I'll match the function to
> it — only the two `opay-*` function files need a small tweak, nothing else.
>
> Also set your **Return/Callback URL** in the Opay dashboard (if it asks) to:
> `https://YOUR_SITE/checkout` — that's where customers come back after paying.

---

## 6. Deploy the server functions

After you have the keys above, set them once and deploy:

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM="KellyInkspired <hello@yourdomain.com>" \
  CONTACT_INBOX=kellyinkspired@gmail.com \
  SITE_URL=https://yourdomain.com \
  PAYSTACK_SECRET_KEY=sk_test_xxx \
  OPAY_PUBLIC_KEY=OPAYPUB... \
  OPAY_SECRET_KEY=OPAYPRV... \
  OPAY_MERCHANT_ID=256xxxxxxxxxxxx \
  OPAY_BASE_URL=https://sandboxapi.opaycheckout.com

supabase functions deploy send-auth-email
supabase functions deploy subscribe-newsletter
supabase functions deploy contact
supabase functions deploy notify-new-release
supabase functions deploy paystack-init
supabase functions deploy paystack-verify
supabase functions deploy opay-init
supabase functions deploy opay-verify
```

---

## 7. Hosting the website (so people can visit it) — REQUIRED

The site is a static build. Easiest options (all have free tiers):
- **Vercel** — https://vercel.com — connect your repo, it auto-builds.
- **Netlify** — https://netlify.com — same idea.

Build settings: build command `npm run build`, output folder `dist`.
Add the two `.env` values (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's
"Environment Variables" settings. Point your domain at the host when ready.

---

## 8. Quick checklist — every value and where to get it

| Setting name | Where it lives | Where you get it | Needed for |
|---|---|---|---|
| `VITE_SUPABASE_URL` | `.env` + host | Supabase → Settings → API → Project URL | Everything |
| `VITE_SUPABASE_ANON_KEY` | `.env` + host | Supabase → Settings → API → anon key | Everything |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret* | Supabase → Settings → API → service_role | Server functions |
| `RESEND_API_KEY` | Supabase secret | Resend → API Keys | All emails |
| `RESEND_FROM` | Supabase secret | Your verified Resend domain | All emails |
| `CONTACT_INBOX` | Supabase secret | Your own email address | Contact form |
| `SITE_URL` | Supabase secret | Your live site address | Email links |
| `PAYSTACK_SECRET_KEY` | Supabase secret | Paystack → Settings → API Keys | Paystack payments |
| `OPAY_PUBLIC_KEY` | Supabase secret | Opay merchant dashboard | Opay payments |
| `OPAY_SECRET_KEY` | Supabase secret | Opay merchant dashboard | Opay payments |
| `OPAY_MERCHANT_ID` | Supabase secret | Opay merchant dashboard | Opay payments |
| `OPAY_BASE_URL` | Supabase secret | Use sandbox, then live URL | Opay payments |

\* Usually auto-provided to functions by Supabase; only set manually if a function reports it missing.

---

## 9. Recommended order to do this in
1. Supabase project + run the migration + change admin password.
2. Deploy to Vercel/Netlify with the two `VITE_` keys so you can see the site.
3. Resend account + domain + set email secrets + enable the Auth email hook.
4. Paystack test key → test a purchase end to end.
5. Opay sandbox keys → test a purchase end to end.
6. Switch Paystack + Opay to **live** keys, switch `OPAY_BASE_URL` to the live URL, point your
   domain, and you're open for business.

If you get stuck on any single key or an Opay screen looks different from what's described,
send me the screen name/label and I'll tell you exactly what to copy.
