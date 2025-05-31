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
import { showProductDetails } from "../build.js"; // Импортируем из build.js
import { getTranslation } from "../localization.js"; // Для перевода алерта

export function setupListeners() {
  const overlay = document.getElementById("quickAddOverlay");
  const quickAddLoader = document.getElementById("quickAddLoader");
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

      if (overlay) overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      if (quickAddLoader) quickAddLoader.style.display = "flex";
      if (grid) grid.innerHTML = "";

      setFilterCategory(cat);
      setFlowCategory(cat);

      try {
        const data = await fetchProductsByCategory(cat);
        setAllProducts(data);
        initFilters();
        applyFiltersAndRender();
      } catch (error) {
        console.error(
          getTranslation("error_loading_components_quickadd") ||
            "Ошибка загрузки или обработки продуктов:",
          error
        );
        if (grid)
          grid.innerHTML = `<p style="color: var(--fg); text-align: center; padding: 20px;">${
            getTranslation("error_failed_to_load_components") ||
            "Не удалось загрузить компоненты. Попробуйте еще раз."
          }</p>`;
      } finally {
        if (quickAddLoader) quickAddLoader.style.display = "none";
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
      if (overlay) overlay.classList.remove("active");
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
        console.warn(
          getTranslation("error_product_not_found_by_id") ||
            "Продукт не найден по ID:",
          id
        );
        return;
      }

      if (e.target.matches(".add-to-build")) {
        window.dispatchEvent(
          new CustomEvent("add-component", {
            // detail: { category: product.category || currentCategory, product }, // currentCategory здесь может быть неактуальным
            // Лучше передавать категорию из setFlowCategory, если она там доступна, или product.category
            detail: {
              category:
                product.category ||
                document.querySelector(
                  ".part-category.active-category-for-quickadd"
                )?.dataset.cat,
              product,
            }, // Пример
          })
        );
        window.dispatchEvent(new Event("buildUpdated"));
        if (overlay) overlay.classList.remove("active");
        document.body.style.overflow = "";
      } else {
        showProductDetails(product); // Используем импортированную функцию
      }
    });
  }
}

// Добавьте ключи для перевода ошибок в localization.js
// en: { ... error_loading_components_quickadd: "Error loading or processing products:", error_failed_to_load_components: "Failed to load components. Please try again.", error_product_not_found_by_id: "Product not found for card ID:" ...}
// uk: { ... error_loading_components_quickadd: "Помилка завантаження або обробки продуктів:", error_failed_to_load_components: "Не вдалося завантажити компоненти. Спробуйте ще раз.", error_product_not_found_by_id: "Продукт не знайдено за ID картки:" ...}
