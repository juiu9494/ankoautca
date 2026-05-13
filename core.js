/* ============================================================
   ANKOAUTCA — CORE JS
   Handles: theme, auth, toasts, loader, scroll animations
   ============================================================ */

/* ── Theme ── */
const Theme = {
  KEY: 'anko_theme',
  get() { return localStorage.getItem(this.KEY) || 'light'; },
  set(t) {
    localStorage.setItem(this.KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  },
  toggle() { this.set(this.get() === 'dark' ? 'light' : 'dark'); },
  init() { this.set(this.get()); }
};

/* ── Auth ── */
const Auth = {
  KEY: 'anko_session',
  HASH: '$2a$12$cz4I8btyCquEIG/98zmZDOkgOwVFmuoseCBRM2PBAqnbAmF0DFizm',

  getSession() {
    try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; }
  },
  setSession(data) {
    localStorage.setItem(this.KEY, JSON.stringify({ ...data, ts: Date.now() }));
  },
  clearSession() { localStorage.removeItem(this.KEY); },
  isLoggedIn() {
    const s = this.getSession();
    if (!s) return false;
    // Session valid for 24h
    return (Date.now() - s.ts) < 86400000;
  },
  requireAuth() {
    if (!this.isLoggedIn()) {
      const current = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `../pages/login.html?redirect=${current}`;
      return false;
    }
    return true;
  },

  /* Simple frontend password check (demo) */
  checkPassword(pwd) {
    return pwd === 'admin2024' || pwd === 'ankoautca';
  },

  login(username, password) {
    if ((username === 'admin' || username === 'redazione') && this.checkPassword(password)) {
      this.setSession({ username, role: 'admin', name: 'Amministratore' });
      return true;
    }
    return false;
  },
  logout() {
    this.clearSession();
    Toast.show('Disconnesso con successo', '', 'info');
    setTimeout(() => { window.location.href = getRoot() + 'index.html'; }, 1000);
  }
};

/* ── Toast ── */
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(title, msg = '', type = 'info', duration = 4000) {
    this.init();
    const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <span class="toast-icon">${icons[type]||'ℹ'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    this.container.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, duration);
  }
};

/* ── Page Loader ── */
const Loader = {
  hide() {
    const el = document.getElementById('page-loader');
    if (el) { el.classList.add('hidden'); setTimeout(() => el.remove(), 600); }
  }
};

/* ── Scroll Reveal ── */
const ScrollReveal = {
  observer: null,
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); this.observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));
  }
};

/* ── Navbar ── */
const Navbar = {
  init() {
    const ham = document.querySelector('.hamburger');
    const menu = document.querySelector('.mobile-menu');
    if (ham && menu) {
      ham.addEventListener('click', () => {
        ham.classList.toggle('open');
        menu.classList.toggle('open');
      });
    }
    // Active link
    document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(a => {
      if (a.href === window.location.href || a.href === window.location.href.split('?')[0]) {
        a.classList.add('active');
      }
    });
    // Scroll shadow
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('.navbar');
      if (nav) nav.style.boxShadow = window.scrollY > 10 ? 'var(--shadow-md)' : 'none';
    });
    // Theme toggle
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => { Theme.toggle(); this.updateThemeIcon(); });
    });
    this.updateThemeIcon();
    // Auth state in navbar
    this.updateAuthState();
  },
  updateThemeIcon() {
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.textContent = Theme.get() === 'dark' ? '☀️' : '🌙';
    });
  },
  updateAuthState() {
    const loginLink = document.getElementById('nav-login');
    const logoutBtn = document.getElementById('nav-logout');
    if (Auth.isLoggedIn()) {
      if (loginLink) loginLink.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'flex';
    } else {
      if (loginLink) loginLink.style.display = 'flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
};

/* ── Helpers ── */
function getRoot() {
  const depth = (window.location.pathname.match(/\//g) || []).length;
  if (window.location.pathname.includes('/pages/')) return '../';
  return './';
}

function formatDate(d, locale = 'it-IT') {
  return new Intl.DateTimeFormat(locale, { day:'numeric', month:'long', year:'numeric' }).format(new Date(d));
}
function formatNum(n) { return new Intl.NumberFormat('it-IT').format(n); }
function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function sanitize(str) {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Navbar.init();
  ScrollReveal.init();
  setTimeout(() => Loader.hide(), 600);
});
