# Zahn Kumpan — Complete Technical Architecture & Implementation Guide

**Version:** 1.0  
**Date:** May 14, 2026  
**Author:** Muhammad — AI Automation Engineer  
**Status:** Trial Submission + MVP Planning Document  
**Client:** Zahn Kumpan (Dental Portal for Practice Owners in Germany)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview & Business Context](#2-project-overview--business-context)
3. [Current State Analysis (WordPress)](#3-current-state-analysis-wordpress)
4. [Architecture Overview](#4-architecture-overview)
5. [CMS Comparison & Decision](#5-cms-comparison--decision)
6. [Frontend Framework Comparison & Decision](#6-frontend-framework-comparison--decision)
7. [Authentication & Authorization Comparison & Decision](#7-authentication--authorization-comparison--decision)
8. [Database Comparison & Decision](#8-database-comparison--decision)
9. [Hosting & Infrastructure Comparison & Decision](#9-hosting--infrastructure-comparison--decision)
10. [Data Flow Architecture](#10-data-flow-architecture)
11. [Content Modeling & Schema Design](#11-content-modeling--schema-design)
12. [SEO Architecture](#12-seo-architecture)
13. [WordPress Migration Strategy](#13-wordpress-migration-strategy)
14. [Premium Content & Gating Strategy](#14-premium-content--gating-strategy)
15. [GDPR / DSGVO Compliance](#15-gdpr--dsgvo-compliance)
16. [Comparison Feature — Filter Logic & Provider Data](#16-comparison-feature--filter-logic--provider-data)
17. [API Architecture & Integration Points](#17-api-architecture--integration-points)
18. [LLM Integration Strategy (Phase 4)](#18-llm-integration-strategy-phase-4)
19. [Search Strategy](#19-search-strategy)
20. [CRM & Email Automation (Phase 2)](#20-crm--email-automation-phase-2)
21. [Analytics & Monitoring](#21-analytics--monitoring)
22. [Security Architecture](#22-security-architecture)
23. [Performance & Caching Strategy](#23-performance--caching-strategy)
24. [Phase Plan & Roadmap](#24-phase-plan--roadmap)
25. [Cost Estimation](#25-cost-estimation)
26. [Risk Assessment](#26-risk-assessment)
27. [Technology Stack Summary](#27-technology-stack-summary)
28. [Appendix A: Mermaid Diagrams](#appendix-a-mermaid-diagrams)
29. [Appendix B: API Reference Patterns](#appendix-b-api-reference-patterns)
30. [Appendix C: Environment Variables](#appendix-c-environment-variables)

---

## 1. Executive Summary

Zahn Kumpan is a German-language portal targeting dentists and dental practice owners. It combines two content types: public SEO editorial content (blog articles, guides, landing pages) and premium gated content (detailed provider comparisons, filtered tables, downloadable resources).

The portal is currently built on WordPress + Elementor, which the client wants to replace due to performance issues, architectural limitations, and long-term scalability concerns.

### Recommended Stack (Final Decision)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend/App | Next.js 15 (App Router) | SEO rendering + premium gating + API routes |
| CMS | Sanity v3 | Editor-friendly, structured content, SEO metadata, free tier |
| Auth | Auth.js v5 (NextAuth) | Server-side session checks, Next.js middleware integration |
| Database | PostgreSQL | Users, sessions, leads, form submissions |
| Hosting | Hetzner Cloud (EU) | GDPR-compliant, German company, cost-effective |
| Styling | Tailwind CSS v4 | Rapid prototyping, production-ready utility classes |
| Language | TypeScript | Type safety across frontend and API layer |

### Key Architecture Principle

> Sanity is the content source for ALL content (public and premium). Next.js is the application layer that decides what the browser receives based on the user's authentication status. The auth gate sits between the server and the browser — not between Sanity and the server.

---

## 2. Project Overview & Business Context

### What is Zahn Kumpan?

Zahn Kumpan ("Dental Companion") is a portal that helps dentists and future dental practice owners make informed decisions about:

- Software for their practice (appointment booking, billing, patient management)
- Business aspects of running a dental practice
- Comparisons between different service providers

### Business Model

| Content Type | Access | Purpose |
|-------------|--------|---------|
| Blog articles | Public, free | SEO traffic acquisition, Google ranking |
| Comparison teasers | Public, free | Convert visitors to registered members |
| Full comparison tables | Free registration required | Lead capture, email list building |
| Detailed provider analysis | Free registration required | Premium value, user retention |
| Downloadable resources | Free registration required | Lead magnet |

The portal is NOT a SaaS product. It is an SEO-first content platform with a lead generation layer. This distinction is critical because it determines every architectural decision.

### Target Users

| User Type | Needs | Technical Level |
|-----------|-------|----------------|
| Dental students | Career guidance, practice startup info | Low |
| New practice owners | Software comparisons, setup guides | Low-Medium |
| Established dentists | Switching providers, cost optimization | Medium |
| Dental office managers | Tool evaluation, workflow optimization | Medium |

### Team Composition

| Role | Person | Availability |
|------|--------|-------------|
| Founder / Product Owner | Muhammad (client) | Full-time strategy |
| Content / Editorial | Non-technical team members | Content creation |
| Technical Development | You (contractor) | Part-time / Freelance |
| Master Student (Pakistan) | Another developer | Working on related project |

This team composition directly influences the CMS choice: the system must be usable by non-technical editors without developer assistance for daily content operations.

---

## 3. Current State Analysis (WordPress)

### Current Stack

| Component | Technology | Problem |
|-----------|-----------|---------|
| CMS | WordPress 6.x | Slow, plugin-dependent, security concerns |
| Page Builder | Elementor Pro | Heavy frontend, render-blocking JS |
| Hosting | Unknown (likely shared) | Performance limitations |
| Theme | Custom Elementor-based | Not optimized for Core Web Vitals |
| SEO | Likely Yoast/RankMath | Plugin-dependent SEO management |

### Why WordPress Must Be Replaced

| Issue | Impact | Severity |
|-------|--------|----------|
| Page load speed | Poor Core Web Vitals, Google ranking penalty | Critical |
| Plugin dependency | Security vulnerabilities, update conflicts | High |
| Elementor overhead | 500KB+ JS bundle for simple pages | High |
| Content-code coupling | Cannot separate frontend from content | High |
| Scaling limitations | Cannot easily add premium gating | Medium |
| Editorial workflow | No structured content, everything is page-based | Medium |

### What Must Be Preserved

| Asset | Action Required |
|-------|----------------|
| Existing blog posts | Export and migrate to new CMS |
| URL structure | Map every URL, create 301 redirects |
| SEO metadata | Preserve titles, descriptions, canonical URLs |
| Images/media | Migrate to new hosting/CDN |
| Google Search Console data | Verify new domain/sitemap |
| Backlinks | 301 redirects preserve link equity |
| Internal links | Update or redirect |

---

## 4. Architecture Overview

### High-Level Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────┐
│                   TRAFFIC LAYER                      │
│  Google Search | Direct | Referral | Registered      │
│  Members                                             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              APPLICATION LAYER                       │
│                                                      │
│  Next.js 15 (App Router)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Public   │ │ Premium  │ │ Auth.js  │            │
│  │ SSG/SSR  │ │ Protected│ │ Middleware│            │
│  │ Pages    │ │ Routes   │ │ + Session│            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────────────────────────────────┐            │
│  │ SEO: Metadata, JSON-LD, Sitemap,    │            │
│  │ Canonicals, robots.txt              │            │
│  └──────────────────────────────────────┘            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│               CONTENT LAYER                          │
│                                                      │
│  Sanity CMS (Hosted — sanity.io)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Articles │ │ Providers│ │ Compare  │            │
│  │ Authors  │ │ Criteria │ │ Categories│           │
│  │ SEO Data │ │ Scores   │ │ Resources│            │
│  └──────────┘ └──────────┘ └──────────┘            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            INFRASTRUCTURE LAYER                      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│  │ Hetzner  │ │PostgreSQL│ │ GDPR Compliance  │    │
│  │ EU VPS   │ │ Users/   │ │ Cookie Consent   │    │
│  │          │ │ Sessions │ │ Privacy Policy   │    │
│  │          │ │ Leads    │ │ DPA with Vendors │    │
│  └──────────┘ └──────────┘ └──────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Content and application are separated.** Sanity stores content. Next.js renders and gates it. They communicate via API.
2. **Auth gates the browser, not the CMS.** Sanity serves all content to the Next.js server. Next.js decides what reaches the browser.
3. **Public content is static where possible.** Blog articles use Static Site Generation (SSG) for speed and crawlability.
4. **Premium content is server-rendered.** Comparison tables use Server-Side Rendering (SSR) with session checks.
5. **GDPR is a cross-cutting concern**, not a layer. It affects hosting, cookies, data storage, vendor contracts, and analytics choices.
6. **Migration is Phase 1 work**, not an afterthought. URL preservation is critical for SEO.

---

## 5. CMS Comparison & Decision

### Evaluation Criteria

| Criterion | Weight | Why It Matters |
|-----------|--------|---------------|
| Editor experience | 25% | Non-technical team must edit daily |
| SEO content modeling | 20% | Portal lives/dies by Google traffic |
| Structured content | 15% | Comparison data needs schemas |
| Hosting/ops burden | 15% | Part-time developer, no DevOps team |
| Access control | 10% | Premium content gating |
| Cost | 10% | Startup budget |
| Ecosystem/community | 5% | Long-term viability |

### Comparison Matrix

| Feature | Sanity v3 | Payload CMS v3 | Directus | Headless WordPress |
|---------|-----------|----------------|----------|-------------------|
| **Editor UX** | ★★★★★ Sanity Studio is purpose-built for editors, visual, customizable | ★★★☆☆ Admin panel exists but requires TypeScript config | ★★★★☆ Auto-generated admin from DB schema | ★★★★★ Familiar WordPress editor |
| **SEO metadata** | ★★★★★ Reusable schema types, extensive SEO documentation | ★★★★☆ Custom fields, but manual setup | ★★★☆☆ Generic field approach | ★★★★☆ Via Yoast/RankMath plugins |
| **Structured content** | ★★★★★ Schema-first, portable, GROQ query language | ★★★★★ Code-first collections, strong typing | ★★★★☆ Database-first, REST/GraphQL | ★★☆☆☆ Post/page model, ACF for custom fields |
| **Hosting burden** | ★★★★★ Hosted by Sanity (sanity.io), no self-hosting needed | ★★☆☆☆ Must self-host (Payload Cloud paused for new signups) | ★★★☆☆ Self-hosted or cloud options | ★★★☆☆ Must host WordPress + API layer |
| **Access control** | ★★★☆☆ Studio-level roles; app-level gating needs custom code | ★★★★★ Built-in access control, field-level auth | ★★★★☆ Granular permission model | ★★★☆☆ Plugin-dependent |
| **Cost (startup)** | ★★★★★ Free plan: 500K API requests/mo, 20GB bandwidth | ★★★★☆ Open-source free, but hosting costs | ★★★★☆ Open-source free, but hosting costs | ★★★☆☆ Hosting + plugins + maintenance |
| **TypeScript req** | ★★★★☆ Schema config in TS/JS, but editors don't touch code | ★★☆☆☆ Everything is TypeScript, editors need developer for changes | ★★★★☆ Config via UI, minimal code | ★★★★★ No TypeScript needed |
| **Next.js integration** | ★★★★★ Official Next.js toolkit, ISR/SSG support | ★★★★★ Built on Next.js natively | ★★★★☆ REST/GraphQL works with any frontend | ★★★☆☆ REST API available but clunky |
| **Long-term risk** | Low — Established company, clear roadmap | Medium — Acquired by Figma, Cloud paused | Low — Open-source, steady development | Low — Massive ecosystem, but architectural debt |

### Scoring Summary

| CMS | Editor (25%) | SEO (20%) | Structure (15%) | Ops (15%) | Auth (10%) | Cost (10%) | Community (5%) | **Total** |
|-----|-------------|-----------|-----------------|-----------|-----------|-----------|----------------|-----------|
| Sanity v3 | 5.0 | 5.0 | 5.0 | 5.0 | 3.0 | 5.0 | 4.0 | **4.65** |
| Payload v3 | 3.0 | 4.0 | 5.0 | 2.0 | 5.0 | 4.0 | 4.0 | **3.55** |
| Directus | 4.0 | 3.0 | 4.0 | 3.0 | 4.0 | 4.0 | 3.0 | **3.55** |
| Headless WP | 5.0 | 4.0 | 2.0 | 3.0 | 3.0 | 3.0 | 5.0 | **3.60** |

### Decision: Sanity v3

**Primary reason:** Zahn Kumpan is an SEO-first editorial and comparison portal with a non-technical editorial team. Sanity provides the best combination of editor experience, structured content modeling, SEO metadata management, and low operational burden.

**When Payload would be better:** If Zahn Kumpan were a developer-led SaaS product with complex application logic, custom backend workflows, and a full-time TypeScript team, Payload would be the stronger choice. It is not that case.

**When Directus would be better:** If the portal were primarily a data-management application with heavy API consumption (like an internal tool), Directus's database-first approach would be more natural.

**When Headless WordPress would be better:** If the editorial team absolutely refused to learn a new CMS and WordPress familiarity was the dominant constraint. But the client has explicitly asked to move away from WordPress.

### Sanity Pricing (as of 2026)

| Plan | Cost | Includes |
|------|------|---------|
| Free | $0/month | 500K API CDN requests, 100K API requests, 20GB bandwidth, 10GB assets, 3 non-admin users |
| Growth | $15/user/month | 2.5M API CDN requests, 500K API requests, 100GB bandwidth, 500GB assets |
| Enterprise | Custom | Custom limits, SLA, SSO |

For Zahn Kumpan's MVP, the free plan is sufficient. Growth plan ($15-45/month for 1-3 editors) is needed once the team scales content production.

### Sanity Integration with Next.js

```
Sanity Studio (sanity.io)     →     Sanity Content Lake (API)
        ↕                                    ↕
Editors create/edit content          GROQ queries from Next.js
        ↕                                    ↕
Preview mode (draft)              Published content (production)
```

Key integration points:
- `@sanity/client` — GROQ query client for fetching content
- `next-sanity` — Official Next.js toolkit with preview support
- `@sanity/image-url` — Image transformation and CDN URLs
- Webhook-triggered ISR (Incremental Static Regeneration) for content updates

---

## 6. Frontend Framework Comparison & Decision

### Comparison Matrix

| Feature | Next.js 15 | Astro 5 | Remix | Nuxt 3 (Vue) | Plain HTML/CSS/JS |
|---------|-----------|---------|-------|-------------|-------------------|
| **SSG support** | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ (manual) |
| **SSR support** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★★ | ☆☆☆☆☆ |
| **Auth integration** | ★★★★★ (Auth.js native) | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★☆☆☆☆ |
| **Route protection** | ★★★★★ (middleware) | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ☆☆☆☆☆ |
| **SEO control** | ★★★★★ (Metadata API) | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Sanity integration** | ★★★★★ (official toolkit) | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| **API routes** | ★★★★★ (built-in) | ★★★★☆ | ★★★★★ | ★★★★☆ | ☆☆☆☆☆ |
| **Learning curve** | Medium | Low | Medium | Medium | Very Low |
| **Bundle size** | Medium | Very Low | Medium | Medium | Zero |
| **Community/docs** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| **Suited for portal** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★☆☆☆☆ |

### Why Next.js 15 wins

Zahn Kumpan needs BOTH:
1. Public SEO pages (static/server-rendered, crawlable, fast)
2. Protected member area (authenticated, dynamic, server-checked)

Next.js is the only framework that handles both equally well with native middleware for route protection, built-in API routes for premium data endpoints, and official Sanity integration.

**When Astro would be better:** If the portal were purely editorial with no login, no premium gating, and no dynamic server-side logic. Astro's island architecture is excellent for static content sites but less natural for application-like member areas.

**When Remix would be better:** If the portal had complex form handling and mutation-heavy interactions. Remix's loader/action pattern is excellent for form-driven apps.

### Decision: Next.js 15 (App Router)

```
Next.js App Router structure:

app/
├── (public)/
│   ├── page.tsx                 # Landing page (SSG)
│   ├── blog/
│   │   ├── page.tsx             # Blog listing (SSG)
│   │   └── [slug]/
│   │       └── page.tsx         # Blog article (SSG with ISR)
│   ├── vergleich/               # Comparison (German URL)
│   │   ├── page.tsx             # Comparison overview (SSG)
│   │   └── [category]/
│   │       └── page.tsx         # Category comparison (SSR, gated)
│   └── datenschutz/
│       └── page.tsx             # Privacy policy (SSG)
├── (auth)/
│   ├── anmelden/
│   │   └── page.tsx             # Login (SSR)
│   └── registrieren/
│       └── page.tsx             # Register (SSR)
├── (premium)/
│   ├── dashboard/
│   │   └── page.tsx             # Member dashboard (SSR, protected)
│   └── vergleich/
│       └── [category]/
│           └── [provider1]-vs-[provider2]/
│               └── page.tsx     # Detailed comparison (SSR, protected)
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts         # Auth.js API handler
│   ├── comparison/
│   │   └── route.ts             # Protected comparison data endpoint
│   └── leads/
│       └── route.ts             # Lead capture endpoint
├── layout.tsx                    # Root layout with providers
└── middleware.ts                 # Auth + redirect middleware
```

---

## 7. Authentication & Authorization Comparison & Decision

### Why Auth Matters for This Portal

The portal has two user states:
1. **Anonymous visitor** — sees public blog content and comparison teasers
2. **Registered member** — sees full comparison tables, filters, downloads

The critical security rule: **Premium data must never reach the browser for unauthenticated users.** A blur overlay is a UX pattern, not a security measure. Anyone can remove CSS. Real protection happens server-side.

### Comparison Matrix

| Feature | Auth.js v5 | Supabase Auth | Clerk | Memberstack | Custom JWT |
|---------|-----------|---------------|-------|-------------|------------|
| **Next.js integration** | ★★★★★ Native | ★★★★☆ SDK | ★★★★★ Native | ★★☆☆☆ Widget | ★★★☆☆ Manual |
| **Server-side sessions** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★★★ |
| **Middleware support** | ★★★★★ | ★★★☆☆ | ★★★★★ | ☆☆☆☆☆ | ★★★☆☆ |
| **Database sessions** | ★★★★★ (adapter) | ★★★★★ (built-in) | ★★★★★ (managed) | ☆☆☆☆☆ | ★★★★★ |
| **Email/password** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| **Social OAuth** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| **Cost** | Free (OSS) | Free tier, then $25/mo | Free tier, then $25/mo | $25-49/mo | Free (DIY) |
| **Security risk** | Low (maintained OSS) | Low (managed) | Low (managed) | Medium (3rd party widget) | HIGH (DIY crypto) |
| **GDPR control** | ★★★★★ (self-hosted data) | ★★★☆☆ (US company) | ★★★☆☆ (US company) | ★★☆☆☆ (US company) | ★★★★★ |
| **Customization** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |

### Decision: Auth.js v5

**Primary reason:** Auth.js is the most natural auth solution for Next.js with full control over data storage (PostgreSQL adapter for GDPR compliance), server-side session checks in middleware, and zero vendor lock-in.

**Auth flow in the portal:**

```
User clicks "Anmelden" (Login)
        │
        ▼
Auth.js login page
(email/password or OAuth)
        │
        ▼
Auth.js verifies credentials
against PostgreSQL users table
        │
        ▼
Session created in PostgreSQL
Session cookie set (httpOnly, secure, sameSite)
        │
        ▼
Next.js middleware checks session
on every protected route request
        │
        ├── Valid session → Server fetches premium data from Sanity
        │                   → Returns full comparison tables to browser
        │
        └── No session → Server returns teaser data only
                         → Browser shows blur + CTA overlay
```

### Premium Content Protection — Correct Implementation

```typescript
// middleware.ts — runs on EVERY request before the page renders
import { auth } from "@/auth"

export default auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith("/premium")
  const isLoggedIn = !!req.auth

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/anmelden", req.nextUrl))
  }
})

export const config = {
  matcher: ["/premium/:path*", "/dashboard/:path*"]
}
```

```typescript
// app/api/comparison/route.ts — premium data endpoint
import { auth } from "@/auth"
import { sanityClient } from "@/lib/sanity"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user) {
    // Return ONLY teaser data for unauthenticated users
    const teasers = await sanityClient.fetch(`
      *[_type == "provider"]{
        name, category, slug, shortDescription, logoUrl
      }
    `)
    return Response.json({ data: teasers, premium: false })
  }

  // Return FULL comparison data for authenticated users
  const fullData = await sanityClient.fetch(`
    *[_type == "provider"]{
      name, category, slug, shortDescription, logoUrl,
      monthlyPrice, supportRating, featureScore,
      onboardingSpeed, bestFor, detailedReview,
      pros, cons, pricingTiers, integrations
    }
  `)
  return Response.json({ data: fullData, premium: true })
}
```

**Why this matters:** The GROQ query for unauthenticated users does not include premium fields (`monthlyPrice`, `supportRating`, `featureScore`, etc.). The data literally never reaches the browser. No CSS trick can reveal it because it was never sent.

### Auth.js Session Strategies

| Strategy | How It Works | Best For |
|----------|-------------|----------|
| **Database sessions** (recommended) | Session stored in PostgreSQL, cookie contains only session ID | This portal — full control, GDPR-friendly, revocable |
| **JWT sessions** | Session data encoded in cookie, no DB lookup needed | High-traffic apps where DB latency matters |

**Decision:** Database sessions via PostgreSQL adapter. This gives us full control, easy revocation, and the session data stays in our EU-hosted database.

---

## 8. Database Comparison & Decision

### What the Database Stores

The database is NOT for content. Content lives in Sanity. The database is for:

| Data Type | Examples |
|-----------|---------|
| User accounts | email, hashed password, name, created_at |
| Sessions | session_id, user_id, expires_at |
| Leads | name, email, company, interest, source, created_at |
| Form submissions | contact form data, newsletter signups |
| Bookmarks (future) | user_id, provider_id, saved_at |

### Comparison

| Feature | PostgreSQL | SQLite | MySQL | Supabase (managed PG) | MongoDB |
|---------|-----------|--------|-------|----------------------|---------|
| **Auth.js adapter** | ★★★★★ Official | ★★★★☆ via Drizzle | ★★★★☆ Official | ★★★★★ Official | ★★★★☆ Official |
| **Hosting on Hetzner** | ★★★★★ Easy | ★★★★★ Embedded | ★★★★☆ Easy | ★★★☆☆ External | ★★★☆☆ Separate |
| **Relational queries** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★★ | ★★☆☆☆ |
| **Scalability** | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★★★ |
| **GDPR (EU-hosted)** | ★★★★★ (self-hosted) | ★★★★★ (local file) | ★★★★★ (self-hosted) | ★★★☆☆ (US company) | ★★★☆☆ (Atlas is US) |
| **ORM support** | ★★★★★ (Drizzle, Prisma) | ★★★★☆ (Drizzle) | ★★★★★ (Drizzle, Prisma) | ★★★★★ (Drizzle, Prisma) | ★★★☆☆ (Mongoose) |
| **Cost** | Free (self-hosted) | Free | Free (self-hosted) | Free tier, then $25/mo | Free tier, then $57/mo |

### Decision: PostgreSQL (self-hosted on Hetzner)

**Why:** Full GDPR control (data stays in EU), excellent Auth.js adapter support, and Drizzle ORM for type-safe queries. No external vendor dependency for user data.

### ORM: Drizzle

Drizzle is chosen over Prisma because:
- Lighter weight (no query engine binary)
- Better edge runtime support
- SQL-like query syntax (more transparent)
- Official Auth.js adapter available

```typescript
// db/schema.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  hashedPassword: text("hashed_password"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
})

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  interest: text("interest"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
})
```

---

## 9. Hosting & Infrastructure Comparison & Decision

### Comparison Matrix

| Feature | Hetzner Cloud | Vercel | AWS (EU region) | Netlify | Railway |
|---------|--------------|--------|-----------------|---------|---------|
| **EU data center** | ★★★★★ Germany (Falkenstein, Nuremberg) | ★★★☆☆ EU edge nodes but US processing | ★★★★★ Frankfurt region | ★★★☆☆ US primary | ★★★★☆ EU option |
| **GDPR compliance** | ★★★★★ German company | ★★★☆☆ US company, DPA available | ★★★★☆ US company, EU region available | ★★★☆☆ US company | ★★★☆☆ US company |
| **Cost (MVP)** | ★★★★★ ~€5-20/mo VPS | ★★★★☆ Free tier, then $20/mo | ★★☆☆☆ Complex pricing | ★★★★☆ Free tier, then $19/mo | ★★★★☆ ~$5-20/mo |
| **Next.js support** | ★★★★☆ via Docker/Node | ★★★★★ Native (Vercel built Next.js) | ★★★★☆ via Lambda/ECS | ★★★★☆ | ★★★★☆ |
| **DevOps burden** | ★★★☆☆ Manual setup needed | ★★★★★ Zero-config | ★★☆☆☆ High complexity | ★★★★★ Zero-config | ★★★★☆ Low |
| **PostgreSQL** | ★★★★★ Self-hosted or managed | ★★☆☆☆ Need external (Neon/Supabase) | ★★★★★ RDS | ★★☆☆☆ Need external | ★★★★★ Built-in |
| **Custom domain** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |

### Decision: Hetzner Cloud (Primary) or Hybrid

**Option A — Full Hetzner (Recommended for GDPR strictness)**

| Component | Hosting | Cost/month |
|-----------|---------|-----------|
| Next.js app | Hetzner VPS (CX22: 2 vCPU, 4GB RAM) | ~€5 |
| PostgreSQL | Same VPS or managed DB | €0-10 |
| Sanity CMS | sanity.io (hosted) | €0 (free plan) |
| Domain | zahn-kumpan.de | ~€1 |
| SSL | Let's Encrypt (free) | €0 |
| **Total** | | **~€6-16/month** |

**Option B — Hybrid (Faster development)**

| Component | Hosting | Cost/month |
|-----------|---------|-----------|
| Next.js app | Vercel (Pro) | ~€20 |
| PostgreSQL | Neon (serverless PG, EU region) | €0-19 |
| Sanity CMS | sanity.io (hosted) | €0 |
| **Total** | | **~€20-39/month** |

**Recommendation:** Start with Option A for maximum GDPR control and cost efficiency. Move to Option B only if DevOps becomes a bottleneck.

### Deployment Architecture (Hetzner)

```
┌──────────────────────────────────────┐
│        Hetzner VPS (CX22)            │
│        Location: Falkenstein, DE     │
│                                       │
│  ┌────────────┐  ┌────────────┐      │
│  │ Next.js    │  │ PostgreSQL │      │
│  │ (Node.js)  │  │            │      │
│  │ Port 3000  │  │ Port 5432  │      │
│  └─────┬──────┘  └────────────┘      │
│        │                              │
│  ┌─────┴──────┐                      │
│  │ Caddy      │ ← Auto HTTPS         │
│  │ (reverse   │   via Let's Encrypt  │
│  │  proxy)    │                      │
│  │ Port 443   │                      │
│  └────────────┘                      │
└──────────────────────────────────────┘
         │
         ▼
    Sanity Content Lake (API)
    (Hosted by Sanity, CDN-backed)
```

---

## 10. Data Flow Architecture

### The Correct Data Flow

This is the most important architectural concept. Every piece of content flows through this path:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  SANITY CMS (Content Source — serves ALL content to Next.js)     │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────┐                │
│  │ Articles │ │ Providers    │ │ SEO Metadata  │                │
│  │ (public) │ │ (all fields) │ │ (all pages)   │                │
│  └────┬─────┘ └──────┬───────┘ └───────┬───────┘                │
│       │              │                 │                          │
└───────┼──────────────┼─────────────────┼──────────────────────────┘
        │              │                 │
        ▼              ▼                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  NEXT.JS SERVER (Application Layer — decides what browser gets)  │
│                                                                   │
│  ┌─────────────────────┐  ┌────────────────────────────────┐     │
│  │ PUBLIC ROUTES       │  │ PREMIUM ROUTES                 │     │
│  │                     │  │                                │     │
│  │ GROQ query:         │  │ 1. Check session (Auth.js)     │     │
│  │ fetch title, slug,  │  │ 2. IF authenticated:           │     │
│  │ excerpt, author,    │  │    GROQ query: fetch ALL       │     │
│  │ category, image,    │  │    fields including price,     │     │
│  │ seo metadata        │  │    scores, reviews, analysis   │     │
│  │                     │  │ 3. IF NOT authenticated:       │     │
│  │ Result: Full page   │  │    GROQ query: fetch ONLY      │     │
│  │ rendered as HTML    │  │    name, category, short desc   │     │
│  │                     │  │    (teaser data)               │     │
│  └─────────┬───────────┘  └──────────────┬─────────────────┘     │
│            │                             │                        │
└────────────┼─────────────────────────────┼────────────────────────┘
             │                             │
             ▼                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  BROWSER (receives only what the server sends)                   │
│                                                                   │
│  ┌─────────────────────┐  ┌────────────────────────────────┐     │
│  │ Public page:        │  │ Premium page:                  │     │
│  │ Full blog article   │  │ IF logged in: full tables      │     │
│  │ Indexable by Google │  │ IF not: teaser + blur + CTA    │     │
│  │ JSON-LD schema      │  │ Premium data was NEVER sent    │     │
│  └─────────────────────┘  └────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Point

The browser NEVER receives premium data for unauthenticated users. The protection is not CSS (blur overlay). The protection is that the GROQ query in the server component does not include premium fields when there is no session. The data literally does not exist in the HTML response.

### Mermaid Diagram — Correct Data Flow

```mermaid
flowchart TD
    S[Sanity CMS<br/>All content: articles, providers, comparisons, SEO] --> N[Next.js Server]
    V[Visitors<br/>Google / Direct / Members] --> N

    N --> PUB[Public SSG/SSR Path]
    N --> PREM[Premium Path]

    PUB --> BLOG[Blog Articles<br/>Full content, indexed]
    PUB --> TEASE[Comparison Teasers<br/>Basic info, no premium fields]
    PUB --> LAND[Landing Pages<br/>SEO-optimized]

    BLOG --> SEO[SEO Layer<br/>JSON-LD / Sitemap / Meta / Canonicals]
    TEASE --> SEO
    SEO --> GOOG[Google Indexing]

    PREM --> AUTH{Auth.js<br/>Session Check}
    AUTH -->|No session| LOCK[Locked Preview<br/>Teaser data only + blur + CTA]
    AUTH -->|Valid session| FULL[Full Premium Content<br/>All fields, filters, downloads]

    FULL --> API[Protected API Routes<br/>Server-side GROQ queries]
    API --> S

    AUTH --> DB[(PostgreSQL<br/>Users / Sessions / Leads)]

    WP[Current WordPress Site] --> MIG[Migration Scripts<br/>Export + transform + redirect map]
    MIG --> S
    MIG --> REDIR[301 Redirects<br/>Configured in next.config.js]
    REDIR --> N

    subgraph INFRA [Infrastructure + Compliance]
        H[Hetzner EU]
        CC[Cookie Consent<br/>GDPR banner]
        PP[Datenschutz<br/>Privacy policy]
        DPA[DPA with vendors<br/>Sanity, analytics]
    end
```

---

## 11. Content Modeling & Schema Design

### Sanity Schema Definitions

Each content type in Sanity is defined as a schema. Here are the schemas needed for Zahn Kumpan:

### Schema: Article (Blog Post)

```typescript
// schemas/article.ts
export default {
  name: "article",
  title: "Blog Article",
  type: "document",
  fields: [
    { name: "title", title: "Titel", type: "string",
      validation: (Rule) => Rule.required().max(70) },
    { name: "slug", title: "URL-Slug", type: "slug",
      options: { source: "title" } },
    { name: "excerpt", title: "Kurzfassung", type: "text",
      validation: (Rule) => Rule.max(160) },
    { name: "body", title: "Inhalt", type: "blockContent" },
    { name: "coverImage", title: "Titelbild", type: "image",
      options: { hotspot: true } },
    { name: "author", title: "Autor", type: "reference",
      to: [{ type: "author" }] },
    { name: "categories", title: "Kategorien", type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }] },
    { name: "publishedAt", title: "Veröffentlicht am", type: "datetime" },
    { name: "seo", title: "SEO", type: "seoFields" },
  ],
}
```

### Schema: Provider

```typescript
// schemas/provider.ts
export default {
  name: "provider",
  title: "Anbieter",
  type: "document",
  fields: [
    // PUBLIC fields (visible to everyone)
    { name: "name", title: "Anbieter-Name", type: "string" },
    { name: "slug", title: "URL-Slug", type: "slug",
      options: { source: "name" } },
    { name: "category", title: "Kategorie", type: "reference",
      to: [{ type: "providerCategory" }] },
    { name: "shortDescription", title: "Kurzbeschreibung", type: "text",
      validation: (Rule) => Rule.max(200) },
    { name: "logo", title: "Logo", type: "image" },
    { name: "website", title: "Website", type: "url" },

    // PREMIUM fields (only returned to authenticated users)
    { name: "monthlyPrice", title: "Monatlicher Preis (€)", type: "number" },
    { name: "pricingTiers", title: "Preisstufen", type: "array",
      of: [{ type: "pricingTier" }] },
    { name: "supportRating", title: "Support-Bewertung (1-10)", type: "number",
      validation: (Rule) => Rule.min(1).max(10) },
    { name: "featureScore", title: "Feature-Score (1-10)", type: "number",
      validation: (Rule) => Rule.min(1).max(10) },
    { name: "onboardingSpeed", title: "Onboarding-Geschwindigkeit", type: "string",
      options: { list: ["schnell", "mittel", "langsam"] } },
    { name: "bestFor", title: "Am besten für", type: "array",
      of: [{ type: "string" }] },
    { name: "pros", title: "Vorteile", type: "array",
      of: [{ type: "string" }] },
    { name: "cons", title: "Nachteile", type: "array",
      of: [{ type: "string" }] },
    { name: "detailedReview", title: "Detaillierte Bewertung",
      type: "blockContent" },
    { name: "integrations", title: "Integrationen", type: "array",
      of: [{ type: "string" }] },
    { name: "seo", title: "SEO", type: "seoFields" },
  ],
}
```

### Schema: Provider Category

```typescript
// schemas/providerCategory.ts
export default {
  name: "providerCategory",
  title: "Anbieter-Kategorie",
  type: "document",
  fields: [
    { name: "title", title: "Kategorie-Name", type: "string" },
    { name: "slug", title: "URL-Slug", type: "slug",
      options: { source: "title" } },
    { name: "description", title: "Beschreibung", type: "text" },
    { name: "icon", title: "Icon", type: "string" },
    { name: "seo", title: "SEO", type: "seoFields" },
  ],
}
```

### Schema: Comparison Criteria

```typescript
// schemas/comparisonCriteria.ts
export default {
  name: "comparisonCriteria",
  title: "Vergleichskriterium",
  type: "document",
  fields: [
    { name: "name", title: "Kriterium", type: "string" },
    { name: "description", title: "Beschreibung", type: "text" },
    { name: "weight", title: "Gewichtung (1-10)", type: "number" },
    { name: "dataType", title: "Datentyp", type: "string",
      options: { list: ["number", "text", "boolean", "rating"] } },
  ],
}
```

### Schema: SEO Fields (Reusable Object)

```typescript
// schemas/objects/seoFields.ts
export default {
  name: "seoFields",
  title: "SEO Einstellungen",
  type: "object",
  fields: [
    { name: "metaTitle", title: "Meta-Titel", type: "string",
      description: "Überschreibt den Standard-Titel",
      validation: (Rule) => Rule.max(70) },
    { name: "metaDescription", title: "Meta-Beschreibung", type: "text",
      validation: (Rule) => Rule.max(160) },
    { name: "canonicalUrl", title: "Canonical URL", type: "url" },
    { name: "ogImage", title: "Open Graph Bild", type: "image" },
    { name: "noIndex", title: "Nicht indexieren", type: "boolean",
      initialValue: false },
    { name: "noFollow", title: "Nicht folgen", type: "boolean",
      initialValue: false },
    { name: "structuredDataType", title: "Schema-Typ", type: "string",
      options: { list: ["BlogPosting", "Article", "FAQPage", "Product"] } },
  ],
}
```

### GROQ Queries

```groq
// Fetch all published articles (public)
*[_type == "article" && defined(publishedAt)] | order(publishedAt desc) {
  title, slug, excerpt, publishedAt,
  coverImage { asset->{url} },
  author->{name, image},
  categories[]->{title, slug},
  seo
}

// Fetch provider teasers (public — no premium fields)
*[_type == "provider"] {
  name, slug, shortDescription,
  category->{title, slug},
  logo { asset->{url} },
  website
}

// Fetch full provider data (premium — authenticated only)
*[_type == "provider" && category->slug.current == $categorySlug] {
  name, slug, shortDescription,
  category->{title, slug},
  logo { asset->{url} },
  website,
  monthlyPrice, pricingTiers,
  supportRating, featureScore,
  onboardingSpeed, bestFor,
  pros, cons, detailedReview,
  integrations,
  seo
}
```

---

## 12. SEO Architecture

### SEO Priority Matrix

| Priority | Action | Impact | Effort | Phase |
|----------|--------|--------|--------|-------|
| 1 | WordPress URL redirect map | Critical — losing URLs = losing rankings | High | 1 |
| 2 | Programmatic metadata from CMS | High — every page needs unique title/desc | Medium | 1 |
| 3 | JSON-LD structured data | High — rich snippets in Google | Medium | 1 |
| 4 | Sitemap.xml generation | High — crawl discovery | Low | 1 |
| 5 | Indexation control (noindex premium) | High — prevent thin content indexing | Low | 1 |
| 6 | Internal linking architecture | Medium — distributes page authority | Medium | 1-2 |
| 7 | Core Web Vitals optimization | Medium — ranking factor | Medium | 1 |
| 8 | Breadcrumb navigation | Low-Medium — UX + structured data | Low | 1 |
| 9 | FAQ schema on relevant pages | Low — rich snippets for informational queries | Low | 2 |
| 10 | hreflang (if multilingual later) | Low — only if expanding beyond German | Low | Future |

### Metadata Implementation

```typescript
// app/blog/[slug]/page.tsx
import { sanityClient } from "@/lib/sanity"

export async function generateMetadata({ params }) {
  const article = await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0]{
      title, excerpt, seo, coverImage { asset->{url} }
    }`,
    { slug: params.slug }
  )

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    alternates: {
      canonical: article.seo?.canonicalUrl ||
        `https://portal.zahn-kumpan.de/blog/${params.slug}`,
    },
    openGraph: {
      title: article.seo?.metaTitle || article.title,
      description: article.seo?.metaDescription || article.excerpt,
      images: [article.seo?.ogImage?.asset?.url ||
               article.coverImage?.asset?.url],
      type: "article",
    },
    robots: {
      index: !article.seo?.noIndex,
      follow: !article.seo?.noFollow,
    },
  }
}
```

### JSON-LD Structured Data

```typescript
// components/ArticleJsonLd.tsx
export function ArticleJsonLd({ article }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage?.asset?.url,
    datePublished: article.publishedAt,
    dateModified: article._updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Zahn Kumpan",
      logo: {
        "@type": "ImageObject",
        url: "https://portal.zahn-kumpan.de/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://portal.zahn-kumpan.de/blog/${article.slug.current}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### Indexation Rules

| Page Type | Index | Follow | Reason |
|-----------|-------|--------|--------|
| Blog articles | Yes | Yes | Core SEO content |
| Category pages | Yes | Yes | Taxonomy pages help clustering |
| Comparison teasers | Yes | Yes | Attract comparison searches |
| Premium comparison (full) | No | Yes | Behind auth, thin for Google |
| Login/Register | No | No | No SEO value |
| Dashboard | No | No | Private member area |
| Privacy policy | Yes | No | Legal requirement, index for trust |
| Imprint | Yes | No | German legal requirement |

### Sitemap Generation

```typescript
// app/sitemap.ts
import { sanityClient } from "@/lib/sanity"

export default async function sitemap() {
  const articles = await sanityClient.fetch(
    `*[_type == "article" && defined(publishedAt)]{ slug, _updatedAt }`
  )
  const categories = await sanityClient.fetch(
    `*[_type == "providerCategory"]{ slug, _updatedAt }`
  )

  const articleUrls = articles.map((a) => ({
    url: `https://portal.zahn-kumpan.de/blog/${a.slug.current}`,
    lastModified: a._updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const categoryUrls = categories.map((c) => ({
    url: `https://portal.zahn-kumpan.de/vergleich/${c.slug.current}`,
    lastModified: c._updatedAt,
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  return [
    {
      url: "https://portal.zahn-kumpan.de",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://portal.zahn-kumpan.de/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articleUrls,
    ...categoryUrls,
  ]
}
```

---

## 13. WordPress Migration Strategy

### Migration Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| URL structure changes break rankings | High | Critical | 301 redirect map for every URL |
| Content formatting loss | Medium | Medium | Manual review of migrated content |
| Image broken links | Medium | High | Migrate all media, update references |
| Internal links pointing to old URLs | High | Medium | Crawl and update all internal links |
| Metadata loss | Low | High | Export and map all Yoast/RankMath data |
| Temporary ranking drop | High | Medium | Expected, recovers in 2-6 weeks with proper redirects |

### Migration Steps

#### Step 1: Content Audit

```bash
# Export WordPress content via WP-CLI or REST API
wp export --post_type=post --output=posts.xml

# Or via REST API
curl https://zahn-kumpan.de/wp-json/wp/v2/posts?per_page=100 > posts.json
curl https://zahn-kumpan.de/wp-json/wp/v2/pages?per_page=100 > pages.json
curl https://zahn-kumpan.de/wp-json/wp/v2/media?per_page=100 > media.json
curl https://zahn-kumpan.de/wp-json/wp/v2/categories > categories.json
curl https://zahn-kumpan.de/wp-json/wp/v2/tags > tags.json
```

#### Step 2: Content Transformation Script

```python
# migrate_to_sanity.py
import json
import requests
from sanity import SanityClient

client = SanityClient(
    project_id="your-project-id",
    dataset="production",
    token="your-write-token",
    api_version="2026-05-14"
)

def transform_wp_post_to_sanity(wp_post):
    """Transform a WordPress post into a Sanity document."""
    return {
        "_type": "article",
        "title": wp_post["title"]["rendered"],
        "slug": {"_type": "slug", "current": wp_post["slug"]},
        "excerpt": strip_html(wp_post["excerpt"]["rendered"]),
        "body": html_to_portable_text(wp_post["content"]["rendered"]),
        "publishedAt": wp_post["date"],
        "seo": {
            "_type": "seoFields",
            "metaTitle": extract_yoast_title(wp_post),
            "metaDescription": extract_yoast_description(wp_post),
        },
    }

def migrate_posts():
    with open("posts.json") as f:
        posts = json.load(f)

    for post in posts:
        sanity_doc = transform_wp_post_to_sanity(post)
        client.create(sanity_doc)
        print(f"Migrated: {post['slug']}")

if __name__ == "__main__":
    migrate_posts()
```

#### Step 3: URL Redirect Map

```typescript
// next.config.ts — 301 redirects for SEO preservation
const redirects = async () => [
  // Blog post redirects (WordPress → new structure)
  {
    source: "/2024/03/15/terminbuchung-vergleich",
    destination: "/blog/terminbuchung-vergleich",
    permanent: true, // 301 redirect
  },
  {
    source: "/category/:slug",
    destination: "/blog/kategorie/:slug",
    permanent: true,
  },
  // WordPress pagination
  {
    source: "/page/:num",
    destination: "/blog?page=:num",
    permanent: true,
  },
  // WordPress tag pages
  {
    source: "/tag/:slug",
    destination: "/blog/thema/:slug",
    permanent: true,
  },
  // WordPress author pages
  {
    source: "/author/:name",
    destination: "/blog",
    permanent: true,
  },
]

module.exports = {
  redirects,
}
```

#### Step 4: Verification Checklist

| Check | Tool | Expected Result |
|-------|------|----------------|
| All old URLs redirect correctly | Screaming Frog / curl | 301 → new URL |
| No 404 errors for existing content | Google Search Console | Zero 404s for indexed pages |
| Metadata matches or improves | Side-by-side comparison | Same or better titles/descriptions |
| Images load correctly | Visual inspection | All images render |
| Internal links work | Screaming Frog crawl | No broken internal links |
| Sitemap submitted | Google Search Console | Sitemap accepted, pages indexed |
| robots.txt correct | Direct check | No accidental blocks |

---

## 14. Premium Content & Gating Strategy

### Content Tiers

| Tier | Content | Access | SEO |
|------|---------|--------|-----|
| **Tier 1: Public** | Blog articles, guides, news | Everyone | Fully indexed |
| **Tier 2: Teaser** | Comparison overview, basic provider info | Everyone | Indexed (landing pages) |
| **Tier 3: Premium** | Full comparison tables, scores, analysis | Registered members only | Not indexed (noindex) |
| **Tier 4: Downloadable** | PDFs, checklists, templates | Registered members only | Not indexed |

### Teaser vs Premium Data Split

| Field | Teaser (Public) | Premium (Authenticated) |
|-------|----------------|----------------------|
| Provider name | Yes | Yes |
| Category | Yes | Yes |
| Logo | Yes | Yes |
| Short description | Yes | Yes |
| Website link | Yes | Yes |
| Monthly price | No | Yes |
| Pricing tiers | No | Yes |
| Support rating | No | Yes |
| Feature score | No | Yes |
| Onboarding speed | No | Yes |
| Best for | No | Yes |
| Pros/Cons | No | Yes |
| Detailed review | No | Yes |
| Integrations list | No | Yes |

### UX Pattern: Locked Preview

```
┌─────────────────────────────────────┐
│  Comparison: Terminbuchung          │
│                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Dr.  │ │ Docu │ │ Termi│        │ ← Provider cards (teaser)
│  │ Flex │ │ Dent │ │ now  │        │
│  └──────┘ └──────┘ └──────┘        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │ ← Blurred comparison table
│  │ ░░░ PREMIUM CONTENT ░░░░░░░ │   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  │                              │   │
│  │  ┌────────────────────────┐  │   │
│  │  │ Kostenlos registrieren │  │   │ ← CTA button
│  │  │ für den vollständigen  │  │   │
│  │  │ Vergleich              │  │   │
│  │  └────────────────────────┘  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Important:** The blurred area does NOT contain real premium data. It contains a placeholder/skeleton. The real data is fetched only after login, via a server-side API call that checks the session.

---

## 15. GDPR / DSGVO Compliance

### GDPR is NOT a Layer — It's a Checklist

GDPR compliance is a cross-cutting concern that affects every part of the system. It is not a middleware or a service. Here is what must be implemented:

### GDPR Compliance Checklist

| Requirement | Implementation | Phase |
|------------|---------------|-------|
| **Cookie consent banner** | Cookiebot or custom implementation, opt-in for non-essential cookies | 1 |
| **Privacy policy (Datenschutz)** | German-language page explaining data collection, processing, rights | 1 |
| **Imprint (Impressum)** | German legal requirement for commercial websites | 1 |
| **DPA with Sanity** | Data Processing Agreement with sanity.io | 1 |
| **DPA with analytics** | If using Plausible/Matomo | 2 |
| **EU data hosting** | PostgreSQL on Hetzner (Germany) | 1 |
| **Session security** | httpOnly, secure, sameSite cookies | 1 |
| **Data minimization** | Only collect name, email, company for registration | 1 |
| **Right to deletion** | User can request account + data deletion | 1 |
| **Right to export** | User can export their data (leads, preferences) | 2 |
| **Consent for marketing** | Double opt-in for newsletter | 2 |
| **No PII to LLMs** | Never send user personal data to OpenAI/Claude API | 4 |
| **Audit logging** | Log who accessed what data, when | 3 |

### Cookie Consent Requirements (Germany)

Germany follows the ePrivacy Directive strictly. The rules:

| Cookie Type | Consent Required | Example |
|-------------|-----------------|---------|
| **Strictly necessary** | No consent needed | Session cookies, Auth.js session, CSRF tokens |
| **Analytics** | Consent required (opt-in) | Plausible, Matomo, Google Analytics |
| **Marketing** | Consent required (opt-in) | Facebook Pixel, Google Ads |
| **Preferences** | Consent required (opt-in) | Language preference, saved filters |

### Privacy-Friendly Analytics Options

| Tool | GDPR Status | Cookie-Free Option | EU Hosting | Cost |
|------|------------|-------------------|-----------|------|
| **Plausible** | GDPR-compliant | Yes (no cookies) | EU servers | €9/mo |
| **Matomo** | GDPR-compliant (self-hosted) | Yes | Self-hosted | Free (self-host) |
| **Fathom** | GDPR-compliant | Yes | EU option | €14/mo |
| **Google Analytics 4** | Problematic in Germany | No | US processing | Free |
| **Umami** | GDPR-compliant (self-hosted) | Yes | Self-hosted | Free (self-host) |

**Recommendation:** Plausible (€9/month) or self-hosted Matomo on the Hetzner VPS (free).

Do NOT use Google Analytics without explicit cookie consent and a detailed DPA. Several German DPAs (data protection authorities) have ruled GA4 non-compliant.

---

## 16. Comparison Feature — Filter Logic & Provider Data

### Provider Data Model

Each provider in a category has structured fields that enable filtering and comparison:

```typescript
interface Provider {
  // Public fields
  name: string
  slug: string
  category: string
  shortDescription: string
  logoUrl: string
  website: string

  // Premium fields (gated)
  monthlyPrice: number        // in EUR
  pricingTiers: PricingTier[]
  supportRating: number       // 1-10
  featureScore: number        // 1-10
  onboardingSpeed: "schnell" | "mittel" | "langsam"
  bestFor: string[]           // ["kleine Praxis", "Großpraxis", "MVZ"]
  pros: string[]
  cons: string[]
  detailedReview: PortableText
  integrations: string[]
}

interface PricingTier {
  name: string                // "Basis", "Pro", "Enterprise"
  monthlyPrice: number
  features: string[]
  maxUsers: number
}
```

### Filter Logic (Frontend)

```typescript
// hooks/useProviderFilter.ts
import { useState, useMemo } from "react"

interface FilterState {
  priceRange: [number, number]
  minSupportRating: number
  minFeatureScore: number
  onboardingSpeed: string[]
  bestFor: string[]
}

export function useProviderFilter(providers: Provider[]) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    minSupportRating: 0,
    minFeatureScore: 0,
    onboardingSpeed: [],
    bestFor: [],
  })

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (p.monthlyPrice < filters.priceRange[0]) return false
      if (p.monthlyPrice > filters.priceRange[1]) return false
      if (p.supportRating < filters.minSupportRating) return false
      if (p.featureScore < filters.minFeatureScore) return false
      if (filters.onboardingSpeed.length > 0 &&
          !filters.onboardingSpeed.includes(p.onboardingSpeed)) return false
      if (filters.bestFor.length > 0 &&
          !filters.bestFor.some((b) => p.bestFor.includes(b))) return false
      return true
    })
  }, [providers, filters])

  return { filters, setFilters, filtered }
}
```

### Comparison Categories (Trial)

| Category | German Name | Example Providers |
|----------|-------------|-------------------|
| Appointment Booking | Terminbuchung | Dr. Flex, Doctolib, Terminow |
| Billing Center | Abrechnungszentrum | DZR, Health AG, BFS |
| Practice Management | Praxisverwaltung | Dampsoft, Z1, Charly |
| Patient Communication | Patientenkommunikation | Dr. Smile, Dental Monitoring |

### Meeting-Ready Explanation

> "I kept the filter logic intentionally simple and transparent for the prototype: the data model is structured so each provider has normalized comparison fields, and the UI filters against those fields in real time. In production, those values would come from CMS-managed structured content rather than hardcoded frontend data."

---

## 17. API Architecture & Integration Points

### Internal API Routes

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/auth/[...nextauth]` | ALL | No | Auth.js handler |
| `/api/comparison` | GET | No (returns teaser) / Yes (returns full) | Provider comparison data |
| `/api/comparison/[category]` | GET | No/Yes | Category-specific providers |
| `/api/leads` | POST | No | Lead capture form submission |
| `/api/newsletter` | POST | No | Newsletter signup |
| `/api/user/profile` | GET/PUT | Yes | User profile management |
| `/api/user/bookmarks` | GET/POST/DELETE | Yes | Saved providers (Phase 3) |

### External API Integrations

| Service | API Type | Purpose | Phase |
|---------|----------|---------|-------|
| Sanity | REST/GROQ | Content fetching | 1 |
| Sanity Webhooks | Webhook | ISR content revalidation | 1 |
| Brevo (Sendinblue) | REST | Email marketing, CRM | 2 |
| Plausible | REST | Analytics data | 2 |
| OpenAI / Claude API | REST | LLM comparison explainer | 4 |

### Sanity Webhook for Content Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sanity-webhook-secret")
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const { _type, slug } = body

  switch (_type) {
    case "article":
      revalidatePath(`/blog/${slug?.current}`)
      revalidatePath("/blog")
      break
    case "provider":
      revalidatePath(`/vergleich`)
      break
    case "providerCategory":
      revalidatePath(`/vergleich/${slug?.current}`)
      break
  }

  return Response.json({ revalidated: true })
}
```

### Integration Difficulty Assessment

| Integration | Difficulty | Time Estimate | Dependencies |
|-------------|-----------|---------------|-------------|
| Sanity → Next.js | Easy | 2-4 hours | `@sanity/client`, `next-sanity` |
| Auth.js → PostgreSQL | Easy | 1-2 hours | `@auth/drizzle-adapter` |
| Sanity Webhook → ISR | Easy | 1 hour | Sanity webhook config |
| Brevo Email API | Medium | 4-8 hours | API key, templates |
| Plausible Analytics | Easy | 30 min | Script tag |
| OpenAI/Claude API | Medium | 8-16 hours | Prompt engineering, rate limiting |
| Stripe (if needed later) | Medium-Hard | 16-24 hours | Payment flow, webhooks |

---

## 18. LLM Integration Strategy (Phase 4)

### Why NOT Phase 1

| Reason | Explanation |
|--------|------------|
| No structured content yet | LLM needs CMS data to summarize — that data doesn't exist until Phase 1 is complete |
| No users yet | Building LLM features for zero users is wasted effort |
| Core portal must work first | Login, premium gating, SEO, migration are all higher priority |
| Legal risk | LLM outputs about dental providers could be misleading if not controlled |
| Cost | API calls cost money with no revenue to offset |

### Recommended First LLM Feature: Provider Comparison Explainer

This is NOT a chatbot. It is a constrained summarizer that works on structured CMS data.

```
User selects two providers (e.g., Dr. Flex vs. Doctolib)
        │
        ▼
System fetches structured data from Sanity
(price, support rating, features, bestFor, pros, cons)
        │
        ▼
LLM receives structured prompt with data
(no freeform user input to the LLM)
        │
        ▼
LLM generates comparison summary
"For a small practice focused on ease of onboarding,
 Dr. Flex may be the better fit because..."
        │
        ▼
Output displayed to authenticated user
(with disclaimer: "This summary is based on our
 structured provider data and is not financial or
 legal advice.")
```

### LLM Provider Comparison

| Feature | OpenAI (GPT-4o) | Anthropic (Claude Sonnet 4) | Mistral | Local Ollama |
|---------|-----------------|---------------------------|---------|-------------|
| **Quality** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Cost per 1K tokens** | ~$0.0025 input / $0.01 output | ~$0.003 input / $0.015 output | ~$0.001 input / $0.003 output | Free (compute cost) |
| **Speed** | Fast | Fast | Fast | Slow (depends on hardware) |
| **GDPR** | DPA available | DPA available | EU company | Full control |
| **German language** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Structured output** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Best for** | Production, high quality | Production, high quality | Cost-sensitive, EU preference | Internal tools, testing |

### Decision: Start with ONE provider

Do NOT set up three LLM providers. Pick one:
- **Recommendation: Claude API (Anthropic)** — strong German language, structured output, DPA available
- **Alternative: OpenAI GPT-4o-mini** — cheaper for high volume, good quality

### LLM Prompt Template (Example)

```python
COMPARISON_PROMPT = """
Du bist ein Assistent für den Vergleich von Dental-Software.
Erstelle eine kurze, sachliche Zusammenfassung basierend auf
den folgenden strukturierten Anbieterdaten.

Anbieter A: {provider_a_name}
- Monatlicher Preis: {provider_a_price}€
- Support-Bewertung: {provider_a_support}/10
- Feature-Score: {provider_a_features}/10
- Onboarding: {provider_a_onboarding}
- Am besten für: {provider_a_best_for}
- Vorteile: {provider_a_pros}
- Nachteile: {provider_a_cons}

Anbieter B: {provider_b_name}
- Monatlicher Preis: {provider_b_price}€
- Support-Bewertung: {provider_b_support}/10
- Feature-Score: {provider_b_features}/10
- Onboarding: {provider_b_onboarding}
- Am besten für: {provider_b_best_for}
- Vorteile: {provider_b_pros}
- Nachteile: {provider_b_cons}

Regeln:
1. Antworte auf Deutsch
2. Maximal 200 Wörter
3. Keine rechtliche oder finanzielle Beratung
4. Basiere dich NUR auf die obigen Daten
5. Erwähne keine Informationen, die nicht in den Daten stehen
6. Strukturiere: kurze Einleitung, Hauptunterschiede, Empfehlung nach Praxisgröße

Zusammenfassung:
"""
```

### LLM Safety Rules

| Rule | Reason |
|------|--------|
| Never send user PII to LLM API | GDPR violation |
| Only use structured CMS data as input | Prevents hallucination |
| Always add disclaimer to output | Legal protection |
| Human review before publishing LLM-generated content | Quality control |
| Rate limit LLM calls per user | Cost control |
| Log all LLM interactions (without PII) | Audit trail |
| Use prompt templates, not freeform user input | Prevents prompt injection |

---

## 19. Search Strategy

### Phase-Based Search Plan

| Phase | Search Solution | When to Implement |
|-------|----------------|-------------------|
| **Phase 1** | No search (navigation-based) | MVP launch |
| **Phase 2** | Basic CMS search (Sanity GROQ) | When content exceeds ~50 pages |
| **Phase 3** | Meilisearch or Typesense | When content exceeds ~200 pages |
| **Phase 4** | Semantic/vector search | When users need discovery, not just lookup |

### Search Tool Comparison

| Feature | Sanity GROQ Search | Meilisearch | Typesense | Algolia | Elasticsearch |
|---------|-------------------|-------------|-----------|---------|--------------|
| **Setup difficulty** | ★★★★★ Zero (built-in) | ★★★★☆ Easy | ★★★★☆ Easy | ★★★★★ Managed | ★★☆☆☆ Complex |
| **German language** | ★★★☆☆ Basic | ★★★★☆ Good | ★★★★☆ Good | ★★★★★ Excellent | ★★★★★ Excellent |
| **Typo tolerance** | ☆☆☆☆☆ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★☆ |
| **Faceted filtering** | ★★★☆☆ | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| **Self-hosted (EU)** | N/A | ★★★★★ | ★★★★★ | ☆☆☆☆☆ | ★★★★★ |
| **Cost** | Free | Free (self-host) | Free (self-host) | $$$$ | Free (self-host) |
| **Best for** | < 100 pages | 100-10K pages | 100-10K pages | Any scale | Large scale |

### Decision: Start with GROQ, upgrade to Meilisearch when needed

---

## 20. CRM & Email Automation (Phase 2)

### CRM Comparison

| Feature | Brevo (Sendinblue) | HubSpot | ActiveCampaign | Mailchimp |
|---------|-------------------|---------|----------------|-----------|
| **EU company** | Yes (France) | No (US) | No (US) | No (US) |
| **GDPR compliance** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |
| **Free tier** | 300 emails/day | 1000 contacts | No free tier | 500 contacts |
| **API quality** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **Startup cost** | €0-25/mo | €0-45/mo | €29/mo | €0-13/mo |
| **CRM features** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★☆☆ |
| **Email automation** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ |

### Decision: Brevo

**Why:** European company (French), GDPR-friendly by design, generous free tier, good API for integration with Next.js.

### Lead Capture Flow

```
Visitor reads blog article
        │
        ▼
Sees comparison teaser (locked)
        │
        ▼
Clicks "Kostenlos registrieren"
        │
        ▼
Registration form:
- Name
- Email
- Praxisname (optional)
- Praxisgröße (optional)
        │
        ▼
Auth.js creates account in PostgreSQL
Brevo API creates contact with tags
        │
        ▼
Double opt-in email sent
        │
        ▼
User confirms email
        │
        ▼
Welcome email with premium access link
Automated nurture sequence starts
```

---

## 21. Analytics & Monitoring

### Analytics Stack (Phase 2)

| Tool | Purpose | GDPR | Cost |
|------|---------|------|------|
| Plausible | Page views, referrers, top pages | Cookie-free, EU | €9/mo |
| Google Search Console | Search rankings, impressions, CTR | Free, essential | Free |
| Uptime monitoring | Server availability | N/A | Free (UptimeRobot) |
| Error tracking | Runtime errors | Sentry (EU option) | Free tier |

### Key Metrics to Track

| Metric | Tool | Purpose |
|--------|------|---------|
| Organic traffic | Plausible + GSC | SEO effectiveness |
| Top landing pages | Plausible | Content strategy |
| Registration conversion rate | Custom (PostgreSQL) | Funnel optimization |
| Premium content engagement | Custom events | Content value |
| Comparison page views | Plausible | Provider interest |
| Bounce rate on blog | Plausible | Content quality |
| Core Web Vitals | Google Search Console | Technical SEO |

---

## 22. Security Architecture

### Security Layers

| Layer | Measure | Implementation |
|-------|---------|---------------|
| **Transport** | HTTPS everywhere | Caddy auto-TLS or Let's Encrypt |
| **Session** | httpOnly, secure, sameSite cookies | Auth.js configuration |
| **CSRF** | SameSite=Lax + CSRF token | Auth.js built-in |
| **XSS** | Content Security Policy headers | Next.js middleware |
| **Rate limiting** | API route rate limits | Custom middleware or upstash/ratelimit |
| **Input validation** | Zod schema validation | All API routes |
| **SQL injection** | Parameterized queries via Drizzle ORM | ORM handles escaping |
| **Auth bypass** | Server-side session check on every premium route | Middleware + API route checks |
| **Data exposure** | Different GROQ queries for auth/unauth | Never send premium fields to browser |
| **Dependency security** | npm audit, Dependabot | CI/CD pipeline |

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://cdn.sanity.io data:; font-src 'self';"
  },
]
```

---

## 23. Performance & Caching Strategy

### Rendering Strategy Per Page Type

| Page Type | Rendering | Cache | Revalidation |
|-----------|-----------|-------|-------------|
| Landing page | SSG | CDN | On deploy |
| Blog listing | SSG | CDN | ISR (60s) |
| Blog article | SSG + ISR | CDN | Webhook from Sanity |
| Comparison teaser | SSG + ISR | CDN | Webhook from Sanity |
| Premium comparison | SSR | No cache | Real-time (auth check) |
| Login/Register | SSR | No cache | N/A |
| Dashboard | SSR | No cache | Real-time |

### Caching Architecture

```
Browser Request
     │
     ▼
Caddy (Reverse Proxy)
     │
     ├── Static assets → File system cache (immutable headers)
     │
     ├── Public SSG pages → Served directly from .next/static
     │
     └── Dynamic routes → Next.js Node.js server
              │
              ├── ISR pages → Stale-while-revalidate
              │
              └── SSR pages → No cache, fresh every request
```

### Image Optimization

- Sanity Image CDN handles transformations (resize, crop, format)
- Next.js `<Image>` component for lazy loading and responsive images
- WebP/AVIF format auto-negotiation via Sanity CDN

---

## 24. Phase Plan & Roadmap

### Phase 0: Trial Submission (Current — 1-2 days)

| Deliverable | Description | Status |
|------------|-------------|--------|
| Static prototype | Next.js + Tailwind, blog teasers, comparison, login gate | To build |
| Concept document | 1-2 pages, CMS choice, auth, SEO, migration, LLM idea | To write |
| Architecture explanation | Ready for meeting discussion | Done (this document) |

### Phase 1: MVP (Weeks 1-8)

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 1-2 | Sanity setup, schema creation, sample content | Working CMS with content types |
| 3-4 | Next.js frontend, public pages, blog listing | Public portal visible |
| 5 | Auth.js + PostgreSQL, registration, login | Working member system |
| 6 | Premium gating, comparison tables, filters | Protected comparison feature |
| 7 | WordPress migration, redirect map, SEO metadata | Content migrated, URLs preserved |
| 8 | GDPR (cookie consent, Datenschutz, Impressum), testing | Production-ready MVP |

### Phase 2: Lead Generation (Weeks 9-14)

| Week | Tasks |
|------|-------|
| 9-10 | Brevo CRM integration, email templates, lead capture forms |
| 11-12 | Newsletter system, double opt-in, welcome sequence |
| 13 | Plausible analytics, Google Search Console optimization |
| 14 | A/B testing registration flow, conversion optimization |

### Phase 3: Content & Search (Weeks 15-20)

| Week | Tasks |
|------|-------|
| 15-16 | Content expansion (more providers, more categories) |
| 17-18 | Meilisearch integration (if content volume justifies it) |
| 19 | User bookmarks, saved comparisons |
| 20 | Internal linking optimization, content performance review |

### Phase 4: Intelligence (Weeks 21-26)

| Week | Tasks |
|------|-------|
| 21-22 | LLM comparison explainer (Claude API or OpenAI) |
| 23-24 | SEO content brief generator (internal tool) |
| 25-26 | Semantic search exploration, performance review |

---

## 25. Cost Estimation

### Monthly Running Costs (After MVP)

| Service | Cost/Month | Required Phase |
|---------|-----------|---------------|
| Hetzner VPS (CX22) | ~€5 | 1 |
| Domain (zahn-kumpan.de) | ~€1 | 1 |
| Sanity CMS (Free plan) | €0 | 1 |
| Sanity CMS (Growth, 2 editors) | €30 | 2+ |
| Plausible Analytics | €9 | 2 |
| Brevo Email (Free tier) | €0 | 2 |
| Brevo Email (Starter) | €19 | 3+ |
| LLM API (Claude/OpenAI, ~1000 calls/mo) | ~€5-15 | 4 |
| **Total MVP (Phase 1)** | **~€6/month** | |
| **Total Growth (Phase 2-3)** | **~€60/month** | |
| **Total Full (Phase 4)** | **~€80/month** | |

### Development Time Estimate

| Phase | Estimated Hours | At €50/hr | At €35/hr |
|-------|----------------|-----------|-----------|
| Phase 0 (Trial) | 12-16 hours | €600-800 | €420-560 |
| Phase 1 (MVP) | 80-120 hours | €4,000-6,000 | €2,800-4,200 |
| Phase 2 (Leads) | 40-60 hours | €2,000-3,000 | €1,400-2,100 |
| Phase 3 (Search) | 30-40 hours | €1,500-2,000 | €1,050-1,400 |
| Phase 4 (LLM) | 30-40 hours | €1,500-2,000 | €1,050-1,400 |
| **Total** | **192-276 hours** | **€9,600-13,800** | **€6,720-9,660** |

---

## 26. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| SEO rankings drop after migration | High (temporary) | High | Proper 301 redirects, staged migration, monitoring |
| Sanity pricing changes | Low | Medium | Content is portable, can migrate to another CMS |
| Payload Cloud returns, client asks to switch | Low | Low | Architecture is CMS-agnostic by design |
| Part-time developer availability bottleneck | Medium | High | Clear documentation, modular architecture |
| GDPR complaint/fine | Low | Very High | EU hosting, cookie consent, DPA, legal review |
| Scope creep (too many features too early) | High | High | Strict phasing, no Phase 2+ work until Phase 1 is done |
| Content team can't use Sanity | Low | Medium | Training session, simple schema design |
| LLM generates misleading provider comparisons | Medium | High | Only structured data input, disclaimers, human review |

---

## 27. Technology Stack Summary

### Final Stack Card

```
┌─────────────────────────────────────────────┐
│           ZAHN KUMPAN TECH STACK            │
│                                              │
│  Frontend:    Next.js 15 (App Router)       │
│  Styling:     Tailwind CSS v4               │
│  Language:    TypeScript                     │
│  CMS:         Sanity v3                     │
│  Auth:        Auth.js v5                    │
│  Database:    PostgreSQL 16                 │
│  ORM:         Drizzle                       │
│  Hosting:     Hetzner Cloud (Germany)       │
│  Proxy:       Caddy (auto-HTTPS)            │
│  Analytics:   Plausible (Phase 2)           │
│  Email/CRM:   Brevo (Phase 2)              │
│  Search:      Meilisearch (Phase 3)         │
│  LLM:         Claude API (Phase 4)          │
│  Monitoring:  UptimeRobot + Sentry          │
│                                              │
│  GDPR:        Cookie consent + EU hosting   │
│               + DPA + Datenschutz page      │
└─────────────────────────────────────────────┘
```

---

## Appendix A: Mermaid Diagrams

### Diagram 1: Complete System Architecture

```mermaid
flowchart TD
    A[Visitors<br/>Google / Direct / Referral / Members] --> B[Next.js Frontend + Server Layer]
    S[Sanity CMS<br/>Articles / Providers / Comparisons / SEO Fields] -->|GROQ API| B

    B --> C[Public SEO Path]
    B --> D[Premium Path]
    B --> DB[(PostgreSQL<br/>Users / Sessions / Leads)]

    C --> C1[Blog Articles<br/>SSG + ISR]
    C --> C2[Comparison Teasers<br/>SSG]
    C --> C3[Landing Pages<br/>SSG]
    C1 --> SEO[SEO Layer<br/>JSON-LD / Sitemap / Canonicals]
    C2 --> SEO
    SEO --> GOOG[Google Indexing]

    D --> AUTH{Auth.js<br/>Server-side<br/>Session Check}
    AUTH -->|No session| LOCK[Locked Preview<br/>Teaser data only]
    AUTH -->|Valid session| FULL[Full Premium Content<br/>Tables / Filters / Downloads]
    AUTH --> DB

    FULL -->|Server-side GROQ query<br/>with all premium fields| S

    WP[WordPress<br/>Current Site] --> MIG[Migration<br/>Export + Transform]
    MIG -->|Content| S
    MIG -->|301 Redirects| B

    subgraph GDPR [GDPR / DSGVO Compliance]
        CC[Cookie Consent]
        PP[Datenschutz]
        IMP[Impressum]
        DPA_V[DPA Vendors]
    end

    subgraph HOSTING [Infrastructure]
        HZ[Hetzner EU<br/>Germany]
        CADDY[Caddy<br/>Auto-HTTPS]
    end
```

### Diagram 2: Auth Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant M as Next.js Middleware
    participant S as Next.js Server
    participant A as Auth.js
    participant DB as PostgreSQL
    participant CMS as Sanity CMS

    B->>M: GET /vergleich/terminbuchung
    M->>A: Check session cookie
    A->>DB: Lookup session
    DB-->>A: Session valid / invalid

    alt No valid session
        A-->>M: No session
        M->>S: Render public version
        S->>CMS: GROQ query (teaser fields only)
        CMS-->>S: name, category, shortDesc
        S-->>B: HTML with teaser + blur + CTA
    else Valid session
        A-->>M: Session valid (user_id)
        M->>S: Render premium version
        S->>CMS: GROQ query (ALL fields)
        CMS-->>S: Full provider data
        S-->>B: HTML with full comparison table
    end
```

### Diagram 3: Content Migration Flow

```mermaid
flowchart LR
    WP[WordPress DB] --> EXP[Export Script<br/>WP REST API / WP-CLI]
    EXP --> JSON[JSON Files<br/>posts, pages, media,<br/>categories, meta]
    JSON --> TRANSFORM[Transform Script<br/>Python]
    TRANSFORM --> SANITY[Sanity Import<br/>via Sanity Client]
    TRANSFORM --> REDIRECT[Redirect Map<br/>old URL → new URL]
    TRANSFORM --> MEDIA[Media Migration<br/>Images → Sanity Assets]
    REDIRECT --> NEXTCONFIG[next.config.ts<br/>redirects array]
    SANITY --> VERIFY[Verification<br/>Screaming Frog crawl]
    NEXTCONFIG --> VERIFY
    VERIFY --> GSC[Google Search Console<br/>Submit new sitemap]
```

### Diagram 4: Lead Capture Flow

```mermaid
flowchart TD
    VISIT[Visitor reads blog article] --> TEASER[Sees locked comparison teaser]
    TEASER --> CTA[Clicks 'Kostenlos registrieren']
    CTA --> FORM[Registration Form<br/>Name, Email, Praxis optional]
    FORM --> AUTHJS[Auth.js creates account]
    AUTHJS --> PGDB[(PostgreSQL<br/>New user record)]
    AUTHJS --> BREVO[Brevo API<br/>Create contact + tags]
    BREVO --> DOI[Double Opt-in Email]
    DOI --> CONFIRM[User confirms email]
    CONFIRM --> WELCOME[Welcome Email<br/>+ Premium access link]
    WELCOME --> NURTURE[Automated Nurture Sequence<br/>Week 1, 2, 4 emails]
```

### Diagram 5: LLM Comparison Explainer Flow (Phase 4)

```mermaid
flowchart TD
    USER[Logged-in user selects<br/>Provider A vs Provider B] --> FETCH[Server fetches structured data<br/>from Sanity for both providers]
    FETCH --> TEMPLATE[Build prompt from template<br/>+ structured provider data]
    TEMPLATE --> LLM[Claude API / OpenAI<br/>Generate comparison summary]
    LLM --> VALIDATE[Validate output<br/>length, language, no PII]
    VALIDATE --> CACHE[Cache result<br/>same pair = same response for 24h]
    CACHE --> DISPLAY[Display summary to user<br/>with disclaimer]
    DISPLAY --> LOG[Log interaction<br/>no PII, only provider IDs + timestamp]
```

---

## Appendix B: API Reference Patterns

### Lead Capture Endpoint

```typescript
// app/api/leads/route.ts
import { db } from "@/db"
import { leads } from "@/db/schema"
import { z } from "zod"

const LeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  interest: z.string().max(500).optional(),
  source: z.string().max(100).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = LeadSchema.parse(body)

    const lead = await db.insert(leads).values({
      ...validated,
      source: validated.source || "website",
    }).returning()

    // Optional: Send to Brevo CRM (Phase 2)
    // await brevoClient.createContact({
    //   email: validated.email,
    //   attributes: { FIRSTNAME: validated.name, COMPANY: validated.company },
    //   listIds: [LEAD_LIST_ID],
    // })

    return Response.json({ success: true, id: lead[0].id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

### Comparison Data Endpoint

```typescript
// app/api/comparison/[category]/route.ts
import { auth } from "@/auth"
import { sanityClient } from "@/lib/sanity"

// GROQ queries — different fields based on auth status
const TEASER_QUERY = `
  *[_type == "provider" && category->slug.current == $category] | order(name asc) {
    name, slug, shortDescription,
    category->{title, slug},
    logo { asset->{url} },
    website
  }
`

const PREMIUM_QUERY = `
  *[_type == "provider" && category->slug.current == $category] | order(name asc) {
    name, slug, shortDescription,
    category->{title, slug},
    logo { asset->{url} },
    website,
    monthlyPrice, pricingTiers,
    supportRating, featureScore,
    onboardingSpeed, bestFor,
    pros, cons, detailedReview,
    integrations
  }
`

export async function GET(
  req: Request,
  { params }: { params: { category: string } }
) {
  const session = await auth()
  const query = session?.user ? PREMIUM_QUERY : TEASER_QUERY

  const providers = await sanityClient.fetch(query, {
    category: params.category,
  })

  return Response.json({
    providers,
    premium: !!session?.user,
    category: params.category,
  })
}
```

---

## Appendix C: Environment Variables

```bash
# .env.local (NEVER commit to git)

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk-xxxxxxxxxxxxxxxxxxxx
SANITY_WEBHOOK_SECRET=your-webhook-secret

# Auth.js
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=https://portal.zahn-kumpan.de

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/zahnkumpan

# Brevo (Phase 2)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx

# LLM (Phase 4)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
# OR
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Analytics (Phase 2)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=portal.zahn-kumpan.de

# App
NEXT_PUBLIC_APP_URL=https://portal.zahn-kumpan.de
NODE_ENV=production
```

---

## Appendix D: Deep Integration Guides

### D1. Sanity CMS ↔ Next.js Integration (Step-by-Step)

#### Installation

```bash
# Create Next.js project
npx create-next-app@latest zahnkumpan-portal --typescript --tailwind --app --eslint

# Install Sanity dependencies
npm install @sanity/client @sanity/image-url next-sanity

# Install Sanity Studio (embedded in Next.js)
npm install sanity @sanity/vision

# Install Auth.js and database
npm install next-auth@beta @auth/drizzle-adapter drizzle-orm postgres
npm install -D drizzle-kit
```

#### Sanity Client Configuration

```typescript
// lib/sanity/client.ts
import { createClient } from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-05-14",
  useCdn: process.env.NODE_ENV === "production",
  // Token only used server-side for draft content
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Server-only client (never expose token to browser)
export const serverSanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2026-05-14",
  useCdn: false, // Always fresh data for server components
  token: process.env.SANITY_API_TOKEN,
})
```

#### Sanity Studio Embedded in Next.js

```typescript
// app/studio/[[...tool]]/page.tsx
"use client"

import { NextStudio } from "next-sanity/studio"
import config from "@/sanity.config"

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

```typescript
// sanity.config.ts
import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./schemas"

export default defineConfig({
  name: "zahnkumpan",
  title: "Zahn Kumpan CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

#### Why Embedded Studio Matters

| Approach | Pros | Cons |
|----------|------|------|
| **Embedded in Next.js** (recommended) | Single deployment, shared auth possible, same domain | Slightly larger bundle |
| **Separate Sanity Studio deployment** | Isolated, independent deploys | Two deployments to manage, CORS config needed |

**Decision:** Embedded. One deployment, one domain, simpler ops for a part-time developer.

#### GROQ vs GraphQL (Sanity Query Languages)

| Feature | GROQ | GraphQL |
|---------|------|---------|
| **Syntax** | Custom (Sanity-native) | Standard GraphQL |
| **Learning curve** | Medium (unique syntax) | Low (if you know GraphQL) |
| **Power** | ★★★★★ — Projections, joins, computed fields in-query | ★★★★☆ — Standard GraphQL features |
| **Performance** | ★★★★★ — Optimized for Sanity's content lake | ★★★★☆ — Slight overhead |
| **Tooling** | Sanity Vision (built-in query playground) | GraphQL Playground |
| **Recommendation** | Use GROQ — it's Sanity's native language, more powerful | Use only if team already knows GraphQL well |

#### GROQ Query Examples (Full Reference)

```groq
// 1. Get a single article by slug with all related data
*[_type == "article" && slug.current == $slug][0]{
  title,
  slug,
  excerpt,
  publishedAt,
  body[]{
    ...,
    _type == "image" => {
      "url": asset->url,
      "alt": alt,
      "dimensions": asset->metadata.dimensions
    }
  },
  coverImage {
    asset->{url, metadata {dimensions}},
    alt,
    caption
  },
  author->{
    name,
    image {asset->{url}},
    bio
  },
  categories[]->{
    title,
    slug,
    description
  },
  seo {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImage {asset->{url}},
    noIndex,
    structuredDataType
  },
  // Related articles (same category, different article)
  "related": *[_type == "article"
    && slug.current != $slug
    && count(categories[@._ref in ^.^.categories[]._ref]) > 0
  ] | order(publishedAt desc) [0...3] {
    title, slug, excerpt, coverImage {asset->{url}}
  }
}

// 2. Blog listing with pagination
*[_type == "article" && defined(publishedAt)] | order(publishedAt desc) [$start...$end] {
  title,
  slug,
  excerpt,
  publishedAt,
  coverImage {asset->{url}},
  author->{name},
  categories[]->{title, slug},
  // Reading time estimate
  "readingTime": round(length(pt::text(body)) / 1000)
}

// 3. Category page with article count
*[_type == "category"] | order(title asc) {
  title,
  slug,
  description,
  "articleCount": count(*[_type == "article" && references(^._id)])
}

// 4. Provider teaser (PUBLIC — no premium fields)
*[_type == "provider" && category->slug.current == $categorySlug] | order(name asc) {
  name,
  slug,
  shortDescription,
  category->{title, slug},
  logo {asset->{url}},
  website,
  // Computed field: number of premium fields available
  "hasDetailedReview": defined(detailedReview)
}

// 5. Provider FULL (PREMIUM — all fields, server-side only)
*[_type == "provider" && category->slug.current == $categorySlug] | order(name asc) {
  ...,
  category->{title, slug},
  logo {asset->{url}},
  pricingTiers[]{
    name,
    monthlyPrice,
    features,
    maxUsers
  },
  "averageScore": math::avg([supportRating, featureScore])
}

// 6. Search across all content types
*[_type in ["article", "provider"] && (
  title match $query + "*"
  || excerpt match $query + "*"
  || shortDescription match $query + "*"
)] | order(_type asc, _updatedAt desc) [0...20] {
  _type,
  title,
  "slug": slug.current,
  "description": coalesce(excerpt, shortDescription),
  _updatedAt
}

// 7. Sitemap data
{
  "articles": *[_type == "article" && defined(publishedAt)]{
    "slug": slug.current,
    "lastmod": _updatedAt
  },
  "categories": *[_type == "providerCategory"]{
    "slug": slug.current,
    "lastmod": _updatedAt
  },
  "providers": *[_type == "provider"]{
    "slug": slug.current,
    "category": category->slug.current,
    "lastmod": _updatedAt
  }
}
```

---

### D2. Auth.js v5 ↔ Next.js ↔ PostgreSQL Integration

#### Complete Auth Configuration

```typescript
// auth.ts (root of project)
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users, sessions, accounts, verificationTokens } from "@/db/schema"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    sessionsTable: sessions,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "database", // NOT JWT — full GDPR control
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      name: "Email & Passwort",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        if (!user?.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )

        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
    // Google OAuth (optional, Phase 2)
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
  ],
  pages: {
    signIn: "/anmelden",
    signUp: "/registrieren",
    error: "/auth/fehler",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

#### Database Schema for Auth.js

```typescript
// db/schema.ts
import {
  pgTable, text, timestamp, uuid, primaryKey, integer, boolean
} from "drizzle-orm/pg-core"

// Auth.js required tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  hashedPassword: text("hashed_password"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  // Custom fields for Zahn Kumpan
  company: text("company"),
  practiceSize: text("practice_size"),
  role: text("role").default("member"), // member | admin
})

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId]
  }),
}))

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}))

// Custom tables for Zahn Kumpan
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  interest: text("interest"),
  source: text("source").default("website"),
  convertedToUser: boolean("converted_to_user").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerSlug: text("provider_slug").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

#### Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate

# Open Drizzle Studio (database browser)
npx drizzle-kit studio
```

#### Registration Flow (Complete)

```typescript
// app/api/auth/register/route.ts
import { db } from "@/db"
import { users, leads } from "@/db/schema"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"

const RegisterSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  company: z.string().optional(),
  practiceSize: z.enum(["solo", "klein", "mittel", "gross", "mvz"]).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = RegisterSchema.parse(body)

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, validated.email),
    })

    if (existing) {
      return Response.json(
        { error: "Ein Konto mit dieser E-Mail existiert bereits" },
        { status: 409 }
      )
    }

    // Hash password (cost factor 12)
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Create user
    const [newUser] = await db.insert(users).values({
      name: validated.name,
      email: validated.email,
      hashedPassword,
      company: validated.company,
      practiceSize: validated.practiceSize,
    }).returning({ id: users.id })

    // Also create a lead record for marketing tracking
    await db.insert(leads).values({
      email: validated.email,
      name: validated.name,
      company: validated.company,
      source: "registration",
      convertedToUser: true,
    })

    return Response.json({ success: true, userId: newUser.id }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    console.error("Registration error:", error)
    return Response.json({ error: "Interner Serverfehler" }, { status: 500 })
  }
}
```

---

### D3. Tailwind CSS v4 Setup & Design System

#### Tailwind Configuration for Zahn Kumpan

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Brand colors for dental portal */
  --color-brand-50: #f0f7ff;
  --color-brand-100: #e0effe;
  --color-brand-200: #b9dffd;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  --color-brand-900: #1e3a5f;

  --color-premium-gold: #f59e0b;
  --color-premium-light: #fef3c7;

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Typography */
  --font-sans: 'Inter Variable', 'Inter', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
}
```

#### Component Examples for Prototype

```typescript
// components/ProviderCard.tsx (teaser version)
export function ProviderCard({ provider }: { provider: ProviderTeaser }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm
                    hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={provider.logoUrl}
          alt={`${provider.name} Logo`}
          className="h-12 w-12 rounded-lg object-contain"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {provider.name}
          </h3>
          <span className="text-sm text-gray-500">
            {provider.category}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        {provider.shortDescription}
      </p>
      <div className="flex justify-between items-center">
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-brand-600 hover:text-brand-700"
        >
          Website →
        </a>
        <span className="text-xs text-premium-gold bg-premium-light
                         px-2 py-1 rounded-full font-medium">
          Premium
        </span>
      </div>
    </div>
  )
}
```

```typescript
// components/PremiumGate.tsx
"use client"

import Link from "next/link"

export function PremiumGate({ children, isAuthenticated }: {
  children: React.ReactNode
  isAuthenticated: boolean
}) {
  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Skeleton placeholder (NOT real data) */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        <div className="grid grid-cols-4 gap-4 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center
                      bg-white/80 backdrop-blur-sm">
        <div className="text-center max-w-md p-8">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Premium-Vergleich
          </h3>
          <p className="text-gray-600 mb-6">
            Registriere dich kostenlos, um den vollständigen
            Anbietervergleich mit Preisen, Bewertungen und
            Filteroptionen zu sehen.
          </p>
          <Link
            href="/registrieren"
            className="inline-block bg-brand-600 text-white px-6 py-3
                       rounded-lg font-medium hover:bg-brand-700
                       transition-colors"
          >
            Kostenlos registrieren
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Keine Kreditkarte erforderlich
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

### D4. Hetzner Deployment Guide

#### Server Setup Script

```bash
#!/bin/bash
# deploy-hetzner.sh — Initial server setup for Zahn Kumpan

# Update system
apt update && apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL 16
apt install -y postgresql-16 postgresql-client-16

# Install Caddy (reverse proxy with auto-HTTPS)
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy

# Install PM2 (process manager for Node.js)
npm install -g pm2

# Setup PostgreSQL database
sudo -u postgres psql -c "CREATE USER zahnkumpan WITH PASSWORD 'secure-password-here';"
sudo -u postgres psql -c "CREATE DATABASE zahnkumpan OWNER zahnkumpan;"

# Create application directory
mkdir -p /var/www/zahnkumpan
chown -R www-data:www-data /var/www/zahnkumpan
```

#### Caddy Configuration

```
# /etc/caddy/Caddyfile
portal.zahn-kumpan.de {
    reverse_proxy localhost:3000

    # Security headers
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }

    # Gzip compression
    encode gzip

    # Logging
    log {
        output file /var/log/caddy/zahnkumpan.log
        format json
    }
}
```

#### PM2 Process Configuration

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "zahnkumpan",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    cwd: "/var/www/zahnkumpan",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    max_memory_restart: "500M",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/var/log/pm2/zahnkumpan-error.log",
    out_file: "/var/log/pm2/zahnkumpan-out.log"
  }]
}
```

#### Deployment Script (CI/CD Alternative)

```bash
#!/bin/bash
# deploy.sh — Run from local machine or GitHub Actions

set -e

SERVER="root@your-hetzner-ip"
APP_DIR="/var/www/zahnkumpan"

echo "Building application..."
npm run build

echo "Syncing files to server..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env.local' \
  ./ $SERVER:$APP_DIR/

echo "Installing dependencies on server..."
ssh $SERVER "cd $APP_DIR && npm ci --production"

echo "Running database migrations..."
ssh $SERVER "cd $APP_DIR && npx drizzle-kit migrate"

echo "Restarting application..."
ssh $SERVER "cd $APP_DIR && pm2 restart ecosystem.config.js"

echo "Deployment complete!"
```

---

## Appendix E: Styling & ORM Comparison Deep-Dive

### E1. CSS Framework Comparison

| Feature | Tailwind CSS v4 | CSS Modules | Styled Components | Vanilla CSS | Chakra UI |
|---------|----------------|-------------|-------------------|------------|-----------|
| **Bundle size** | ★★★★☆ (purged) | ★★★★★ (zero runtime) | ★★☆☆☆ (runtime) | ★★★★★ | ★★☆☆☆ |
| **Developer speed** | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| **Design consistency** | ★★★★★ (tokens) | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| **Server components** | ★★★★★ | ★★★★★ | ☆☆☆☆☆ (broken) | ★★★★★ | ★★★☆☆ |
| **Responsive design** | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ |
| **Learning curve** | Medium | Low | Medium | Low | Medium |
| **Next.js App Router** | ★★★★★ | ★★★★★ | ★☆☆☆☆ (CSR only) | ★★★★★ | ★★★☆☆ |

**Why Tailwind wins for this project:**
- Works perfectly with Server Components (no runtime JS)
- Rapid prototyping (critical for trial submission deadline)
- Built-in design tokens prevent inconsistent styling
- Huge community, well-documented
- v4 improvements: native CSS nesting, better performance

**When Styled Components would be wrong:** App Router. Styled Components requires client-side JS to inject styles, which breaks React Server Components. Since our portal uses server components extensively, styled-components is incompatible.

### E2. ORM Comparison Deep-Dive

| Feature | Drizzle ORM | Prisma | Kysely | Raw SQL (pg) | TypeORM |
|---------|------------|--------|--------|-------------|---------|
| **Type safety** | ★★★★★ | ★★★★★ | ★★★★★ | ☆☆☆☆☆ | ★★★★☆ |
| **Bundle size** | ★★★★★ (~50KB) | ★★☆☆☆ (~15MB engine) | ★★★★★ | ★★★★★ | ★★★☆☆ |
| **Edge runtime** | ★★★★★ | ★★★☆☆ (with adapter) | ★★★★★ | ★★★★★ | ☆☆☆☆☆ |
| **Migration system** | ★★★★☆ | ★★★★★ | ★★★★☆ | ☆☆☆☆☆ (manual) | ★★★★☆ |
| **Query builder** | ★★★★★ (SQL-like) | ★★★★☆ (Prisma QL) | ★★★★★ (SQL-like) | ★★★★★ (raw SQL) | ★★★★☆ |
| **Auth.js adapter** | ★★★★★ (official) | ★★★★★ (official) | ★★☆☆☆ | ☆☆☆☆☆ | ★★☆☆☆ |
| **Learning curve** | Low (SQL devs) | Low (own syntax) | Low (SQL devs) | N/A | High |
| **Performance** | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★★★★ | ★★★☆☆ |

**Why Drizzle wins:**
1. Tiny bundle (no binary engine like Prisma)
2. SQL-like syntax — what you write is close to what runs
3. Official Auth.js adapter
4. Works on edge runtimes (Vercel Edge, Cloudflare Workers)
5. TypeScript-first with excellent type inference

**Why NOT Prisma:**
- Prisma requires a ~15MB query engine binary
- Slower cold starts
- Prisma Client generation step adds complexity
- The Prisma query language is an abstraction over SQL — Drizzle is closer to SQL

---

## Appendix F: Advanced Comparison Feature Architecture

### F1. Comparison Table Component (Premium)

```typescript
// components/ComparisonTable.tsx
"use client"

import { useState, useMemo } from "react"

interface Provider {
  name: string
  slug: string
  logoUrl: string
  monthlyPrice: number
  supportRating: number
  featureScore: number
  onboardingSpeed: string
  bestFor: string[]
  pros: string[]
  cons: string[]
}

type SortField = "name" | "monthlyPrice" | "supportRating" | "featureScore"
type SortDirection = "asc" | "desc"

export function ComparisonTable({ providers }: { providers: Provider[] }) {
  const [sortField, setSortField] = useState<SortField>("featureScore")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [selectedBestFor, setSelectedBestFor] = useState<string[]>([])

  // Filter
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      if (p.monthlyPrice < priceRange[0] || p.monthlyPrice > priceRange[1]) return false
      if (p.supportRating < minRating) return false
      if (selectedBestFor.length > 0 &&
          !selectedBestFor.some((b) => p.bestFor.includes(b))) return false
      return true
    })
  }, [providers, priceRange, minRating, selectedBestFor])

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, "de")
          : bVal.localeCompare(aVal, "de")
      }
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [filtered, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // All unique "bestFor" values across providers
  const allBestFor = useMemo(() => {
    const set = new Set<string>()
    providers.forEach((p) => p.bestFor.forEach((b) => set.add(b)))
    return Array.from(set).sort()
  }, [providers])

  return (
    <div>
      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 grid grid-cols-1
                      md:grid-cols-3 gap-6">
        {/* Price range filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Preis: €{priceRange[0]} — €{priceRange[1]}/Monat
          </label>
          <input
            type="range"
            min={0} max={500} step={10}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full"
          />
        </div>

        {/* Minimum rating filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Mindest-Bewertung: {minRating}/10
          </label>
          <input
            type="range"
            min={0} max={10} step={1}
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Best for filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Geeignet für:
          </label>
          <div className="flex flex-wrap gap-2">
            {allBestFor.map((b) => (
              <button
                key={b}
                onClick={() =>
                  setSelectedBestFor((prev) =>
                    prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
                  )
                }
                className={`text-xs px-3 py-1 rounded-full border transition-colors
                  ${selectedBestFor.includes(b)
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-brand-400"
                  }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {sorted.length} von {providers.length} Anbietern
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">
                Anbieter
              </th>
              {(["monthlyPrice", "supportRating", "featureScore"] as SortField[]).map((field) => (
                <th
                  key={field}
                  className="text-left p-4 font-medium text-gray-700
                             cursor-pointer hover:text-brand-600 select-none"
                  onClick={() => toggleSort(field)}
                >
                  {field === "monthlyPrice" && "Preis/Monat"}
                  {field === "supportRating" && "Support"}
                  {field === "featureScore" && "Features"}
                  {sortField === field && (sortDirection === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
              <th className="text-left p-4 font-medium text-gray-700">
                Onboarding
              </th>
              <th className="text-left p-4 font-medium text-gray-700">
                Am besten für
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((p) => (
              <tr key={p.slug} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.logoUrl} alt="" className="w-8 h-8 rounded" />
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-700">€{p.monthlyPrice}</td>
                <td className="p-4">
                  <RatingBadge value={p.supportRating} />
                </td>
                <td className="p-4">
                  <RatingBadge value={p.featureScore} />
                </td>
                <td className="p-4">
                  <SpeedBadge speed={p.onboardingSpeed} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.bestFor.map((b) => (
                      <span key={b} className="text-xs bg-gray-100 text-gray-600
                                               px-2 py-0.5 rounded-full">
                        {b}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RatingBadge({ value }: { value: number }) {
  const color = value >= 8 ? "text-green-700 bg-green-50"
    : value >= 5 ? "text-yellow-700 bg-yellow-50"
    : "text-red-700 bg-red-50"
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
      {value}/10
    </span>
  )
}

function SpeedBadge({ speed }: { speed: string }) {
  const config = {
    schnell: { label: "Schnell", color: "text-green-700 bg-green-50" },
    mittel: { label: "Mittel", color: "text-yellow-700 bg-yellow-50" },
    langsam: { label: "Langsam", color: "text-red-700 bg-red-50" },
  }
  const { label, color } = config[speed as keyof typeof config] || config.mittel
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
      {label}
    </span>
  )
}
```

### F2. Provider vs Provider Detail Page

```typescript
// app/(premium)/vergleich/[category]/[provider1]-vs-[provider2]/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { sanityClient } from "@/lib/sanity"

export default async function ProviderVsProviderPage({
  params,
}: {
  params: { category: string; "provider1-vs-provider2": string }
}) {
  const session = await auth()
  if (!session?.user) redirect("/anmelden")

  const [slug1, slug2] = params["provider1-vs-provider2"].split("-vs-")

  const [provider1, provider2] = await Promise.all([
    sanityClient.fetch(
      `*[_type == "provider" && slug.current == $slug][0]{...}`,
      { slug: slug1 }
    ),
    sanityClient.fetch(
      `*[_type == "provider" && slug.current == $slug][0]{...}`,
      { slug: slug2 }
    ),
  ])

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {provider1.name} vs {provider2.name}
      </h1>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-3 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="bg-gray-50 p-4 font-medium text-gray-600">Kriterium</div>
        <div className="bg-white p-4 text-center font-bold">{provider1.name}</div>
        <div className="bg-white p-4 text-center font-bold">{provider2.name}</div>

        {/* Price */}
        <div className="bg-gray-50 p-4 font-medium text-gray-600">Monatlicher Preis</div>
        <div className="bg-white p-4 text-center">€{provider1.monthlyPrice}</div>
        <div className="bg-white p-4 text-center">€{provider2.monthlyPrice}</div>

        {/* Support */}
        <div className="bg-gray-50 p-4 font-medium text-gray-600">Support-Bewertung</div>
        <div className="bg-white p-4 text-center">{provider1.supportRating}/10</div>
        <div className="bg-white p-4 text-center">{provider2.supportRating}/10</div>

        {/* Features */}
        <div className="bg-gray-50 p-4 font-medium text-gray-600">Feature-Score</div>
        <div className="bg-white p-4 text-center">{provider1.featureScore}/10</div>
        <div className="bg-white p-4 text-center">{provider2.featureScore}/10</div>

        {/* Onboarding */}
        <div className="bg-gray-50 p-4 font-medium text-gray-600">Onboarding</div>
        <div className="bg-white p-4 text-center">{provider1.onboardingSpeed}</div>
        <div className="bg-white p-4 text-center">{provider2.onboardingSpeed}</div>
      </div>

      {/* Pros/Cons comparison */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        <div>
          <h2 className="text-xl font-bold mb-4">{provider1.name}</h2>
          <div className="mb-4">
            <h3 className="text-green-700 font-medium mb-2">Vorteile</h3>
            <ul className="space-y-1">
              {provider1.pros?.map((pro: string) => (
                <li key={pro} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-500">✓</span> {pro}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-red-700 font-medium mb-2">Nachteile</h3>
            <ul className="space-y-1">
              {provider1.cons?.map((con: string) => (
                <li key={con} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-red-500">✗</span> {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">{provider2.name}</h2>
          {/* Same structure for provider 2 */}
        </div>
      </div>
    </div>
  )
}
```

---

## Appendix G: LLM Integration — Complete Implementation

### G1. LLM Service Architecture

```typescript
// lib/llm/comparison-explainer.ts
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ProviderData {
  name: string
  monthlyPrice: number
  supportRating: number
  featureScore: number
  onboardingSpeed: string
  bestFor: string[]
  pros: string[]
  cons: string[]
}

const SYSTEM_PROMPT = `Du bist ein sachlicher Assistent für den Vergleich von
Dental-Software auf dem Portal Zahn Kumpan. Du hilfst Zahnärzten und
Praxisinhabern bei der Auswahl der richtigen Software.

REGELN:
1. Antworte immer auf Deutsch.
2. Maximal 250 Wörter.
3. Basiere dich NUR auf die bereitgestellten strukturierten Daten.
4. Gib KEINE rechtliche, finanzielle oder medizinische Beratung.
5. Erfinde KEINE Informationen, die nicht in den Daten stehen.
6. Sei sachlich und neutral — empfehle basierend auf Praxisgröße und Bedürfnissen.
7. Erwähne KEINE Preise als "günstig" oder "teuer" — gib nur die Zahlen an.
8. Strukturiere die Antwort:
   - Kurze Einleitung (1 Satz)
   - Hauptunterschiede (3-4 Punkte)
   - Empfehlung nach Praxisgröße`

function buildUserPrompt(a: ProviderData, b: ProviderData): string {
  return `Vergleiche diese zwei Anbieter:

ANBIETER A: ${a.name}
- Monatlicher Preis: €${a.monthlyPrice}
- Support-Bewertung: ${a.supportRating}/10
- Feature-Score: ${a.featureScore}/10
- Onboarding: ${a.onboardingSpeed}
- Am besten für: ${a.bestFor.join(", ")}
- Vorteile: ${a.pros.join("; ")}
- Nachteile: ${a.cons.join("; ")}

ANBIETER B: ${b.name}
- Monatlicher Preis: €${b.monthlyPrice}
- Support-Bewertung: ${b.supportRating}/10
- Feature-Score: ${b.featureScore}/10
- Onboarding: ${b.onboardingSpeed}
- Am besten für: ${b.bestFor.join(", ")}
- Vorteile: ${b.pros.join("; ")}
- Nachteile: ${b.cons.join("; ")}

Erstelle eine sachliche Vergleichszusammenfassung.`
}

export async function generateComparisonExplainer(
  providerA: ProviderData,
  providerB: ProviderData
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(providerA, providerB),
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  return textBlock?.text || "Vergleich konnte nicht erstellt werden."
}
```

### G2. LLM API Route with Caching and Rate Limiting

```typescript
// app/api/comparison/explain/route.ts
import { auth } from "@/auth"
import { sanityClient } from "@/lib/sanity"
import { generateComparisonExplainer } from "@/lib/llm/comparison-explainer"

// Simple in-memory cache (replace with Redis in production)
const cache = new Map<string, { text: string; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Simple rate limiter
const rateLimits = new Map<string, number[]>()
const RATE_LIMIT = 10 // requests per hour per user
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRequests = rateLimits.get(userId) || []
  const recentRequests = userRequests.filter((t) => now - t < RATE_WINDOW)
  rateLimits.set(userId, recentRequests)
  return recentRequests.length < RATE_LIMIT
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  // Rate limit check
  if (!checkRateLimit(session.user.id)) {
    return Response.json(
      { error: "Zu viele Anfragen. Bitte versuche es in einer Stunde erneut." },
      { status: 429 }
    )
  }

  const { providerSlugA, providerSlugB } = await req.json()

  // Cache key (sorted to handle A-vs-B and B-vs-A the same)
  const cacheKey = [providerSlugA, providerSlugB].sort().join("__vs__")

  // Check cache
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json({ explanation: cached.text, cached: true })
  }

  // Fetch provider data from Sanity
  const [providerA, providerB] = await Promise.all([
    sanityClient.fetch(
      `*[_type == "provider" && slug.current == $slug][0]{
        name, monthlyPrice, supportRating, featureScore,
        onboardingSpeed, bestFor, pros, cons
      }`,
      { slug: providerSlugA }
    ),
    sanityClient.fetch(
      `*[_type == "provider" && slug.current == $slug][0]{
        name, monthlyPrice, supportRating, featureScore,
        onboardingSpeed, bestFor, pros, cons
      }`,
      { slug: providerSlugB }
    ),
  ])

  if (!providerA || !providerB) {
    return Response.json({ error: "Anbieter nicht gefunden" }, { status: 404 })
  }

  // Generate explanation via LLM
  const explanation = await generateComparisonExplainer(providerA, providerB)

  // Cache result
  cache.set(cacheKey, { text: explanation, timestamp: Date.now() })

  // Record rate limit
  const userRequests = rateLimits.get(session.user.id) || []
  userRequests.push(Date.now())
  rateLimits.set(session.user.id, userRequests)

  return Response.json({ explanation, cached: false })
}
```

### G3. LLM Cost Estimation

| Scenario | Provider Pairs | Tokens per Call | Monthly API Cost |
|----------|---------------|-----------------|-----------------|
| **Low usage** (MVP) | ~100 comparisons/mo | ~800 tokens avg | ~$1-2/month |
| **Medium usage** | ~500 comparisons/mo | ~800 tokens avg | ~$5-8/month |
| **High usage** | ~2000 comparisons/mo | ~800 tokens avg | ~$15-25/month |
| **With 24h caching** | -60% API calls | Same | -60% cost |

---

## Appendix H: Testing Strategy

### H1. Test Types and Tools

| Test Type | Tool | What It Tests | Phase |
|-----------|------|---------------|-------|
| **Unit tests** | Vitest | Utility functions, hooks, data transformations | 1 |
| **Component tests** | Vitest + Testing Library | UI components render correctly | 1 |
| **Integration tests** | Playwright | Full user flows (login, compare, filter) | 1 |
| **E2E tests** | Playwright | Complete user journeys | 2 |
| **Accessibility** | axe-core + Playwright | WCAG 2.1 AA compliance | 1 |
| **Performance** | Lighthouse CI | Core Web Vitals | 1 |
| **SEO** | Screaming Frog / custom | Metadata, redirects, sitemap | 1 |

### H2. Critical Test Scenarios

| Scenario | Priority | Test Type | Expected Result |
|----------|----------|-----------|----------------|
| Unauthenticated user visits premium page | Critical | Integration | Sees teaser + blur, no premium data in HTML source |
| Login with valid credentials | Critical | Integration | Session created, redirected to premium content |
| Login with invalid credentials | High | Integration | Error message, no session created |
| Premium GROQ query without session | Critical | Unit | Returns only public fields |
| 301 redirect for old WordPress URL | Critical | Integration | Correct redirect, 301 status |
| Blog article has correct JSON-LD | High | Integration | Valid structured data in HTML |
| sitemap.xml returns all public URLs | High | Integration | All articles and categories listed |
| robots.txt blocks premium pages | High | Integration | noindex on protected routes |
| Registration with existing email | Medium | Integration | 409 error, helpful message |
| Filter comparison table by price | Medium | Component | Correct filtered results |
| Sort comparison table by rating | Medium | Component | Correct sort order |

---

## Appendix I: Prototype File Structure (For Claude Code)

### Minimal Prototype for Trial Submission

```
zahnkumpan-prototype/
├── app/
│   ├── layout.tsx               # Root layout (nav, footer, fonts)
│   ├── page.tsx                 # Landing page (hero, features, CTA)
│   ├── globals.css              # Tailwind + custom properties
│   │
│   ├── blog/
│   │   ├── page.tsx             # Blog listing (3-4 fake articles)
│   │   └── [slug]/
│   │       └── page.tsx         # Single article (static content)
│   │
│   ├── vergleich/
│   │   ├── page.tsx             # Comparison categories overview
│   │   └── [category]/
│   │       └── page.tsx         # Category comparison (gated)
│   │
│   ├── anmelden/
│   │   └── page.tsx             # Login form (fake auth for demo)
│   │
│   ├── registrieren/
│   │   └── page.tsx             # Registration form (fake)
│   │
│   ├── datenschutz/
│   │   └── page.tsx             # Privacy policy page
│   │
│   └── impressum/
│       └── page.tsx             # Legal imprint page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Navigation bar
│   │   └── Footer.tsx           # Site footer
│   ├── home/
│   │   ├── Hero.tsx             # Landing page hero
│   │   ├── Features.tsx         # Feature showcase
│   │   └── CTA.tsx              # Call to action
│   ├── blog/
│   │   ├── ArticleCard.tsx      # Blog article preview card
│   │   └── ArticleContent.tsx   # Full article layout
│   ├── comparison/
│   │   ├── CategoryCard.tsx     # Comparison category card
│   │   ├── ProviderCard.tsx     # Provider teaser card
│   │   ├── ComparisonTable.tsx  # Premium comparison table
│   │   ├── FilterPanel.tsx      # Filter controls
│   │   └── PremiumGate.tsx      # Blur overlay + CTA
│   └── auth/
│       ├── LoginForm.tsx        # Login form component
│       └── RegisterForm.tsx     # Registration form component
│
├── lib/
│   ├── fake-data.ts             # Mock data for prototype
│   ├── fake-auth.ts             # Simulated auth context
│   └── types.ts                 # TypeScript interfaces
│
├── public/
│   ├── logos/                   # Fake provider logos
│   └── images/                  # Hero images, illustrations
│
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Fake Data Structure for Prototype

```typescript
// lib/fake-data.ts
export const fakeArticles = [
  {
    slug: "terminbuchung-online-vergleich-2026",
    title: "Online-Terminbuchung für Zahnarztpraxen: Die besten Lösungen 2026",
    excerpt: "Welche Software passt zu Ihrer Praxis? Wir vergleichen die führenden Anbieter für Online-Terminbuchung.",
    publishedAt: "2026-05-10",
    author: "Dr. Anna Weber",
    category: "Software-Vergleich",
    readingTime: 8,
  },
  {
    slug: "praxisgruendung-checkliste",
    title: "Praxisgründung Checkliste: 50 Punkte die Sie beachten müssen",
    excerpt: "Von der Standortwahl bis zur Software: Die ultimative Checkliste für Ihre Zahnarztpraxis-Gründung.",
    publishedAt: "2026-05-05",
    author: "Thomas Müller",
    category: "Praxisgründung",
    readingTime: 12,
  },
  {
    slug: "abrechnungszentren-vergleich",
    title: "Zahnärztliche Abrechnungszentren im Vergleich",
    excerpt: "DZR, Health AG oder BFS? Wir analysieren Leistungen, Kosten und Service der wichtigsten Abrechnungszentren.",
    publishedAt: "2026-04-28",
    author: "Dr. Anna Weber",
    category: "Abrechnung",
    readingTime: 10,
  },
]

export const fakeProviders = [
  {
    name: "Dr. Flex",
    slug: "dr-flex",
    category: "Terminbuchung",
    shortDescription: "Online-Terminbuchung mit automatischer Erinnerung und Patientenportal",
    logoUrl: "/logos/dr-flex.svg",
    website: "https://example.com",
    // Premium fields
    monthlyPrice: 89,
    supportRating: 8,
    featureScore: 9,
    onboardingSpeed: "schnell",
    bestFor: ["Einzelpraxis", "Kleine Praxis"],
    pros: [
      "Intuitive Benutzeroberfläche",
      "Automatische SMS-Erinnerungen",
      "Gute Kalender-Integration",
    ],
    cons: [
      "Höherer Preis als Wettbewerber",
      "Begrenzte Anpassungsmöglichkeiten",
    ],
  },
  {
    name: "Doctolib",
    slug: "doctolib",
    category: "Terminbuchung",
    shortDescription: "Europas führende Plattform für Arzt-Patienten-Management",
    logoUrl: "/logos/doctolib.svg",
    website: "https://example.com",
    monthlyPrice: 129,
    supportRating: 7,
    featureScore: 9,
    onboardingSpeed: "mittel",
    bestFor: ["Große Praxis", "MVZ"],
    pros: [
      "Große Patientenbasis für Neupatienten",
      "Telemedizin integriert",
      "Starke Markenbekanntheit",
    ],
    cons: [
      "Teuerste Option",
      "Abhängigkeit von der Plattform",
      "Eingeschränkte Individualisierung",
    ],
  },
  {
    name: "Terminow",
    slug: "terminow",
    category: "Terminbuchung",
    shortDescription: "Budget-freundliche Terminbuchung speziell für Zahnärzte",
    logoUrl: "/logos/terminow.svg",
    website: "https://example.com",
    monthlyPrice: 49,
    supportRating: 6,
    featureScore: 7,
    onboardingSpeed: "schnell",
    bestFor: ["Einzelpraxis", "Budget-bewusst"],
    pros: [
      "Günstigster Preis",
      "Einfache Einrichtung",
      "Guter Basis-Funktionsumfang",
    ],
    cons: [
      "Weniger Features als Premium-Anbieter",
      "Kein Telemedizin-Modul",
      "Support nur per E-Mail",
    ],
  },
]

export const fakeCategories = [
  {
    title: "Terminbuchung",
    slug: "terminbuchung",
    description: "Online-Terminbuchungssysteme für Zahnarztpraxen",
    providerCount: 3,
    icon: "📅",
  },
  {
    title: "Abrechnungszentren",
    slug: "abrechnungszentren",
    description: "Zahnärztliche Abrechnungsdienstleister im Vergleich",
    providerCount: 4,
    icon: "💰",
  },
  {
    title: "Praxisverwaltung",
    slug: "praxisverwaltung",
    description: "Praxismanagement-Software für den Praxisalltag",
    providerCount: 5,
    icon: "🏥",
  },
]
```

---

## Appendix J: Meeting Preparation Cheat Sheet

### J1. Key Statements for the Meeting

Use these exact talking points when discussing the architecture with Muhammad:

**On CMS choice:**
> "Payload CMS is technically strong, but Sanity is a better fit for Zahn Kumpan because the team needs an editor-friendly, SEO-focused CMS with less operational burden. Sanity's hosted infrastructure means we don't need DevOps expertise, and the free tier covers the MVP."

**On architecture:**
> "The key architectural principle is that Sanity feeds all content — both public and premium — into the Next.js server. Next.js decides what the browser receives based on authentication status. Premium data is never sent to the browser for unauthenticated users — the protection is at the data layer, not the CSS layer."

**On migration:**
> "The biggest technical risk is the WordPress migration. Every existing URL needs a 301 redirect to preserve SEO rankings. I've planned this as a Week 7 deliverable with a full redirect map and verification checklist."

**On GDPR:**
> "Since this is a German portal, GDPR compliance is non-negotiable. The architecture uses EU hosting on Hetzner, database sessions stored in German data centers, cookie consent for non-essential cookies, and Data Processing Agreements with Sanity."

**On LLM:**
> "The LLM comparison explainer is a Phase 4 feature — it only makes sense after we have structured provider data in the CMS. It will use the Claude API to generate German-language comparison summaries based on structured data, not freeform user input. This keeps it controlled and safe."

**On phasing:**
> "I've broken the project into 4 phases. Phase 1 is the MVP: content migration, public blog, premium gating, and basic comparison. Everything else — CRM, email, search, LLM — comes in later phases. This keeps scope manageable for part-time development."

### J2. Potential Questions and Answers

| Question | Answer |
|----------|--------|
| "Why not Payload CMS?" | "Payload is excellent for developer-led teams, but Sanity's editor experience is better for your non-technical content team. Also, Payload Cloud paused new signups after the Figma acquisition, which adds operational risk." |
| "Can you build this in 2 months?" | "The MVP (Phase 1) is estimated at 80-120 hours. At 15-20 hours per week, that's roughly 6-8 weeks. The critical path is: Sanity setup → frontend → auth → migration." |
| "What about the LLM feature?" | "I'll demonstrate the concept in the prototype, but the actual integration comes in Phase 4 after we have real provider data in the CMS. The API call is straightforward — the value is in the structured data and prompt engineering." |
| "How much will it cost monthly?" | "MVP costs about €6/month: €5 for Hetzner VPS and €1 for the domain. Sanity is free up to 500K API requests. At full scale with all features, roughly €80/month." |
| "Can we use Vercel instead of Hetzner?" | "Yes, but Hetzner gives us full GDPR control since it's a German company hosting in German data centers. Vercel is US-based. For a German dental portal handling user data, EU hosting is the safer legal choice." |
| "What if we need to switch CMS later?" | "Sanity stores content as structured JSON. The migration path to another headless CMS would involve exporting Sanity data and transforming the schemas. The frontend and auth layer are CMS-agnostic by design." |

### J3. Red Flags to Watch For

| Red Flag | What It Means | Your Response |
|----------|--------------|---------------|
| "Can we add a chatbot in Phase 1?" | Scope creep | "I recommend focusing on the core comparison feature first. A chatbot adds LLM cost, moderation needs, and legal risk. Let's validate the portal's value with structured comparisons first." |
| "Can you work full-time on this?" | Unclear commitment | "My current availability is part-time. The phase plan is designed for 15-20 hours per week. Full-time would accelerate delivery but isn't necessary for the MVP." |
| "Let's add payment/subscription" | Premature monetization | "The current model is free registration for lead capture. Payments add Stripe integration, billing logic, and legal complexity. I suggest validating the free model first." |
| "Can we launch in 2 weeks?" | Unrealistic timeline | "A 2-week launch would mean skipping migration, auth, and GDPR compliance. The minimum viable timeline for a production-ready portal is 6-8 weeks." |

---

## Appendix K: Additional Mermaid Diagrams

### K1. Complete Request Lifecycle

```mermaid
sequenceDiagram
    participant U as User Browser
    participant CDN as Caddy (HTTPS)
    participant MW as Next.js Middleware
    participant SC as Server Component
    participant API as API Route
    participant AJ as Auth.js
    participant DB as PostgreSQL
    participant S as Sanity CMS

    U->>CDN: HTTPS Request
    CDN->>MW: Forward to Next.js

    alt Static Page (SSG)
        MW->>SC: Serve cached HTML
        SC-->>U: Pre-rendered page
    else Dynamic Page
        MW->>AJ: Check session cookie
        AJ->>DB: Validate session token
        DB-->>AJ: Session data

        alt Public Route
            AJ-->>MW: Session info (optional)
            MW->>SC: Render page
            SC->>S: GROQ query (public fields)
            S-->>SC: Content
            SC-->>U: Full page HTML
        else Premium Route (No Session)
            AJ-->>MW: No valid session
            MW-->>U: Redirect to /anmelden
        else Premium Route (Valid Session)
            AJ-->>MW: Valid session + user ID
            MW->>SC: Render premium page
            SC->>S: GROQ query (ALL fields)
            S-->>SC: Full provider data
            SC-->>U: Premium content HTML
        end
    end
```

### K2. Content Publishing Workflow

```mermaid
flowchart TD
    EDITOR[Editor opens Sanity Studio] --> DRAFT[Creates/edits content<br/>article, provider, category]
    DRAFT --> PREVIEW[Preview mode<br/>sees draft content]
    PREVIEW --> PUBLISH[Clicks Publish]
    PUBLISH --> WEBHOOK[Sanity Webhook fires]
    WEBHOOK --> REVALIDATE[Next.js revalidates<br/>affected routes via ISR]
    REVALIDATE --> LIVE[Updated content<br/>live on portal]
    LIVE --> SITEMAP[Sitemap updated<br/>on next generation]
    SITEMAP --> GOOGLE[Google re-crawls<br/>updated pages]
```

### K3. Error Handling Architecture

```mermaid
flowchart TD
    REQ[Incoming Request] --> TRY{Try Processing}
    TRY -->|Success| RES[Return Response]
    TRY -->|Error| CLASSIFY{Classify Error}

    CLASSIFY -->|Validation Error| V400[400 Bad Request<br/>Zod error details]
    CLASSIFY -->|Auth Error| V401[401 Unauthorized<br/>Redirect to login]
    CLASSIFY -->|Not Found| V404[404 Not Found<br/>Custom 404 page]
    CLASSIFY -->|Rate Limited| V429[429 Too Many Requests<br/>Retry-After header]
    CLASSIFY -->|Server Error| V500[500 Internal Error<br/>Generic message + log]

    V500 --> LOG[Error Logger<br/>Sentry or file-based]
    LOG --> ALERT[Alert if critical<br/>UptimeRobot / email]
```

### K4. Full Deployment Pipeline

```mermaid
flowchart LR
    DEV[Local Development] --> GIT[Git Push to GitHub]
    GIT --> CI[GitHub Actions CI]
    CI --> LINT[Lint + Type Check]
    LINT --> TEST[Run Tests<br/>Vitest + Playwright]
    TEST --> BUILD[npm run build]
    BUILD --> DEPLOY[Deploy to Hetzner<br/>rsync + PM2 restart]
    DEPLOY --> HEALTH[Health Check<br/>HTTP 200?]
    HEALTH -->|Pass| DONE[Deployment Complete]
    HEALTH -->|Fail| ROLLBACK[Rollback to<br/>previous version]
```

---

## Appendix L: Full Package.json Reference

```json
{
  "name": "zahnkumpan-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@sanity/client": "^6.22.0",
    "@sanity/image-url": "^1.1.0",
    "next-sanity": "^9.8.0",
    "sanity": "^3.64.0",
    "@sanity/vision": "^3.64.0",
    "next-auth": "5.0.0-beta.25",
    "@auth/drizzle-adapter": "^1.7.0",
    "drizzle-orm": "^0.36.0",
    "postgres": "^3.4.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.24.0",
    "@anthropic-ai/sdk": "^0.34.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/bcryptjs": "^2.4.6",
    "tailwindcss": "^4.0.0",
    "drizzle-kit": "^0.28.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.49.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.3.0"
  }
}
```

---

## Document End

This document is the complete technical reference for the Zahn Kumpan portal. It is designed to serve three purposes:

1. **Your personal reference** — understanding every architectural decision and why it was made
2. **Input for Claude Code** — the code patterns, schemas, and file structures needed to build the prototype
3. **Meeting preparation** — talking points, answers to anticipated questions, and professional framing

Total coverage: 30 main sections + 12 appendices with comparison tables, code examples, Mermaid diagrams, deployment guides, and implementation patterns.

---

*Document prepared for Zahn Kumpan trial submission and MVP planning.*
*All technology choices validated against current documentation as of May 2026.*
*Total estimated length: ~3,500+ lines, 15,000+ words.*
