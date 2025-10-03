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



// ========================
//  NAVEGACIÓN A PÁGINA DE MOVIES DESDE "VIEW ALL"
// ========================

// View All → ir a la página de Movies
document.addEventListener("DOMContentLoaded", () => {
  const viewAllLink = document.querySelector(".popular-section .view-all a");
  if (!viewAllLink) return;

  viewAllLink.addEventListener("click", (e) => {
    e.preventDefault();

    // 1) Si tu app ya tiene navegación centralizada:
    if (typeof window.navigateToPage === "function") {
      window.navigateToPage("movies");
    } else {
      // 2) Fallback simple: mostrar #movies-page y ocultar las demás
      document.querySelectorAll(".page-content").forEach(p => p.classList.remove("active"));
      const moviesPage = document.getElementById("movies-page");
      if (moviesPage) moviesPage.classList.add("active");

      // Marcar el item de navegación como activo (opcional)
      document.querySelectorAll(".nav-item").forEach(a => {
        a.classList.toggle("active", a.dataset.page === "movies");
      });
    }

    // Cerrar sidebar si está abierto (opcional)
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar?.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay?.classList.remove("active");
    }

    // Subir al inicio
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Si tienes una función para cargar el grid de películas, llámala (opcional)
    if (typeof window.loadMoviesPage === "function") {
      window.loadMoviesPage();          // o loadMoviesGrid(50) si la tienes
    }
  });
});

// ========================



// Si tus loaders están en el módulo, expórtalos a window desde el módulo:
  // window.loadMoviesGrid = loadMoviesGrid; window.loadSeriesGrid = loadSeriesGrid; window.loadAnimeGrid = loadAnimeGrid;

  (function () {
    const pages = {
      home:   document.getElementById('home-page'),
      movies: document.getElementById('movies-page'),
      series: document.getElementById('series-page'),
      anime:  document.getElementById('anime-page'),
      ranking: document.getElementById('ranking-page'),
    };

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // Para no recargar muchas veces
    const loaded = { movies:false, series:false, anime:false };

    function showPage(key) {
      // activar sección
      Object.values(pages).forEach(p => p && p.classList.remove('active'));
      if (pages[key]) pages[key].classList.add('active');

      // marcar nav activo
      document.querySelectorAll('.nav-item').forEach(a => {
        a.classList.toggle('active', a.dataset.page === key);
      });

      // cerrar sidebar si estaba abierto
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');

      // scroll top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // cargar grillas al entrar por primera vez
      if (key === 'movies' && !loaded.movies && typeof window.loadMoviesGrid === 'function') {
        loaded.movies = true;
        window.loadMoviesGrid(50);
      }
      if (key === 'series' && !loaded.series && typeof window.loadSeriesGrid === 'function') {
        loaded.series = true;
        window.loadSeriesGrid(50);
      }
      if (key === 'anime' && !loaded.anime && typeof window.loadAnimeGrid === 'function') {
        loaded.anime = true;
        window.loadAnimeGrid(50);
      }
    }

    // clicks del menú lateral
    document.querySelectorAll('.nav-item').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = a.dataset.page;
        if (!target) return;
        showPage(target);
      });
    });

    // "view all" → movies
    const viewAll = document.querySelector('.popular-section .view-all a');
    if (viewAll) {
      viewAll.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('movies');
      });
    }

    // expón por si llamas desde otros scripts
    window.showPage = showPage;
  })();
