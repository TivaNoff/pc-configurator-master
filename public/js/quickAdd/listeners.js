import {
  applyFiltersAndRender,
  initFilters,
  getFilteredProducts,
  setAllProducts,
  setCurrentCategory,
} from "./filters.js";
import { fetchProductsByCategory } from "../components.js";
import {
  renderProductsPage,
  setCurrentPage,
  setPageSize,
  setCurrentCategory as setFlowCategory,
} from "./productFlow.js";

function showProductDetails(product) {
  const s = product.specs || {};
  const title =
    product.specs?.metadata?.name ||
    [s.manufacturer, s.series, s.model].filter(Boolean).join(" ") ||
    product.opendb_id;
  const imgUrl = product?.storeImg?.Ekua || "/img/placeholder.png";

  // Список ключей, которые надо исключить на любом уровне вложенности
  const EXCLUDE_KEYS = new Set(["opendb_id", "general_product_information"]);

  // Функция форматирования значения: для объектов - рекурсивный вывод, для примитивов - строка
  function renderSpecs(obj) {
    if (!obj || typeof obj !== "object") return "";

    return Object.entries(obj)
      .filter(([key, value]) => !EXCLUDE_KEYS.has(key) && value != null)
      .map(([key, value]) => {
        if (typeof value === "object") {
          // Рекурсивно рендерим вложенный объект
          return `
            <li><strong>${key}:</strong>
              <ul>
                ${renderSpecs(value)}
              </ul>
            </li>
          `;
        } else {
          return `<li><strong>${key}:</strong> ${String(value)}</li>`;
        }
      })
      .join("");
  }

  const specsList = renderSpecs(s);

  const detailOverlay = document.createElement("div");
  detailOverlay.classList.add("detail-overlay");
  detailOverlay.id = "detailOverlay";

  const detailModal = document.createElement("div");
  detailModal.classList.add("modal", "detail-modal");

  detailModal.innerHTML = `
    <button class="modal-close" id="closeDetail">✕</button>
    <h3>${title}</h3>
    <img src="${imgUrl}" alt="${title}" class="detail-overlay-img" />
    <ul>${specsList}</ul>
  `;

  detailOverlay.appendChild(detailModal);
  document.body.appendChild(detailOverlay);

  // Закрытие модалки
  detailModal
    .querySelector("#closeDetail")
    .addEventListener("click", () => detailOverlay.remove());
  detailOverlay.addEventListener("click", (e) => {
    if (e.target === detailOverlay) detailOverlay.remove();
  });
}

export function setupListeners() {
  const overlay = document.getElementById("quickAddOverlay");
  const grid = document.getElementById("productsGrid");
  const compOnly = document.getElementById("compatibilityOnly");
  const only3d = document.getElementById("only3d");
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceMinVal = document.getElementById("priceMinVal");
  const priceMaxVal = document.getElementById("priceMaxVal");
  const rowsPerPageSel = document.getElementById("rowsPerPage");
  const closeBtn = document.getElementById("closeQuickAdd");
  const searchInput = document.getElementById("component-search");
  const sortBySelect = document.getElementById("sortBySelect");

  document.body.addEventListener("click", async (e) => {
    if (e.target.matches(".add-btn")) {
      const cat = e.target.closest(".part-category").dataset.cat;
      overlay.classList.add("active");

      setCurrentCategory(cat);
      setFlowCategory(cat);

      const data = await fetchProductsByCategory(cat);
      setAllProducts(data);
      initFilters();
      applyFiltersAndRender();
    }
  });

  [compOnly, only3d, searchInput].forEach((el) =>
    el.addEventListener("input", applyFiltersAndRender)
  );

  priceMin.addEventListener("input", () => {
    if (+priceMin.value > +priceMax.value) priceMin.value = priceMax.value;
    priceMinVal.textContent = `$${priceMin.value}`;
    applyFiltersAndRender();
  });

  priceMax.addEventListener("input", () => {
    if (+priceMax.value < +priceMin.value) priceMax.value = priceMin.value;
    priceMaxVal.textContent = `$${priceMax.value}`;
    applyFiltersAndRender();
  });

  rowsPerPageSel.addEventListener("change", () => {
    setPageSize(parseInt(rowsPerPageSel.value, 10));
    setCurrentPage(1);
    renderProductsPage(getFilteredProducts());
  });

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    initFilters();
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;
    const product = getFilteredProducts().find((p) => p.opendb_id === id);
    if (!product) return;

    if (e.target.matches(".add-to-build")) {
      window.dispatchEvent(
        new CustomEvent("add-component", {
          detail: { category: product.category || "", product },
        })
      );
      window.dispatchEvent(new Event("buildUpdated"));
      overlay.classList.remove("active");
    } else {
      showProductDetails(product);
    }
  });

  sortBySelect.addEventListener("change", () => {
    applyFiltersAndRender(); // Повторно применить фильтры и отсортировать
  });
}
