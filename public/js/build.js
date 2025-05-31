// public/js/build.js
import {
  getTranslation,
  translateDynamicElement,
  currentLanguage,
  translatePage,
  setLanguage, // Ensure setLanguage is exported and imported if used here for initial setup
} from "./localization.js";

// Helper function to parse JWT token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
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

const API = {
  list: "/api/configs",
  create: "/api/configs",
  load: (id) => `/api/configs/${id}`,
  update: (id) => `/api/configs/${id}`,
  component: (id) => `/api/components/${id}`,
  login: "/api/auth/login",
  register: "/api/auth/register",
};

let currentBuildId = null;
let isSaving = false;
export const selectedParts = {};

// DOM Elements
const mainBuildLoaderOverlay = document.getElementById(
  "mainBuildLoaderOverlay"
);
const buildNameElement = document.getElementById("build-name");
const buildSelector = document.getElementById("build-selector");
const newBuildBtn = document.getElementById("new-build");
const totalPriceSpan = document.getElementById("totalPrice");
const compatibilitySpan = document.getElementById("compatibility");
const compicon = document.getElementById("compicon");
const totalTdpSpan = document.getElementById("totalTdp");
const buildDateSpan = document.getElementById("build-date");
const buildAuthorSpan = document.getElementById("build-author");
const partsListSection = document.querySelector(".parts-list");

// Sidebar auth elements
const loggedOutView = document.getElementById("logged-out-view");
const loggedInView = document.getElementById("logged-in-view");
const sidebarUsername = document.getElementById("sidebar-username");
const signupBtnModal = document.getElementById("signup-btn-modal");
const loginBtnModal = document.getElementById("login-btn-modal");
const myBuildsBtn = document.getElementById("my-builds-btn");
const logoutBtn = document.getElementById("logout-btn");

// Auth Modal Elements
const loginModalOverlay = document.getElementById("loginModalOverlay");
const registerModalOverlay = document.getElementById("registerModalOverlay");
const myBuildsModalOverlay = document.getElementById("myBuildsModalOverlay");

const closeLoginModalBtn = document.getElementById("closeLoginModal");
const closeRegisterModalBtn = document.getElementById("closeRegisterModal");
const closeMyBuildsModalBtn = document.getElementById("closeMyBuildsModal");

const loginFormModal = document.getElementById("loginFormModal");
const registerFormModal = document.getElementById("registerFormModal");

const loginErrorModal = document.getElementById("loginErrorModal");
const registerErrorModal = document.getElementById("registerErrorModal");
const myBuildsError = document.getElementById("myBuildsError");

const switchToRegisterModalLink = document.getElementById(
  "switchToRegisterModal"
);
const switchToLoginModalLink = document.getElementById("switchToLoginModal");

const myBuildsListContainer = document.getElementById("myBuildsListContainer");
const myBuildsLoader = document.getElementById("myBuildsLoader");

const generateDescriptionBtn = document.getElementById(
  "generateDescriptionBtn"
);
const getCompatibilityAdviceBtn = document.getElementById(
  "getCompatibilityAdviceBtn"
);
const estimatePerformanceBtn = document.getElementById(
  "estimatePerformanceBtn"
);
const compatibilityAdvisorTriggerSection = document.getElementById(
  "compatibilityAdvisorTriggerSection"
);

const geminiResponseModalOverlay = document.getElementById(
  "geminiResponseModalOverlay"
);
const geminiResponseModalTitle = document.getElementById(
  "geminiResponseModalTitle"
);
const geminiResponseLoader = document.getElementById("geminiResponseLoader");
const geminiResponseModalOutput = document.getElementById(
  "geminiResponseModalOutput"
);
const closeGeminiResponseModalBtn = document.getElementById(
  "closeGeminiResponseModal"
);

const productDetailModalOverlay = document.getElementById(
  "productDetailModalOverlay"
);
const productDetailModalTitleElement = document.getElementById(
  "productDetailModalTitle"
);
const closeProductDetailModalBtn = document.getElementById(
  "closeProductDetailModal"
);
const productDetailMainImage = document.getElementById(
  "productDetailMainImage"
);
const productDetailThumbnailsContainer = document.getElementById(
  "productDetailThumbnails"
);
const productDetailName = document.getElementById("productDetailName");
const productDetailCategoryElement = document.getElementById(
  "productDetailCategoryValue"
);
const productDetail3DIcon = document.getElementById("productDetail3DIcon");
let productDetailAddToBuildBtn;
const productDetailMerchantsContainer = document.getElementById(
  "productDetailMerchants"
);
const productDetailSpecsTableBody = document.querySelector(
  "#productDetailSpecs table tbody"
);
let currentBuildNumericTotalPrice = 0; // Variable to store the numeric total price

function formatComplexValue(value, baseKeyPath) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    const keySuffix = baseKeyPath.split(".").pop().toLowerCase();
    if (keySuffix.includes("pcie_slots") || keySuffix.includes("pci_e_slots")) {
      return (
        value
          .map((slot) => {
            let slotInfo = [];
            if (slot.quantity) slotInfo.push(`${slot.quantity}x`);
            if (slot.type) slotInfo.push(slot.type);
            else if (slot.gen) slotInfo.push(`PCIe ${slot.gen}`);
            if (slot.lanes) slotInfo.push(`x${slot.lanes}`);
            return slotInfo.filter(Boolean).join(" ");
          })
          .filter(Boolean)
          .join("; ") || "-"
      );
    }
    if (keySuffix.includes("m_2_slots") || keySuffix.includes("m2_slots")) {
      return (
        value
          .map((slot) => {
            let slotInfo = `M.2`;
            if (slot.key) slotInfo += ` Key-${slot.key}`;
            if (slot.size) slotInfo += ` Size-${slot.size}`;
            if (slot.interface) slotInfo += ` (${slot.interface})`;
            return slotInfo;
          })
          .filter(Boolean)
          .join("; ") || "-"
      );
    }
    if (value.every((item) => typeof item !== "object" || item === null)) {
      return value.join(", ");
    }
    return null;
  }
  if (typeof value === "object") {
    const keySuffix = baseKeyPath.split(".").pop().toLowerCase();
    if (
      keySuffix === "resolution" &&
      value.horizontalRes &&
      value.verticalRes
    ) {
      return `${value.horizontalRes}x${value.verticalRes}`;
    }
    if (keySuffix === "onboard_ethernet" && value.speed) {
      let ethInfo = value.speed;
      if (value.controller && value.controller.toLowerCase() !== "unknown")
        ethInfo += ` (${value.controller})`;
      return ethInfo;
    }
    if (keySuffix.includes("clocks") && value.base) {
      let clockStr = `Base: ${value.base}${value.unit || "GHz"}`;
      if (value.boost)
        clockStr += `, Boost: ${value.boost}${value.unit || "GHz"}`;
      return clockStr;
    }
    return null;
  }
  return String(value);
}

export function showProductDetails(product) {
  if (!product || !productDetailModalOverlay) {
    console.warn("showProductDetails: product or modal elements are undefined");
    return;
  }
  const s = product.specs || {};
  const productName = getProductDisplayTitle(s);
  const primaryImageUrl = getBuildImage(product);

  if (productDetailModalTitleElement)
    productDetailModalTitleElement.textContent =
      getTranslation("part_details_title_modal", undefined, {
        partName: productName,
      }) || productName;
  if (productDetailName) productDetailName.textContent = productName;

  if (productDetailCategoryElement) {
    const categoryText =
      getTranslation(product.category) ||
      product.category ||
      getTranslation("category_na") ||
      "N/A";
    productDetailCategoryElement.textContent = categoryText;
  }
  if (productDetail3DIcon) {
    productDetail3DIcon.style.display =
      s.supports3D || product.supports3D ? "inline" : "none";
  }
  if (productDetailMainImage) {
    productDetailMainImage.src = primaryImageUrl;
    productDetailMainImage.alt = productName;
  }

  if (productDetailThumbnailsContainer) {
    productDetailThumbnailsContainer.innerHTML = "";
    let imageUrls = [];
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      imageUrls = product.images;
    } else if (product.storeImg && typeof product.storeImg === "object") {
      Object.values(product.storeImg).forEach((url) => {
        if (typeof url === "string") imageUrls.push(url);
      });
    }
    if (imageUrls.length === 0 && primaryImageUrl) {
      imageUrls.push(primaryImageUrl);
    }
    imageUrls = [...new Set(imageUrls)];
    imageUrls.forEach((url, index) => {
      if (!url) return;
      const thumb = document.createElement("img");
      thumb.src = url;
      thumb.alt = `${
        getTranslation("thumbnail_alt_prefix") || "Thumbnail for"
      } ${productName} ${index + 1}`;
      if (url === primaryImageUrl) thumb.classList.add("active");
      thumb.addEventListener("click", () => {
        if (productDetailMainImage) productDetailMainImage.src = url;
        productDetailThumbnailsContainer
          .querySelectorAll("img")
          .forEach((img) => img.classList.remove("active"));
        thumb.classList.add("active");
      });
      productDetailThumbnailsContainer.appendChild(thumb);
    });
    if (imageUrls.length <= 1) {
      productDetailThumbnailsContainer.style.display = "none";
    } else {
      productDetailThumbnailsContainer.style.display = "flex";
    }
  }

  if (productDetailMerchantsContainer) {
    productDetailMerchantsContainer.innerHTML = "";
    let merchantsRendered = false;
    if (product.prices?.Ekua !== undefined && product.prices?.Ekua !== null) {
      const priceEkua = product.prices.Ekua;
      const urlEkua = product.storeIds?.Ekua;
      if (typeof priceEkua === "number") {
        const merchantRow = document.createElement("div");
        merchantRow.className = "merchant-row";
        merchantRow.innerHTML = `
            <span class="merchant-name">Ek.ua</span>
            <span class="merchant-availability">${
              getTranslation("availability_in_stock") || "In Stock"
            }</span>
            <span class="merchant-price">₴${priceEkua
              .toFixed(2)
              .replace(".", ",")}</span>
            ${
              urlEkua
                ? `<a href="${
                    urlEkua.startsWith("http")
                      ? urlEkua
                      : "https://ek.ua/ua/search/?kof=" + urlEkua
                  }" target="_blank" rel="noopener noreferrer" class="merchant-buy-btn">${getTranslation(
                    "buy_button_text"
                  )}</a>`
                : ""
            }
        `;
        productDetailMerchantsContainer.appendChild(merchantRow);
        merchantsRendered = true;
      }
    }
    if (!merchantsRendered) {
      productDetailMerchantsContainer.innerHTML = `<p>${
        getTranslation("no_price_data_available") ||
        "No pricing data available."
      }</p>`;
    }
  }

  if (productDetailSpecsTableBody) {
    productDetailSpecsTableBody.innerHTML = "";
    const EXCLUDE_SPECS_KEYS = new Set([
      "opendb_id",
      "_id",
      "category",
      "__v",
      "updatedAt",
      "createdAt",
      "storeImg",
      "storeIds",
      "storeUrls",
      "prices",
      "metadata",
      "compatible",
      "supports3D",
      "general_product_information",
      "images",
    ]);
    const specOrder = [
      "manufacturer",
      "series",
      "model",
      "form_factor",
      "socket",
      "chipset",
      "cores.total",
      "threads",
      "clocks.performance.base",
      "clocks.performance.boost",
      "memory",
      "memory_type",
      "speed",
      "modules.quantity",
      "modules.capacity_gb",
      "cas_latency",
      "capacity",
      "type",
      "interface",
      "nvme",
      "wattage",
      "efficiency_rating",
      "modular",
      "length_mm",
      "max_video_card_length",
      "max_cpu_cooler_height_mm",
      "side_panel",
      "color",
      "height_mm",
      "water_cooled",
      "radiator_size_mm",
      "fan_rpm",
      "screen_size",
      "resolution",
      "refresh_rate",
      "panel_type",
      "response_time_ms",
      "size_mm",
      "quantity",
      "pwm",
      "led",
      "max_video_capture_resolution",
      "host_interface",
      "audio",
      "pcie_slots",
      "m_2_slots",
      "onboard_ethernet",
      "channels",
      "sample_rate_khz",
      "protocol",
    ];
    const displayedSpecs = new Set();

    function addSpecRow(keyText, value, isNestedGroupTitle = false) {
      if (value === null || value === undefined) {
        if (typeof value === "string" && value.trim() === "") return;
        if (typeof value !== "string" && !isNestedGroupTitle) return;
      }
      const row = productDetailSpecsTableBody.insertRow();
      const cellKey = row.insertCell();
      const cellValue = row.insertCell();
      cellKey.textContent = keyText;
      if (isNestedGroupTitle) {
        cellKey.colSpan = 2;
        cellKey.style.fontWeight = "bold";
        cellKey.style.paddingTop = "0.5em";
        if (keyText.includes(".")) cellKey.style.paddingLeft = "1em";
      } else {
        if (typeof value === "boolean") {
          cellValue.textContent = value
            ? getTranslation("yes_filter")
            : getTranslation("no_filter");
        } else {
          cellValue.textContent = value;
        }
      }
    }

    function displaySpecsRecursive(obj, parentPath = "", indentLevel = 0) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !EXCLUDE_SPECS_KEYS.has(key)) {
          const currentValue = obj[key];
          const currentPath = parentPath ? `${parentPath}.${key}` : key;
          const translationKey = `spec_key_${currentPath
            .replace(/\./g, "_")
            .toLowerCase()}`;
          const displayKeyText =
            getTranslation(translationKey) ||
            key
              .replace(/_/g, " ")
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
          if (!displayedSpecs.has(currentPath)) {
            const formattedValue = formatComplexValue(
              currentValue,
              currentPath
            );
            if (formattedValue === null) {
              addSpecRow(displayKeyText, null, true);
              displayedSpecs.add(currentPath);
              displaySpecsRecursive(currentValue, currentPath, indentLevel + 1);
            } else {
              const row = productDetailSpecsTableBody.insertRow();
              const cellKey = row.insertCell();
              const cellValue = row.insertCell();
              cellKey.textContent = displayKeyText;
              cellValue.textContent = formattedValue;
              if (indentLevel > 0)
                cellKey.style.paddingLeft = `${indentLevel}em`;
              displayedSpecs.add(currentPath);
            }
          }
        }
      }
    }
    specOrder.forEach((path) => {
      const value = getNestedValue(s, path);
      const firstSegment = path.split(".")[0];
      if (!EXCLUDE_SPECS_KEYS.has(firstSegment) && !displayedSpecs.has(path)) {
        const formattedValue = formatComplexValue(value, path);
        const displayKeyText =
          getTranslation(
            `spec_key_${path.replace(/\./g, "_").toLowerCase()}`
          ) ||
          path
            .split(".")
            .pop()
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
        if (formattedValue === null) {
          addSpecRow(displayKeyText, null, true);
          displayedSpecs.add(path);
          displaySpecsRecursive(value, path, 1);
        } else if (formattedValue !== "") {
          addSpecRow(displayKeyText, formattedValue);
          displayedSpecs.add(path);
        }
      }
    });
    displaySpecsRecursive(s);
  }

  let currentDetailModalAddToBuildButton = document.getElementById(
    "productDetailAddToBuildBtn"
  );
  if (currentDetailModalAddToBuildButton) {
    const newBtn = currentDetailModalAddToBuildButton.cloneNode(true);
    const btnTextSpan = newBtn.querySelector("span");
    if (btnTextSpan) {
      btnTextSpan.textContent = getTranslation("add_to_build_btn_modal");
    } else {
      newBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${getTranslation(
        "add_to_build_btn_modal"
      )}`;
    }
    if (currentDetailModalAddToBuildButton.parentNode) {
      currentDetailModalAddToBuildButton.parentNode.replaceChild(
        newBtn,
        currentDetailModalAddToBuildButton
      );
      productDetailAddToBuildBtn = newBtn;
    } else {
      const actionsContainer = productDetailModalOverlay?.querySelector(
        ".product-detail-main-actions"
      );
      if (actionsContainer) {
        actionsContainer.innerHTML = "";
        actionsContainer.appendChild(newBtn);
        productDetailAddToBuildBtn = newBtn;
      } else {
        console.error(
          "Не удалось найти контейнер для кнопки 'Add to Build' в модальном окне."
        );
      }
    }
    productDetailAddToBuildBtn.onclick = () => {
      window.dispatchEvent(
        new CustomEvent("add-component", {
          detail: { category: product.category, product },
        })
      );
      window.dispatchEvent(new Event("buildUpdated"));
      if (productDetailModalOverlay)
        productDetailModalOverlay.style.display = "none";
      document.body.style.overflow = "";
    };
  } else {
    console.error(
      "Кнопка 'productDetailAddToBuildBtn' не найдена в DOM при вызове showProductDetails."
    );
  }

  if (productDetailModalOverlay)
    productDetailModalOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function toggleMainLoader(show) {
  if (mainBuildLoaderOverlay) {
    mainBuildLoaderOverlay.style.display = show ? "flex" : "none";
    const loaderText = mainBuildLoaderOverlay.querySelector("p");
    if (loaderText) {
      translateDynamicElement(loaderText, "loading_build_data");
    }
  }
}

export function checkCompatibility(parts) {
  const cpu = parts["CPU"];
  const motherboard = parts["Motherboard"];
  const ram = parts["RAM"];
  const psu = parts["PSU"];
  const pcCase = parts["PCCase"];
  const cpuCooler = parts["CPUCooler"];
  const gpu = parts["GPU"];

  function eqIgnoreCase(a, b) {
    return (
      String(a || "")
        .trim()
        .toLowerCase() ===
      String(b || "")
        .trim()
        .toLowerCase()
    );
  }
  let calculatedTotalTdp = 0;
  Object.values(parts).forEach((p) => {
    if (p && p.specs) {
      let tdpVal =
        typeof p.specs.tdp === "number"
          ? p.specs.tdp
          : typeof p.specs.specifications?.tdp === "number"
          ? p.specs.specifications.tdp
          : typeof p.specs.tdp_w === "number"
          ? p.specs.tdp_w
          : { Motherboard: 70, RAM: 15, CPUCooler: 5, Storage: 10 }[
              p.category
            ] || 0;
      calculatedTotalTdp += tdpVal;
    }
  });
  calculatedTotalTdp += 50;
  if (cpu && motherboard) {
    const cpuSocket = cpu.specs?.socket;
    const mbSocket = motherboard.specs?.socket;
    if (cpuSocket && mbSocket && !eqIgnoreCase(cpuSocket, mbSocket))
      return false;
  }
  if (ram && motherboard) {
    const ramType = ram.specs?.ram_type || ram.specs?.type;
    const mbRamType = motherboard.specs?.memory?.ram_type;
    if (ramType && mbRamType && !eqIgnoreCase(ramType, mbRamType)) return false;
    if (
      typeof ram.specs?.registered === "boolean" &&
      typeof motherboard.specs?.memory?.supports_registered_ram === "boolean"
    ) {
      if (
        ram.specs.registered &&
        !motherboard.specs.memory.supports_registered_ram
      )
        return false;
    }
    if (
      typeof ram.specs?.ecc === "boolean" &&
      typeof motherboard.specs?.memory?.supports_ecc_ram === "boolean"
    ) {
      if (ram.specs.ecc && !motherboard.specs.memory.supports_ecc_ram)
        return false;
    }
    const totalRamCapacity = ram.specs?.capacity;
    const mbMaxRam =
      motherboard.specs?.memory?.max_gb || motherboard.specs?.memory?.max;
    if (totalRamCapacity && mbMaxRam && totalRamCapacity > mbMaxRam)
      return false;
    const ramModules = ram.specs?.modules?.quantity || 1;
    const mbRamSlots = motherboard.specs?.memory?.slots;
    if (mbRamSlots && ramModules > mbRamSlots) return false;
  }
  if (cpuCooler && cpu) {
    const coolerSockets = cpuCooler.specs?.cpu_sockets || [];
    const cpuSocket = cpu.specs?.socket;
    if (
      cpuSocket &&
      coolerSockets.length > 0 &&
      !coolerSockets.some((s) => eqIgnoreCase(s, cpuSocket))
    )
      return false;
    if (pcCase?.specs?.max_cpu_cooler_height_mm && cpuCooler.specs?.height_mm) {
      if (cpuCooler.specs.height_mm > pcCase.specs.max_cpu_cooler_height_mm)
        return false;
    }
  }
  if (pcCase && motherboard) {
    const caseFormFactorRaw = pcCase.specs?.form_factor || "";
    const mbFormFactor = motherboard.specs?.form_factor;
    if (mbFormFactor) {
      let caseSupportsMb = false;
      if (Array.isArray(caseFormFactorRaw)) {
        caseSupportsMb = caseFormFactorRaw.some((ff) =>
          eqIgnoreCase(ff, mbFormFactor)
        );
      } else if (typeof caseFormFactorRaw === "string") {
        const caseFormFactors = caseFormFactorRaw.toLowerCase().split(/,\s*/);
        caseSupportsMb = caseFormFactors.includes(mbFormFactor.toLowerCase());
      }
      if (!caseSupportsMb) return false;
    }
    const maxGpuLength =
      pcCase.specs?.max_video_card_length_mm ||
      pcCase.specs?.max_video_card_length;
    if (
      gpu?.specs?.length_mm &&
      maxGpuLength &&
      gpu.specs.length_mm > maxGpuLength
    )
      return false;
  }
  if (psu) {
    const psuWattage = psu.specs?.wattage || psu.specs?.wattage_w;
    if (psuWattage && calculatedTotalTdp && psuWattage < calculatedTotalTdp)
      return false;
  }
  return true;
}

export function getProductDisplayTitle(specs) {
  if (!specs) return getTranslation("unknown_component");
  const name =
    specs.metadata?.name ||
    [specs.manufacturer, specs.series, specs.model].filter(Boolean).join(" ") ||
    specs.opendb_id ||
    getTranslation("unnamed_component");
  return name;
}

function getBuildImage(product) {
  return (
    product?.storeImg?.Ekua || product?.images?.[0] || "/img/placeholder.png"
  );
}

function getBuyLink(product) {
  const ekuaId = product?.storeIds?.Ekua;
  if (ekuaId) {
    return ekuaId.startsWith("http")
      ? ekuaId
      : `https://ek.ua/ua/search/?kof=${ekuaId}`;
  }
  return product?.storeUrls?.Ekua;
}

function updateTotal() {
  const sumPrice = Object.values(selectedParts).reduce((sum, p) => {
    if (!p || !p.prices) return sum;
    const price =
      p.prices.Ekua ??
      Object.values(p.prices).find((pr) => typeof pr === "number");
    return sum + (typeof price === "number" ? price : 0);
  }, 0);

  currentBuildNumericTotalPrice = sumPrice; // Store the numeric total price

  if (totalPriceSpan)
    totalPriceSpan.textContent = sumPrice.toFixed(2).replace(".", ",");
  let calculatedTotalTdp = 0;
  Object.values(selectedParts).forEach((p) => {
    if (p && p.specs) {
      let tdpVal =
        typeof p.specs.tdp === "number"
          ? p.specs.tdp
          : typeof p.specs.specifications?.tdp === "number"
          ? p.specs.specifications.tdp
          : typeof p.specs.tdp_w === "number"
          ? p.specs.tdp_w
          : { Motherboard: 70, RAM: 15, CPUCooler: 5, Storage: 10 }[
              p.category
            ] || 0;
      calculatedTotalTdp += tdpVal;
    }
  });
  calculatedTotalTdp += 50;
  if (totalTdpSpan) totalTdpSpan.textContent = calculatedTotalTdp;
  const compatible = checkCompatibility(selectedParts);
  if (compatibilitySpan && compicon) {
    if (compatible) {
      translateDynamicElement(
        compatibilitySpan,
        "compatibility_status_compatible"
      );
      compatibilitySpan.style.color = "#3b82f5";
      compicon.className = "fa fa-check-circle";
      compicon.style.color = "#3b82f5";
      if (compatibilityAdvisorTriggerSection)
        compatibilityAdvisorTriggerSection.style.display = "none";
    } else {
      translateDynamicElement(
        compatibilitySpan,
        "compatibility_status_incompatible"
      );
      compatibilitySpan.style.color = "var(--error-color)";
      compicon.className = "fa fa-times-circle";
      compicon.style.color = "var(--error-color)";
      if (compatibilityAdvisorTriggerSection)
        compatibilityAdvisorTriggerSection.style.display = "block";
    }
  }
  const currentBuildNameDisplay = document.getElementById("current-build-name");
  const currentBuildPriceDisplay = document.getElementById(
    "current-build-price"
  );
  if (currentBuildNameDisplay && buildNameElement)
    currentBuildNameDisplay.textContent = buildNameElement.textContent;
  if (currentBuildPriceDisplay)
    currentBuildPriceDisplay.textContent = `₴ ${sumPrice
      .toFixed(2)
      .replace(".", ",")}`;
}

function renderPart(category, product) {
  if (!product || !product.specs) {
    console.warn(
      `Продукт или его характеристики для категории "${category}" не определены.`
    );
    delete selectedParts[category];
    const container = document.querySelector(
      `.part-category[data-cat="${category}"]`
    );
    if (container) {
      container.querySelectorAll(".selected-part").forEach((el) => el.remove());
      const addBtn = container.querySelector(".add-btn");
      if (addBtn) {
        const categoryTitleElement = container.querySelector("h3");
        const categoryTitle = categoryTitleElement
          ? getTranslation(
              categoryTitleElement.dataset.translateCategory || category
            )
          : getTranslation(category);
        addBtn.textContent = `${getTranslation(
          "add_btn_prefix"
        )}${categoryTitle}`;
        addBtn.classList.remove("swap-btn");
      }
    }
    updateTotal();
    return;
  }
  selectedParts[category] = product;
  const container = document.querySelector(
    `.part-category[data-cat="${category}"]`
  );
  if (!container) return;
  container.querySelectorAll(".selected-part").forEach((el) => el.remove());
  const addBtn = container.querySelector(".add-btn");
  if (addBtn) {
    addBtn.textContent = getTranslation("swap_btn_text");
    addBtn.classList.add("swap-btn");
  }
  const title = getProductDisplayTitle(product.specs);
  const imgUrl = getBuildImage(product);
  const price = product.prices?.Ekua ?? 0;
  const buyLink = getBuyLink(product);
  const partDiv = document.createElement("div");
  partDiv.className = "selected-part";
  partDiv.dataset.productId = product.opendb_id;
  partDiv.innerHTML = `
    <img src="${imgUrl}" alt="${title}" class="sp-thumb" onerror="this.src='/img/placeholder.png'" />
    <div class="sp-info">
      <div class="sp-title multiline-truncate-part">${title}</div>
      <div class="sp-buy-sec">
        <div class="sp-price"><p>₴${price
          .toFixed(2)
          .replace(".", ",")}</p></div>
        <div class="sp-actions">
          ${
            buyLink
              ? `<a href="${buyLink}" target="_blank" rel="noopener noreferrer" class="sp-buy">${getTranslation(
                  "buy_button_text"
                )}</a>`
              : `<span class="sp-buy-na" style="font-size: 0.8em; color: #999;">N/A</span>`
          }
          <button class="sp-remove" title="${
            getTranslation("remove_button_title") || "Видалити"
          }">&times;</button>
        </div>
      </div>
    </div>
  `;
  container.append(partDiv);
  updateTotal();
}

if (partsListSection) {
  partsListSection.addEventListener("click", (e) => {
    const selectedPartElement = e.target.closest(".selected-part");
    const isRemoveButton = e.target.closest(".sp-remove");
    const isBuyButton = e.target.closest(".sp-buy");
    const isAddButton = e.target.closest(".add-btn");
    if (
      selectedPartElement &&
      !isRemoveButton &&
      !isBuyButton &&
      !isAddButton
    ) {
      const categoryElement = selectedPartElement.closest(".part-category");
      if (categoryElement) {
        const category = categoryElement.dataset.cat;
        const product = selectedParts[category];
        if (product) {
          showProductDetails(product);
        } else {
          console.warn(
            "Product data not found for selected part in category:",
            category
          );
        }
      }
    } else if (isRemoveButton) {
      const catElement = isRemoveButton.closest(".part-category");
      if (!catElement) return;
      const cat = catElement.dataset.cat;
      delete selectedParts[cat];
      isRemoveButton.closest(".selected-part")?.remove();
      const addBtn = catElement.querySelector(".add-btn");
      if (addBtn) {
        const categoryTitleElement = catElement.querySelector("h3");
        const categoryKey =
          categoryTitleElement?.dataset.translateCategory ||
          catElement?.dataset.cat ||
          "Part";
        const categoryName = getTranslation(categoryKey);
        addBtn.textContent = `${getTranslation(
          "add_btn_prefix"
        )}${categoryName}`;
        addBtn.classList.remove("swap-btn");
      }
      updateTotal();
      window.dispatchEvent(new Event("buildUpdated"));
    }
  });
}

window.addEventListener("add-component", ({ detail }) => {
  if (detail && detail.category && detail.product) {
    renderPart(detail.category, detail.product);
    window.dispatchEvent(new Event("buildUpdated"));
  }
});

function getCurrentPartsData() {
  return Object.values(selectedParts)
    .map((p) => p.opendb_id)
    .filter((id) => id);
}

async function loadBuildList(selectBuildId = null) {
  // Added parameter to optionally select a build
  if (!buildSelector) return; // Exit if buildSelector is not on the page
  toggleMainLoader(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      buildSelector.innerHTML = `<option value="">${getTranslation(
        "please_login_to_see_builds"
      )}</option>`;
      return;
    }
    const res = await fetch(API.list, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(
        `${getTranslation("error_loading_build_list_status")}: ${res.status}`
      );
    const list = await res.json();

    if (list.length === 0) {
      buildSelector.innerHTML = `<option value="">${getTranslation(
        "no_builds_found"
      )}</option>`;
    } else {
      buildSelector.innerHTML = list
        .map((b) => `<option value="${b._id}">${b.name}</option>`)
        .join("");
      if (
        selectBuildId &&
        buildSelector.querySelector(`option[value="${selectBuildId}"]`)
      ) {
        buildSelector.value = selectBuildId; // Select the specified build
      } else if (buildSelector.options.length > 0) {
        // buildSelector.value = buildSelector.options[0].value; // Default to first if no specific selection
      }
    }
  } catch (error) {
    console.error(getTranslation("error_loading_build_list"), error);
    buildSelector.innerHTML = `<option value="">${getTranslation(
      "error_loading_build_list"
    )}</option>`;
  } finally {
    toggleMainLoader(false);
  }
}

async function loadBuild(id) {
  const token = localStorage.getItem("token");
  const currentUser = token ? parseJwt(token) : null;
  const currentUsername = currentUser
    ? currentUser.username
    : getTranslation("anonymous_author");

  if (!id) {
    Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
    document.querySelectorAll(".selected-part").forEach((el) => el.remove());
    document.querySelectorAll(".part-category .add-btn").forEach((btn) => {
      const catElement = btn.closest(".part-category");
      const categoryKey =
        catElement?.querySelector("h3")?.dataset.translateCategory ||
        catElement?.dataset.cat ||
        "Part";
      const categoryName = getTranslation(categoryKey);
      btn.textContent = `${getTranslation("add_btn_prefix")}${categoryName}`;
      btn.classList.remove("swap-btn");
    });
    if (buildNameElement)
      buildNameElement.textContent = getTranslation("new_build_default_name");
    if (buildDateSpan)
      buildDateSpan.textContent = new Date().toLocaleDateString(
        currentLanguage === "uk" ? "uk-UA" : "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      );
    if (buildAuthorSpan) {
      buildAuthorSpan.textContent =
        currentUsername || getTranslation("you_author_placeholder");
    }
    updateTotal(); // This will also update currentBuildNumericTotalPrice to 0
    if (geminiResponseModalOutput) geminiResponseModalOutput.value = "";
    currentBuildId = null;
    if (buildSelector) buildSelector.value = ""; // Clear selection in dropdown for new build
    return;
  }

  toggleMainLoader(true);
  if (geminiResponseModalOutput) geminiResponseModalOutput.value = "";

  try {
    if (!token) return;
    const res = await fetch(API.load(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(
        `${getTranslation("error_loading_build_status")}: ${res.status}`
      );
    const cfg = await res.json();

    currentBuildId = cfg._id;
    if (buildNameElement) buildNameElement.textContent = cfg.name;
    if (buildDateSpan)
      buildDateSpan.textContent = new Date(
        cfg.createdAt || Date.now()
      ).toLocaleDateString(currentLanguage === "uk" ? "uk-UA" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (buildAuthorSpan) {
      buildAuthorSpan.textContent =
        cfg.authorName || getTranslation("anonymous_author");
    }
    if (buildSelector) buildSelector.value = cfg._id; // Ensure dropdown reflects loaded build

    Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
    document.querySelectorAll(".selected-part").forEach((el) => el.remove());
    document.querySelectorAll(".part-category .add-btn").forEach((btn) => {
      const catElement = btn.closest(".part-category");
      const categoryKey =
        catElement?.querySelector("h3")?.dataset.translateCategory ||
        catElement?.dataset.cat ||
        "Part";
      const categoryName = getTranslation(categoryKey);
      btn.textContent = `${getTranslation("add_btn_prefix")}${categoryName}`;
      btn.classList.remove("swap-btn");
    });

    if (cfg.components && cfg.components.length > 0) {
      const productsPromises = cfg.components.map((cid) =>
        fetch(API.component(cid), {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => {
          if (!r.ok) {
            console.error(
              `${getTranslation("error_loading_component_status")} ${cid}: ${
                r.status
              }`
            );
            return null;
          }
          return r.json();
        })
      );
      const products = (await Promise.all(productsPromises)).filter((p) => p);
      products.forEach((p) => {
        if (p && p.category) renderPart(p.category, p);
        else console.warn("Отримано недійсний або неповний компонент:", p);
      });
    }
    updateTotal(); // This will also update currentBuildNumericTotalPrice based on loaded parts
  } catch (error) {
    console.error(getTranslation("error_loading_build_status"), error);
  } finally {
    toggleMainLoader(false);
  }
}

if (newBuildBtn) {
  newBuildBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showLoginModal(); // Show login modal if not logged in
      return;
    }
    toggleMainLoader(true);
    try {
      const defaultBuildName = `${
        getTranslation("new_build_default_name_prefix") || "Нова збірка"
      } ${new Date().toLocaleTimeString(
        currentLanguage === "uk" ? "uk-UA" : "en-US",
        { hour: "2-digit", minute: "2-digit" }
      )}`;
      const res = await fetch(API.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: defaultBuildName,
          components: [],
          totalPrice: 0,
        }), // Explicitly set totalPrice to 0
      });
      if (!res.ok)
        throw new Error(
          `${getTranslation("error_creating_build_status")}: ${res.status}`
        );
      const b = await res.json();
      await loadBuildList(b._id); // Pass new build ID to select it
      await loadBuild(b._id);
    } catch (error) {
      console.error(getTranslation("error_creating_build_status"), error);
      alert(getTranslation("alert_error_creating_build"));
    } finally {
      toggleMainLoader(false);
    }
  });
}

if (buildSelector) {
  buildSelector.addEventListener("change", () => {
    if (buildSelector.value && buildSelector.value !== "") {
      loadBuild(buildSelector.value);
    }
  });
}

if (buildNameElement) {
  buildNameElement.addEventListener("blur", async () => {
    const newName =
      buildNameElement.textContent.trim() ||
      getTranslation("unnamed_build_placeholder");
    buildNameElement.textContent = newName;
    if (!currentBuildId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const optionInSelector = buildSelector?.querySelector(
      `option[value="${currentBuildId}"]`
    );
    if (optionInSelector) optionInSelector.textContent = newName;
    const currentBuildNameDisplay =
      document.getElementById("current-build-name");
    if (currentBuildNameDisplay) currentBuildNameDisplay.textContent = newName;
    try {
      // When name is updated, we might also want to save the current totalPrice
      // However, the primary trigger for totalPrice update is component change via "buildUpdated"
      await fetch(API.update(currentBuildId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }), // Only send name if only name changed
      });
    } catch (error) {
      console.error("Помилка оновлення назви збірки:", error);
    }
  });
}

window.addEventListener("buildUpdated", async () => {
  if (!currentBuildId || isSaving) return;
  isSaving = true;
  const token = localStorage.getItem("token");
  if (!token) {
    isSaving = false;
    return;
  }
  const buildDataToSave = {
    components: getCurrentPartsData(),
    totalPrice: currentBuildNumericTotalPrice, // Send the numeric total price
  };
  try {
    await fetch(API.update(currentBuildId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildDataToSave),
    });
  } catch (e) {
    console.error("Помилка автозбереження:", e);
  } finally {
    isSaving = false;
  }
});

async function showGeminiResponseInModal(
  modalTitleKey,
  prompt,
  triggerButtonElement
) {
  if (
    !geminiResponseModalOverlay ||
    !geminiResponseModalTitle ||
    !geminiResponseLoader ||
    !geminiResponseModalOutput
  ) {
    console.error(
      "Один або декілька елементів модального вікна Gemini не знайдено."
    );
    return;
  }
  const tempDetailContent = geminiResponseModalOverlay.querySelector(
    ".temp-detail-content"
  );
  if (tempDetailContent) tempDetailContent.style.display = "none";
  if (geminiResponseModalOutput.tagName === "TEXTAREA") {
    geminiResponseModalOutput.style.display = "block";
  }
  translateDynamicElement(geminiResponseModalTitle, modalTitleKey);
  const loaderTextElement = geminiResponseLoader.querySelector("p");
  if (loaderTextElement)
    translateDynamicElement(loaderTextElement, "processing_request");
  geminiResponseModalOutput.value = "";
  geminiResponseLoader.style.display = "flex";
  geminiResponseModalOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  if (triggerButtonElement) triggerButtonElement.disabled = true;
  try {
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
    const apiKey = "AIzaSyAAtZYb30LUDpGEQ4JcF_9oEejBbnXN4g8"; // Replace with your actual API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `${getTranslation("api_error_prefix")}: ${
          errorData.error?.message || response.status
        }`
      );
    }
    const result = await response.json();
    if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
      geminiResponseModalOutput.value =
        result.candidates[0].content.parts[0].text.trim();
    } else {
      geminiResponseModalOutput.value = getTranslation(
        "gemini_error_unexpected_response"
      );
    }
  } catch (error) {
    console.error("Помилка при взаємодії з Gemini API:", error);
    geminiResponseModalOutput.value = `${getTranslation("error_prefix")}: ${
      error.message
    }. ${getTranslation("check_console_details")}`;
  } finally {
    if (geminiResponseLoader) geminiResponseLoader.style.display = "none";
    if (triggerButtonElement) triggerButtonElement.disabled = false;
  }
}

if (closeGeminiResponseModalBtn) {
  closeGeminiResponseModalBtn.addEventListener("click", () => {
    if (geminiResponseModalOverlay)
      geminiResponseModalOverlay.style.display = "none";
    document.body.style.overflow = "";
    const tempContent = geminiResponseModalOverlay.querySelector(
      ".temp-detail-content"
    );
    if (tempContent) tempContent.style.display = "none";
    if (
      geminiResponseModalOutput &&
      geminiResponseModalOutput.tagName === "TEXTAREA"
    ) {
      geminiResponseModalOutput.style.display = "block";
    }
  });
}
if (geminiResponseModalOverlay) {
  geminiResponseModalOverlay.addEventListener("click", (event) => {
    if (event.target === geminiResponseModalOverlay) {
      geminiResponseModalOverlay.style.display = "none";
      document.body.style.overflow = "";
      const tempContent = geminiResponseModalOverlay.querySelector(
        ".temp-detail-content"
      );
      if (tempContent) tempContent.style.display = "none";
      if (
        geminiResponseModalOutput &&
        geminiResponseModalOutput.tagName === "TEXTAREA"
      ) {
        geminiResponseModalOutput.style.display = "block";
      }
    }
  });
}

if (closeProductDetailModalBtn) {
  closeProductDetailModalBtn.addEventListener("click", () => {
    if (productDetailModalOverlay)
      productDetailModalOverlay.style.display = "none";
    document.body.style.overflow = "";
  });
}
if (productDetailModalOverlay) {
  productDetailModalOverlay.addEventListener("click", (event) => {
    if (event.target === productDetailModalOverlay) {
      productDetailModalOverlay.style.display = "none";
      document.body.style.overflow = "";
    }
  });
}

async function handleGenerateDescription() {
  if (Object.keys(selectedParts).length === 0) {
    alert(getTranslation("alert_add_components_for_description"));
    return;
  }
  const partDetails = Object.entries(selectedParts)
    .map(([category, part]) => {
      return `${getTranslation(category)}: ${getProductDisplayTitle(
        part.specs
      )}`;
    })
    .join("\n- ");
  const promptTextMain = getTranslation(
    currentLanguage === "uk"
      ? "prompt_generate_description_uk_template"
      : "prompt_generate_description_en_template"
  );
  const prompt = promptTextMain.replace("{partDetails}", partDetails);
  await showGeminiResponseInModal(
    "gemini_modal_title_description",
    prompt,
    generateDescriptionBtn
  );
}

async function handleGetCompatibilityAdvice() {
  if (Object.keys(selectedParts).length < 2) {
    alert(getTranslation("alert_add_min_two_components_for_compatibility"));
    return;
  }
  const crucialParts = ["CPU", "Motherboard", "RAM", "GPU", "PSU", "PCCase"];
  let componentsList =
    getTranslation("compatibility_components_list_header") + "\n";
  crucialParts.forEach((category) => {
    if (selectedParts[category]) {
      const part = selectedParts[category];
      let details = `${getTranslation(category)}: ${getProductDisplayTitle(
        part.specs
      )}`;
      if (category === "CPU" && part.specs?.socket)
        details += ` (${getTranslation("socket_label")}: ${part.specs.socket})`;
      if (category === "Motherboard" && part.specs?.socket)
        details += ` (${getTranslation("socket_label")}: ${part.specs.socket})`;
      if (category === "Motherboard" && part.specs?.chipset)
        details += ` (${getTranslation("chipset_label")}: ${
          part.specs.chipset
        })`;
      if (category === "Motherboard" && part.specs?.memory?.ram_type)
        details += ` (${getTranslation("ram_type_label")}: ${
          part.specs.memory.ram_type
        })`;
      if (category === "RAM" && part.specs?.type)
        details += ` (${getTranslation("type_label")}: ${part.specs.type})`;
      if (category === "GPU" && part.specs?.length_mm)
        details += ` (${getTranslation("length_label")}: ${
          part.specs.length_mm
        }мм)`;
      if (category === "PSU" && part.specs?.wattage)
        details += ` (${getTranslation("wattage_label")}: ${
          part.specs.wattage
        }Вт)`;
      if (category === "PCCase" && part.specs?.max_video_card_length_mm)
        details += ` (${getTranslation("max_gpu_length_label")}: ${
          part.specs.max_video_card_length_mm
        }мм)`;
      componentsList += `- ${details}\n`;
    }
  });
  const promptTextMain = getTranslation(
    currentLanguage === "uk"
      ? "prompt_compatibility_advice_uk_template"
      : "prompt_compatibility_advice_en_template"
  );
  const promptCompatibilityQuestion = getTranslation(
    "compatibility_advice_question"
  );
  const prompt = `${promptTextMain}\n${componentsList}\n${promptCompatibilityQuestion}`;
  await showGeminiResponseInModal(
    "gemini_modal_title_compatibility",
    prompt,
    getCompatibilityAdviceBtn
  );
}

async function handleEstimatePerformance() {
  if (Object.keys(selectedParts).length === 0) {
    alert(getTranslation("alert_add_components_for_performance"));
    return;
  }
  let componentsDetails =
    getTranslation("performance_components_list_header") + "\n";
  Object.entries(selectedParts).forEach(([category, part]) => {
    let details = `${getTranslation(category)}: ${getProductDisplayTitle(
      part.specs
    )}`;
    if (category === "CPU" && part.specs?.cores?.total)
      details += ` (${part.specs.cores.total} ${getTranslation(
        "cores_label"
      )}/${part.specs.cores.threads || part.specs.cores.total} ${getTranslation(
        "threads_label"
      )})`;
    if (category === "RAM" && part.specs?.capacity && part.specs?.ram_type)
      details += ` (${part.specs.capacity}GB ${part.specs.ram_type} ${
        part.specs.speed || part.specs.speed_mhz || ""
      }MHz)`;
    if (category === "GPU" && part.specs?.memory)
      details += ` (${part.specs.memory}GB VRAM)`;
    if (category === "Storage" && part.specs?.type && part.specs?.capacity)
      details += ` (${
        getTranslation(
          "spec_key_" +
            String(part.specs.type)
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/\./g, "_")
        ) || part.specs.type
      } ${part.specs.capacity}${part.specs.capacity_unit || "GB"})`;
    componentsDetails += `- ${details}\n`;
  });
  const promptTextMain = getTranslation(
    currentLanguage === "uk"
      ? "prompt_estimate_performance_uk_template"
      : "prompt_estimate_performance_en_template"
  );
  const prompt = `${promptTextMain}\n${componentsDetails}`;
  await showGeminiResponseInModal(
    "gemini_modal_title_performance",
    prompt,
    estimatePerformanceBtn
  );
}

// --- Auth Modal Logic ---
function showLoginModal() {
  if (loginModalOverlay) loginModalOverlay.style.display = "flex";
  if (registerModalOverlay) registerModalOverlay.style.display = "none";
  if (loginErrorModal) loginErrorModal.textContent = "";
  document.body.style.overflow = "hidden";
}
function closeLoginModal() {
  if (loginModalOverlay) loginModalOverlay.style.display = "none";
  document.body.style.overflow = "";
}
function showRegisterModal() {
  if (registerModalOverlay) registerModalOverlay.style.display = "flex";
  if (loginModalOverlay) loginModalOverlay.style.display = "none";
  if (registerErrorModal) registerErrorModal.textContent = "";
  document.body.style.overflow = "hidden";
}
function closeRegisterModal() {
  if (registerModalOverlay) registerModalOverlay.style.display = "none";
  document.body.style.overflow = "";
}

function updateAuthUI() {
  const token = localStorage.getItem("token");
  const currentUser = token ? parseJwt(token) : null;

  if (currentUser) {
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedInView.style.display = "flex";
    if (sidebarUsername)
      sidebarUsername.textContent = currentUser.username || "User";
    if (newBuildBtn) newBuildBtn.disabled = false;
    if (buildSelector) buildSelector.disabled = false;
    if (buildNameElement) buildNameElement.contentEditable = "true";
    document
      .querySelectorAll(".part-category .add-btn")
      .forEach((btn) => (btn.disabled = false));
    if (generateDescriptionBtn) generateDescriptionBtn.disabled = false;
    if (getCompatibilityAdviceBtn) getCompatibilityAdviceBtn.disabled = false;
    if (estimatePerformanceBtn) estimatePerformanceBtn.disabled = false;
  } else {
    if (loggedOutView) loggedOutView.style.display = "flex";
    if (loggedInView) loggedInView.style.display = "none";
    if (newBuildBtn) newBuildBtn.disabled = true;
    if (buildSelector) {
      buildSelector.disabled = true;
      buildSelector.innerHTML = `<option value="">${getTranslation(
        "login_to_start"
      )}</option>`;
    }
    if (buildNameElement) {
      buildNameElement.textContent = getTranslation("login_to_start");
      buildNameElement.contentEditable = "false";
    }
    document
      .querySelectorAll(".part-category .add-btn")
      .forEach((btn) => (btn.disabled = true));
    if (generateDescriptionBtn) generateDescriptionBtn.disabled = true;
    if (getCompatibilityAdviceBtn) getCompatibilityAdviceBtn.disabled = true;
    if (estimatePerformanceBtn) estimatePerformanceBtn.disabled = true;

    // Clear build specific info for logged out state
    if (totalPriceSpan) totalPriceSpan.textContent = "0";
    if (compatibilitySpan)
      translateDynamicElement(
        compatibilitySpan,
        "compatibility_status_unknown"
      );
    if (compicon) compicon.className = "fa fa-question-circle";
    if (totalTdpSpan) totalTdpSpan.textContent = "0";
    if (buildDateSpan) buildDateSpan.textContent = "—";
    if (buildAuthorSpan) buildAuthorSpan.textContent = "—";
    Object.keys(selectedParts).forEach((cat) => delete selectedParts[cat]);
    document.querySelectorAll(".selected-part").forEach((el) => el.remove());
    document.querySelectorAll(".part-category .add-btn").forEach((btn) => {
      const catElement = btn.closest(".part-category");
      const categoryKey =
        catElement?.querySelector("h3")?.dataset.translateCategory ||
        catElement?.dataset.cat ||
        "Part";
      const categoryName = getTranslation(categoryKey);
      btn.textContent = `${getTranslation("add_btn_prefix")}${categoryName}`;
      btn.classList.remove("swap-btn");
    });
    currentBuildId = null;
  }
}

if (loginBtnModal) loginBtnModal.addEventListener("click", showLoginModal);
if (signupBtnModal) signupBtnModal.addEventListener("click", showRegisterModal);
if (closeLoginModalBtn)
  closeLoginModalBtn.addEventListener("click", closeLoginModal);
if (loginModalOverlay)
  loginModalOverlay.addEventListener("click", (e) => {
    if (e.target === loginModalOverlay) closeLoginModal();
  });
if (closeRegisterModalBtn)
  closeRegisterModalBtn.addEventListener("click", closeRegisterModal);
if (registerModalOverlay)
  registerModalOverlay.addEventListener("click", (e) => {
    if (e.target === registerModalOverlay) closeRegisterModal();
  });

if (switchToRegisterModalLink)
  switchToRegisterModalLink.addEventListener("click", (e) => {
    e.preventDefault();
    showRegisterModal();
  });
if (switchToLoginModalLink)
  switchToLoginModalLink.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginModal();
  });

if (loginFormModal) {
  loginFormModal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginFormModal.loginEmail.value;
    const password = loginFormModal.loginPassword.value;
    if (loginErrorModal) loginErrorModal.textContent = "";

    try {
      const res = await fetch(API.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        updateAuthUI();
        closeLoginModal();
        await loadBuildList(); // Reload build list
        // Attempt to load the first build or create a new one if list is empty
        if (
          buildSelector &&
          buildSelector.options.length > 0 &&
          buildSelector.options[0].value
        ) {
          await loadBuild(buildSelector.options[0].value);
        } else if (newBuildBtn) {
          newBuildBtn.click(); // Create and load a new build
        }
      } else {
        if (loginErrorModal)
          loginErrorModal.textContent =
            data.message || getTranslation("error_login_failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (loginErrorModal)
        loginErrorModal.textContent = getTranslation("error_login_failed");
    }
  });
}

if (registerFormModal) {
  registerFormModal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = registerFormModal.registerUsername.value;
    const email = registerFormModal.registerEmail.value;
    const password = registerFormModal.registerPassword.value;
    if (registerErrorModal) registerErrorModal.textContent = "";

    try {
      const res = await fetch(API.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.userId) {
        alert(getTranslation("registration_successful"));
        showLoginModal(); // Switch to login modal after successful registration
      } else {
        if (registerErrorModal)
          registerErrorModal.textContent =
            data.message || getTranslation("error_registration_failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (registerErrorModal)
        registerErrorModal.textContent = getTranslation(
          "error_registration_failed"
        );
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    updateAuthUI();
    // Optionally, clear the current build or redirect
    loadBuild(null); // Load an empty/new build state
  });
}

// My Builds Modal Logic
async function showMyBuildsModal() {
  if (
    !myBuildsModalOverlay ||
    !myBuildsListContainer ||
    !myBuildsLoader ||
    !myBuildsError
  )
    return;
  myBuildsModalOverlay.style.display = "flex";
  myBuildsListContainer.innerHTML = "";
  myBuildsError.textContent = "";
  myBuildsLoader.style.display = "flex";
  translateDynamicElement(
    myBuildsLoader.querySelector("p"),
    "loading_my_builds"
  );
  document.body.style.overflow = "hidden";

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      myBuildsError.textContent = getTranslation("please_login_to_see_builds");
      return;
    }
    const res = await fetch(API.list, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(
        `${getTranslation("error_loading_build_list_status")}: ${res.status}`
      );
    const builds = await res.json();

    if (builds.length === 0) {
      myBuildsListContainer.innerHTML = `<p style="text-align:center; color: var(--fg-alt);">${getTranslation(
        "no_builds_to_display"
      )}</p>`;
    } else {
      builds.forEach((build) => {
        const item = document.createElement("div");
        item.className = "my-builds-item";
        item.innerHTML = `
                    <div class="my-builds-item-info">
                        <span class="my-builds-item-name">${
                          build.name ||
                          getTranslation("unnamed_build_placeholder")
                        }</span>
                        <span class="my-builds-item-date">${getTranslation(
                          "created_at_text"
                        )}: ${new Date(build.createdAt).toLocaleDateString(
          currentLanguage === "uk" ? "uk-UA" : "en-US"
        )}</span>
                        <span class="my-builds-item-price">₴ ${Number(
                          build.totalPrice || 0
                        )
                          .toFixed(2)
                          .replace(".", ",")}</span>
                    </div>
                    <div class="my-builds-item-actions">
                        <button class="load-build-btn-modal" data-id="${
                          build._id
                        }">${getTranslation("load_build_btn_modal")}</button>
                        <button class="delete-build-btn-modal" data-id="${
                          build._id
                        }" data-name="${
          build.name || getTranslation("unnamed_build_placeholder")
        }">${getTranslation("delete_build_btn_modal")}</button>
                    </div>
                `;
        myBuildsListContainer.appendChild(item);
      });
    }
  } catch (error) {
    console.error(getTranslation("error_loading_build_list"), error);
    myBuildsError.textContent = getTranslation("error_loading_build_list");
  } finally {
    if (myBuildsLoader) myBuildsLoader.style.display = "none";
  }
}

if (myBuildsBtn) myBuildsBtn.addEventListener("click", showMyBuildsModal);
if (closeMyBuildsModalBtn)
  closeMyBuildsModalBtn.addEventListener("click", () => {
    if (myBuildsModalOverlay) myBuildsModalOverlay.style.display = "none";
    document.body.style.overflow = "";
  });
if (myBuildsModalOverlay)
  myBuildsModalOverlay.addEventListener("click", (e) => {
    if (e.target === myBuildsModalOverlay) {
      myBuildsModalOverlay.style.display = "none";
      document.body.style.overflow = "";
    }
  });

if (myBuildsListContainer) {
  myBuildsListContainer.addEventListener("click", async (e) => {
    const target = e.target;
    const buildId = target.dataset.id;

    if (target.classList.contains("load-build-btn-modal") && buildId) {
      await loadBuild(buildId);
      if (myBuildsModalOverlay) myBuildsModalOverlay.style.display = "none";
      document.body.style.overflow = "";
    } else if (target.classList.contains("delete-build-btn-modal") && buildId) {
      const buildName = target.dataset.name;
      if (
        confirm(
          getTranslation("confirm_delete_build_message", undefined, {
            buildName,
          })
        )
      ) {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          const res = await fetch(API.update(buildId), {
            // Should be API.delete(buildId)
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(getTranslation("error_deleting_build"));
          alert(
            getTranslation("build_deleted_successfully", undefined, {
              buildName,
            })
          );
          showMyBuildsModal(); // Refresh list
          await loadBuildList(); // Refresh main dropdown
          if (currentBuildId === buildId) {
            // If deleted build was current, load new/empty
            loadBuild(null);
          }
        } catch (error) {
          console.error(getTranslation("error_deleting_build"), error);
          alert(getTranslation("error_deleting_build_generic"));
        }
      }
    }
  });
}

// Event Listeners for Gemini and other buttons
if (generateDescriptionBtn)
  generateDescriptionBtn.addEventListener("click", handleGenerateDescription);
if (getCompatibilityAdviceBtn)
  getCompatibilityAdviceBtn.addEventListener(
    "click",
    handleGetCompatibilityAdvice
  );
if (estimatePerformanceBtn)
  estimatePerformanceBtn.addEventListener("click", handleEstimatePerformance);

window.addEventListener("languageChanged", async (event) => {
  await translatePage(); // Ensure page elements are translated first
  updateAuthUI(); // Then update UI based on auth state, which might re-translate some elements

  const mainLoaderText = mainBuildLoaderOverlay?.querySelector("p");
  if (mainLoaderText)
    translateDynamicElement(mainLoaderText, "loading_build_data");

  const quickAddLoaderText = document
    .getElementById("quickAddLoader")
    ?.querySelector("p");
  if (quickAddLoaderText)
    translateDynamicElement(quickAddLoaderText, "loading_components");

  const geminiModalLoaderText = geminiResponseLoader?.querySelector("p");
  if (geminiModalLoaderText)
    translateDynamicElement(geminiModalLoaderText, "processing_request");

  const myBuildsLoaderText = myBuildsLoader?.querySelector("p");
  if (myBuildsLoaderText)
    translateDynamicElement(myBuildsLoaderText, "loading_my_builds");

  if (
    compatibilitySpan &&
    compatibilitySpan.textContent !==
      getTranslation("compatibility_status_unknown")
  ) {
    const isCompatible = compatibilitySpan.style.color === "var(--success)";
    translateDynamicElement(
      compatibilitySpan,
      isCompatible
        ? "compatibility_status_compatible"
        : "compatibility_status_incompatible"
    );
  }
  if (generateDescriptionBtn)
    generateDescriptionBtn.innerHTML = ` ${getTranslation(
      "generate_description_btn"
    )}`;
  if (getCompatibilityAdviceBtn)
    getCompatibilityAdviceBtn.innerHTML = ` ${getTranslation(
      "compatibility_advice_btn"
    )}`;
  if (estimatePerformanceBtn)
    estimatePerformanceBtn.innerHTML = ` ${getTranslation(
      "estimate_performance_btn"
    )}`;

  if (
    productDetailModalOverlay &&
    productDetailModalOverlay.style.display === "flex" &&
    productDetailModalTitleElement
  ) {
    const currentProductNameInModal = productDetailName?.textContent || "";
    productDetailModalTitleElement.textContent = getTranslation(
      "part_details_title_modal",
      undefined,
      { partName: currentProductNameInModal }
    );
  }
  const currentDetailModalAddToBuildButton = document.getElementById(
    "productDetailAddToBuildBtn"
  );
  if (currentDetailModalAddToBuildButton) {
    const btnTextSpan =
      currentDetailModalAddToBuildButton.querySelector("span");
    if (btnTextSpan) {
      btnTextSpan.textContent = getTranslation("add_to_build_btn_modal");
    } else {
      currentDetailModalAddToBuildButton.innerHTML = `<i class="fas fa-plus-circle"></i> ${getTranslation(
        "add_to_build_btn_modal"
      )}`;
    }
  }
});

(async function init() {
  updateAuthUI(); // Initial UI update based on token presence
  await loadBuildList(); // Load build list for dropdown

  const urlParams = new URLSearchParams(window.location.search);
  const configIdFromUrl = urlParams.get("config");
  let initialBuildId = null;

  const token = localStorage.getItem("token");

  if (token) {
    // User is logged in
    if (
      configIdFromUrl &&
      buildSelector?.querySelector(`option[value="${configIdFromUrl}"]`)
    ) {
      initialBuildId = configIdFromUrl;
    } else if (
      buildSelector?.options.length > 0 &&
      buildSelector.options[0]?.value
    ) {
      initialBuildId = buildSelector.options[0].value; // Default to the first build
    }

    if (initialBuildId) {
      if (buildSelector) buildSelector.value = initialBuildId;
      await loadBuild(initialBuildId);
    } else if (newBuildBtn) {
      // No specific build, no existing builds, create new
      newBuildBtn.click();
    } else {
      // Fallback if newBuildBtn is not available (should not happen if logged in)
      loadBuild(null);
    }
  } else {
    // User is not logged in
    loadBuild(null); // Load empty state, UI will be set by updateAuthUI
  }
  translatePage(); // Ensure all static elements are translated
})();
