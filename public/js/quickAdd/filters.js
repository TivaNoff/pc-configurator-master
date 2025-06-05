import { renderCheckboxList, getCheckedValues } from "./helpers.js";
import { renderProductsPage, setCurrentPage } from "./productFlow.js";
import {
  selectedParts,
  checkCompatibility,
  getProductDisplayTitle,
} from "../build.js";
import { getTranslation, translateDynamicElement } from "../localization.js";

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
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}

const categoryFilterConfigs = {
  cpu: {
    containerId: "cpu-filters",
    filters: {
      cpuSocketFilter: "socket",
      cpuManufacturerFilter: "metadata.manufacturer",
      cpuCoreCountFilter: "cores.total",
      cpuLithographyFilter: "specifications.lithography",
    },
  },
  gpu: {
    containerId: "gpu-filters",
    filters: {
      gpuChipsetFilter: "chipset",
      gpuChipsetManufacturerFilter: "chipset_manufacturer",
      gpuMemorySizeFilter: "memory",
      gpuMemoryTypeFilter: "memory_type",
      gpuInterfaceFilter: "interface",
      gpuFrameSyncFilter: "frame_sync",
      gpuManufacturerFilter: "metadata.manufacturer",
    },
  },
  motherboard: {
    containerId: "mb-filters",
    filters: {
      mbSocketFilter: "socket",
      mbFormFactorFilter: "form_factor",
      mbChipsetFilter: "chipset",
      mbRamTypeFilter: "memory.ram_type",
      mbManufacturerFilter: "metadata.manufacturer",
      mbMemorySlotsFilter: "memory.slots",
    },
  },
  ram: {
    containerId: "ramfilters",
    filters: {
      ramTypeFilter: "ram_type",
      ramFormFactorFilter: "form_factor",
      ramSpeedFilter: "speed",
      ramModulesQuantityFilter: "modules.quantity",
      ramCapacityPerModuleFilter: "modules.capacity_gb",
      ramCasLatencyFilter: "cas_latency",
      ramEccFilter: "ecc",
      ramRegisteredFilter: "registered",
      ramManufacturerFilter: "metadata.manufacturer",
      ramRgbFilter: "rgb",
    },
  },
  storage: {
    containerId: "storage-filters",
    filters: {
      storageTypeFilter: "type",
      storageFormFactorFilter: "form_factor",
      storageInterfaceFilter: "interface",
      storageCapacityFilter: "capacity",
      storageNvmeFilter: "nvme",
      storageManufacturerFilter: "metadata.manufacturer",
    },
  },
  pccase: {
    containerId: "case-filters",
    filters: {
      caseFormFactorFilter: "form_factor",
      caseSidePanelFilter: "side_panel",
      caseColorFilter: "color",
      caseManufacturerFilter: "metadata.manufacturer",
    },
  },
  psu: {
    containerId: "psu-filters",
    filters: {
      psuFormFactorFilter: "form_factor",
      psuEfficiencyRatingFilter: "efficiency_rating",
      psuModularFilter: "modular",
      psuWattageFilter: "wattage",
      psuManufacturerFilter: "metadata.manufacturer",
    },
  },
  cpucooler: {
    containerId: "cooler-filters",
    filters: {
      coolerManufacturerFilter: "metadata.manufacturer",
      coolerWaterCooledFilter: "water_cooled",
      coolerRadiatorSizeFilter: "radiator_size",
    },
  },
  monitor: {
    containerId: "monitor-filters",
    filters: {
      monitorBrandFilter: "metadata.manufacturer",
      monitorScreenSizeFilter: "screen_size",
      monitorResolutionFilter: "resolution",
      monitorRefreshRateFilter: "refresh_rate",
      monitorPanelTypeFilter: "panel_type",
      monitorAdaptiveSyncFilter: "adaptive_sync",
    },
  },
  casefan: {
    containerId: "casefan-filters",
    filters: {
      fanSizeFilter: "size_mm",
      fanQuantityFilter: "quantity",
      fanPwmFilter: "pwm",
      fanLedFilter: "led",
      fanManufacturerFilter: "metadata.manufacturer",
    },
  },
  capturecard: {
    containerId: "capturecard-filters",
    filters: {
      captureInterfaceFilter: "interface",
      captureMaxVideoResolutionFilter: "max_video_capture_resolution",
      captureManufacturerFilter: "metadata.manufacturer",
    },
  },
  soundcard: {
    containerId: "soundcard-filters",
    filters: {
      soundcardInterfaceFilter: "interface",
      soundcardChannelsFilter: "channels",
      soundcardSampleRateFilter: "sample_rate_khz",
      soundcardSnrFilter: "signal_to_noise_ratio_db",
      soundcardManufacturerFilter: "metadata.manufacturer",
    },
  },
  networkcard: {
    containerId: "networkcard-filters",
    filters: {
      networkInterfaceFilter: "interface",
      networkProtocolFilter: "protocol",
      networkManufacturerFilter: "metadata.manufacturer",
    },
  },
};

function formatFilterValue(value, filterKey) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") {
    return value ? getTranslation("yes_filter") : getTranslation("no_filter");
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (
    filterKey === "monitorResolutionFilter" &&
    typeof value === "object" &&
    value.horizontalRes &&
    value.verticalRes
  ) {
    return `${value.horizontalRes}x${value.verticalRes}`;
  }

  if (typeof value === "object") {
    return value.name || value.model || JSON.stringify(value);
  }
  return String(value).trim();
}

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

  Object.values(categoryFilterConfigs).forEach((config) => {
    if (config.containerId) {
      const el = document.getElementById(config.containerId);
      if (el) el.style.display = "none";
    }
  });

  const categoryKey = currentCategory.toLowerCase();
  const config = categoryFilterConfigs[categoryKey];

  if (config && config.containerId && config.filters) {
    const filterContainer = document.getElementById(config.containerId);
    if (filterContainer) {
      filterContainer.style.display = "flex";
      const valueSetsForFilters = {};
      Object.keys(config.filters).forEach((filterKeyInConfig) => {
        valueSetsForFilters[filterKeyInConfig] = new Set();
      });

      allProducts.forEach((product) => {
        Object.entries(config.filters).forEach(
          ([filterKeyInConfig, specsPath]) => {
            let rawValue = getNestedValue(product.specs, specsPath);
            let formattedValue = formatFilterValue(rawValue, filterKeyInConfig);

            if (formattedValue !== "") {
              if (specsPath === "color" && Array.isArray(rawValue)) {
                rawValue.forEach((color) => {
                  const formattedColor = formatFilterValue(
                    color,
                    filterKeyInConfig
                  );
                  if (formattedColor)
                    valueSetsForFilters[filterKeyInConfig].add(formattedColor);
                });
              } else if (
                specsPath === "form_factor" &&
                categoryKey === "pccase" &&
                Array.isArray(rawValue)
              ) {
                rawValue.forEach((ff) => {
                  const formattedFf = formatFilterValue(ff, filterKeyInConfig);
                  if (formattedFf)
                    valueSetsForFilters[filterKeyInConfig].add(formattedFf);
                });
              } else {
                valueSetsForFilters[filterKeyInConfig].add(formattedValue);
              }
            }
          }
        );
      });
      Object.entries(config.filters).forEach(([filterKeyInConfig, _]) => {
        renderCheckboxList(
          filterKeyInConfig,
          valueSetsForFilters[filterKeyInConfig],
          applyFiltersAndRender
        );
      });
    } else {
      console.warn(
        `Filter container #${config.containerId} not found for category ${currentCategory}. Ensure it exists in uiSetup.js or build.html.`
      );
    }
  } else {
    console.warn(
      `No filter configuration found for category: ${currentCategory} (key: ${categoryKey})`
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

  const categoryKey = currentCategory.toLowerCase();
  const activeConfig = categoryFilterConfigs[categoryKey];

  prods = prods.filter((p) => {
    const price = p.prices?.Ekua ?? null;
    if (price !== null && (price < minPrice || price > maxPrice)) return false;
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
    if (only3d && !getNestedValue(p.specs, "supports3D")) return false;

    if (searchQuery) {
      const searchCorpus = [
        getNestedValue(p.specs, "metadata.name"),
        getNestedValue(p.specs, "metadata.manufacturer"),
        getNestedValue(p.specs, "series"),
        getNestedValue(p.specs, "model"),
        getProductDisplayTitle(p.specs),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchWords.every((word) => searchCorpus.includes(word)))
        return false;
    }

    if (activeConfig && activeConfig.filters) {
      for (const [filterKeyInConfig, specsPath] of Object.entries(
        activeConfig.filters
      )) {
        const rawProductValue = getNestedValue(p.specs, specsPath);
        if (
          !checkCheckboxFilter(
            filterKeyInConfig,
            rawProductValue,
            specsPath === "color" ||
              (specsPath === "form_factor" && categoryKey === "pccase")
          )
        )
          return false;
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
    default:
      prods.sort((a, b) => {
        const priceA = a.prices?.Ekua;
        const priceB = b.prices?.Ekua;
        if (priceA != null && priceB == null) return -1;
        if (priceA == null && priceB != null) return 1;
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

function checkCheckboxFilter(
  checkboxContainerId,
  rawProductValue,
  isArrayField = false
) {
  const checkedValues = getCheckedValues(checkboxContainerId);
  if (checkedValues.length === 0) return true;

  if (
    rawProductValue === undefined ||
    rawProductValue === null ||
    String(rawProductValue).trim() === ""
  ) {
    return false;
  }

  if (isArrayField && Array.isArray(rawProductValue)) {
    return rawProductValue.some((item) => {
      const formattedItem = formatFilterValue(item, checkboxContainerId);
      return checkedValues.includes(formattedItem);
    });
  } else {
    const formattedProductValue = formatFilterValue(
      rawProductValue,
      checkboxContainerId
    );
    return checkedValues.includes(formattedProductValue);
  }
}
