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





// Global state
let currentPage = "home";
let movies = [];
let currentEditingMovie = null;
const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com";   // Cambia esto según tu backend

// DOM Elements - Declarados sin asignar inicialmente
let sidebar, mainContent, menuToggle, sidebarOverlay;

/* ===========================
   API - Obtenemos las películas desde backend
   =========================== */

async function fetchMoviesFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/api/movies`, {
      // Si algún día necesitas cookies/headers, agrégalos aquí
      // credentials: "include"
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text}`);
    }

    const data = await res.json();

    if (data.results) {
      movies = data.results.map(movie => ({
        id: movie.id,
        name: movie.title,
        description: movie.overview,
        category: movie.genre_ids?.length ? movie.genre_ids[0] : "Sin categoría",
        year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=200&width=300",
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
      }));
      console.log("Películas obtenidas desde la API:", movies);
      renderMovies();
    } else {
      console.warn("La API no devolvió resultados válidos:", data);
    }
  } catch (err) {
    console.error("Error al obtener películas desde el backend:", err);
    // Feedback visual mínimo si falla
    const moviesGrid = document.getElementById("movies-grid");
    if (moviesGrid) {
      moviesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #f55; padding: 2rem;">
          <p>No se pudo cargar el catálogo. Revisa que el backend esté en <code>${API_BASE}</code>.</p>
        </div>
      `;
    }
  }
}



// --- Función para obtener las películas desde el backend ---
async function getMovies() {
  try {
    const response = await fetch("http://localhost:1100/api/movies");
    const data = await response.json();

    console.log(data); // ver toda la respuesta en consola


    // Selecciona el contenedor principal de películas
    const movieContainer = document.querySelector(".movie-container");
    movieContainer.innerHTML = ""; // limpiamos antes de inyectar

    // Solo tomamos las primeras 10 películas
    const topMovies = data.results.slice(0, 10);

    // data.results -> contiene el array de películas populares
    topMovies.forEach((movie, index) => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");

      movieCard.innerHTML = `
        <div class="movie-poster">
          <div class="movie-number">${index + 1}</div>
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
               alt="${movie.title}" />
        </div>
        <h3>${movie.title}</h3>
        <p><strong>Rating:</strong> ⭐ ${movie.vote_average.toFixed(1)}</p>
      `;

      // Se agrega cada película al contenedor
      movieContainer.appendChild(movieCard);
    });

  } catch (error) {
    console.error("Error al obtener películas:", error);
  }
}

// --- Llamada inicial ---
document.addEventListener("DOMContentLoaded", getMovies);





/* ===========================
    Sidebar - Abrir/Cerrar 
   =========================== */
function toggleSidebar() {
  if (sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("sidebar-open");
    sidebarOverlay.classList.toggle("active");
  }
}

// Cerrar sidebar al hacer click en overlay
function closeSidebarOnOverlay() {
  if (sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("active");
  }
}



/* ===========================
   Navegación - Mostrar página
   =========================== */
function navigateToPage(pageId) {
  showPage(pageId);
}

function showPage(pageId) {

  // Ocultar todas
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.remove("active");
  });


  
  // Mostrar seleccionada
  const targetPage = document.getElementById(pageId + "-page");
  if (targetPage) {
    targetPage.classList.add("active");
  }


  // Actualizar navegación
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
  if (activeNavItem) activeNavItem.classList.add("active");

  currentPage = pageId;



  // Si es movies, asegurar renderizado
  if (pageId === "movies") {
    setTimeout(() => {
      renderMovies();
    }, 100);
  }

  // Cerrar sidebar
  closeSidebarOnOverlay();
}




/* ===========================
   Modales de películas osea Add/Edit
   =========================== */

// Mostrar modal de añadir película
function showAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  if (modal) modal.classList.add("active");
}

// Cerrar modal de añadir película
function closeAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  if (modal) modal.classList.remove("active");
}


// Mostrar modal de editar película
function showEditMovieModal(movieData) {
  currentEditingMovie = movieData;

  document.getElementById("edit-movie-name").value = movieData.name || ""; // Asegurarse de que no sea undefined
  document.getElementById("edit-movie-description").value = movieData.description || ""; // Asegurarse de que no sea undefined
  document.getElementById("edit-movie-category").value = movieData.category || ""; // Asegurarse de que no sea undefined
  document.getElementById("edit-movie-image").value = movieData.image || ""; // Asegurarse de que no sea undefined
  document.getElementById("edit-movie-year").value = movieData.year || ""; // Asegurarse de que no sea undefined

  const modal = document.getElementById("edit-movie-modal");
  if (modal) modal.classList.add("active");
}

// Cerrar modal de editar película
function closeEditMovieModal() {
  const modal = document.getElementById("edit-movie-modal");
  if (modal) modal.classList.remove("active");
  currentEditingMovie = null;
}





/* ===========================
   CRUD de Películas
   =========================== */

// Guardar cambios de edición para eliminar peli
function deleteMovie() {
  if (currentEditingMovie && confirm("¿Estás seguro de que quieres eliminar esta película?")) {
    movies = movies.filter((movie) => movie.id !== currentEditingMovie.id);
    renderMovies();
    closeEditMovieModal();
  }
}


// Guardar cambios de edición o agregar nueva peli
function addMovie(movieData) {
  const newMovie = {
    id: Date.now(),
    ...movieData,
    rating: "8.0"
  };
  movies.push(newMovie);
  if (currentPage === "movies") renderMovies();
}


// Guardar cambios de edición
function renderMovies() {
  const moviesGrid = document.getElementById("movies-grid");
  if (!moviesGrid) return;

  if (movies.length === 0) {
    moviesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 2rem;">
        <p>No hay películas para mostrar.</p>
      </div>
    `;
    return;
  }

  // Renderizar tarjetas de películas
  moviesGrid.innerHTML = movies.map(movie => `
    <div class="content-card" data-id="${movie.id}">
      <div class="content-image">
        <img src="${movie.image}" alt="${movie.name}" onerror="this.src='/placeholder.svg?height=200&width=300'">
        <button class="play-btn">▶</button>
      </div>
      <div class="content-info">
        <h3>${movie.name}</h3>
        <div class="content-meta">
          <span class="rating">★ ${movie.rating || "N/A"}</span>
          <span>${movie.year}</span>
          <span class="tag">${movie.category}</span>
        </div>
      </div>
    </div>
  `).join("");

  // Añadir event listeners para editar al hacer click en la tarjeta
  document.querySelectorAll(".content-card").forEach((card) => {
    card.addEventListener("click", () => {
      const movieId = parseInt(card.dataset.id);
      const movie = movies.find((m) => m.id === movieId);
      if (movie) showEditMovieModal(movie);
    });
  });
}




/* ===========================
   Init App - inicialización del DOM
   =========================== */

// Esperar a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  sidebar = document.getElementById("sidebar");
  mainContent = document.getElementById("main-content");
  menuToggle = document.getElementById("menu-toggle");
  sidebarOverlay = document.getElementById("sidebar-overlay");

  // Sidebar osea menú
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }

  // Cerrar sidebar al hacer click en overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", (e) => {
      e.preventDefault();
      closeSidebarOnOverlay();
    });
  }


  // Nav osea navegación para cambiar de página
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = item.getAttribute("data-page");
      showPage(pageId);
    });
  });

  // Cerrar modal al hacer click fuera
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  });


  /* ===========================
     Cargar películas desde API
     =========================== */
  fetchMoviesFromAPI();
});
