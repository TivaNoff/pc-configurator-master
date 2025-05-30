// filters.js

import { renderCheckboxList, getCheckedValues } from "./helpers.js";
import { renderProductsPage, setCurrentPage } from "./productFlow.js";
import { selectedParts, checkCompatibility } from "../build.js";

let allProducts = [];
let filteredProducts = [];
let currentCategory = "";
let defaultMinPrice = 0;
let defaultMaxPrice = 0;

export function setAllProducts(data) {
  allProducts = data;
}

export function setCurrentCategory(cat) {
  currentCategory = cat;
}

export function getFilteredProducts() {
  return filteredProducts;
}

function getNestedValue(obj, path) {
  // path — строка вида 'specifications.integratedGraphics.model'
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function initFilters() {
  const priceMin = document.getElementById("priceMin");
  const priceMax = document.getElementById("priceMax");
  const priceMinVal = document.getElementById("priceMinVal");
  const priceMaxVal = document.getElementById("priceMaxVal");

  const prices = allProducts
    .map((p) => p.prices?.Ekua)
    .filter((v) => v != null);
  if (prices.length === 0) return;

  defaultMinPrice = 0;
  defaultMaxPrice = Math.max(...prices);

  priceMin.min = priceMax.min = defaultMinPrice;
  priceMin.max = priceMax.max = defaultMaxPrice;
  priceMin.value = defaultMinPrice;
  priceMax.value = defaultMaxPrice;
  priceMinVal.textContent = `$${defaultMinPrice}`;
  priceMaxVal.textContent = `$${defaultMaxPrice}`;

  document.getElementById("compatibilityOnly").checked;
  document.getElementById("only3d").checked = false;
  document.getElementById("component-search").value = "";

  // Скрыть все блоки фильтров
  [
    "cpu-filters",
    "gpu-filters",
    "mb-filters",
    "case-filters",
    "cooler-filters",
    "ramfilters",
    "storage-filters",
    "psu-filters",
    "monitor-filters",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // Настраиваем фильтры для выбранной категории
  switch (currentCategory.toLowerCase()) {
    case "cpu":
      setupCategoryFilters("cpu-filters", {
        socketFilter: "socket",
        microarchitectureFilter: "microarchitecture",
        integratedGraphicsFilter: "specifications.integratedGraphics.model",
      });
      break;

    case "gpu":
      setupCategoryFilters("gpu-filters", {
        chipsetFilter: "chipset",
        memoryTypeFilter: "memory_type",
        interfaceFilter: "interface",
        manufacturerFilter: "metadata.manufacturer",
      });
      break;

    case "motherboard":
      setupCategoryFilters("mb-filters", {
        socketFilterMB: "socket",
        formFactorFilter: "form_factor",
        mbChipsetFilter: "chipset",
        ramTypeFilter: "memory.ram_type",
        mbManufacturerFilter: "metadata.manufacturer",
      });
      break;

    case "pccase":
      setupCategoryFilters("case-filters", {
        caseFormFactorFilter: "form_factor",
        sidePanelFilter: "side_panel",
        caseManufacturerFilter: "metadata.manufacturer",
      });
      break;

    case "cpucooler":
      setupCategoryFilters("cooler-filters", {
        coolerManufacturerFilter: "metadata.manufacturer",
        waterCooledFilter: "water_cooled",
      });
      break;

    case "ram":
      setupCategoryFilters("ramfilters", {
        ramTypeFilterRAM: "ram_type",
        ramFormFactorFilter: "form_factor",
        eccFilter: "ecc",
        registeredFilter: "registered",
        ramManufacturerFilter: "metadata.manufacturer",
        heatSpreaderFilter: "heat_spreader",
        rgbFilter: "rgb",
      });
      break;

    case "storage":
      setupCategoryFilters("storage-filters", {
        storageTypeFilter: "type",
        storageFormFactorFilter: "form_factor",
        storageInterfaceFilter: "interface",
        storageManufacturerFilter: "metadata.manufacturer",
        nvmeFilter: "nvme",
      });
      break;

    case "psu":
      setupCategoryFilters("psu-filters", {
        psuFormFactorFilter: "form_factor",
        efficiencyRatingFilter: "efficiency_rating",
        modularFilter: "modular",
        psuManufacturerFilter: "metadata.manufacturer",
      });
      break;

    case "monitor":
      setupCategoryFilters("monitor-filters", {
        monitorBrandFilter: "metadata.manufacturer",
        refreshRateFilter: "refresh_rate",
        screenSizeFilter: "screen_size",
        verticalResFilter: "resolution.verticalRes",
        horizontalResFilter: "resolution.horizontalRes",
      });
      break;
  }
}

function setupCategoryFilters(containerId, filtersMap) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`initFilters: #${containerId} not found`);
    return;
  }
  container.style.display = "flex";

  Object.entries(filtersMap).forEach(([checkboxContainerId, specsPath]) => {
    const valuesSet = new Set();
    allProducts.forEach((p) => {
      const val = getNestedValue(p.specs, specsPath);
      if (val !== undefined && val !== null) {
        if (typeof val === "boolean") valuesSet.add(val ? "Yes" : "No");
        else valuesSet.add(String(val));
      }
    });
    renderCheckboxList(checkboxContainerId, valuesSet, applyFiltersAndRender);
  });
}

export function applyFiltersAndRender() {
  let prods = [...allProducts];
  const minP = Number(document.getElementById("priceMin").value);
  const maxP = Number(document.getElementById("priceMax").value);
  const sortBySelect = document.getElementById("sortBySelect");

  const query = document
    .getElementById("component-search")
    .value.trim()
    .toLowerCase();
  const compOnly = document.getElementById("compatibilityOnly").checked;
  const only3d = document.getElementById("only3d").checked;

  prods = prods.filter((p) => {
    const price = p.prices?.Ekua ?? 0;
    if (price < minP || price > maxP) return false;

    // Вместо p.specs?.compatible теперь проверяем реальную совместимость с выбранными комплектующими
    if (compOnly) {
      // Создаем копию выбранных частей
      const partsCopy = { ...selectedParts, [p.category]: p };
      if (!checkCompatibility(partsCopy)) return false;
    }

    if (only3d && !p.specs?.supports3D) return false;

    if (query) {
      const words = query.split(/\s+/);
      const name = (p.specs?.metadata?.name || "").toLowerCase();
      if (!words.every((w) => name.includes(w))) return false;
    }

    // Применяем категорийные фильтры
    switch (currentCategory.toLowerCase()) {
      case "cpu":
        if (!checkCheckboxFilter("socketFilter", p.specs?.socket)) return false;
        if (
          !checkCheckboxFilter(
            "microarchitectureFilter",
            p.specs?.microarchitecture
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "integratedGraphicsFilter",
            getNestedValue(p.specs, "specifications.integratedGraphics.model")
          )
        )
          return false;
        break;

      case "gpu":
        if (!checkCheckboxFilter("chipsetFilter", p.specs?.chipset))
          return false;
        if (!checkCheckboxFilter("memoryTypeFilter", p.specs?.memory_type))
          return false;
        if (!checkCheckboxFilter("interfaceFilter", p.specs?.interface))
          return false;
        if (
          !checkCheckboxFilter(
            "manufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        break;

      case "motherboard":
        if (!checkCheckboxFilter("socketFilterMB", p.specs?.socket))
          return false;
        if (!checkCheckboxFilter("formFactorFilter", p.specs?.form_factor))
          return false;
        if (!checkCheckboxFilter("mbChipsetFilter", p.specs?.chipset))
          return false;
        if (
          !checkCheckboxFilter(
            "ramTypeFilter",
            getNestedValue(p.specs, "memory.ram_type")
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "mbManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        break;

      case "pccase":
        if (!checkCheckboxFilter("caseFormFactorFilter", p.specs?.form_factor))
          return false;
        if (!checkCheckboxFilter("sidePanelFilter", p.specs?.side_panel))
          return false;
        if (
          !checkCheckboxFilter(
            "caseManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        break;

      case "cpucooler":
        if (
          !checkCheckboxFilter(
            "coolerManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "waterCooledFilter",
            p.specs?.water_cooled === true
              ? "Yes"
              : p.specs?.water_cooled === false
              ? "No"
              : null
          )
        )
          return false;
        break;

      case "ram":
        if (!checkCheckboxFilter("ramTypeFilterRAM", p.specs?.ram_type))
          return false;
        if (!checkCheckboxFilter("ramFormFactorFilter", p.specs?.form_factor))
          return false;
        if (!checkCheckboxFilter("eccFilter", p.specs?.ecc)) return false;
        if (!checkCheckboxFilter("registeredFilter", p.specs?.registered))
          return false;
        if (
          !checkCheckboxFilter(
            "ramManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "heatSpreaderFilter",
            p.specs?.heat_spreader === true
              ? "Yes"
              : p.specs?.heat_spreader === false
              ? "No"
              : null
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "rgbFilter",
            p.specs?.rgb === true ? "Yes" : p.specs?.rgb === false ? "No" : null
          )
        )
          return false;
        break;

      case "storage":
        if (!checkCheckboxFilter("storageTypeFilter", p.specs?.type))
          return false;
        if (
          !checkCheckboxFilter("storageFormFactorFilter", p.specs?.form_factor)
        )
          return false;
        if (!checkCheckboxFilter("storageInterfaceFilter", p.specs?.interface))
          return false;
        if (
          !checkCheckboxFilter(
            "storageManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "nvmeFilter",
            p.specs?.nvme === true
              ? "Yes"
              : p.specs?.nvme === false
              ? "No"
              : null
          )
        )
          return false;
        break;

      case "psu":
        if (!checkCheckboxFilter("psuFormFactorFilter", p.specs?.form_factor))
          return false;
        if (
          !checkCheckboxFilter(
            "efficiencyRatingFilter",
            p.specs?.efficiency_rating
          )
        )
          return false;
        if (!checkCheckboxFilter("modularFilter", p.specs?.modular))
          return false;
        if (
          !checkCheckboxFilter(
            "psuManufacturerFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        break;

      case "monitor":
        if (
          !checkCheckboxFilter(
            "monitorBrandFilter",
            p.specs?.metadata?.manufacturer
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "refreshRateFilter",
            String(p.specs?.refresh_rate)
          )
        )
          return false;
        if (
          !checkCheckboxFilter("screenSizeFilter", String(p.specs?.screen_size))
        )
          return false;
        if (
          !checkCheckboxFilter(
            "verticalResFilter",
            String(getNestedValue(p.specs, "resolution.verticalRes"))
          )
        )
          return false;
        if (
          !checkCheckboxFilter(
            "horizontalResFilter",
            String(getNestedValue(p.specs, "resolution.horizontalRes"))
          )
        )
          return false;
        break;
    }

    return true;
  });

  switch (sortBySelect) {
    case "priceAsc":
      prods.sort((a, b) => (a.prices?.Ekua ?? 0) - (b.prices?.Ekua ?? 0));
      break;
    case "priceDesc":
      prods.sort((a, b) => (b.prices?.Ekua ?? 0) - (a.prices?.Ekua ?? 0));
      break;
    // default - без сортировки или по дефолту
    default:
      // Оставляем порядок как есть или можно добавить дефолтную сортировку
      break;
  }

  // Сортируем: сначала с ценой, потом без
  const withPrice = prods.filter((p) => p.prices?.Ekua != null);
  const withoutPrice = prods.filter((p) => p.prices?.Ekua == null);

  filteredProducts = [...withPrice, ...withoutPrice];

  // после расчёта filteredProducts
  const countEl = document.getElementById("productsCount");
  if (countEl) {
    countEl.textContent = `${filteredProducts.length} Compatible Products`;
  }
  setCurrentPage(1);
  renderProductsPage(filteredProducts);
}

function checkCheckboxFilter(containerId, value) {
  if (value == null) return true;
  const checked = getCheckedValues(containerId);
  if (checked.length === 0) return true;

  let valStr =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);

  return checked.includes(valStr);
}
