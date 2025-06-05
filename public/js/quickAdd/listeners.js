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
import { showProductDetails } from "../build.js";
import { getTranslation } from "../localization.js";

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

  const quickAddFilterToggleButton = document.getElementById(
    "quickadd-filter-toggle"
  );
  const quickAddFilterSidebar = document.getElementById(
    "quickAddFilterSidebar"
  );

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

      if (
        quickAddFilterSidebar &&
        quickAddFilterSidebar.classList.contains("filter-sidebar-open")
      ) {
        quickAddFilterSidebar.classList.remove("filter-sidebar-open");
      }
      if (quickAddFilterToggleButton) {
        quickAddFilterToggleButton.setAttribute("aria-expanded", "false");

        const icon = quickAddFilterToggleButton.querySelector("i");
        if (icon && icon.classList.contains("fa-times")) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-filter");
        }
      }

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

      if (
        quickAddFilterSidebar &&
        quickAddFilterSidebar.classList.contains("filter-sidebar-open")
      ) {
        quickAddFilterSidebar.classList.remove("filter-sidebar-open");
      }
      if (quickAddFilterToggleButton) {
        quickAddFilterToggleButton.setAttribute("aria-expanded", "false");
        const icon = quickAddFilterToggleButton.querySelector("i");
        if (icon && icon.classList.contains("fa-times")) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-filter");
        }
      }
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
            detail: {
              category:
                product.category ||
                document.querySelector(
                  ".part-category.active-category-for-quickadd"
                )?.dataset.cat ||
                currentCategory,
              product,
            },
          })
        );
        window.dispatchEvent(new Event("buildUpdated"));
        if (overlay) overlay.classList.remove("active");
        document.body.style.overflow = "";

        if (
          quickAddFilterSidebar &&
          quickAddFilterSidebar.classList.contains("filter-sidebar-open")
        ) {
          quickAddFilterSidebar.classList.remove("filter-sidebar-open");
        }
        if (quickAddFilterToggleButton) {
          quickAddFilterToggleButton.setAttribute("aria-expanded", "false");
          const icon = quickAddFilterToggleButton.querySelector("i");
          if (icon && icon.classList.contains("fa-times")) {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-filter");
          }
        }
      } else {
        showProductDetails(product);
      }
    });
  }

  if (quickAddFilterToggleButton && quickAddFilterSidebar) {
    quickAddFilterToggleButton.addEventListener("click", () => {
      const isOpen = quickAddFilterSidebar.classList.toggle(
        "filter-sidebar-open"
      );
      quickAddFilterToggleButton.setAttribute(
        "aria-expanded",
        isOpen.toString()
      );

      const icon = quickAddFilterToggleButton.querySelector("i");
      if (icon) {
        if (isOpen) {
          icon.classList.remove("fa-filter");
          icon.classList.add("fa-times");
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-filter");
        }
      }
    });
  }
}
