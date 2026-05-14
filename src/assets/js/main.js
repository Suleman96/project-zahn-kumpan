/* ============================================================
   Zahn Kumpan — Main JS (utilities, animations, TOC)
   ============================================================ */

/* ── Intersection Observer: fade-in on scroll ── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => observer.observe(el));
}

/* Add CSS for animations */
const style = document.createElement('style');
style.textContent = `
  [data-animate] { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
  [data-animate].animated { opacity: 1; transform: none; }
  [data-animate][data-delay="1"] { transition-delay: 0.1s; }
  [data-animate][data-delay="2"] { transition-delay: 0.2s; }
  [data-animate][data-delay="3"] { transition-delay: 0.3s; }
  [data-animate][data-delay="4"] { transition-delay: 0.4s; }
`;
document.head.appendChild(style);

/* ── Active navigation highlighting ── */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isActive = href !== '#' && currentPath.endsWith(href.replace(/^\.\.\//, ''));
    link.classList.toggle('active', isActive);
  });
}

/* ── Smooth counter animation ── */
function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + current.toLocaleString('de-DE') + suffix;
      if (current >= target) clearInterval(interval);
    }, 20);
  });
}

/* ── Table of contents: active section tracking ── */
function initToc() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (!tocLinks.length) return;
  const headings = Array.from(document.querySelectorAll('.article-body h2, .article-body h3'));
  if (!headings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-20% 0% -60% 0%' });

  headings.forEach(h => { if (h.id) observer.observe(h); });
}

/* ── Add heading IDs automatically ── */
function addHeadingIds() {
  document.querySelectorAll('.article-body h2, .article-body h3').forEach(el => {
    if (!el.id) {
      el.id = el.textContent.toLowerCase()
        .replace(/[^a-z0-9äöüß\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[äöüß]/g, c => ({ä:'ae',ö:'oe',ü:'ue',ß:'ss'}[c]));
    }
  });
}

/* ── Reading progress bar ── */
function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });
}

/* ── Blog category filter ── */
function initBlogFilter() {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = document.querySelectorAll('.blog-card[data-category]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.category;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        card.style.display = match ? '' : 'none';
        card.style.opacity = match ? '1' : '0';
      });
    });
  });
}

/* ── Blog search ── */
function initBlogSearch() {
  const searchInput = document.getElementById('blog-search');
  const cards = document.querySelectorAll('.blog-card[data-title]');
  if (!searchInput || !cards.length) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const excerpt = (card.dataset.excerpt || '').toLowerCase();
      const match = !query || title.includes(query) || excerpt.includes(query);
      card.style.display = match ? '' : 'none';
    });
  });
}

/* ── Share buttons ── */
function initShare() {
  const shareBtn = document.getElementById('share-btn');
  if (!shareBtn) return;
  shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    const title = document.title;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast && showToast('Link wurde kopiert!', 'success');
    }
  });
}

/* ── Login form ── */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput    = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorEl       = document.getElementById('login-error');
  const submitBtn     = document.getElementById('login-submit');
  const togglePwd     = document.getElementById('toggle-password');

  if (togglePwd && passwordInput) {
    togglePwd.addEventListener('click', () => {
      const isText = passwordInput.type === 'text';
      passwordInput.type = isText ? 'password' : 'text';
      togglePwd.textContent = isText ? '👁' : '🙈';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');

    const email    = emailInput?.value || '';
    const password = passwordInput?.value || '';

    if (!email || !password) {
      if (errorEl) { errorEl.textContent = 'Bitte alle Felder ausfüllen.'; errorEl.classList.remove('hidden'); }
      return;
    }

    /* Loading state */
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Anmelden...';
    }

    await new Promise(r => setTimeout(r, 800));

    const result = Auth.login(email, password);

    if (result.success) {
      showToast && showToast('Willkommen zurück! Du wirst weitergeleitet...', 'success');
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || resolveRoot('vergleich/index.html');
      setTimeout(() => { window.location.href = redirect; }, 1000);
    } else {
      if (errorEl) { errorEl.textContent = result.error; errorEl.classList.remove('hidden'); }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Anmelden'; }
      emailInput?.classList.add('error');
      passwordInput?.classList.add('error');
      emailInput?.addEventListener('input', () => emailInput.classList.remove('error'), { once: true });
    }
  });
}

/* ── Register form ── */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('register-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<div class="spinner"></div> Registrieren...'; }

    await new Promise(r => setTimeout(r, 1000));

    showToast && showToast('Willkommen! Bitte melde dich jetzt an.', 'success');
    setTimeout(() => { window.location.href = resolveRoot('anmelden.html'); }, 1200);
  });
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  addHeadingIds();
  initScrollAnimations();
  highlightActiveNav();
  initToc();
  initReadingProgress();
  initBlogFilter();
  initBlogSearch();
  initShare();
  initLoginForm();
  initRegisterForm();

  /* Counter observer */
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObserver.disconnect(); } });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }
});
