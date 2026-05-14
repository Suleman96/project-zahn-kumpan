# 🦷 Zahn Kumpan — Portal Prototype

A functional front-end prototype for the **Zahn Kumpan** dental professional portal — a knowledge hub for German dental practices with editorial blog content and a premium provider comparison engine.

> **Trial project** — built as part of the Zahn Kumpan developer trial task (May 2026).

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
│   │   ├── terminbuchung-software.html
│   │   ├── digitalisierung-zahnarzt.html
│   │   └── abrechnungszentrum-vergleich.html
│   │
│   ├── vergleich/
│   │   └── index.html                ← Premium comparison (login required)
│   │
│   └── assets/
│       ├── css/
│       │   └── style.css             ← Full design system (CSS variables)
│       └── js/
│           ├── auth.js               ← Auth logic, premium gate, cookie banner
│           ├── comparison.js         ← 6 providers, filter + sort engine
│           └── main.js               ← TOC, animations, blog search, forms
│
├── documentation/                    ← Project docs (not deployed)
│   ├── brief.txt                     ← Original task brief
│   ├── TECHNICAL_ARCHITECTURE.md     ← Full architecture document
│   ├── MISSING_SECTIONS.md           ← Architecture supplements
│   └── diagrams/
│       ├── architecture-flow.png
│       ├── architecture-blocks.png
│       ├── screenshot-architecture.jpg
│       └── screenshot-dashboard.jpg
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← Auto-deploy src/ to GitHub Pages on push
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Pages

| Page | URL (local) | Description |
|------|-------------|-------------|
| Landing | `/` | Hero, 3 blog teasers, premium preview gate |
| Login | `/anmelden.html` | Auth form with demo credentials |
| Register | `/registrieren.html` | Split-panel registration |
| Blog | `/blog/` | Listing with search + category tabs |
| Article 1 | `/blog/terminbuchung-software.html` | JSON-LD + reading progress bar |
| Article 2 | `/blog/digitalisierung-zahnarzt.html` | TOC + sticky sidebar |
| Article 3 | `/blog/abrechnungszentrum-vergleich.html` | TOC + sticky sidebar |
| Comparison | `/vergleich/` | **Login required** — 6 providers, filterable |
| Impressum | `/impressum.html` | Legal page |
| Datenschutz | `/datenschutz.html` | Privacy policy (DSGVO) |
| 404 | `/404.html` | Custom error page |

---

## Demo Login

The comparison page is locked behind authentication. Use these credentials:

| Field | Value |
|-------|-------|
| E-Mail | `demo@zahnkumpan.de` |
| Passwort | `test1234` |

After logging in, the full comparison with 6 providers unlocks (Doctolib, samedi, Terminland for booking; DZR, ARC, BFS for billing).

---

## How to Test Locally

No build step required — this is pure HTML / CSS / JS.

### Option 1 — Python (recommended, built into every computer)

Open a terminal and run:

```bash
# Windows — PowerShell or Command Prompt
python -m http.server 8080 --directory src

# macOS / Linux
python3 -m http.server 8080 --directory src
```

Then open your browser at **http://localhost:8080**

> To stop the server: press `Ctrl + C` in the terminal.

---

### Option 2 — VS Code Live Server (easiest, one click)

1. Open this project folder in **VS Code**
2. Install the **Live Server** extension:
   - Press `Ctrl + Shift + X` → search **"Live Server"** → click **Install**
3. In the file explorer, right-click `src/index.html`
4. Click **"Open with Live Server"**
5. Browser opens automatically at `http://127.0.0.1:5500`

Live Server automatically refreshes the browser when you save a file.

---

### Option 3 — Node.js (if you have Node installed)

```bash
npx serve src -p 8080
```

---

> **Why not just double-click the HTML file?**
> Opening via `file://` works for basic browsing, but the cookie banner and some relative paths behave differently. Always use a local server for accurate testing.

---

## Features

| Feature | Details |
|---------|---------|
| Auth | `localStorage`-based session. Demo credentials above. |
| Premium gate | Blur + overlay CTA on landing page; full block on `/vergleich/` |
| Comparison | Filter by category, price range, support quality. Cards + table view. Sortable columns. |
| JSON-LD | `BlogPosting` schema on article 1, `WebSite` schema on root |
| Semantic HTML | `<main>`, `<article>`, `<header>`, `<nav>`, `<footer>`, `<time>` |
| Accessibility | Skip links, ARIA labels, focus indicators, `role` attributes |
| Cookie banner | Consent stored in `localStorage`, accepts/declines |
| Responsive | Mobile nav (hamburger), stacked layout at 768px |

---

## Tech Stack

| | |
|--|--|
| HTML | Semantic HTML5 |
| CSS | Custom design system — CSS variables, Grid, Flexbox |
| JS | Vanilla ES6+, no libraries, no framework |
| Fonts | Inter + Plus Jakarta Sans (Google Fonts) |
| Images | Unsplash CDN (free, no account needed) |
| Deployment | GitHub Pages via GitHub Actions |

---

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **"GitHub Actions"**
4. The workflow in `.github/workflows/deploy.yml` runs automatically on every push to `main`
5. Your site goes live at: `https://<your-username>.github.io/<repo-name>/`

The GitHub Action deploys the `src/` folder — nothing else is published.

---

## Meeting Prep

Key topics likely to come up:

1. **Filter logic** — walk through `src/assets/js/comparison.js` (`applyFilters()` and `render()`)
2. **Premium gate security** — prototype uses `localStorage`; production uses server-side sessions so premium data is never sent to unauthenticated browsers
3. **CMS recommendation** — Sanity v3 (see `documentation/TECHNICAL_ARCHITECTURE.md`)
4. **LLM bonus idea** — Claude API generates German-language comparison summaries from structured provider data (no user personal data sent to the LLM)
