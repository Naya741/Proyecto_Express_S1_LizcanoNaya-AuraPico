// Global state
let currentPage = "home";
let movies = [];
let currentEditingMovie = null;

// DOM Elements - Declarados sin asignar inicialmente
let sidebar, mainContent, menuToggle, sidebarOverlay;

/* ===========================
   API - Obtenemos las películas desde backend
   =========================== */
async function fetchMoviesFromAPI() {
  try {
    const res = await fetch("/api/movies"); // nuestro backend hace el proxy a TMDB
    const data = await res.json();

    if (data.results) {
      movies = data.results.map(movie => ({
        id: movie.id,
        name: movie.title,
        description: movie.overview,
        category: movie.genre_ids && movie.genre_ids.length > 0 ? movie.genre_ids[0] : "Sin categoría",
        year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=200&width=300",
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"
      }));

      console.log("Películas obtenidas desde la API:", movies);
      renderMovies();
    } else {
      console.warn("La API no devolvió resultados");
    }
  } catch (err) {
    console.error("Error al obtener películas desde el backend:", err);
  }
}

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
