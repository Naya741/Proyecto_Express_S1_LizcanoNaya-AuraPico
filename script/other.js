// --- Hook mínimo para evitar fallos por onclick inline y por orden de carga ---
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const nav = document.querySelector('.sidebar-nav');
  const menuToggle = document.getElementById('menu-toggle');

  // Páginas conocidas (añade si tienes más)
  const pages = {
    home: document.getElementById('home-page'),
    movies: document.getElementById('movies-page'),
    series: document.getElementById('series-page'),
    anime: document.getElementById('anime-page'),
    ranking: document.getElementById('ranking-page'),
    profile: document.getElementById('profile-page'),
    settings: document.getElementById('settings-page'),
    category: document.getElementById('category-page'),
  };

  const setActiveNav = (page) => {
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  };

  const navigateToPage = (page) => {
    Object.entries(pages).forEach(([name, el]) => {
      if (!el) return;
      if (name === page) {
        el.style.display = '';
        el.classList.add('active');
      } else {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    });
    setActiveNav(page);
  };

  const toggleSidebar = () => {
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };

  const showAddMovieModal = () => {
    // Implementa tu modal real aquí si ya lo tienes
    // Este fallback evita que un onclick roto tumbe todo
    alert('showAddMovieModal()');
  };

  // Listeners seguros (sin onclick en HTML)
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  if (nav) {
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-item');
      if (!link) return;
      e.preventDefault();
      const page = link.dataset.page;
      if (page && pages[page]) {
        navigateToPage(page);
        // cerrar sidebar al navegar (opcional)
        if (sidebar?.classList.contains('open')) toggleSidebar();
      }
    });
  }

  const addBtn = document.getElementById('add-movie-btn');
  if (addBtn) addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showAddMovieModal();
  });

  // Estado inicial
  navigateToPage('home');

  // Exponer por compatibilidad si quedara algún onclick suelto
  window.toggleSidebar = toggleSidebar;
  window.navigateToPage = navigateToPage;
  window.showAddMovieModal = showAddMovieModal;
});
// --- fin del hook mínimo ---


