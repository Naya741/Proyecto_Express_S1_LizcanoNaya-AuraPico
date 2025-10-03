const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com";   // Cambia esto según tu backend
const CATALOG = `${API_BASE}/api/catalogo`; // <-- usa tu ruta real
const CATEGORY_GENRE_BASE = `${CATALOG}/genre`;

// Lista rápida de géneros habituales (ajústala a tu DB)
const KNOWN_GENRES = [
  "Acción", "Aventura", "Animación", "Comedia", "Crimen",
  "Drama", "Fantasía", "Ciencia ficción", "Suspense", "Misterio",
  "Terror", "Romance", "Familia" , "Música", "Bélica", "Historia", 
  "Western" 
];


// ========================
//  CATÁLOGO GENERAL (Movies, Series, Anime)
// ========================
// Adapta un ítem del catálogo a la UI
function mapCatalogItem(it) {

  // Extrae el año de first_air_date o release_date si year no está
  const yearFromFirst = it?.first_air_date ? String(it.first_air_date).slice(0, 4) : null;
  const yearFromRel = it?.release_date ? String(it.release_date).slice(0, 4) : null;

  // Asegúrate de que los campos coincidan con los que devuelve tu API
  return {
    id: String(it?._id ?? it?.tmdb_id ?? ""),
    name: it?.title ?? "Sin título",
    year: String(it?.year ?? yearFromFirst ?? yearFromRel ?? "N/A"),
    image: it?.poster || "/placeholder.svg?height=200&width=300",
    rating: (typeof it?.vote_average === "number") ? it.vote_average.toFixed(1) : "N/A",
    popularity: (typeof it?.popularity === "number") ? it.popularity : 0,
    // categoria viene como "movie" | "serie" | "anime"
    category: (it?.categoria || "").toLowerCase()
  };
}




// ========================
//  RENDER GENÉRICO DE LISTA A UN SELECTOR
// ========================

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
          <span class="tag">${item.category}</span>
        </div>
      </div>
    </div>
  `).join("");
}




// ========================
//  RANKING GLOBAL (Home) usando /api/catalogo/popular
// ========================

function renderRanking(list, containerSelector = ".movie-container") {
  const movieContainer = document.querySelector(containerSelector);
  if (!movieContainer) return;

  movieContainer.innerHTML = "";

  const top = list.slice(0, 10);
  top.forEach((movie, index) => {
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

// Alternativa: cargar el ranking global usando /api/catalogo/popular y filtrar movies
// Útil si tu endpoint /ranking no está listo o no soporta bien categorías
// (esto carga más datos y filtra en el front, pero es mejor que nada)

// Carga ranking desde tu backend (si no pasas categoria -> mezcla de todo)

async function loadRankingGlobalFromBackend({
  categoria = "",          // "" => TODAS (movie, serie, anime)
  limit = 10,
  containerSelector = ".movie-container",
} = {}) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = `
      <div style="text-align:center;color:#999;padding:1.5rem;">
        Cargando ranking…
      </div>`;
  }

  try {
    // arma la URL sin categoria si no viene
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    params.set("limit", String(limit));
    const url = `${CATALOG}/ranking?${params.toString()}`;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    const docs = Array.isArray(raw) ? raw : (raw.documents || raw.results || []);
    const list = docs.map(mapCatalogItem); // ya viene ordenado por vote_average (backend)

    renderRanking(list, containerSelector);
  } catch (err) {
    console.error("[ranking] no se pudo cargar:", err);
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;color:#e66;padding:1.5rem;">
          No se pudo cargar el ranking.
        </div>`;
    }
  }
}




// ========================
// APARTADO DE RANKING  (Despliege)
// ========================

// ===== RANKING PAGE =====
function renderRankingGrid50(list) {
  const grid = document.querySelector(".ranking-grid-50");
  if (!grid) return;

  if (!Array.isArray(list) || !list.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:#888;padding:1.5rem;">
        No hay resultados para el ranking.
      </div>`;
    return;
  }

  grid.innerHTML = list.map((movie, index) => `
    <div class="ranking-card">
      <div class="ranking-poster">
        <div class="ranking-number">${index + 1}</div>
        <img src="${movie.image}" alt="${movie.name}">
      </div>
      <h3 class="ranking-title">${movie.name}</h3>
      <p class="ranking-meta">★ ${movie.rating ?? "N/A"} • ${movie.year ?? ""}</p>
    </div>
  `).join("");
}

export async function loadRankingPage(limit = 100) {
  const grid = document.querySelector(".ranking-grid-50");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;color:#999;padding:1.5rem;">
      Cargando ranking…
    </div>`;

  try {
    // ranking de TODAS las categorías, ordenado por vote_average (ya lo hace tu backend)
    const res = await fetch(`${CATALOG}/ranking?limit=${limit}`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw  = await res.json();
    const docs = Array.isArray(raw) ? raw : (raw.documents || raw.results || []);
    const list = docs.map(mapCatalogItem); // usa tu adaptador actual

    renderRankingGrid50(list);
  } catch (err) {
    console.error("[ranking-page] error:", err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:#e66;padding:1.5rem;">
        No se pudo cargar el ranking.
      </div>`;
  }
}

// Si quieres cargarlo automáticamente cuando la página Ranking se hace visible:
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("#ranking-page .ranking-grid-50")) {
    loadRankingPage(100);
  }
});








// ========================
//  APARTADO DE POPULARES
// ========================

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

    // Extraemos la lista de documentos (ajusta según tu API)

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

// ================================




// ========================
//  CARGA Y RENDERIZADO GENÉRICO
// ========================

// Función genérica para cargar y renderizar una lista en un selector dado

async function fetchAndRender({ url, selector, limit = 50 }) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;color:#999;padding:1.5rem;">
      Cargando…
    </div>`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();

    const list = (Array.isArray(raw) ? raw : []).map(mapCatalogItem);
    const slice = list.slice(0, limit); // “hasta 50” o lo que haya

    renderListToSelector(slice, selector);
  } catch (err) {
    console.error(`[fetchAndRender] ${url} error:`, err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:#e66;padding:1.5rem;">
        No se pudo cargar esta sección.
      </div>`;
  }
}

// ========================



/* =========================
   CARGADORES POR SECCIÓN
========================= */

// Carga y renderiza el grid de Movies
export function loadMoviesGrid(limit = 100) {
  return fetchAndRender({
    url: `${CATALOG}/movies`,
    selector: ".movies-grid",
    limit
  });
}

// Carga y renderiza el grid de Series
export function loadSeriesGrid(limit = 100) {
  return fetchAndRender({
    url: `${CATALOG}/series`,
    selector: ".series-grid",
    limit
  });
}

// Carga y renderiza el grid de Anime
export function loadAnimeGrid(limit = 100) {
  return fetchAndRender({
    url: `${CATALOG}/animes`,
    selector: ".anime-grid",
    limit
  });
}








// ========================
//  CARGA POR GÉNERO
// ========================

// Carga por género y pinta en .category-grid (hasta limit)
export async function loadCategoryByGenre(genre, limit = 70) {
  const grid = document.querySelector(".category-grid");
  const title = document.querySelector("#category-page .section-header h2");
  if (title) title.textContent = `Category: ${genre}`;
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;color:#999;padding:1.5rem;">
      Cargando "${genre}"…
    </div>`;

  try {
    const url = `${CATEGORY_GENRE_BASE}/${encodeURIComponent(genre)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw  = await res.json();
    const list = (Array.isArray(raw) ? raw : []).map(mapCatalogItem);
    const slice = list.slice(0, limit);

    renderListToSelector(slice, ".category-grid");
  } catch (err) {
    console.error("[category] error:", err);
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:#e66;padding:1.5rem;">
        No se pudo cargar la categoría "${genre}".
      </div>`;
  }
}


// Añade controles de selección de género si no existen

function ensureCategoryControls() {
  const header = document.querySelector("#category-page .section-header");
  if (!header) return;

  // Evita duplicar el select si ya existe
  if (header.querySelector("#category-genre-select")) return;

  const wrap = document.createElement("div");
  wrap.style.marginLeft = "auto";
  wrap.innerHTML = `
    <label style="margin-right:8px;opacity:.8;"> Genre:</label>
    <select id="category-genre-select" class="btn" style="min-width:180px;">
      ${KNOWN_GENRES.map(g => `<option value="${g}">${g}</option>`).join("")}
    </select>
  `;
  header.appendChild(wrap);

  const select = header.querySelector("#category-genre-select");
  select.addEventListener("change", (e) => {
    const genre = e.target.value;
    loadCategoryByGenre(genre, 70);
  });
}



// Carga inicial al abrir Category
// (si la navegación no recarga la página, llama a loadCategoryByGenre desde el manejador de rutas)

document.addEventListener("DOMContentLoaded", () => {
  // Cuando se navegue a Category, prepara el select y carga un género por defecto
  const categoryPage = document.getElementById("category-page");
  if (!categoryPage) return;

  ensureCategoryControls();

  // Género por defecto (cámbialo si prefieres otro)
  const defaultGenre = KNOWN_GENRES[0] || "Acción";
  const select = document.getElementById("category-genre-select");
  if (select) select.value = defaultGenre;

  // Carga inicial
  loadCategoryByGenre(defaultGenre, 70);
});

// Si tu navegación cambia las páginas con clases, puedes enganchar aquí:
window.showCategory = (genre = KNOWN_GENRES[0] || "Acción") => {
  document.querySelectorAll(".page-content").forEach(p => p.classList.remove("active"));
  document.getElementById("category-page")?.classList.add("active");
  ensureCategoryControls();
  const select = document.getElementById("category-genre-select");
  if (select) select.value = genre;
  loadCategoryByGenre(genre, 70);
};




// ========================
// AGREGAR PELICULA (modal)
// ========================
// Aquí podemos añadir la lógica para manejar el formulario de añadir película






// Dispara Popular content sin tocar tu getMovies()
document.addEventListener("DOMContentLoaded", () => {
  
  loadRankingGlobalFromBackend({ limit: 10, containerSelector: ".movie-container" });

  loadPopularContent(20); // puedes cambiar el límite si quieres


  if (document.querySelector(".movies-grid")) loadMoviesGrid(100);
  if (document.querySelector(".series-grid")) loadSeriesGrid(100);
  if (document.querySelector(".anime-grid")) loadAnimeGrid(100);
});
