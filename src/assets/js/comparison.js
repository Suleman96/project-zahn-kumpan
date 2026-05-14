/* ============================================================
   Zahn Kumpan — Comparison Module
   Interactive filtering and sorting for provider comparison
   ============================================================ */

const PROVIDERS = [
  /* ── Terminbuchung (Online Booking) ── */
  {
    id: 'doctolib',
    name: 'Doctolib',
    category: 'terminbuchung',
    categoryLabel: 'Terminbuchung',
    emoji: '📅',
    logoColor: '#26A65B',
    shortDesc: 'Marktführer für Online-Terminbuchung im Gesundheitswesen — bekannt, bewährt und patientenfreundlich.',
    monthlyPrice: 139,
    annualPrice: 1588,
    trialDays: 0,
    trialLabel: 'Kein Testzeitraum',
    rating: 4.7,
    ratingCount: 2340,
    supportQuality: 5,
    setupEase: 4,
    features: {
      onlineBooking: true,
      reminders: true,
      patientApp: true,
      videoConsult: true,
      multiLocation: true,
      api: true,
      gdprCompliant: true,
    },
    priceRange: 'premium',
    featured: true,
    pros: [
      'Bekannte Marke — Patienten vertrauen ihr',
      'Sehr einfach für Patienten zu bedienen',
      'Starke mobile App',
      'Telemedizin integriert',
    ],
    cons: [
      'Hohe Monatskosts bei kleinen Praxen',
      'Kein Testzeitraum verfügbar',
      'Wenig Anpassungsoptionen',
    ],
    website: '#',
    tags: ['Beliebt', 'Patientenapp', 'Telemed'],
    tagColors: ['badge-green', 'badge-primary', 'badge-teal'],
  },
  {
    id: 'samedi',
    name: 'samedi',
    category: 'terminbuchung',
    categoryLabel: 'Terminbuchung',
    emoji: '🗓️',
    logoColor: '#2980B9',
    shortDesc: 'Deutsches Online-Terminbuchungssystem mit DSGVO-Fokus und flexiblen Konfigurationsmöglichkeiten.',
    monthlyPrice: 79,
    annualPrice: 828,
    trialDays: 30,
    trialLabel: '30 Tage kostenlos',
    rating: 4.4,
    ratingCount: 891,
    supportQuality: 4,
    setupEase: 4,
    features: {
      onlineBooking: true,
      reminders: true,
      patientApp: false,
      videoConsult: false,
      multiLocation: true,
      api: true,
      gdprCompliant: true,
    },
    priceRange: 'mittel',
    featured: false,
    pros: [
      'Deutsches Unternehmen — DSGVO-konform',
      '30 Tage Testphase',
      'Günstiger als Doctolib',
      'Flexible Konfiguration',
    ],
    cons: [
      'Keine eigene Patienten-App',
      'Kein Telemedizin-Modul',
      'Kleinere Nutzerbasis',
    ],
    website: '#',
    tags: ['DSGVO', 'Flexibel', 'Testphase'],
    tagColors: ['badge-primary', 'badge-gray', 'badge-green'],
  },
  {
    id: 'terminland',
    name: 'Terminland',
    category: 'terminbuchung',
    categoryLabel: 'Terminbuchung',
    emoji: '📋',
    logoColor: '#8E44AD',
    shortDesc: 'Kompakte, kostengünstige Buchungslösung für kleinere Zahnarztpraxen mit einfacher Einrichtung.',
    monthlyPrice: 39,
    annualPrice: 408,
    trialDays: 14,
    trialLabel: '14 Tage kostenlos',
    rating: 4.1,
    ratingCount: 430,
    supportQuality: 3,
    setupEase: 5,
    features: {
      onlineBooking: true,
      reminders: true,
      patientApp: false,
      videoConsult: false,
      multiLocation: false,
      api: false,
      gdprCompliant: true,
    },
    priceRange: 'guenstig',
    featured: false,
    pros: [
      'Sehr günstig und einfach',
      'Schnelle Einrichtung in unter 1 Stunde',
      '14 Tage Testphase',
      'Für kleine Praxen ideal',
    ],
    cons: [
      'Keine Multi-Location Unterstützung',
      'Kein API / Integrationen',
      'Eingeschränkter Support',
    ],
    website: '#',
    tags: ['Budget', 'Einfach'],
    tagColors: ['badge-amber', 'badge-gray'],
  },
  /* ── Abrechnungszentrum (Billing Centers) ── */
  {
    id: 'dzr',
    name: 'DZR',
    category: 'abrechnung',
    categoryLabel: 'Abrechnungszentrum',
    emoji: '🏦',
    logoColor: '#C0392B',
    shortDesc: 'Deutsches Zahnärztliches Rechenzentrum — Marktführer für Privatliquidation seit über 50 Jahren.',
    monthlyPrice: 0,
    annualPrice: 0,
    priceNote: 'Provisionsbasiert (~2-3%)',
    trialDays: 0,
    trialLabel: 'Kostenloser Start',
    rating: 4.5,
    ratingCount: 1820,
    supportQuality: 5,
    setupEase: 3,
    features: {
      goaeLiquidation: true,
      kmaiAbrechnung: true,
      mahnwesen: true,
      ausfallschutz: true,
      onlinePortal: true,
      datevExport: true,
      gdprCompliant: true,
    },
    priceRange: 'provision',
    featured: true,
    pros: [
      'Branchenführer mit 50+ Jahren Erfahrung',
      'Kein fixer Monatsbeitrag',
      'Umfassender Ausfallschutz',
      'Starkes Mahnwesen',
    ],
    cons: [
      'Provision reduziert Praxisertrag',
      'Lange Bearbeitungszeit (7-14 Tage)',
      'Wenig Digitalisierung im Prozess',
    ],
    website: '#',
    tags: ['Marktführer', 'GOÄ', 'Kasse'],
    tagColors: ['badge-primary', 'badge-teal', 'badge-green'],
  },
  {
    id: 'arc',
    name: 'ARC',
    category: 'abrechnung',
    categoryLabel: 'Abrechnungszentrum',
    emoji: '⚡',
    logoColor: '#E67E22',
    shortDesc: 'Modernes Abrechnungszentrum mit schneller digitaler Abwicklung und transparentem Online-Portal.',
    monthlyPrice: 0,
    annualPrice: 0,
    priceNote: 'Provisionsbasiert (~1.8-2.5%)',
    trialDays: 0,
    trialLabel: 'Kostenloser Start',
    rating: 4.3,
    ratingCount: 567,
    supportQuality: 4,
    setupEase: 4,
    features: {
      goaeLiquidation: true,
      kmaiAbrechnung: true,
      mahnwesen: true,
      ausfallschutz: false,
      onlinePortal: true,
      datevExport: true,
      gdprCompliant: true,
    },
    priceRange: 'provision',
    featured: false,
    pros: [
      'Günstigere Provision als DZR',
      'Schnelle digitale Abwicklung (3-5 Tage)',
      'Modernes Online-Portal',
      'Persönlicher Ansprechpartner',
    ],
    cons: [
      'Kein vollständiger Ausfallschutz',
      'Kleinere Marke — weniger bekannt',
      'Eingeschränkte KFO-Unterstützung',
    ],
    website: '#',
    tags: ['Digital', 'Schnell'],
    tagColors: ['badge-teal', 'badge-amber'],
  },
  {
    id: 'bfs',
    name: 'BFS health finance',
    category: 'abrechnung',
    categoryLabel: 'Abrechnungszentrum',
    emoji: '💼',
    logoColor: '#1A5276',
    shortDesc: 'Spezialist für Gesundheitsfinanzierung mit Fokus auf Liquiditätssicherung und Factoring.',
    monthlyPrice: 0,
    annualPrice: 0,
    priceNote: 'Provisionsbasiert (~2.2-3%)',
    trialDays: 0,
    trialLabel: 'Kostenloser Start',
    rating: 4.2,
    ratingCount: 389,
    supportQuality: 4,
    setupEase: 3,
    features: {
      goaeLiquidation: true,
      kmaiAbrechnung: false,
      mahnwesen: true,
      ausfallschutz: true,
      onlinePortal: true,
      datevExport: false,
      gdprCompliant: true,
    },
    priceRange: 'provision',
    featured: false,
    pros: [
      'Starker Ausfallschutz',
      'Schnelle Auszahlung durch Factoring',
      'Spezialisiert auf Gesundheitswesen',
    ],
    cons: [
      'Kein DATEV-Export',
      'Kein KFO / KIG',
      'Lange Vertragsbindung erforderlich',
    ],
    website: '#',
    tags: ['Factoring', 'Liquidität'],
    tagColors: ['badge-primary', 'badge-gray'],
  },
];

/* ── State ── */
let state = {
  category: 'all',
  priceRange: 'all',
  supportQuality: 'all',
  sortBy: 'rating',
  sortDir: 'desc',
  viewMode: 'cards',
  filtered: [...PROVIDERS],
};

/* ── Render star rating ── */
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/* ── Render support quality ── */
function renderSupportBadge(level) {
  const map = {1:'Basis',2:'Standard',3:'Gut',4:'Sehr gut',5:'Exzellent'};
  const color = level >= 4 ? 'badge-green' : level === 3 ? 'badge-teal' : 'badge-gray';
  return `<span class="badge ${color}">${map[level] || level}</span>`;
}

/* ── Render price display ── */
function renderPrice(p) {
  if (p.priceNote) return `<span style="font-size:0.8rem;color:var(--gray-500)">${p.priceNote}</span>`;
  return `<strong>€${p.monthlyPrice}</strong><span style="font-size:0.8rem;color:var(--gray-400)">/Monat</span>`;
}

/* ── Build provider card HTML ── */
function buildProviderCard(p) {
  const featureKeys = Object.keys(p.features);
  const featureLabels = {
    onlineBooking: 'Online-Buchung',
    reminders: 'Erinnerungen',
    patientApp: 'Patienten-App',
    videoConsult: 'Video-Konsultation',
    multiLocation: 'Mehrere Standorte',
    api: 'API / Integrationen',
    gdprCompliant: 'DSGVO-konform',
    goaeLiquidation: 'GOÄ-Liquidation',
    kmaiAbrechnung: 'KMA/KFO-Abrechnung',
    mahnwesen: 'Mahnwesen',
    ausfallschutz: 'Ausfallschutz',
    onlinePortal: 'Online-Portal',
    datevExport: 'DATEV-Export',
  };
  const tagsHtml = p.tags.map((t, i) =>
    `<span class="badge ${p.tagColors[i] || 'badge-gray'}">${t}</span>`
  ).join('');
  const prosHtml = p.pros.map(pro =>
    `<li class="pros-cons-item"><span class="pros-icon">✓</span>${pro}</li>`
  ).join('');
  const consHtml = p.cons.map(con =>
    `<li class="pros-cons-item"><span class="cons-icon">✕</span>${con}</li>`
  ).join('');
  const featuresHtml = featureKeys.map(k =>
    `<li class="feature-item">
      <span class="${p.features[k] ? 'feature-check' : 'feature-cross'}">${p.features[k] ? '✓' : '✕'}</span>
      <span style="${!p.features[k] ? 'color:var(--gray-400);text-decoration:line-through' : ''}">${featureLabels[k] || k}</span>
    </li>`
  ).join('');

  return `
    <article class="provider-card${p.featured ? ' featured' : ''}" data-id="${p.id}" aria-label="${p.name}">
      <div class="provider-card-header">
        <div class="provider-logo" style="color:${p.logoColor}">${p.emoji}</div>
        <div class="provider-info">
          <div class="provider-name">${p.name}${p.featured ? ' <span class="badge badge-premium" style="font-size:0.65rem;padding:2px 8px;">⭐ Top</span>' : ''}</div>
          <div class="provider-category">${p.categoryLabel}</div>
          <div class="provider-tags">${tagsHtml}</div>
        </div>
        <div class="provider-rating">
          <div class="stars" aria-label="Bewertung: ${p.rating} von 5">${renderStars(p.rating)}</div>
          <div class="rating-value">${p.rating}</div>
        </div>
      </div>
      <div class="provider-card-body">
        <p class="provider-card-description">${p.shortDesc}</p>
        <div class="provider-specs">
          <div class="provider-spec">
            <div class="provider-spec-label">Preis</div>
            <div class="provider-spec-value">${renderPrice(p)}</div>
          </div>
          <div class="provider-spec">
            <div class="provider-spec-label">Test</div>
            <div class="provider-spec-value" style="font-size:0.875rem;color:${p.trialDays > 0 ? 'var(--green-600)' : 'var(--gray-500)'}">${p.trialLabel}</div>
          </div>
          <div class="provider-spec">
            <div class="provider-spec-label">Support</div>
            <div class="provider-spec-value">${renderSupportBadge(p.supportQuality)}</div>
          </div>
          <div class="provider-spec">
            <div class="provider-spec-label">Setup</div>
            <div class="provider-spec-value">
              <span class="stars" style="font-size:0.75rem;">${'★'.repeat(p.setupEase)}${'☆'.repeat(5 - p.setupEase)}</span>
            </div>
          </div>
        </div>
        <div class="provider-features">
          <div class="provider-features-title">Funktionen</div>
          <ul class="feature-list">${featuresHtml}</ul>
        </div>
        <div class="provider-pros-cons">
          <div class="pros-cons-column">
            <div class="pros-cons-label pros-label">Vorteile</div>
            <ul class="pros-cons-list">${prosHtml}</ul>
          </div>
          <div class="pros-cons-column">
            <div class="pros-cons-label cons-label">Nachteile</div>
            <ul class="pros-cons-list">${consHtml}</ul>
          </div>
        </div>
      </div>
      <div class="provider-card-footer">
        ${p.trialDays > 0
          ? `<span class="provider-trial">✓ ${p.trialDays} Tage gratis testen</span>`
          : `<span style="color:var(--gray-400);font-size:0.8125rem">${p.trialLabel}</span>`}
        <a href="${p.website}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">
          Website →
        </a>
      </div>
    </article>`;
}

/* ── Build table row HTML ── */
function buildTableRow(p) {
  const featureCount = Object.values(p.features).filter(Boolean).length;
  const totalFeatures = Object.keys(p.features).length;
  return `
    <tr class="${p.featured ? 'featured-row' : ''}">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:1.5rem">${p.emoji}</span>
          <div>
            <div style="font-weight:700;color:var(--gray-900)">${p.name}
              ${p.featured ? '<span class="badge badge-premium" style="font-size:0.65rem;vertical-align:middle">Top</span>' : ''}
            </div>
            <div style="font-size:0.78rem;color:var(--gray-400)">${p.categoryLabel}</div>
          </div>
        </div>
      </td>
      <td style="font-weight:700;color:var(--gray-900)">${p.priceNote || (p.monthlyPrice > 0 ? '€' + p.monthlyPrice + '/Mo.' : 'Kostenlos')}</td>
      <td>
        <div class="stars" style="font-size:0.8rem">${renderStars(p.rating)}</div>
        <div style="font-size:0.78rem;color:var(--gray-400)">${p.rating} (${p.ratingCount})</div>
      </td>
      <td>${renderSupportBadge(p.supportQuality)}</td>
      <td>
        <span style="color:${p.trialDays > 0 ? 'var(--green-600)' : 'var(--gray-400)'};font-size:0.875rem;font-weight:${p.trialDays > 0 ? '600' : '400'}">
          ${p.trialLabel}
        </span>
      </td>
      <td>
        <span style="font-size:0.875rem;color:var(--gray-600)">${featureCount}/${totalFeatures} Features</span>
      </td>
      <td>
        <a href="${p.website}" class="btn btn-primary btn-sm" target="_blank" rel="noopener">Details</a>
      </td>
    </tr>`;
}

/* ── Filter & Sort ── */
function applyFilters() {
  let result = [...PROVIDERS];

  if (state.category !== 'all') {
    result = result.filter(p => p.category === state.category);
  }
  if (state.priceRange !== 'all') {
    result = result.filter(p => p.priceRange === state.priceRange);
  }
  if (state.supportQuality !== 'all') {
    const minQuality = parseInt(state.supportQuality, 10);
    result = result.filter(p => p.supportQuality >= minQuality);
  }

  result.sort((a, b) => {
    let valA, valB;
    switch (state.sortBy) {
      case 'price':
        valA = a.monthlyPrice; valB = b.monthlyPrice; break;
      case 'support':
        valA = a.supportQuality; valB = b.supportQuality; break;
      default:
        valA = a.rating; valB = b.rating;
    }
    return state.sortDir === 'asc' ? valA - valB : valB - valA;
  });

  state.filtered = result;
  return result;
}

/* ── Render ── */
function render() {
  const providers = applyFilters();
  const countEl = document.getElementById('filter-results-count');
  if (countEl) countEl.textContent = `${providers.length} Anbieter gefunden`;

  if (state.viewMode === 'cards') {
    const grid = document.getElementById('comparison-grid');
    if (!grid) return;
    if (providers.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--gray-400)">
          <div style="font-size:2.5rem;margin-bottom:12px">🔍</div>
          <p style="font-size:1rem;font-weight:600">Keine Anbieter gefunden</p>
          <p style="font-size:0.875rem;margin-top:6px">Passe die Filter an, um Ergebnisse zu sehen.</p>
        </div>`;
      return;
    }
    grid.innerHTML = providers.map(buildProviderCard).join('');
  } else {
    const tbody = document.getElementById('comparison-tbody');
    if (!tbody) return;
    tbody.innerHTML = providers.length > 0
      ? providers.map(buildTableRow).join('')
      : `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400)">Keine Anbieter gefunden</td></tr>`;
  }
}

/* ── Toggle view mode (cards / table) ── */
function setViewMode(mode) {
  state.viewMode = mode;
  const cardsView = document.getElementById('cards-view');
  const tableView = document.getElementById('table-view');
  const btns = document.querySelectorAll('.view-toggle-btn');
  btns.forEach(b => b.classList.toggle('active', b.dataset.view === mode));
  if (cardsView) cardsView.classList.toggle('hidden', mode !== 'cards');
  if (tableView) tableView.classList.toggle('hidden', mode !== 'table');
  render();
}

/* ── Sort column (table header) ── */
function sortBy(field) {
  if (state.sortBy === field) {
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortBy = field;
    state.sortDir = 'desc';
  }
  document.querySelectorAll('.comparison-table th button').forEach(btn => {
    btn.classList.toggle('sorted', btn.dataset.sort === field);
    const arrow = btn.querySelector('.sort-arrow');
    if (arrow && btn.dataset.sort === field) {
      arrow.textContent = state.sortDir === 'asc' ? ' ↑' : ' ↓';
    } else if (arrow) {
      arrow.textContent = ' ↕';
    }
  });
  render();
}

/* ── Init ── */
function initComparison() {
  const container = document.getElementById('comparison-section');
  if (!container) return;

  /* Filter controls */
  const categoryFilter  = document.getElementById('filter-category');
  const priceFilter     = document.getElementById('filter-price');
  const supportFilter   = document.getElementById('filter-support');
  const sortFilter      = document.getElementById('filter-sort');

  if (categoryFilter) categoryFilter.addEventListener('change', (e) => { state.category = e.target.value; render(); });
  if (priceFilter)    priceFilter.addEventListener('change', (e) => { state.priceRange = e.target.value; render(); });
  if (supportFilter)  supportFilter.addEventListener('change', (e) => { state.supportQuality = e.target.value; render(); });
  if (sortFilter)     sortFilter.addEventListener('change', (e) => { state.sortBy = e.target.value; render(); });

  /* Category toggle buttons */
  document.querySelectorAll('.filter-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.category;
      if (categoryFilter) categoryFilter.value = state.category;
      render();
    });
  });

  /* View mode toggle */
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setViewMode(btn.dataset.view));
  });

  /* Table sort buttons */
  document.querySelectorAll('.comparison-table th button').forEach(btn => {
    btn.addEventListener('click', () => sortBy(btn.dataset.sort));
  });

  /* Initial render */
  render();
}

document.addEventListener('DOMContentLoaded', initComparison);
