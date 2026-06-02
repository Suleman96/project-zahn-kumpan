# Zahn Kumpan — Portal Prototype

A functional front-end prototype for the **Zahn Kumpan** dental knowledge and decision-support portal — a platform for dentists and dental practice owners in Germany to find and compare the companies they need to run and grow their practice.

> **Trial project** — built as part of the Zahn Kumpan developer trial task (May 2026).

**Live demo:** [suleman96.github.io/project-zahn-kumpan](https://suleman96.github.io/project-zahn-kumpan/)

---

## What This Platform Is

Zahn Kumpan serves dentists who are opening a new practice or running an existing one. Instead of spending weeks researching which software, billing service, or financing partner to use, dentists subscribe and get access to structured, verified comparisons across all the categories they need.

**Public content (free):**
- Blog articles on practice management, digitalization, and billing
- Category overviews — what each type of provider does and why it matters
- Comparison teasers — company names and categories, no pricing

**Premium content (subscription required):**
- Full comparison tables with verified pricing, pros/cons, and feature breakdowns
- Side-by-side provider analysis across 4 categories (see below)
- Downloadable guides: HKP-Leitfaden, PVS-Wechsel-Checkliste, and more

---

## Provider Categories (Comparison Section)

The comparison section currently covers 4 categories with **13 providers total**:

| Category | Providers | What It Covers |
|---|---|---|
| **Terminbuchungssoftware** | Doctolib, Samedi, Terminland | Online booking systems for dental practices |
| **Abrechnungszentrum** | DZR, ARC, BFS health finance | GOÄ/KFO billing outsourcing and liquidation |
| **Praxissoftware (PVS)** | Dampsoft, DS-Win, CGM Z1 | Practice management software (scheduling, patient records, X-ray) |
| **Praxisfinanzierung** | apoBank, Commerzbank Healthcare | Practice startup loans and acquisition financing |

**Coming soon:** Patientengewinnung (patient acquisition / marketing), Mitarbeitergewinnung (staff recruitment)

---

## Project Structure

```
project-zahn-kumpan/
│
├── src/                              ← Front-end application (the portal)
│   ├── index.html                    ← Public landing page
│   ├── anmelden.html                 ← Login
│   ├── registrieren.html             ← Registration
│   ├── impressum.html                ← Legal (German requirement)
│   ├── datenschutz.html              ← GDPR privacy policy
│   ├── 404.html                      ← Custom error page
│   │
│   ├── blog/
│   │   ├── index.html                ← Blog listing with search + category filter
│   │   ├── terminbuchung-software.html     ← Article: booking software comparison
│   │   ├── digitalisierung-zahnarzt.html   ← Article: practice digitalization guide
│   │   └── abrechnungszentrum-vergleich.html ← Article: billing centre guide
│   │
│   ├── vergleich/
│   │   └── index.html                ← Premium comparison (login required)
│   │
│   └── assets/
│       ├── css/
│       │   └── style.css             ← Full design system (CSS variables, Grid, Flexbox)
│       └── js/
│           ├── auth.js               ← Auth logic, premium gate (3 states), cookie banner
│           ├── comparison.js         ← 13 providers across 4 categories, filter + sort engine
│           ├── i18n.js               ← DE/EN language switcher (300+ translation keys)
│           └── main.js               ← TOC, animations, blog search, counter animations
│
├── documentation/                    ← Architecture docs (not deployed)
│   ├── brief.txt                     ← Original task brief
│   ├── TECHNICAL_ARCHITECTURE.md     ← Full production architecture concept
│   ├── SAAS_ARCHITECTURE_PLAN.md     ← Premium access control and SaaS design
│   ├── PRODUCTION_ARCHITECTURE_PLAN.md ← Auth.js vs Supabase analysis
│   └── MISSING_SECTIONS.md           ← Architecture supplements
│
├── MEETING_SCRIPT.md                 ← Speaking guide for the client meeting
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← Auto-deploys src/ to GitHub Pages on push to main
│
├── .gitignore
└── README.md
```

---

## Pages

| Page | URL (local) | Description |
|------|-------------|-------------|
| Landing | `/` | Hero, blog teasers, category overview, premium gate |
| Login | `/anmelden.html` | Auth form with demo credentials |
| Register | `/registrieren.html` | Registration page |
| Blog | `/blog/` | Listing with search + category tabs |
| Article 1 | `/blog/terminbuchung-software.html` | Booking software guide with JSON-LD |
| Article 2 | `/blog/digitalisierung-zahnarzt.html` | Practice digitalization guide |
| Article 3 | `/blog/abrechnungszentrum-vergleich.html` | Billing centre comparison |
| Comparison | `/vergleich/` | **Premium — login required.** 13 providers, 4 categories, filterable |
| Impressum | `/impressum.html` | Legal notice (§5 TMG) |
| Datenschutz | `/datenschutz.html` | GDPR privacy policy |
| 404 | `/404.html` | Custom error page |

---

## Demo Credentials

The comparison section requires login. Two demo accounts are available:

| Account | Email | Password | Access |
|---------|-------|----------|--------|
| **Premium** | `demo@zahnkumpan.de` | `test1234` | Full comparison — all 13 providers, all 4 categories |
| **Free** | `frei@zahnkumpan.de` | `free1234` | Blog only — comparison shows upgrade prompt |

After logging in with the premium account, all 4 filter tabs (Terminbuchung, Abrechnung, Praxissoftware, Finanzierung) become active with full provider details, pricing, pros/cons, and feature breakdowns.

---

## How to Run Locally

No build step required — pure HTML / CSS / JS.

### Option 1 — Python (built into every machine)

```bash
# Windows (PowerShell or Command Prompt)
python -m http.server 8080 --directory src

# macOS / Linux
python3 -m http.server 8080 --directory src
```

Open: **http://localhost:8080**

Press `Ctrl + C` to stop.

### Option 2 — VS Code Live Server

1. Open the project folder in VS Code
2. Install the **Live Server** extension (`Ctrl + Shift + X` → search "Live Server")
3. Right-click `src/index.html` → **Open with Live Server**
4. Browser opens automatically at `http://127.0.0.1:5500`

### Option 3 — Node.js

```bash
npx serve src -p 8080
```

> Always use a local server rather than opening via `file://` — relative paths and cookie behaviour differ.

---

## Key Features

| Feature | Details |
|---------|---------|
| **Auth — 3 user states** | Guest (gate), free user (upgrade prompt), premium user (full access) |
| **Premium gate** | Blur + overlay CTA on landing page; hard lock screen on `/vergleich/` |
| **Comparison engine** | Filter by category (4 tabs), price tier, support quality. Sort by rating, price, or support. Cards view + table view. |
| **13 providers** | Terminbuchung (3), Abrechnung (3), PVS-Software (3), Praxisfinanzierung (2) |
| **DE/EN language switcher** | Full i18n module — 300+ keys, toggle injected into every nav bar |
| **JSON-LD structured data** | `BlogPosting` on article pages, `WebSite` on root — for Google search indexing |
| **Semantic HTML** | `<main>`, `<article>`, `<header>`, `<nav>`, `<footer>`, `<time>` throughout |
| **Accessibility** | Skip links, ARIA labels, ARIA roles, keyboard-navigable |
| **Responsive** | Mobile nav (hamburger menu), stacked layout at 768px |
| **Cookie consent** | Accept/decline banner, stored in `localStorage` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Custom design system — CSS variables, Grid, Flexbox |
| JavaScript | Vanilla ES6+ — no libraries, no framework, no build step |
| i18n | Custom IIFE module (`i18n.js`) with DE/EN translation objects |
| Fonts | Inter + Plus Jakarta Sans (Google Fonts CDN) |
| Images | Unsplash CDN |
| Deployment | GitHub Pages via GitHub Actions (`src/` folder only) |

---

## Production Architecture (planned)

The prototype is browser-only and uses `localStorage` for auth. The production system is planned as:

| Layer | Technology | Reason |
|---|---|---|
| Frontend/App | Next.js 15 (App Router) | SSG for public pages, SSR for premium routes |
| CMS | Sanity v3 | Structured content, non-technical editors, SEO metadata |
| Auth | Auth.js v5 + PostgreSQL | Server-side sessions, GDPR-compliant, EU-hosted |
| Database | PostgreSQL (Hetzner) | Users, sessions, subscription state |
| Payments | Stripe | Subscription billing with webhooks |
| Hosting | Hetzner Cloud (Germany) | GDPR-compliant, German company, ~€6/month MVP |
| Email | Brevo | Transactional + newsletter |

Full details: [`documentation/TECHNICAL_ARCHITECTURE.md`](documentation/TECHNICAL_ARCHITECTURE.md)
Access control and subscription design: [`documentation/SAAS_ARCHITECTURE_PLAN.md`](documentation/SAAS_ARCHITECTURE_PLAN.md)

---

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **"GitHub Actions"**
4. The workflow in `.github/workflows/deploy.yml` runs automatically on every push to `main`
5. Site goes live at: `https://<your-username>.github.io/<repo-name>/`

Only the `src/` folder is deployed. The `documentation/` folder is excluded via `.gitignore`.

---

## Meeting Reference

The [`MEETING_SCRIPT.md`](MEETING_SCRIPT.md) file contains a full speaking guide for the client meeting including:

- Prepared answers to all 4 brief discussion questions
- Demo walkthrough order (landing → gate → login → comparison → architecture)
- Phase 1–4 roadmap with full Phase 2 detail (CRM, email automation, member dashboard)
- Rejected technology decisions and how to explain them
- What not to overclaim about the prototype
