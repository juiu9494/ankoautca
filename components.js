/* ============================================================
   ANKOAUTCA — COMPONENTS JS
   Injects shared navbar + footer into every page
   ============================================================ */

const Components = {

  getNavbarHTML(root = './') {
    return `
    <div id="page-loader">
      <div class="loader-logo"><span>A</span>NKOAUTCA</div>
      <div class="loader-bar"><div class="loader-bar-inner"></div></div>
    </div>

    <nav class="navbar">
      <a href="${root}index.html" class="navbar-logo"><span>A</span>NKOAUTCA</a>
      <div class="navbar-links">
        <a href="${root}index.html">Home</a>
        <a href="${root}pages/news.html">News</a>
        <a href="${root}pages/meteo.html">Meteo</a>
        <a href="${root}pages/contact.html">Contatti</a>
        <a href="${root}pages/admin.html" id="nav-admin" style="color:var(--red);font-weight:700;">Admin</a>
      </div>
      <div class="navbar-actions">
        <button class="navbar-icon-btn" data-theme-toggle title="Cambia tema">
          <span data-theme-icon>🌙</span>
        </button>
        <div class="navbar-divider"></div>
        <a href="${root}pages/login.html" class="btn btn-primary btn-sm" id="nav-login">
          Accedi
        </a>
        <button class="btn btn-ghost btn-sm" id="nav-logout" style="display:none" onclick="Auth.logout()">
          Esci
        </button>
      </div>
      <div class="hamburger" id="hamburger">
        <span></span><span></span><span></span>
      </div>
    </nav>

    <div class="mobile-menu" id="mobile-menu">
      <a href="${root}index.html">🏠 Home</a>
      <a href="${root}pages/news.html">📰 News</a>
      <a href="${root}pages/meteo.html">🌤 Meteo</a>
      <a href="${root}pages/contact.html">✉️ Contatti</a>
      <a href="${root}pages/admin.html" style="color:var(--red);">⚙️ Admin</a>
      <div class="divider"></div>
      <a href="${root}pages/login.html" class="btn btn-primary btn-full" style="margin-top:4px">Accedi</a>
    </div>
    <div id="toast-container"></div>`;
  },

  getFooterHTML(root = './') {
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div>
            <div class="footer-logo"><span>A</span>NKOAUTCA</div>
            <p class="footer-desc">Il portale italiano di notizie, attualità e approfondimento. Informazione libera, indipendente e rigorosa. Politica, economia, mondo, sport, cultura, tecnologia.</p>
            <div class="footer-social">
              <a href="#" title="Facebook">f</a>
              <a href="#" title="X">𝕏</a>
              <a href="#" title="Instagram">📷</a>
              <a href="#" title="YouTube">▶</a>
              <a href="#" title="Telegram">✈</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Sezioni</div>
            <div class="footer-col-links">
              <a href="${root}index.html">Home</a>
              <a href="${root}pages/news.html">News & Attualità</a>
              <a href="${root}pages/meteo.html">Meteo</a>
              <a href="${root}pages/contact.html">Contatti</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Area Utente</div>
            <div class="footer-col-links">
              <a href="${root}pages/login.html">Accedi</a>
              <a href="${root}pages/profil.html">Profilo</a>
              <a href="${root}pages/dashboard.html">Dashboard</a>
              <a href="${root}pages/parametres.html">Impostazioni</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Admin</div>
            <div class="footer-col-links">
              <a href="${root}pages/admin.html">Pannello Admin</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
              <a href="${root}pages/404.html">404</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2025 ANKOAUTCA — Tutti i diritti riservati</span>
          <div class="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Cookie</a>
            <a href="#">Note Legali</a>
          </div>
        </div>
      </div>
    </footer>`;
  },

  inject(root = './') {
    const navTarget = document.getElementById('navbar-placeholder');
    const footTarget = document.getElementById('footer-placeholder');
    if (navTarget)  navTarget.outerHTML = this.getNavbarHTML(root);
    if (footTarget) footTarget.outerHTML = this.getFooterHTML(root);
    // Re-init navbar after injection
    if (typeof Navbar !== 'undefined') { Navbar.init(); }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const isInPages = window.location.pathname.includes('/pages/');
  Components.inject(isInPages ? '../' : './');
});
