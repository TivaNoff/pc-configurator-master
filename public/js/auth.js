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
      const { email, password } = e.target;
      const { message } = await postJSON("/api/auth/register", {
        email: email.value,
        password: password.value,
      });
      if (message) location.href = "/login.html";
      else document.getElementById("error").textContent = "Error";
    });
}
