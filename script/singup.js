// script/signup.js
const API_BASE = "https://proyecto-express-s1-picoaura-lizcanonaya.onrender.com";


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in name, email and password");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // si queremos mandar rol explícito: body: JSON.stringify({ username: name, email, password, role }),
        body: JSON.stringify({ username: name, email, password }),
      });

      const payload = await res.json().catch(() => ({}));
      console.log("[signup] status:", res.status, "payload:", payload);

      if (res.status === 409) {
        alert("This email is already registered.");
        return;
      }
      if (!res.ok) {
        throw new Error(`Register failed (${res.status})`);
      }

      alert("Account created! You can now log in.");
      window.location.href = "./login.html";
    } catch (err) {
      console.error("[signup] error:", err);
      alert("Register failed. Try again later.");
    }
  });
});
