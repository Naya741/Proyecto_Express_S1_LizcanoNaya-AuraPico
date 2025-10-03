// script/login.js
const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    if (!email || !password) {
      alert("Please fill in email and password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",          // <--- IMPORTANTE para cookie
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Login failed (${res.status}) ${t}`);
      }

      // Opcional: muestra mensaje
      // alert("Logged in!");

      // Redirige al home
      window.location.href = "../index.html";
    } catch (err) {
      console.error("[login] error:", err);
      alert("Login failed. Check your credentials.");
    }
  });
});
