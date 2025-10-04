// /script/search.js
const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com/api/catalogo";

function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Crea (o reutiliza) el panel de resultados
function ensureSearchPanel() {
  let panel = document.getElementById("kf-search-panel");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "kf-search-panel";
  panel.innerHTML = `<div class="kf-search-empty">Empieza a escribir para buscar…</div>`;
  document.body.appendChild(panel);
  return panel;
}

// Mapea item del backend -> UI simple
function mapItem(d) {
  return {
    tmdb_id: d.tmdb_id,
    categoria: d.categoria,
    title: d.title || d.original_title || "Sin título",
    year: d.year || (d.release_date ? String(d.release_date).slice(0, 4) : ""),
    poster: d.poster || d.backdrop || "",
    rating: d.vote_average ?? null,
  };
}

function renderResults(items) {
  const panel = ensureSearchPanel();
  if (!Array.isArray(items) || !items.length) {
    panel.innerHTML = `<div class="kf-search-empty">Sin resultados</div>`;
    panel.classList.add("open");
    return;
  }

  const html = items
    .map(mapItem)
    .map(
      (m) => `
      <div class="kf-search-row" data-tmdb="${m.tmdb_id}">
        <img src="${m.poster}" alt="${m.title}" class="kf-search-poster" />
        <div class="kf-search-meta">
          <div class="kf-search-title">${m.title}</div>
          <div class="kf-search-sub">${m.categoria || ""}${
        m.year ? " • " + m.year : ""
      }${m.rating ? " • ★ " + m.rating : ""}</div>
        </div>
      </div>`
    )
    .join("");

  panel.innerHTML = html;
  panel.classList.add("open");

  // Si quieres hacer algo al click del resultado:
  panel.querySelectorAll(".kf-search-row").forEach((row) => {
    row.addEventListener("click", () => {
      const tmdb = row.dataset.tmdb;
      console.log("click result tmdb_id:", tmdb);
      // Aquí podrías abrir detalle, navegar, etc.
      // panel.classList.remove("open");
    });
  });
}

async function doSearch(q) {
  const panel = ensureSearchPanel();

  if (!q || q.length < 2) {
    panel.innerHTML = `<div class="kf-search-empty">Empieza a escribir para buscar…</div>`;
    panel.classList.remove("open");
    return;
  }

  try {
    panel.innerHTML = `<div class="kf-search-empty">Buscando…</div>`;
    panel.classList.add("open");

    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    console.error("[search] error:", err);
    panel.innerHTML = `<div class="kf-search-error">No se pudo buscar</div>`;
    panel.classList.add("open");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".search-input");
  if (!input) return;

  const debounced = debounce((v) => doSearch(v.trim()), 400);

  // Posiciona el panel cerca del input
  const placePanel = () => {
    const panel = ensureSearchPanel();
    const r = input.getBoundingClientRect();
    panel.style.top = `${window.scrollY + r.bottom + 8}px`;
    panel.style.left = `${window.scrollX + r.left}px`;
    panel.style.width = `${r.width}px`;
  };

  // Eventos
  input.addEventListener("input", (e) => {
    placePanel();
    debounced(e.target.value);
  });

  input.addEventListener("focus", () => {
    placePanel();
    const val = input.value.trim();
    if (val.length >= 2) doSearch(val);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      placePanel();
      doSearch(input.value.trim());
    } else if (e.key === "Escape") {
      ensureSearchPanel().classList.remove("open");
    }
  });

  // Cerrar si haces click fuera
  document.addEventListener("click", (e) => {
    const panel = ensureSearchPanel();
    const isInside = panel.contains(e.target) || input.contains(e.target);
    if (!isInside) panel.classList.remove("open");
  });

  // Reposicionar en resize/scroll
  window.addEventListener("resize", placePanel, { passive: true });
  window.addEventListener("scroll", placePanel, { passive: true });
});
