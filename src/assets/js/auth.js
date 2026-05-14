/* ============================================================
   Zahn Kumpan — Auth Module
   Demo credentials: demo@zahnkumpan.de / test1234
   ============================================================ */

const AUTH_KEY = 'zk_session_v1';
const DEMO_CREDENTIALS = { email: 'demo@zahnkumpan.de', password: 'test1234' };

const Auth = {
  login(email, password) {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (trimmedEmail === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      const session = {
        email: trimmedEmail,
        name: 'Demo Nutzer',
        initials: 'DN',
        loginTime: Date.now(),
        isPremium: true,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return { success: true, session };
    }
    return { success: false, error: 'E-Mail oder Passwort ist falsch.' };
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  getSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },
};

/* ── Nav state update ── */
function updateNavForAuth() {
  const session = Auth.getSession();
  const loginBtn   = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const userMenu   = document.getElementById('nav-user-menu');
  const userNameEl = document.getElementById('nav-user-name');
  const logoutBtn  = document.getElementById('nav-logout-btn');
  const memberBar  = document.getElementById('member-bar');

  if (session) {
    if (loginBtn)    loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (userMenu) {
      userMenu.classList.remove('hidden');
      if (userNameEl) userNameEl.textContent = session.name;
    }
    if (memberBar) {
      memberBar.classList.remove('hidden');
      const greetEl = memberBar.querySelector('.member-greeting strong');
      if (greetEl) greetEl.textContent = session.name;
    }
    // Unlock premium nav link
    document.querySelectorAll('.nav-premium-link .lock-icon').forEach(el => el.remove());
    document.querySelectorAll('.premium-locked-hint').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.premium-unlocked-hint').forEach(el => el.classList.remove('hidden'));
  } else {
    if (loginBtn)    loginBtn.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (userMenu)    userMenu.classList.add('hidden');
    if (memberBar)   memberBar.classList.add('hidden');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      showToast('Du wurdest erfolgreich abgemeldet.', 'success');
      setTimeout(() => { window.location.href = resolveRoot('index.html'); }, 900);
    });
  }
}

/* ── Premium gate ── */
function initPremiumGate() {
  const gateContainer = document.getElementById('premium-gate-container');
  const fullContent   = document.getElementById('premium-full-content');
  if (!gateContainer && !fullContent) return;

  if (Auth.isLoggedIn()) {
    if (gateContainer) gateContainer.classList.add('hidden');
    if (fullContent)   fullContent.classList.remove('hidden');
  } else {
    if (gateContainer) gateContainer.classList.remove('hidden');
    if (fullContent)   fullContent.classList.add('hidden');
  }
}

/* ── Protect page (redirect to login if not authenticated) ── */
function requireAuth(returnPath) {
  if (!Auth.isLoggedIn()) {
    const redirect = returnPath || window.location.href;
    window.location.href = resolveRoot('anmelden.html') + '?redirect=' + encodeURIComponent(redirect);
  }
}

/* ── Toast notification ── */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ── Resolve root path (works from subdirectories) ── */
function resolveRoot(path) {
  const depth = (window.location.pathname.match(/\//g) || []).length;
  const base = window.location.hostname === '' || window.location.hostname === 'localhost'
    ? window.location.pathname.includes('/portal/')
      ? window.location.pathname.split('/portal/')[0] + '/portal/'
      : '/'
    : '';
  // Simple relative resolution based on current path depth within portal
  const currentPath = window.location.pathname;
  if (currentPath.includes('/blog/') || currentPath.includes('/vergleich/')) {
    return '../' + path;
  }
  return path;
}

/* ── Mobile menu ── */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-close');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeFn = () => {
    menu.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (closeBtn) closeBtn.addEventListener('click', closeFn);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeFn));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFn(); });
}

/* ── Cookie banner ── */
function initCookieBanner() {
  const banner  = document.getElementById('cookie-banner');
  const accept  = document.getElementById('cookie-accept');
  const decline = document.getElementById('cookie-decline');
  if (!banner) return;

  if (localStorage.getItem('zk_cookie_consent')) {
    banner.classList.add('hidden');
    return;
  }

  if (accept) {
    accept.addEventListener('click', () => {
      localStorage.setItem('zk_cookie_consent', 'accepted');
      banner.classList.add('hidden');
    });
  }
  if (decline) {
    decline.addEventListener('click', () => {
      localStorage.setItem('zk_cookie_consent', 'declined');
      banner.classList.add('hidden');
    });
  }
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  updateNavForAuth();
  initPremiumGate();
  initMobileMenu();
  initCookieBanner();
});
