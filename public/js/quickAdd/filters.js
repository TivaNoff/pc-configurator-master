// public/js/quickAdd/filters.js
import { renderCheckboxList, getCheckedValues } from "./helpers.js";
import { renderProductsPage, setCurrentPage } from "./productFlow.js";
import { selectedParts, checkCompatibility } from "../build.js";
import { getTranslation, translateDynamicElement } from "../localization.js"; // Импортируем

let allProducts = [];
let filteredProducts = [];
let currentCategory = "";
let defaultMinPrice = 0;
let defaultMaxPrice = 0;

export function setAllProducts(data) {
  allProducts = Array.isArray(data) ? data : [];
}

export function setCurrentCategory(cat) {
  currentCategory = cat;
}

export function getFilteredProducts() {
  return filteredProducts;
}

function getNestedValue(obj, path) {
  if (!obj || typeof path !== "string") return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

// Определение конфигураций фильтров для каждой категории
// Это должно быть доступно для initFilters и applyFiltersAndRender
const categoryFilterConfigs = {
  cpu: {
    containerId: "cpu-filters",
    filters: {
      socketFilter: "socket",
      microarchitectureFilter: "microarchitecture",
      integratedGraphicsFilter: "specifications.integratedGraphics.model",
    },
  },
  gpu: {
    containerId: "gpu-filters",
    filters: {
      chipsetFilter: "chipset",
      memoryTypeFilter: "memory_type",
      interfaceFilter: "interface",
      manufacturerFilter: "metadata.manufacturer",
    },
  },
  motherboard: {
    containerId: "mb-filters",
    filters: {
      socketFilterMB: "socket",
      formFactorFilter: "form_factor",
      mbChipsetFilter: "chipset",
      ramTypeFilter: "memory.ram_type",
      mbManufacturerFilter: "metadata.manufacturer",
    },
  },
  pccase: {
    // Имя категории должно совпадать с тем, что используется в data-cat и setCurrentCategory
    containerId: "case-filters",
    filters: {
      caseFormFactorFilter: "form_factor",
      sidePanelFilter: "side_panel",
      caseManufacturerFilter: "metadata.manufacturer",
    },
  },
  cpucooler: {
    // Имя категории должно совпадать
    containerId: "cooler-filters",
    filters: {
      coolerManufacturerFilter: "metadata.manufacturer",
      waterCooledFilter: "water_cooled", // Boolean
      // socketCompatibilityCooler: "cpu_sockets" // Array - пример, если бы был такой фильтр
    },
  },
  ram: {
    containerId: "ramfilters",
    filters: {
      ramTypeFilterRAM: "ram_type", // или 'type' в зависимости от структуры данных
      ramFormFactorFilter: "form_factor",
      eccFilter: "ecc", // Boolean
      registeredFilter: "registered", // Boolean
      ramManufacturerFilter: "metadata.manufacturer",
      heatSpreaderFilter: "heat_spreader", // Boolean
      rgbFilter: "rgb", // Boolean
    },
  },
  storage: {
    containerId: "storage-filters",
    filters: {
      storageTypeFilter: "type",
      storageFormFactorFilter: "form_factor",
      storageInterfaceFilter: "interface",
      storageManufacturerFilter: "metadata.manufacturer",
      nvmeFilter: "nvme", // Boolean
    },
  },
  psu: {
    containerId: "psu-filters",
    filters: {
      psuFormFactorFilter: "form_factor",
      efficiencyRatingFilter: "efficiency_rating",
      modularFilter: "modular",
      psuManufacturerFilter: "metadata.manufacturer",
    },
  },
  monitor: {
    containerId: "monitor-filters",
    filters: {
      monitorBrandFilter: "metadata.manufacturer",
      refreshRateFilter: "refresh_rate", // Number
      screenSizeFilter: "screen_size", // Number (inches)
      verticalResFilter: "resolution.verticalRes", // Number
      horizontalResFilter: "resolution.horizontalRes", // Number
      panelTypeFilter: "panel_type",
    },
  },
};

export function initFilters() {
  const priceMinSlider = document.getElementById("priceMin");
  const priceMaxSlider = document.getElementById("priceMax");
  const priceMinValDisplay = document.getElementById("priceMinVal");
  const priceMaxValDisplay = document.getElementById("priceMaxVal");

  const prices = allProducts
    .map((p) => p.prices?.Ekua)
    .filter((v) => typeof v === "number" && !isNaN(v));

  defaultMinPrice = prices.length > 0 ? Math.min(0, ...prices) : 0;
  defaultMaxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

  if (
    priceMinSlider &&
    priceMaxSlider &&
    priceMinValDisplay &&
    priceMaxValDisplay
  ) {
    priceMinSlider.min = defaultMinPrice;
    priceMinSlider.max = defaultMaxPrice;
    priceMinSlider.value = defaultMinPrice;

    priceMaxSlider.min = defaultMinPrice;
    priceMaxSlider.max = defaultMaxPrice;
    priceMaxSlider.value = defaultMaxPrice;

    // Валюту можно тоже локализовать, если нужно. Пока оставляем ₴.
    priceMinValDisplay.textContent = `₴${defaultMinPrice}`;
    priceMaxValDisplay.textContent = `₴${defaultMaxPrice}`;
  }

  const compatibilityOnlyCheckbox =
    document.getElementById("compatibilityOnly");
  if (compatibilityOnlyCheckbox) compatibilityOnlyCheckbox.checked = true;

  const only3dCheckbox = document.getElementById("only3d");
  if (only3dCheckbox) only3dCheckbox.checked = false;

  const searchInput = document.getElementById("component-search");
  if (searchInput) searchInput.value = "";

  const allFilterContainerIds = Object.values(categoryFilterConfigs).map(
    (config) => config.containerId
  );
  allFilterContainerIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const config = categoryFilterConfigs[currentCategory.toLowerCase()];

  if (config && config.containerId && config.filters) {
    const filterContainer = document.getElementById(config.containerId);
    if (filterContainer) {
      filterContainer.style.display = "flex";
      const valueSetsForFilters = {};
      Object.keys(config.filters).forEach((filterKey) => {
        valueSetsForFilters[filterKey] = new Set();
      });

      allProducts.forEach((product) => {
        Object.entries(config.filters).forEach(([filterKey, specsPath]) => {
          let value = getNestedValue(product.specs, specsPath);
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((item) =>
                valueSetsForFilters[filterKey].add(String(item).trim())
              );
            } else if (typeof value === "boolean") {
              valueSetsForFilters[filterKey].add(
                value
                  ? getTranslation("yes_filter")
                  : getTranslation("no_filter")
              );
            } else {
              valueSetsForFilters[filterKey].add(String(value).trim());
            }
          }
        });
      });
      Object.entries(config.filters).forEach(([filterKey, _]) => {
        renderCheckboxList(
          filterKey,
          valueSetsForFilters[filterKey],
          applyFiltersAndRender
        );
      });
    } else {
      console.warn(
        `Filter container #${config.containerId} not found for category ${currentCategory}`
      );
    }
  } else {
    console.warn(
      `No filter configuration found for category: ${currentCategory}`
    );
  }
}

export function applyFiltersAndRender() {
  let prods = [...allProducts];

  const minPrice = Number(
    document.getElementById("priceMin")?.value ?? defaultMinPrice
  );
  const maxPrice = Number(
    document.getElementById("priceMax")?.value ?? defaultMaxPrice
  );
  const searchQuery =
    document.getElementById("component-search")?.value.trim().toLowerCase() ??
    "";
  const searchWords = searchQuery.split(/\s+/).filter((w) => w.length > 0);
  const compatibilityOnly =
    document.getElementById("compatibilityOnly")?.checked ?? false;
  const only3d = document.getElementById("only3d")?.checked ?? false;

  const activeConfig = categoryFilterConfigs[currentCategory.toLowerCase()];

  prods = prods.filter((p) => {
    const price = p.prices?.Ekua ?? null;
    if (price !== null && (price < minPrice || price > maxPrice)) return false;
    // Если цена не указана, и фильтр цен активен (не дефолтные значения), то не показываем
    if (
      price === null &&
      (minPrice > defaultMinPrice || maxPrice < defaultMaxPrice)
    )
      return false;

    if (compatibilityOnly) {
      const tempBuild = {
        ...selectedParts,
        [p.category || currentCategory]: p,
      };
      if (!checkCompatibility(tempBuild)) return false;
    }
    // Предполагаем, что в p.specs есть поле supports3D или аналогичное
    if (only3d && !getNestedValue(p.specs, "supports3D")) return false;

    if (searchQuery) {
      const productName = (
        getNestedValue(p.specs, "metadata.name") ||
        getNestedValue(p.specs, "model") ||
        getProductDisplayTitle(p.specs) ||
        ""
      ).toLowerCase();
      if (!searchWords.every((word) => productName.includes(word)))
        return false;
    }

    if (activeConfig && activeConfig.filters) {
      for (const [filterKey, specsPath] of Object.entries(
        activeConfig.filters
      )) {
        const productValue = getNestedValue(p.specs, specsPath);
        if (!checkCheckboxFilter(filterKey, productValue)) return false;
      }
    }
    return true;
  });

  const sortBy = document.getElementById("sortBySelect")?.value ?? "default";
  switch (sortBy) {
    case "priceAsc":
      prods.sort(
        (a, b) => (a.prices?.Ekua ?? Infinity) - (b.prices?.Ekua ?? Infinity)
      );
      break;
    case "priceDesc":
      prods.sort(
        (a, b) => (b.prices?.Ekua ?? -Infinity) - (a.prices?.Ekua ?? -Infinity)
      );
      break;
    // Можно добавить другие варианты сортировки, например, по названию
    // case "nameAsc":
    //   prods.sort((a, b) =>
    //     (getProductDisplayTitle(a.specs) || "").localeCompare(getProductDisplayTitle(b.specs) || "")
    //   );
    //   break;
    default: // Сначала с ценой, потом без, или по умолчанию как есть
      prods.sort((a, b) => {
        const priceA = a.prices?.Ekua;
        const priceB = b.prices?.Ekua;
        if (priceA != null && priceB == null) return -1;
        if (priceA == null && priceB != null) return 1;
        // Если цены одинаковые или обе null, можно добавить вторичную сортировку, например, по имени
        // return (getProductDisplayTitle(a.specs) || "").localeCompare(getProductDisplayTitle(b.specs) || "");
        return 0;
      });
      break;
  }

  filteredProducts = prods;

  const countEl = document.getElementById("productsCount");
  if (countEl) {
    translateDynamicElement(countEl, "products_found", {
      count: filteredProducts.length,
    });
  }
  setCurrentPage(1);
  renderProductsPage(filteredProducts);
}

function checkCheckboxFilter(checkboxContainerId, productValue) {
  const checkedValues = getCheckedValues(checkboxContainerId);
  if (checkedValues.length === 0) return true;

  if (
    productValue === undefined ||
    productValue === null ||
    productValue === ""
  ) {
    // Если у продукта нет значения для этой характеристики, он не проходит фильтр, если фильтр активен
    return false;
  }

  if (Array.isArray(productValue)) {
    // Если значение у продукта - массив (например, сокеты кулера), проверяем, есть ли пересечение с выбранными
    return productValue.some((item) =>
      checkedValues.includes(String(item).trim())
    );
  } else if (typeof productValue === "boolean") {
    // Для булевых значений, сравниваем с переведенными "Да"/"Нет"
    const translatedYes = getTranslation("yes_filter");
    const translatedNo = getTranslation("no_filter");
    const pValueStr = productValue ? translatedYes : translatedNo;
    return checkedValues.includes(pValueStr);
  } else {
    // Для строковых и числовых значений
    return checkedValues.includes(String(productValue).trim());
  }
}

// Убедитесь, что ключи 'yes_filter' и 'no_filter' добавлены в translations в localization.js
// en: { ... yes_filter: "Yes", no_filter: "No", ... }
// uk: { ... yes_filter: "Так", no_filter: "Ні", ... }
