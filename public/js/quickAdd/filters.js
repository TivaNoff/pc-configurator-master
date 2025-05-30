// public/js/quickAdd/filters.js

import { renderCheckboxList, getCheckedValues } from "./helpers.js";
import { renderProductsPage, setCurrentPage } from "./productFlow.js";
import { selectedParts, checkCompatibility } from "../build.js";

let allProducts = []; // Stores all products for the current category
let filteredProducts = []; // Stores products after filtering
let currentCategory = ""; // The current component category being viewed
let defaultMinPrice = 0;
let defaultMaxPrice = 0;

/**
 * Sets the master list of all products for the current category.
 * @param {object[]} data - Array of product objects.
 */
export function setAllProducts(data) {
  allProducts = Array.isArray(data) ? data : [];
}

/**
 * Sets the current category for filtering.
 * @param {string} cat - The category name (e.g., "CPU", "GPU").
 */
export function setCurrentCategory(cat) {
  currentCategory = cat;
}

/**
 * Gets the currently filtered list of products.
 * @returns {object[]} Array of filtered product objects.
 */
export function getFilteredProducts() {
  return filteredProducts;
}

/**
 * Safely gets a nested value from an object using a dot-separated path.
 * @param {object} obj - The object to traverse.
 * @param {string} path - The dot-separated path (e.g., "specs.metadata.name").
 * @returns {*} The value at the path, or undefined if not found.
 */
function getNestedValue(obj, path) {
  if (!obj || typeof path !== "string") return undefined;
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

/**
 * Initializes all filter UI elements.
 * This function should be called after `setAllProducts` and `setCurrentCategory`.
 */
export function initFilters() {
  const priceMinSlider = document.getElementById("priceMin");
  const priceMaxSlider = document.getElementById("priceMax");
  const priceMinValDisplay = document.getElementById("priceMinVal");
  const priceMaxValDisplay = document.getElementById("priceMaxVal");

  const prices = allProducts
    .map((p) => p.prices?.Ekua)
    .filter((v) => typeof v === "number" && !isNaN(v));

  defaultMinPrice = prices.length > 0 ? Math.min(0, ...prices) : 0; // Can be 0 if all positive
  defaultMaxPrice = prices.length > 0 ? Math.max(...prices) : 10000; // Default max if no prices

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

    priceMinValDisplay.textContent = `₴${defaultMinPrice}`;
    priceMaxValDisplay.textContent = `₴${defaultMaxPrice}`;
  }

  const compatibilityOnlyCheckbox =
    document.getElementById("compatibilityOnly");
  if (compatibilityOnlyCheckbox) compatibilityOnlyCheckbox.checked = true; // Default to true or as needed

  const only3dCheckbox = document.getElementById("only3d");
  if (only3dCheckbox) only3dCheckbox.checked = false;

  const searchInput = document.getElementById("component-search");
  if (searchInput) searchInput.value = "";

  // Hide all filter sections first
  const allFilterContainerIds = [
    "cpu-filters",
    "gpu-filters",
    "mb-filters",
    "case-filters",
    "cooler-filters",
    "ramfilters",
    "storage-filters",
    "psu-filters",
    "monitor-filters",
  ];
  allFilterContainerIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // Define filter configurations for each category
  const categoryFilterConfigs = {
    cpu: {
      containerId: "cpu-filters",
      filters: {
        socketFilter: "socket",
        microarchitectureFilter: "microarchitecture",
        integratedGraphicsFilter: "specifications.integratedGraphics.model", // Example of deeper path
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
      containerId: "case-filters",
      filters: {
        caseFormFactorFilter: "form_factor",
        sidePanelFilter: "side_panel",
        caseManufacturerFilter: "metadata.manufacturer",
      },
    },
    cpucooler: {
      containerId: "cooler-filters",
      filters: {
        coolerManufacturerFilter: "metadata.manufacturer",
        waterCooledFilter: "water_cooled", // Boolean
        // socketCompatibilityCooler: "cpu_sockets" // Array
      },
    },
    ram: {
      containerId: "ramfilters",
      filters: {
        ramTypeFilterRAM: "ram_type", // or 'type'
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
        modularFilter: "modular", // Often a string like "Full", "Semi", "None"
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

  const config = categoryFilterConfigs[currentCategory.toLowerCase()];
  if (config) {
    const filterContainer = document.getElementById(config.containerId);
    if (filterContainer) {
      filterContainer.style.display = "flex"; // Show the relevant filter section

      // Collect all unique values for the active filters in one pass
      const valueSetsForFilters = {};
      Object.keys(config.filters).forEach((filterKey) => {
        valueSetsForFilters[filterKey] = new Set();
      });

      allProducts.forEach((product) => {
        Object.entries(config.filters).forEach(([filterKey, specsPath]) => {
          let value = getNestedValue(product.specs, specsPath);
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              // Handle array values (e.g., CPU cooler sockets)
              value.forEach((item) =>
                valueSetsForFilters[filterKey].add(String(item))
              );
            } else if (typeof value === "boolean") {
              valueSetsForFilters[filterKey].add(value ? "Yes" : "No");
            } else {
              valueSetsForFilters[filterKey].add(String(value));
            }
          }
        });
      });

      // Render checkbox lists for each filter
      Object.entries(config.filters).forEach(([filterKey, _]) => {
        // filterKey is the ID of the div that will contain the checkboxes (e.g., "socketFilter")
        renderCheckboxList(
          filterKey,
          valueSetsForFilters[filterKey],
          applyFiltersAndRender
        );
      });
    } else {
      console.error(
        `Filter container #${config.containerId} not found for category ${currentCategory}.`
      );
    }
  }
}

/**
 * Applies all active filters to the `allProducts` list and re-renders the product grid.
 */
export function applyFiltersAndRender() {
  let prods = [...allProducts]; // Start with all products for the current category

  // Price filters
  const minPrice = Number(
    document.getElementById("priceMin")?.value ?? defaultMinPrice
  );
  const maxPrice = Number(
    document.getElementById("priceMax")?.value ?? defaultMaxPrice
  );

  // Search query
  const searchQuery =
    document.getElementById("component-search")?.value.trim().toLowerCase() ??
    "";
  const searchWords = searchQuery.split(/\s+/).filter((w) => w.length > 0);

  // Checkbox states
  const compatibilityOnly =
    document.getElementById("compatibilityOnly")?.checked ?? false;
  const only3d = document.getElementById("only3d")?.checked ?? false; // Assuming you have a 'supports3D' or similar in specs

  // Category-specific filter configurations (mirrors initFilters structure)
  const categoryFilterConfigs = {
    cpu: {
      filters: {
        socketFilter: "socket",
        microarchitectureFilter: "microarchitecture",
        integratedGraphicsFilter: "specifications.integratedGraphics.model",
      },
    },
    gpu: {
      filters: {
        chipsetFilter: "chipset",
        memoryTypeFilter: "memory_type",
        interfaceFilter: "interface",
        manufacturerFilter: "metadata.manufacturer",
      },
    },
    motherboard: {
      filters: {
        socketFilterMB: "socket",
        formFactorFilter: "form_factor",
        mbChipsetFilter: "chipset",
        ramTypeFilter: "memory.ram_type",
        mbManufacturerFilter: "metadata.manufacturer",
      },
    },
    pccase: {
      filters: {
        caseFormFactorFilter: "form_factor",
        sidePanelFilter: "side_panel",
        caseManufacturerFilter: "metadata.manufacturer",
      },
    },
    cpucooler: {
      filters: {
        coolerManufacturerFilter: "metadata.manufacturer",
        waterCooledFilter:
          "water_cooled" /*, socketCompatibilityCooler: "cpu_sockets" */,
      },
    },
    ram: {
      filters: {
        ramTypeFilterRAM: "ram_type",
        ramFormFactorFilter: "form_factor",
        eccFilter: "ecc",
        registeredFilter: "registered",
        ramManufacturerFilter: "metadata.manufacturer",
        heatSpreaderFilter: "heat_spreader",
        rgbFilter: "rgb",
      },
    },
    storage: {
      filters: {
        storageTypeFilter: "type",
        storageFormFactorFilter: "form_factor",
        storageInterfaceFilter: "interface",
        storageManufacturerFilter: "metadata.manufacturer",
        nvmeFilter: "nvme",
      },
    },
    psu: {
      filters: {
        psuFormFactorFilter: "form_factor",
        efficiencyRatingFilter: "efficiency_rating",
        modularFilter: "modular",
        psuManufacturerFilter: "metadata.manufacturer",
      },
    },
    monitor: {
      filters: {
        monitorBrandFilter: "metadata.manufacturer",
        refreshRateFilter: "refresh_rate",
        screenSizeFilter: "screen_size",
        verticalResFilter: "resolution.verticalRes",
        horizontalResFilter: "resolution.horizontalRes",
        panelTypeFilter: "panel_type",
      },
    },
  };

  const activeConfig = categoryFilterConfigs[currentCategory.toLowerCase()];

  prods = prods.filter((p) => {
    const price = p.prices?.Ekua ?? null;
    if (price !== null && (price < minPrice || price > maxPrice)) return false;
    if (price === null && (minPrice > 0 || maxPrice < defaultMaxPrice))
      return false; // Handle products without price

    if (compatibilityOnly) {
      const tempBuild = {
        ...selectedParts,
        [p.category || currentCategory]: p,
      };
      if (!checkCompatibility(tempBuild)) return false;
    }

    if (only3d && !getNestedValue(p.specs, "supports3D")) return false; // Adjust path if needed

    if (searchQuery) {
      const productName = (
        getNestedValue(p.specs, "metadata.name") ||
        getNestedValue(p.specs, "model") ||
        ""
      ).toLowerCase();
      if (!searchWords.every((word) => productName.includes(word)))
        return false;
    }

    // Apply dynamic checkbox filters for the current category
    if (activeConfig) {
      for (const [filterKey, specsPath] of Object.entries(
        activeConfig.filters
      )) {
        const productValue = getNestedValue(p.specs, specsPath);
        if (!checkCheckboxFilter(filterKey, productValue)) return false;
      }
    }
    return true;
  });

  // Sorting
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
    // Add more sorting options if needed (e.g., by name, by rating)
    // case "nameAsc":
    //   prods.sort((a, b) => (getNestedValue(a.specs, "metadata.name") || "").localeCompare(getNestedValue(b.specs, "metadata.name") || ""));
    //   break;
    default:
      // Default sort: items with price first, then by name or leave as is
      prods.sort((a, b) => {
        const priceA = a.prices?.Ekua;
        const priceB = b.prices?.Ekua;
        if (priceA != null && priceB == null) return -1;
        if (priceA == null && priceB != null) return 1;
        return 0; // Or add secondary sort criteria
      });
      break;
  }

  filteredProducts = prods;

  const countEl = document.getElementById("productsCount");
  if (countEl) {
    countEl.textContent = `${filteredProducts.length} Product${
      filteredProducts.length === 1 ? "" : "s"
    } Found`;
  }
  setCurrentPage(1); // Reset to page 1 whenever filters change
  renderProductsPage(filteredProducts);
}

/**
 * Checks if a product's value matches any of the checked values for a given checkbox filter.
 * @param {string} checkboxContainerId - The ID of the div containing the checkbox group.
 * @param {*} productValue - The value from the product to check. Can be string, number, boolean, or array.
 * @returns {boolean} True if the product matches the filter, false otherwise.
 */
function checkCheckboxFilter(checkboxContainerId, productValue) {
  const checkedValues = getCheckedValues(checkboxContainerId);
  if (checkedValues.length === 0) return true; // If no checkboxes are checked for this filter, all products pass

  let pValueStr;
  if (
    productValue === undefined ||
    productValue === null ||
    productValue === ""
  ) {
    // If product has no value for this spec, it only passes if "Any" or no specific value is checked.
    // This behavior might need adjustment based on desired logic for missing specs.
    // For now, if a filter is active (checkedValues.length > 0), and productValue is null/undefined, it fails.
    return false;
  }

  if (Array.isArray(productValue)) {
    // If product spec is an array (e.g. CPU Cooler Sockets)
    return productValue.some((item) => checkedValues.includes(String(item)));
  } else if (typeof productValue === "boolean") {
    pValueStr = productValue ? "Yes" : "No";
  } else {
    pValueStr = String(productValue);
  }

  return checkedValues.includes(pValueStr);
}
