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
    const confirm = document.getElementById("confirm-password")?.value.trim();

    if (!name || !email || !password || !confirm) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match");
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
        body: JSON.stringify({ username: name, email, password }),
      });

      if (res.status === 409) {
        alert("This email is already registered.");
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Register failed (${res.status}) ${t}`);
      }

      alert("Account created! You can now log in.");
      window.location.href = "./login.html";
    } catch (err) {
      console.error("[signup] error:", err);
      alert("Register failed. Try again later.");
    }
  });
});
