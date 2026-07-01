# KellyInkspired — Setup & Deployment Guide

Author platform & bookstore for **Awokunle M. Kelechi**.
Stack: Vite + React + TypeScript + Tailwind + Supabase (Auth, Postgres, Storage, Edge Functions) + Paystack + Resend.

> **Important:** The frontend builds and type-checks cleanly. The Supabase migration,
> edge functions, and the email/payment runtime **could not be live-tested in the build
> environment** (no network access to Supabase/Resend/Paystack). The steps below are what
> you run once to wire everything up. Test in Supabase's test mode before going live.

---

## 1. Frontend

```bash
npm install
cp .env.example .env     # fill in your Supabase URL + anon key
npm run dev              # local dev
npm run build            # production build → dist/
```

`.env` only needs the two `VITE_` values. Everything secret lives in Supabase (step 4).

---

## 2. Database (single migration)

Everything is in **`supabase/migrations/00000000000000_init.sql`** — schema, RLS,
storage buckets, triggers, seed categories, and the admin seed.

Apply it with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

…or paste the file into the Supabase SQL editor and run it once.

### Admin account (seeded — admins cannot self-register)
The migration seeds one admin:

- **Email:** `kellyinkspired@gmail.com`
- **Password:** `ChangeMe!2025`  ← **change this immediately** (see bottom of the SQL file, or update via Supabase Auth dashboard).

Customers never use passwords — they sign in with a one-time code (OTP) emailed to them.
Admins sign in at **`/admin`** with email + password.

---

## 3. Storage buckets
Created by the migration: `book-covers` (public), `blog-media` (public),
`book-files` (private — paid downloads). No manual step needed.

---

## 4. Edge functions + secrets

Set secrets once:

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM="KellyInkspired <hello@your-domain.com>" \
  CONTACT_INBOX=kellyinkspired@gmail.com \
  SITE_URL=https://your-site.com \
  PAYSTACK_SECRET_KEY=sk_test_xxx \
  OPAY_PUBLIC_KEY=OPAYPUB... \
  OPAY_SECRET_KEY=OPAYPRV... \
  OPAY_MERCHANT_ID=256xxxxxxxxxxxx \
  OPAY_BASE_URL=https://sandboxapi.opaycheckout.com
```

Deploy the functions:

```bash
supabase functions deploy send-auth-email
supabase functions deploy subscribe-newsletter
supabase functions deploy contact
supabase functions deploy notify-new-release
supabase functions deploy paystack-init
supabase functions deploy paystack-verify
supabase functions deploy opay-init
supabase functions deploy opay-verify
```

| Function | Purpose |
|---|---|
| `send-auth-email` | Branded OTP / auth emails via Resend (Auth hook) |
| `subscribe-newsletter` | Newsletter sign-up + welcome email |
| `contact` | Contact form → inbox + auto-reply |
| `notify-new-release` | Email all subscribers about a new / upcoming book |
| `paystack-init` | Creates a pending order and starts Paystack checkout |
| `paystack-verify` | Verifies payment, marks order paid, emails download links |
| `opay-init` | Creates a pending order and starts Opay checkout |
| `opay-verify` | Verifies Opay payment, marks order paid, emails download links |

### Enable the branded OTP email
In **Supabase → Authentication → Emails → Send Email hook**, point the hook at the
deployed `send-auth-email` function so customer login codes use the branded template
(via Resend) instead of the default Supabase email.

---

## 5. Payments
Both **Paystack** and **Opay** are wired end-to-end and selectable at checkout. The flow is
identical for both: the customer picks a provider, is redirected to that provider's hosted
page, pays, and is returned to `/checkout`, where the matching verify function confirms the
payment, marks the order paid, and emails the download links.

- **Paystack** works with your existing test key now.
- **Opay** needs the Opay keys below (see EXTERNAL-SERVICES-GUIDE.md). Until they're set,
  selecting Opay returns a clear "not configured" error rather than charging anyone.

---

## 6. What the admin can do (`/admin` → dashboard)
- Add / edit / delete books; upload covers and private book files; set price (₦),
  category, status (published / coming soon / draft), **featured**, and **new release**.
- One-click **Notify subscribers** (broadcast) per book.
- Write blog posts with images / video / audio / files; publish or save as draft.
- View orders, sales chart, subscribers, and contact messages.

---

## 7. Notes
- Currency is Naira (₦) everywhere via `formatNaira`.
- Hero banner automatically shows the latest **new release**; the homepage shows a
  **Coming Soon** section when any book has that status.
- Social links (Instagram, Facebook, WhatsApp, email) are set in the footer/contact page.
- Dark/light mode is preserved across the new peach/rose theme.
