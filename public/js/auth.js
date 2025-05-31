// public/js/auth.js
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

if (location.pathname.endsWith("login.html")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { email, password } = e.target;
    const { token, message } = await postJSON("/api/auth/login", {
      email: email.value,
      password: password.value,
    });
    if (token) {
      localStorage.setItem("token", token);
      location.href = "/build.html";
    } else {
      document.getElementById("error").textContent = message || "Error";
    }
  });
}

if (location.pathname.endsWith("register.html")) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const { email, password, username } = e.target; // MODIFIED: Added username
      const { message, userId, error } = await postJSON("/api/auth/register", {
        // MODIFIED: Added userId and error for better feedback
        username: username.value, // MODIFIED: Added username
        email: email.value,
        password: password.value,
      });
      // MODIFIED: Check for userId for success, display error message from server or generic error
      if (userId) {
        // Optionally display success message or just redirect
        alert(message || "Реєстрація успішна!"); // Example success message
        location.href = "/login.html";
      } else {
        document.getElementById("error").textContent =
          error || message || "Помилка реєстрації";
      }
    });
}