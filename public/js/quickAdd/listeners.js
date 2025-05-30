// public/js/quickAdd/listeners.js
import {
  applyFiltersAndRender,
  initFilters,
  getFilteredProducts,
  setAllProducts,
  setCurrentCategory as setFilterCategory,
} from "./filters.js";
import { fetchProductsByCategory } from "../components.js";
import {
  renderProductsPage,
  setCurrentPage,
  setPageSize,
  setCurrentCategory as setFlowCategory,
} from "./productFlow.js";
import { debounce } from "./helpers.js";

/**
 * Shows product details in a modal overlay.
 * @param {object} product - The product object.
 */
function showProductDetails(product) {
  const s = product.specs || {};
  const title =
    product.specs?.metadata?.name ||
    [s.manufacturer, s.series, s.model].filter(Boolean).join(" ") ||
    product.opendb_id;
  const imgUrl = product?.storeImg?.Ekua || "/img/placeholder.png";

  const EXCLUDE_KEYS = new Set([
    "opendb_id",
    "general_product_information",
    "metadata",
    "compatible",
    "supports3D",
    "manufacturer",
    "series",
    "model",
  ]);

  function renderSpecs(obj, level = 0) {
    if (!obj || typeof obj !== "object") return "";

    return Object.entries(obj)
      .filter(
        ([key, value]) =>
          !EXCLUDE_KEYS.has(key) &&
          value != null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
      .map(([key, value]) => {
        const displayKey = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        if (typeof value === "object" && !Array.isArray(value)) {
          const nestedSpecs = renderSpecs(value, level + 1);
          return nestedSpecs
            ? `<li><strong>${displayKey}:</strong><ul>${nestedSpecs}</ul></li>`
            : "";
        } else if (Array.isArray(value)) {
          return `<li><strong>${displayKey}:</strong> ${value.join(", ")}</li>`;
        } else if (typeof value === "boolean") {
          return `<li><strong>${displayKey}:</strong> ${
            value ? "Yes" : "No"
          }</li>`;
        } else {
          return `<li><strong>${displayKey}:</strong> ${String(value)}</li>`;
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
    <button class="modal-close" id="closeDetailModal">✕</button>
    <h3 class="detail-title">${title}</h3>
    <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start;">
        <div style="flex: 1; min-width: 200px; text-align: center;">
            <img src="${imgUrl}" alt="${title}" class="detail-overlay-img" onerror="this.src='/img/placeholder.png'" />
        </div>
        <div style="flex: 2; min-width: 300px;">
            <h4>Характеристики:</h4>
            <ul class="detail-specs">${
              specsList || "Додаткові характеристики відсутні."
            }</ul>
        </div>
    </div>
  `;

  detailOverlay.appendChild(detailModal);
  document.body.appendChild(detailOverlay);
  document.body.style.overflow = "hidden"; // Prevent background scroll when detail modal is open

  const closeDetailButton = detailModal.querySelector("#closeDetailModal");
  if (closeDetailButton) {
    closeDetailButton.addEventListener("click", () => {
      detailOverlay.remove();
      document.body.style.overflow = ""; // Restore background scroll
    });
  }
  detailOverlay.addEventListener("click", (e) => {
    if (e.target === detailOverlay) {
      detailOverlay.remove();
      document.body.style.overflow = ""; // Restore background scroll
    }
  });
}

/**
 * Sets up all event listeners for the Quick Add functionality.
 */
export function setupListeners() {
  const overlay = document.getElementById("quickAddOverlay");
  const quickAddLoader = document.getElementById("quickAddLoader"); // Get loader
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

  const debouncedApplyFiltersAndRender = debounce(applyFiltersAndRender, 300);

  document.body.addEventListener("click", async (e) => {
    if (e.target.matches(".add-btn")) {
      const catElement = e.target.closest(".part-category");
      if (!catElement) return;
      const cat = catElement.dataset.cat;

      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      if (quickAddLoader) quickAddLoader.style.display = "flex"; // Show loader
      if (grid) grid.innerHTML = ""; // Clear previous products

      setFilterCategory(cat);
      setFlowCategory(cat);

      try {
        const data = await fetchProductsByCategory(cat);
        setAllProducts(data);
        initFilters();
        applyFiltersAndRender();
      } catch (error) {
        console.error("Помилка завантаження або обробки продуктів:", error);
        if (grid)
          grid.innerHTML =
            '<p style="color: var(--fg); text-align: center; padding: 20px;">Не вдалося завантажити компоненти. Спробуйте ще раз.</p>';
      } finally {
        if (quickAddLoader) quickAddLoader.style.display = "none"; // Hide loader
      }
    }
  });

  [compOnly, only3d].forEach((el) => {
    if (el) el.addEventListener("input", applyFiltersAndRender);
  });
  if (sortBySelect) {
    sortBySelect.addEventListener("change", applyFiltersAndRender);
  }

  if (searchInput) {
    searchInput.addEventListener("input", debouncedApplyFiltersAndRender);
  }

  if (priceMin && priceMax && priceMinVal && priceMaxVal) {
    priceMin.addEventListener("input", () => {
      if (+priceMin.value > +priceMax.value) priceMin.value = priceMax.value;
      priceMinVal.textContent = `₴${priceMin.value}`;
      debouncedApplyFiltersAndRender();
    });

    priceMax.addEventListener("input", () => {
      if (+priceMax.value < +priceMin.value) priceMax.value = priceMin.value;
      priceMaxVal.textContent = `₴${priceMax.value}`;
      debouncedApplyFiltersAndRender();
    });
  }

  if (rowsPerPageSel) {
    rowsPerPageSel.addEventListener("change", () => {
      setPageSize(parseInt(rowsPerPageSel.value, 10));
      setCurrentPage(1);
      renderProductsPage(getFilteredProducts());
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;

      const id = card.dataset.id;
      const product = getFilteredProducts().find((p) => p.opendb_id === id);
      if (!product) {
        console.warn("Продукт не знайдено для ID картки:", id);
        return;
      }

      if (e.target.matches(".add-to-build")) {
        window.dispatchEvent(
          new CustomEvent("add-component", {
            detail: { category: product.category || currentCategory, product },
          })
        );
        window.dispatchEvent(new Event("buildUpdated"));
        overlay.classList.remove("active");
        document.body.style.overflow = "";
      } else {
        showProductDetails(product);
      }
    });
  }
}
