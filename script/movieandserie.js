const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com";   // Cambia esto según tu backend
const CATALOG  = `${API_BASE}/api/catalogo`; // <-- usa tu ruta real


// Adapta un ítem del catálogo a la UI
function mapCatalogItem(it) {
  const yearFromFirst = it?.first_air_date ? String(it.first_air_date).slice(0, 4) : null;
  const yearFromRel   = it?.release_date ? String(it.release_date).slice(0, 4) : null;
  const categoria = (it?.categoria || "").toLowerCase();

  return {
    id: String(it?._id ?? it?.tmdb_id ?? ""),
    name: it?.title ?? "Sin título",
    year: String(it?.year ?? yearFromFirst ?? yearFromRel ?? "N/A"),
    image: it?.poster || "/placeholder.svg?height=200&width=300",
    rating: (typeof it?.vote_average === "number") ? it.vote_average.toFixed(1) : "N/A",
    popularity: (typeof it?.popularity === "number") ? it.popularity : 0,
    category: categoria
  };
}


// Ítems del fallback TMDB popular (/api/movies) 
// (lo dejo igual por si lo usas en otra parte; Popular content YA NO lo usa)
function mapTMDBItem(m) {
  return {
    id: String(m?.id ?? ""),
    name: m?.title ?? m?.name ?? "Sin título",
    year: m?.release_date ? String(m.release_date).slice(0, 4) : "N/A",
    image: m?.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : "/placeholder.svg?height=200&width=300",
    rating: (typeof m?.vote_average === "number") ? m.vote_average.toFixed(1) : "N/A",
    popularity: (typeof m?.popularity === "number") ? m.popularity : 0,
    category: "peliculas"
  };
}



// Render genérico a un selector
function renderListToSelector(list, selector) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  if (!Array.isArray(list) || !list.length) {
    grid.innerHTML = `
      <div style="grid-column:1 / -1; text-align:center; color:#888; padding:2rem;">
        <p>No hay elementos para mostrar.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(item => `
    <div class="content-card" data-id="${item.id}">
      <div class="content-image">
        <img src="${item.image}" alt="${item.name}"
             onerror="this.src='/placeholder.svg?height=200&width=300'">
        <button class="play-btn">▶</button>
      </div>
      <div class="content-info">
        <h3>${item.name}</h3>
        <div class="content-meta">
          <span class="rating">★ ${item.rating || "N/A"}</span>
          <span>${item.year}</span>
          <span class="tag">películas</span>
        </div>
      </div>
    </div>
  `).join("");
}




// ========================
//  APARTADO DE INSERTAR PELÍCULAS Y CATALOGO INCIIAL DE INDEX 
// ========================


// Renderizar top 10 películas en la página de inicio (home) 
function renderTop10() {
  const movieContainer = document.querySelector(".movie-container");

  if (!movieContainer) return;

  movieContainer.innerHTML = "";
  const topMovies = movies.slice(0, 10);

  topMovies.forEach((movie, index) => {
    const card = document.createElement("div");
    card.classList.add("movie-card");
    card.innerHTML = `
      <div class="movie-poster">
        <div class="movie-number">${index + 1}</div>
        <img src="${movie.image}" alt="${movie.name}">
      </div>
      <h3>${movie.name}</h3>
      <p><strong>Rating:</strong> ★ ${movie.rating ?? "N/A"}</p>
    `;
    movieContainer.appendChild(card);
  });
}




// --- Función para obtener las películas desde el backend ---
async function getMovies() {
  try {
    const response = await fetch(`${API_BASE}/api/movies`);
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




// ---- Popular content usando SOLO tu endpoint /api/catalogo/popular ----
async function loadPopularContent(limit = 20) {
  const grid = document.querySelector(".popular-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;color:#999;padding:1.5rem;">
      Cargando populares…
    </div>`;

  try {
    // Llamamos directamente a tu endpoint. Puedes añadir ?page=2 si soportas paginación
    const url = `${CATALOG}/popular?categoria=movie&limit=${limit}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    const docs = Array.isArray(raw) ? raw
               : (raw.documents || raw.results || raw.items || []);
    let list = docs.map(mapCatalogItem);

    // (opcional) ordenar por popularidad si el backend ya lo hace no es necesario
    list = list
      .filter(item => Number.isFinite(item.popularity))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    if (!list.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;color:#888;padding:1.5rem;">
          No hay elementos populares para mostrar.
        </div>`;
      return;
    }

    renderListToSelector(list, ".popular-grid");

  } catch (err) {
    console.error("Popular content error:", err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:#e66;padding:1.5rem;">
        No se pudo cargar los populares.
      </div>`;
  }
}



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







// --- Llamada inicial ---
document.addEventListener("DOMContentLoaded", getMovies);

// Dispara Popular content sin tocar tu getMovies()
document.addEventListener("DOMContentLoaded", () => {
  loadPopularContent(20); // puedes cambiar el límite si quieres
});
