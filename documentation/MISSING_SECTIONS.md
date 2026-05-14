# Zahn Kumpan — Missing Sections (Supplement)

**Instructions:** Each section below has a header telling you exactly where to paste it in the main `ZAHNKUMPAN_TECHNICAL_ARCHITECTURE.md` file. Look for the `INSERT AFTER:` marker — find that heading in the main doc and paste the new content right after that section ends (before the next `##` heading).

---

---

## SECTION 1: Why NOT n8n, Vector Search, Ollama, Multi-LLM

**INSERT AFTER:** Section 18 (LLM Integration Strategy), right before `## 19. Search Strategy`

---

### Rejected Technologies — Why They Don't Belong in This Project

This section explicitly documents technologies that were considered and rejected. This matters because the original architecture proposal (from an earlier ChatGPT conversation) included all of these, and Muhammad may ask about them in the meeting.

#### Why NOT n8n (Workflow Automation)

| Question | Answer |
|----------|--------|
| What is n8n? | Open-source workflow automation tool (like Zapier but self-hosted) |
| Why was it suggested? | To automate lead routing, CRM syncing, email triggers, Slack notifications |
| Why is it rejected? | Zahn Kumpan has zero automation needs in Phase 1. There are no leads to route, no CRM to sync, no team Slack to notify. n8n adds a separate Node.js process on the server, requires its own database, and needs monitoring — all for workflows that don't exist yet. |
| When would it make sense? | Phase 3+, IF the team has 500+ leads/month and manual CRM management becomes a bottleneck. Even then, Brevo's built-in automation handles 90% of email workflows without a separate tool. |
| What to say in the meeting | "n8n is a powerful automation layer, but it solves a problem we don't have yet. Our MVP needs content, auth, and SEO — not workflow automation. We can add it in Phase 3 if lead volume justifies it." |

#### Why NOT Vector Search

| Question | Answer |
|----------|--------|
| What is vector search? | Semantic search using AI embeddings (e.g., pgvector, Pinecone, Weaviate) |
| Why was it suggested? | To enable "smart" content discovery beyond keyword matching |
| Why is it rejected? | The portal will launch with ~20-50 pages of content. Vector search is designed for 10,000+ documents where keyword search fails. At our scale, Sanity's built-in GROQ search handles everything. Vector search also requires embedding generation (API cost), a vector database (hosting cost), and index maintenance (dev time). |
| When would it make sense? | Phase 4+, IF the portal has 500+ articles AND users report that they can't find what they need with keyword search. |
| What to say in the meeting | "Semantic search is impressive technology, but at our content volume, it's solving a problem that doesn't exist. GROQ search covers our needs. When we hit 200+ pages, we'll add Meilisearch. Vector search is a Phase 4 exploration." |

#### Why NOT Ollama (Local LLM)

| Question | Answer |
|----------|--------|
| What is Ollama? | Tool for running open-source LLMs locally (Llama, Mistral, etc.) |
| Why was it suggested? | To avoid API costs and keep data fully private |
| Why is it rejected? | Running an LLM locally requires significant GPU/CPU resources. Our Hetzner VPS (CX22: 2 vCPU, 4GB RAM) cannot run even a small 7B parameter model. A GPU-capable server costs €50-200/month — far more than the €5-15/month we'd spend on Claude API calls. Response quality is also significantly lower than cloud APIs for German-language structured output. |
| When would it make sense? | Only if the portal processes sensitive patient data (which it doesn't — we only handle provider comparison data) or if API costs exceed €200/month (which requires 10,000+ LLM calls/month). |
| What to say in the meeting | "Local LLMs sound appealing for privacy, but they need GPU hardware we can't afford, and the quality for German dental content is much lower than cloud APIs. Since we never send user personal data to the LLM — only structured provider data — the privacy concern doesn't apply." |

#### Why NOT Multiple LLM Providers

| Question | Answer |
|----------|--------|
| What was suggested? | Using OpenAI + Mistral + Ollama simultaneously with a routing layer |
| Why is it rejected? | Three LLM integrations means three API clients, three prompt formats, three billing accounts, three sets of documentation, and a routing layer to decide which one to use. This is engineering overhead for zero user benefit. The comparison explainer needs ONE reliable provider that handles German well. |
| The right approach | Pick one provider. Start with Claude API (Anthropic) — strong German language, structured output, DPA available. If costs become an issue later, evaluate switching to a cheaper provider. Never run multiple simultaneously. |
| What to say in the meeting | "I recommend starting with one LLM provider — Claude API — and validating the feature before adding complexity. Running three providers in parallel is an anti-pattern that triples maintenance without improving the user experience." |

#### Summary: Rejected Technologies

| Technology | Status | Earliest Possible Phase | Realistic Need |
|------------|--------|------------------------|----------------|
| n8n | Rejected | Phase 3+ | Only if 500+ leads/month |
| Vector search | Rejected | Phase 4+ | Only if 500+ articles |
| Ollama (local LLM) | Rejected | Never (for this project) | GPU costs exceed API costs |
| Multi-LLM routing | Rejected | Never | One provider is sufficient |
| Admin dashboard | Deferred | Phase 2 | Sanity Studio IS the admin dashboard |
| Slack integration | Deferred | Phase 3+ | Only if team uses Slack |
| Lead scoring | Deferred | Phase 3+ | Only if Brevo CRM is active |

---

---

## SECTION 2: Reverse Proxy Comparison (Caddy vs Nginx)

**INSERT AFTER:** The Deployment Architecture (Hetzner) subsection in Section 9, right before `## 10. Data Flow Architecture`

---

### Reverse Proxy Comparison: Caddy vs Nginx

| Feature | Caddy | Nginx | Apache | Traefik |
|---------|-------|-------|--------|---------|
| **Auto HTTPS** | ★★★★★ Automatic Let's Encrypt, zero config | ★★☆☆☆ Manual certbot setup, cron renewal | ★★☆☆☆ Manual certbot | ★★★★★ Automatic |
| **Configuration** | ★★★★★ Simple Caddyfile (10 lines for our setup) | ★★★☆☆ Verbose nginx.conf syntax | ★★☆☆☆ Complex httpd.conf | ★★★★☆ YAML/TOML |
| **Performance** | ★★★★☆ Very good for our scale | ★★★★★ Industry standard for high traffic | ★★★☆☆ Heavier | ★★★★☆ Good |
| **Reverse proxy** | ★★★★★ Built-in, one line | ★★★★★ Built-in, well-documented | ★★★★☆ mod_proxy | ★★★★★ Built-in |
| **Security headers** | ★★★★★ Simple header block | ★★★★☆ add_header directives | ★★★★☆ Header module | ★★★★☆ Middleware |
| **Maintenance burden** | ★★★★★ Near-zero, auto-updates certs | ★★★☆☆ Must manage certbot, config, restarts | ★★☆☆☆ Complex | ★★★★☆ Low |
| **Learning curve** | ★★★★★ 10 minutes | ★★★☆☆ Hours to days | ★★☆☆☆ Days | ★★★★☆ Hours |
| **Community/docs** | ★★★★☆ Growing | ★★★★★ Massive | ★★★★★ Massive | ★★★★☆ Good |
| **Best for** | Small-medium sites, part-time devs | High-traffic, complex routing | Legacy setups | Docker/Kubernetes |

### Decision: Caddy

**Why Caddy over Nginx:**
1. Automatic HTTPS with Let's Encrypt — zero certificate management
2. Configuration is 10 lines instead of 40+
3. Part-time developer cannot maintain certbot cron jobs and Nginx config edge cases
4. Performance difference is irrelevant at our traffic level (< 10,000 requests/day initially)

**When Nginx would be better:** If the portal were handling 100,000+ requests/day with complex load balancing, WebSocket proxying, or multi-upstream routing. Nginx is the industry standard for high-traffic production environments. Zahn Kumpan is not that — and if it ever becomes that, migrating from Caddy to Nginx is a 2-hour task.

**Our Caddy config (complete, production-ready):**

```
# /etc/caddy/Caddyfile — Complete config for Zahn Kumpan
portal.zahn-kumpan.de {
    reverse_proxy localhost:3000

    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }

    encode gzip

    log {
        output file /var/log/caddy/zahnkumpan.log
        format json
    }
}
```

**Equivalent Nginx config (for comparison — 3x more complex):**

```nginx
# /etc/nginx/sites-available/zahnkumpan
server {
    listen 80;
    server_name portal.zahn-kumpan.de;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.zahn-kumpan.de;

    ssl_certificate /etc/letsencrypt/live/portal.zahn-kumpan.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.zahn-kumpan.de/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/zahnkumpan.access.log;
    error_log /var/log/nginx/zahnkumpan.error.log;
}

# Also need certbot cron:
# 0 0,12 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

The Caddy config is 15 lines. The Nginx config is 40+ lines plus a cron job. For a part-time developer, this difference matters.

---

---

## SECTION 3: Backup & Disaster Recovery Strategy

**INSERT AFTER:** Section 22 (Security Architecture), right before `## 23. Performance & Caching Strategy`

---

### Backup & Disaster Recovery Strategy

#### What Needs to Be Backed Up

| Data | Location | Backup Method | Frequency | Recovery Priority |
|------|----------|---------------|-----------|-------------------|
| PostgreSQL (users, sessions, leads) | Hetzner VPS | pg_dump automated script | Daily | Critical — no users can log in without this |
| Sanity CMS content | sanity.io (hosted) | Sanity export API | Weekly | Medium — Sanity has its own redundancy |
| Next.js application code | GitHub repository | Git (inherent) | Every push | High — can redeploy from any commit |
| Environment variables (.env) | Hetzner VPS | Encrypted copy in password manager | On change | Critical — app cannot start without secrets |
| Caddy config | Hetzner VPS | Version-controlled in repo | On change | Low — 15 lines, can be rewritten in 5 minutes |
| SSL certificates | Caddy auto-manages | Not needed — Caddy regenerates automatically | N/A | N/A |
| Uploaded media | Sanity CDN | Sanity export includes assets | Weekly | Medium |

#### PostgreSQL Automated Backup Script

```bash
#!/bin/bash
# /home/zahnkumpan/scripts/backup-db.sh
# Run daily via cron: 0 3 * * * /home/zahnkumpan/scripts/backup-db.sh

BACKUP_DIR="/home/zahnkumpan/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M)
DB_NAME="zahnkumpan"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -U zahnkumpan $DB_NAME | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Keep only last 14 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +14 -delete

# Log backup size
echo "$(date): Backup completed - $(du -h $BACKUP_DIR/db_$TIMESTAMP.sql.gz | cut -f1)" \
  >> /var/log/zahnkumpan-backup.log
```

#### Sanity Content Export Script

```bash
#!/bin/bash
# /home/zahnkumpan/scripts/backup-sanity.sh
# Run weekly via cron: 0 4 * * 0 /home/zahnkumpan/scripts/backup-sanity.sh

BACKUP_DIR="/home/zahnkumpan/backups/sanity"
TIMESTAMP=$(date +%Y-%m-%d)

mkdir -p $BACKUP_DIR

# Export all Sanity content as NDJSON
npx sanity dataset export production "$BACKUP_DIR/sanity_$TIMESTAMP.tar.gz" \
  --token $SANITY_API_TOKEN

# Keep last 4 weekly backups
find $BACKUP_DIR -name "sanity_*.tar.gz" -mtime +28 -delete
```

#### Disaster Recovery Plan

| Scenario | Recovery Time | Steps |
|----------|-------------|-------|
| VPS dies completely | 1-2 hours | 1. Spin up new Hetzner VPS, 2. Run server setup script, 3. Restore PostgreSQL from latest backup, 4. Deploy app from GitHub, 5. Restore .env from password manager, 6. Update DNS if IP changed |
| Database corruption | 30 minutes | 1. Stop Next.js, 2. Drop corrupted database, 3. Restore from latest pg_dump, 4. Restart Next.js |
| Sanity CMS data loss | 1 hour | 1. Import latest Sanity export, 2. Verify content, 3. Trigger ISR revalidation |
| Application bug in production | 5 minutes | 1. `git revert` to last working commit, 2. Rebuild and deploy, 3. PM2 restart |
| SSL certificate issue | 0 minutes | Caddy auto-renews. If Caddy itself fails, restart Caddy service. |

#### Hetzner Snapshot Backup (Additional Layer)

Hetzner offers VPS snapshots at €0.01/GB/month. Enable weekly snapshots of the entire VPS as an additional safety net:

```bash
# Via Hetzner API or Cloud Console
# Weekly snapshot, keep last 3
# Cost: ~€0.50-1.00/month for a 20GB VPS
```

---

---

## SECTION 4: Accessibility (WCAG) Strategy

**INSERT AFTER:** Section 22 (Security Architecture) — specifically after the new Backup section above, right before `## 23. Performance & Caching Strategy`

---

### Accessibility (WCAG 2.1 AA) Strategy

#### Why Accessibility Matters for a German Dental Portal

Germany's Barrierefreiheitsstärkungsgesetz (BFSG) — the Accessibility Strengthening Act — takes effect June 28, 2025. While it primarily targets e-commerce, a professional portal serving dentists should meet WCAG 2.1 AA as a baseline for credibility and legal safety.

#### Accessibility Checklist

| Requirement | Implementation | Priority |
|------------|---------------|----------|
| **Semantic HTML** | Use proper heading hierarchy (h1-h6), landmark elements (nav, main, article, aside), and semantic tags | Critical |
| **Keyboard navigation** | All interactive elements (buttons, links, filters, forms) must be operable via keyboard Tab/Enter/Space | Critical |
| **Color contrast** | Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text (Tailwind's default grays pass this) | Critical |
| **Alt text for images** | All provider logos, article cover images, and decorative images need appropriate alt attributes | High |
| **Form labels** | Every input field (login, registration, filters) must have a visible associated `<label>` | High |
| **Focus indicators** | Visible focus ring on all interactive elements (Tailwind's `focus:ring` classes) | High |
| **Error messages** | Form validation errors must be announced to screen readers via `aria-live="polite"` or `role="alert"` | High |
| **Skip navigation link** | "Skip to content" link for keyboard users at the top of every page | Medium |
| **Responsive text** | Text must be readable at 200% zoom without horizontal scrolling | Medium |
| **Table headers** | Comparison tables must use proper `<th>` elements with `scope="col"` attributes | High |
| **ARIA labels** | Premium gate overlay, filter controls, and sort buttons need descriptive `aria-label` attributes | Medium |

#### Implementation in the Prototype

```typescript
// Example: Accessible comparison table header
<table className="w-full" role="table" aria-label="Anbietervergleich Terminbuchung">
  <thead>
    <tr>
      <th scope="col" className="text-left p-4">Anbieter</th>
      <th scope="col" className="text-left p-4">
        <button
          onClick={() => toggleSort("monthlyPrice")}
          aria-label="Sortiere nach Preis pro Monat"
          className="font-medium hover:text-brand-600"
        >
          Preis/Monat {sortField === "monthlyPrice" && (sortDirection === "asc" ? "↑" : "↓")}
        </button>
      </th>
    </tr>
  </thead>
</table>
```

```typescript
// Example: Accessible premium gate
<div
  role="region"
  aria-label="Premium-Inhalt — Registrierung erforderlich"
>
  <div aria-hidden="true" className="blur-sm pointer-events-none select-none">
    {/* Skeleton placeholder */}
  </div>
  <div role="dialog" aria-labelledby="premium-cta-title">
    <h3 id="premium-cta-title">Premium-Vergleich</h3>
    <p>Registriere dich kostenlos für den vollständigen Vergleich.</p>
    <Link href="/registrieren" className="...">
      Kostenlos registrieren
    </Link>
  </div>
</div>
```

#### Testing Tools

| Tool | Purpose | Phase |
|------|---------|-------|
| axe-core (browser extension) | Automated WCAG audit | 1 |
| Lighthouse Accessibility audit | Scoring and recommendations | 1 |
| Keyboard-only navigation test | Manual tab-through of all pages | 1 |
| Screen reader test (NVDA/VoiceOver) | Real assistive technology check | 2 |

---

---

## SECTION 5: Internationalization (i18n) Strategy

**INSERT AFTER:** Section 12 (SEO Architecture), after the Sitemap Generation subsection, right before `## 13. WordPress Migration Strategy`

---

### Internationalization (i18n) Strategy

#### Current Decision: German-Only

Zahn Kumpan is a German portal for German dentists. There is no business case for multi-language support in the MVP or any near-term phase.

| Language | Status | Reason |
|----------|--------|--------|
| German (de-DE) | Active — the only language | Target audience is German dental professionals |
| English | Not planned | German dentists don't need English content for German practice software |
| Turkish | Not planned | Could be considered if there's a significant Turkish-speaking dentist audience in Germany |

#### Architecture Prepared for Future i18n

Even though we are German-only, the architecture doesn't lock us out of future multilingual support:

| Preparation | How It's Done | Effort to Add Later |
|-------------|---------------|-------------------|
| URL structure | German URLs now (`/blog`, `/vergleich`, `/anmelden`) | Add `/en/blog`, `/en/compare` with Next.js middleware — 2-4 hours |
| CMS content | Sanity supports document-level and field-level localization natively | Add locale field to schemas — 4-8 hours per content type |
| hreflang tags | Not needed now (single language) | Add via `generateMetadata` — 1 hour |
| Date/number formatting | Use `Intl.DateTimeFormat("de-DE")` and `Intl.NumberFormat("de-DE")` | Already locale-aware by design |
| UI strings | Currently hardcoded in German (acceptable for German-only portal) | Extract to i18n library (next-intl) — 8-16 hours |

#### What NOT to Do Now

Do NOT add `next-intl` or any i18n library in Phase 1. It adds routing complexity, translation file management, and doubles the content workload — all for a language nobody has asked for. If Muhammad asks about multilingual support in the meeting:

> "The architecture supports adding languages later through Sanity's built-in localization and Next.js middleware routing. But for the MVP, German-only is the right choice — it avoids doubling our content workload and keeps the URL structure clean for German SEO."

---

---

## SECTION 6: Deployment Strategy Comparison (Bare Metal vs Docker)

**INSERT AFTER:** Appendix D4 (Hetzner Deployment Guide), right before `## Appendix E: Styling & ORM Comparison Deep-Dive`

---

### D5. Deployment Strategy: Bare Metal Node.js vs Docker

| Feature | Bare Metal (PM2 + Node.js) | Docker (docker-compose) |
|---------|---------------------------|------------------------|
| **Setup complexity** | ★★★★★ Simple — install Node, run PM2 | ★★★☆☆ Need Docker, Dockerfile, docker-compose.yml |
| **Resource usage** | ★★★★★ Minimal overhead | ★★★★☆ ~50-100MB Docker daemon overhead |
| **Debugging** | ★★★★★ Direct access to process, logs, files | ★★★☆☆ Must exec into container |
| **Deployment speed** | ★★★★★ rsync + PM2 restart = 30 seconds | ★★★★☆ Build image + restart = 1-2 minutes |
| **Reproducibility** | ★★★☆☆ Depends on server state | ★★★★★ Same image runs anywhere |
| **Scaling** | ★★★☆☆ PM2 cluster mode (same server) | ★★★★★ Docker Swarm / Kubernetes |
| **Rollback** | ★★★★☆ Git revert + rebuild | ★★★★★ Tag previous image, instant rollback |
| **Learning curve** | ★★★★★ Familiar to any Node.js dev | ★★★☆☆ Docker concepts needed |
| **Best for** | Single-server MVP, part-time developer | Multi-server production, team with Docker experience |

### Decision: Bare Metal (PM2 + Node.js) for MVP

**Why:** Docker is overkill for a single Hetzner VPS running one Next.js app and one PostgreSQL database. PM2 handles process management, clustering, and log rotation. The deployment script (rsync + PM2 restart) is 10 lines of bash. Docker would add a Dockerfile, docker-compose.yml, image registry, and container debugging — all for the same result on one server.

**When to switch to Docker:** If the project needs multiple servers, a staging environment, or a CI/CD pipeline that deploys to different environments. At that point, Docker provides reproducibility that bare metal cannot match.

**Docker config (for future reference, NOT for MVP):**

```dockerfile
# Dockerfile — only use this if switching to Docker later
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml — only use if switching to Docker
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://zahnkumpan:password@db:5432/zahnkumpan
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zahnkumpan
      POSTGRES_PASSWORD: password
      POSTGRES_DB: zahnkumpan
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

---

---

## SECTION 7: Concept Document Template (1-2 Page Submission)

**INSERT AFTER:** Appendix J (Meeting Preparation Cheat Sheet), right before `## Appendix K: Additional Mermaid Diagrams`

---

### J4. Concept Document Template (Ready to Submit)

This is the actual 1-2 page concept document you submit alongside the prototype. Copy it, fill in any placeholders, and submit as a separate PDF or markdown file.

---

#### CONCEPT DOCUMENT — START

---

# Zahn Kumpan — Technical Concept

**Portal:** Zahn Kumpan — Vergleichsportal für Zahnarztpraxen  
**Prepared by:** [Your Name]  
**Date:** May 2026

---

## 1. Architecture Summary

Zahn Kumpan is an SEO-first content portal with a premium comparison layer. The architecture separates content management from the application layer:

**Sanity CMS** stores all content — blog articles, provider data, comparison criteria, and SEO metadata. Editors manage content through Sanity Studio without needing developer assistance.

**Next.js 15** renders pages and controls what the browser receives. Public content (blog articles, landing pages) is statically generated for fast load times and Google indexing. Premium content (full comparison tables with pricing, ratings, and analysis) is server-rendered with authentication checks — unauthenticated users see only teaser data.

**Auth.js v5** handles registration and login with server-side database sessions stored in PostgreSQL on a German server. Premium data is never sent to the browser without a valid session — the protection is at the data query level, not a CSS blur.

**PostgreSQL** stores users, sessions, and leads. All user data stays in the EU (Hetzner, Germany).

## 2. Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| CMS | Sanity v3 | Editor-friendly, hosted infrastructure, free tier covers MVP, structured content for comparisons |
| Frontend | Next.js 15 | Handles both public SEO pages (SSG) and protected member area (SSR) natively |
| Auth | Auth.js v5 | Server-side sessions, GDPR-friendly (EU-hosted data), Next.js middleware integration |
| Hosting | Hetzner Cloud | German company, EU data centers, GDPR compliant, ~€6/month for MVP |
| Styling | Tailwind CSS v4 | Rapid development, consistent design system, works with Server Components |

## 3. SEO & Migration Strategy

Existing WordPress content will be exported via REST API, transformed into Sanity documents, and every URL will receive a 301 redirect in `next.config.ts`. SEO metadata (titles, descriptions, canonicals) will be preserved or improved. A sitemap and JSON-LD structured data are generated programmatically from CMS content.

## 4. Premium Gating Approach

The comparison feature has two tiers: public teasers (provider name, category, short description) and premium data (pricing, ratings, pros/cons, detailed analysis). The GROQ query executed on the server differs based on session status — unauthenticated queries never include premium fields. The browser cannot access data it was never sent.

## 5. GDPR / DSGVO Compliance

All user data is stored on Hetzner (Germany). Session cookies are httpOnly, secure, and sameSite. Cookie consent banner for non-essential cookies. Datenschutz and Impressum pages included. Data Processing Agreements with Sanity (hosted CMS).

## 6. Future: LLM Comparison Explainer (Phase 4)

After the portal has structured provider data in the CMS, a comparison explainer will use the Claude API to generate German-language summaries from structured data (not freeform user input). This keeps outputs controlled, factual, and safe. No user personal data is ever sent to the LLM.

## 7. Phase Plan

| Phase | Scope | Timeline |
|-------|-------|----------|
| Phase 1 (MVP) | CMS setup, frontend, auth, premium gating, WordPress migration, GDPR basics | Weeks 1-8 |
| Phase 2 | Brevo CRM, email automation, Plausible analytics | Weeks 9-14 |
| Phase 3 | Content expansion, Meilisearch (if needed), bookmarks | Weeks 15-20 |
| Phase 4 | LLM comparison explainer, semantic search exploration | Weeks 21-26 |

**MVP monthly cost:** ~€6/month (Hetzner VPS + domain)  
**Full platform monthly cost:** ~€80/month (all services active)

---

#### CONCEPT DOCUMENT — END

---

---

## SECTION 8: GitHub Actions CI/CD Pipeline

**INSERT AFTER:** Appendix K4 (Full Deployment Pipeline mermaid diagram), right before `## Appendix L: Full Package.json Reference`

---

### K5. GitHub Actions CI/CD Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Hetzner

on:
  push:
    branches: [main]

env:
  SERVER_HOST: ${{ secrets.HETZNER_HOST }}
  SERVER_USER: root
  APP_DIR: /var/www/zahnkumpan

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run build

      - name: Deploy to Hetzner
        uses: easingthemes/ssh-deploy@v5
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ env.SERVER_HOST }}
          REMOTE_USER: ${{ env.SERVER_USER }}
          TARGET: ${{ env.APP_DIR }}
          EXCLUDE: ".git, node_modules, .env.local"

      - name: Install dependencies and restart
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ env.SERVER_HOST }}
          username: ${{ env.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ${{ env.APP_DIR }}
            npm ci --production
            npx drizzle-kit migrate
            pm2 restart ecosystem.config.js
```

#### Required GitHub Secrets

| Secret | Value | Where to Get It |
|--------|-------|-----------------|
| `HETZNER_HOST` | IP address of your VPS | Hetzner Cloud Console |
| `SSH_PRIVATE_KEY` | SSH private key for root access | Generate with `ssh-keygen` |

#### When to Set Up CI/CD

NOT in Phase 0 (trial) or early Phase 1. Manual deployment (`./deploy.sh`) is fine until you have a stable codebase. Set up GitHub Actions in Week 4-5 of Phase 1, once the core application structure is finalized.

---

---

## SECTION 9: Error Pages (404/500)

**INSERT AFTER:** Appendix K3 (Error Handling Architecture mermaid diagram), right before `### K4. Full Deployment Pipeline`

---

### K3b. Error Page Implementation

```typescript
// app/not-found.tsx — Custom 404 page
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-brand-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Seite nicht gefunden
        </h2>
        <p className="text-gray-600 mb-8">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
          Wenn Sie über einen alten Link hierher gekommen sind,
          wurde der Inhalt möglicherweise migriert.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg
                       font-medium hover:bg-brand-700 transition-colors"
          >
            Zur Startseite
          </Link>
          <Link
            href="/blog"
            className="border border-gray-300 text-gray-700 px-6 py-3
                       rounded-lg font-medium hover:border-brand-400
                       transition-colors"
          >
            Blog lesen
          </Link>
        </div>
      </div>
    </div>
  )
}
```

```typescript
// app/error.tsx — Custom 500 error page
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Ein Fehler ist aufgetreten
        </h2>
        <p className="text-gray-600 mb-8">
          Bitte versuchen Sie es erneut. Wenn das Problem weiterhin
          besteht, kontaktieren Sie uns.
        </p>
        <button
          onClick={() => reset()}
          className="bg-brand-600 text-white px-6 py-3 rounded-lg
                     font-medium hover:bg-brand-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  )
}
```

---

---

## Quick Reference: Where to Insert Each Section

| Section # | Title | Insert AFTER this heading in main doc |
|-----------|-------|---------------------------------------|
| 1 | Why NOT n8n, Vector Search, Ollama, Multi-LLM | `## 18. LLM Integration Strategy (Phase 4)` (before `## 19`) |
| 2 | Reverse Proxy Comparison (Caddy vs Nginx) | `### Deployment Architecture (Hetzner)` in Section 9 (before `## 10`) |
| 3 | Backup & Disaster Recovery Strategy | `## 22. Security Architecture` (before `## 23`) |
| 4 | Accessibility (WCAG) Strategy | After new Section 3 above (before `## 23`) |
| 5 | Internationalization (i18n) Strategy | `### Sitemap Generation` in Section 12 (before `## 13`) |
| 6 | Deployment: Bare Metal vs Docker | `### D4. Hetzner Deployment Guide` (before `## Appendix E`) |
| 7 | Concept Document Template | `### J3. Red Flags to Watch For` (before `## Appendix K`) |
| 8 | GitHub Actions CI/CD Pipeline | `### K4. Full Deployment Pipeline` (before `## Appendix L`) |
| 9 | Error Pages (404/500) | `### K3. Error Handling Architecture` (before `### K4`) |

---

*End of supplementary sections.*
