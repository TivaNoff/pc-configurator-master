// public/js/saved.js
const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";
const container = document.getElementById("savedList");

async function loadConfigs() {
  const res = await fetch("/api/configs", {
    headers: { Authorization: "Bearer " + token },
  });
  return res.ok ? res.json() : [];
}
function renderConfigs(cfgs) {
  container.innerHTML = cfgs
    .map(
      (c) => `
    <div class="saved-item" data-id="${c._id}">
      <span class="si-name">${c.name}</span> —
      <span class="si-price">${c.totalPrice} ₴</span>
      <button class="si-load">Load</button>
      <button class="si-delete">Delete</button>
    </div>
  `
    )
    .join("");
  container.querySelectorAll(".si-delete").forEach((btn) => {
    btn.onclick = async (e) => {
      const id = e.target.closest(".saved-item").dataset.id;
      const d = await fetch(`/api/configs/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      if (d.ok) loadAndRender();
      else alert("Не вдалося видалити");
    };
  });
  container.querySelectorAll(".si-load").forEach((btn) => {
    btn.onclick = (e) => {
      const id = e.target.closest(".saved-item").dataset.id;
      location.href = `/build.html?config=${id}`;
    };
  });
}

async function loadAndRender() {
  container.textContent = "Завантаження…";
  const cfgs = await loadConfigs();
  renderConfigs(cfgs);
}
loadAndRender();
