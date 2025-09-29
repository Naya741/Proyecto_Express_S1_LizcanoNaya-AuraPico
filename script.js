// Global state
let currentPage = "home";
let movies = [];
let currentEditingMovie = null;

// DOM Elements - Declarados sin asignar inicialmente
let sidebar, mainContent, menuToggle, sidebarOverlay;

// Toggle Sidebar Function
function toggleSidebar() {
  console.log("Toggle sidebar called");
  if (sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("sidebar-open");
    sidebarOverlay.classList.toggle("active");
  }
}

// Navigation Function
function navigateToPage(pageId) {
  console.log("Navigating to:", pageId);
  showPage(pageId);
}

function showPage(pageId) {
  console.log("Showing page:", pageId);
  
  // Hide all pages
  document.querySelectorAll(".page-content").forEach((page) => {
    page.classList.remove("active");
  });

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page");
  if (targetPage) {
    targetPage.classList.add("active");
    console.log("Page activated:", pageId + "-page");
  } else {
    console.error("Page not found:", pageId + "-page");
  }

  // Update navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }

  currentPage = pageId;

  // Si es la página de movies, asegurar que las películas se rendericen
  if (pageId === "movies") {
    setTimeout(() => {
      renderMovies();
      console.log("Movies rendered for movies page");
    }, 100);
  }

  // Close sidebar after navigation
  if (sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("active");
  }
}

function showLoginPage() {
  window.location.href = "login.html";
}

function showRegisterPage() {
  window.location.href = "signup.html";
}

function showHomePage() {
  showPage("home");
}

function showAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  if (modal) modal.classList.add("active");
}

function closeAddMovieModal() {
  const modal = document.getElementById("add-movie-modal");
  if (modal) modal.classList.remove("active");
}

function showEditMovieModal(movieData) {
  currentEditingMovie = movieData;
  
  const editNameInput = document.getElementById("edit-movie-name");
  const editDescInput = document.getElementById("edit-movie-description");
  const editCategorySelect = document.getElementById("edit-movie-category");
  const editImageInput = document.getElementById("edit-movie-image");
  const editYearSelect = document.getElementById("edit-movie-year");

  if (editNameInput) editNameInput.value = movieData.name || "";
  if (editDescInput) editDescInput.value = movieData.description || "";
  if (editCategorySelect) editCategorySelect.value = movieData.category || "";
  if (editImageInput) editImageInput.value = movieData.image || "";
  if (editYearSelect) editYearSelect.value = movieData.year || "";

  const modal = document.getElementById("edit-movie-modal");
  if (modal) modal.classList.add("active");
}

function closeEditMovieModal() {
  const modal = document.getElementById("edit-movie-modal");
  if (modal) modal.classList.remove("active");
  currentEditingMovie = null;
}

function deleteMovie() {
  if (currentEditingMovie && confirm("¿Estás seguro de que quieres eliminar esta película?")) {
    movies = movies.filter((movie) => movie.id !== currentEditingMovie.id);
    renderMovies();
    closeEditMovieModal();
  }
}

function addMovie(movieData) {
  const newMovie = { 
    id: Date.now(), 
    ...movieData,
    rating: "8.0" // Rating por defecto
  };
  movies.push(newMovie);
  console.log("Movie added to array:", newMovie);
  
  // Si estamos en la página de movies, renderizar inmediatamente
  if (currentPage === "movies") {
    renderMovies();
  }
  
  // También actualizar cualquier vista que muestre películas
  setTimeout(() => {
    renderMovies();
  }, 100);
}

function renderMovies() {
  const moviesGrid = document.getElementById("movies-grid");
  if (!moviesGrid) {
    console.error("Movies grid element not found");
    return;
  }

  console.log("Rendering movies:", movies.length);

  if (movies.length === 0) {
    moviesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 2rem;">
        <p>No movies added yet. Click "Add Movie" to get started!</p>
      </div>
    `;
    return;
  }

  moviesGrid.innerHTML = movies
    .map(
      (movie) => `
        <div class="content-card" data-id="${movie.id}">
          <div class="content-image">
            <img src="${movie.image || "/placeholder.svg?height=200&width=300"}" alt="${movie.name}" onerror="this.src='/placeholder.svg?height=200&width=300'">
            <button class="play-btn">▶</button>
          </div>
          <div class="content-info">
            <h3>${movie.name}</h3>
            <div class="content-meta">
              <span class="rating">★★ 8.0</span>
              <span>${movie.year}</span>
              <span class="tag">${movie.category}</span>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  // Re-assign listeners to content-cards
  document.querySelectorAll(".content-card").forEach((card) => {
    card.addEventListener("click", () => {
      const movieId = parseInt(card.dataset.id);
      const movie = movies.find((m) => m.id === movieId);
      if (movie) {
        console.log("Opening edit modal for:", movie.name);
        showEditMovieModal(movie);
      }
    });
  });

  console.log("Movies rendered successfully");
}

// Close sidebar when clicking on overlay
function closeSidebarOnOverlay() {
  if (sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("active");
  }
}

// Initialize everything when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Inicializando KarenFlix");

  // AHORA SI asignar los elementos DOM
  sidebar = document.getElementById("sidebar");
  mainContent = document.getElementById("main-content");
  menuToggle = document.getElementById("menu-toggle");
  sidebarOverlay = document.getElementById("sidebar-overlay");

  console.log("Elementos encontrados:", {
    sidebar: !!sidebar,
    mainContent: !!mainContent,
    menuToggle: !!menuToggle,
    sidebarOverlay: !!sidebarOverlay
  });

  // Menu toggle - Multiple ways to ensure it works
  if (menuToggle) {
    menuToggle.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });
    console.log("Menu toggle event listener attached");
  } else {
    console.error("Menu toggle element not found");
  }

  // Sidebar overlay click
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeSidebarOnOverlay();
    });
    console.log("Sidebar overlay event listener attached");
  }

  // Navigation items
  const navItems = document.querySelectorAll(".nav-item[data-page]");
  console.log("Navigation items found:", navItems.length);
  
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const pageId = item.getAttribute("data-page");
      console.log("Navigation clicked:", pageId);
      showPage(pageId);
    });
  });

  // Close modals when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Add movie form submission
  const addMovieForm = document.querySelector("#add-movie-modal .modal-form");
  if (addMovieForm) {
    addMovieForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const titleInput = e.target.querySelector('input[placeholder="write the title..."]');
      const descriptionInput = e.target.querySelector("textarea");
      const categorySelect = e.target.querySelector("select");
      const imageInput = e.target.querySelector('input[placeholder="Image URL..."]');
      const yearSelect = e.target.querySelectorAll("select")[1];

      const movieData = {
        name: titleInput ? titleInput.value : "",
        description: descriptionInput ? descriptionInput.value : "",
        category: categorySelect ? categorySelect.value : "",
        image: imageInput ? imageInput.value : "",
        year: yearSelect ? yearSelect.value : "",
      };

      if (movieData.name && movieData.category && movieData.year && 
          movieData.category !== "set the category" && movieData.year !== "select the year...") {
        addMovie(movieData);
        closeAddMovieModal();
        e.target.reset();
        console.log("Movie added:", movieData.name);
      } else {
        alert("Por favor completa todos los campos obligatorios");
      }
    });
    console.log("Add movie form listener attached");
  }

  // Edit movie form submission
  const editMovieForm = document.querySelector("#edit-movie-modal .modal-form");
  if (editMovieForm) {
    editMovieForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (currentEditingMovie) {
        const nameInput = document.getElementById("edit-movie-name");
        const descInput = document.getElementById("edit-movie-description");
        const categoryInput = document.getElementById("edit-movie-category");
        const imageInput = document.getElementById("edit-movie-image");
        const yearInput = document.getElementById("edit-movie-year");

        const updatedMovie = {
          ...currentEditingMovie,
          name: nameInput ? nameInput.value : currentEditingMovie.name,
          description: descInput ? descInput.value : currentEditingMovie.description,
          category: categoryInput ? categoryInput.value : currentEditingMovie.category,
          image: imageInput ? imageInput.value : currentEditingMovie.image,
          year: yearInput ? yearInput.value : currentEditingMovie.year,
        };

        const index = movies.findIndex((m) => m.id === currentEditingMovie.id);
        if (index !== -1) {
          movies[index] = updatedMovie;
          renderMovies();
          console.log("Movie updated:", updatedMovie.name);
        }
        closeEditMovieModal();
      }
    });
    console.log("Edit movie form listener attached");
  }

  // Initialize with sample movies
  movies = [
    {
      id: 1,
      name: "Memorias de un Caracol",
      description: "Una película que te robará el corazón",
      category: "Drama",
      year: "2023",
      image: "memorias-de-un-caracol-movie-poster.jpg",
    },
    {
      id: 2,
      name: "Flow",
      description: "An animated adventure",
      category: "Animation",
      year: "2024",
      image: "flow-movie-poster.jpg",
    },
    {
      id: 3,
      name: "Better Man",
      description: "A biographical story",
      category: "Biography",
      year: "2024",
      image: "better-man-movie-poster.jpg",
    },
  ];

  renderMovies();
  console.log("KarenFlix initialized successfully!");
});

// Smooth scrolling for anchor links - CORREGIDO: mover dentro de DOMContentLoaded
window.addEventListener("load", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

// Responsive sidebar handling
window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && sidebar && mainContent && sidebarOverlay) {
    sidebar.classList.remove("active");
    mainContent.classList.remove("sidebar-open");
    sidebarOverlay.classList.remove("active");
  }
});