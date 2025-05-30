// public/js/build.js

const API = {
  list: "/api/configs",
  create: "/api/configs",
  load: (id) => `/api/configs/${id}`,
  update: (id) => `/api/configs/${id}`,
  component: (id) => `/api/components/${id}`,
};

let currentBuildId = null;
let isSaving = false;
export const selectedParts = {}; // Stores { category: productObject }

// DOM Elements
const mainBuildLoaderOverlay = document.getElementById(
  "mainBuildLoaderOverlay"
);
const buildNameElement = document.getElementById("build-name"); // Renamed for clarity
const buildSelector = document.getElementById("build-selector");
const newBuildBtn = document.getElementById("new-build");
const totalPriceSpan = document.getElementById("totalPrice");
const compatibilitySpan = document.getElementById("compatibility");
const compicon = document.getElementById("compicon");
const totalTdpSpan = document.getElementById("totalTdp");
const buildDateSpan = document.getElementById("build-date");
const buildAuthorSpan = document.getElementById("build-author");

// Gemini Feature Elements
const generateDescriptionBtn = document.getElementById(
  "generateDescriptionBtn"
);
const descriptionLoader = document.getElementById("descriptionLoader");
const buildDescriptionOutput = document.getElementById(
  "buildDescriptionOutput"
);

/**
 * Shows or hides the main build loader.
 * @param {boolean} show - True to show, false to hide.
 */
function toggleMainLoader(show) {
  if (mainBuildLoaderOverlay) {
    mainBuildLoaderOverlay.style.display = show ? "flex" : "none";
  }
}

/**
 * Checks compatibility between selected PC parts.
 * @param {object} parts - An object журналирования selected parts, e.g., { CPU: cpuProduct, Motherboard: mbProduct }.
 * @returns {boolean} True if compatible, false otherwise.
 */
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

  let currentTotalTdp = 0;
  Object.values(parts).forEach((p) => {
    if (p && p.specs) {
      let tdpVal =
        typeof p.specs.tdp === "number"
          ? p.specs.tdp
          : typeof p.specs.specifications?.tdp === "number"
          ? p.specs.specifications.tdp
          : { Motherboard: 70, RAM: 15, CPUCooler: 5, Storage: 10 }[
              p.category
            ] || 0;
      currentTotalTdp += tdpVal;
    }
  });
  currentTotalTdp += 50;

  if (cpu && motherboard) {
    const cpuSocket = cpu.specs?.socket;
    const mbSocket = motherboard.specs?.socket;
    if (cpuSocket && mbSocket && !eqIgnoreCase(cpuSocket, mbSocket))
      return false;
  }

  if (ram && motherboard) {
    const ramType = ram.specs?.ram_type || ram.specs?.type;
    const mbRamType =
      motherboard.specs?.memory?.ram_type || motherboard.specs?.ram_type;
    if (ramType && mbRamType && !eqIgnoreCase(ramType, mbRamType)) return false;

    if (
      typeof ram.specs?.registered === "boolean" &&
      typeof motherboard.specs?.supports_registered_ram === "boolean"
    ) {
      if (ram.specs.registered && !motherboard.specs.supports_registered_ram)
        return false;
    }
    if (
      typeof ram.specs?.ecc === "boolean" &&
      typeof motherboard.specs?.supports_ecc_ram === "boolean"
    ) {
      if (ram.specs.ecc && !motherboard.specs.supports_ecc_ram) return false;
    }

    const totalRamCapacity = ram.specs?.capacity;
    const mbMaxRam = motherboard.specs?.memory?.max_capacity_gb;
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

    const maxGpuLength = pcCase.specs?.max_video_card_length_mm;
    if (
      gpu?.specs?.length_mm &&
      maxGpuLength &&
      gpu.specs.length_mm > maxGpuLength
    )
      return false;
  }

  if (psu) {
    const psuWattage = psu.specs?.wattage;
    if (psuWattage && currentTotalTdp && psuWattage < currentTotalTdp)
      return false;
  }
  return true;
}

/**
 * Generates a display title for a product.
 * @param {object} specs - The product's specifications object.
 * @returns {string} The display title.
 */
function getProductDisplayTitle(specs) {
  if (!specs) return "Невідомий компонент";
  return (
    specs.metadata?.name || // Prefer metadata name
    [specs.manufacturer, specs.series, specs.model].filter(Boolean).join(" ") ||
    specs.opendb_id ||
    "Компонент без назви"
  );
}

function getBuildImage(product) {
  return product?.storeImg?.Ekua || "/img/placeholder.png";
}

function getBuyLink(product) {
  return product?.storeUrls?.Ekua || product?.storeIds?.Ekua;
}

/**
 * Updates total price, TDP, and compatibility status in the UI.
 */
function updateTotal() {
  const sumPrice = Object.values(selectedParts).reduce((sum, p) => {
    if (!p || !p.prices) return sum;
    const price =
      p.prices.Ekua ??
      Object.values(p.prices).find((pr) => typeof pr === "number");
    return sum + (typeof price === "number" ? price : 0);
  }, 0);

  totalPriceSpan.textContent = sumPrice.toFixed(2).replace(".", ",");

  let sumTdp = 0;
  Object.values(selectedParts).forEach((p) => {
    if (p && p.specs) {
      let tdpVal =
        typeof p.specs.tdp === "number"
          ? p.specs.tdp
          : typeof p.specs.specifications?.tdp === "number"
          ? p.specs.specifications.tdp
          : { Motherboard: 70, RAM: 15, CPUCooler: 5, Storage: 10 }[
              p.category
            ] || 0;
      sumTdp += tdpVal;
    }
  });
  sumTdp += 50;
  totalTdpSpan.textContent = sumTdp;

  const compatible = checkCompatibility(selectedParts);
  if (compatibilitySpan && compicon) {
    if (compatible) {
      compatibilitySpan.textContent = "Сумісно";
      compatibilitySpan.style.color = "var(--success)";
      compicon.className = "fa fa-check-circle";
      compicon.style.color = "var(--success)";
    } else {
      compatibilitySpan.textContent = "Несумісно";
      compatibilitySpan.style.color = "var(--error-color)";
      compicon.className = "fa fa-times-circle";
      compicon.style.color = "var(--error-color)";
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

/**
 * Renders a selected part in its category section.
 * @param {string} category - The category of the part.
 * @param {object} product - The product object.
 */
function renderPart(category, product) {
  if (!product || !product.specs) {
    console.warn(
      `Продукт або його характеристики для категорії "${category}" не визначені.`
    );
    delete selectedParts[category];
    const container = document.querySelector(
      `.part-category[data-cat="${category}"]`
    );
    if (container) {
      container.querySelectorAll(".selected-part").forEach((el) => el.remove());
      const addBtn = container.querySelector(".add-btn");
      if (addBtn) {
        addBtn.textContent = `+ Add ${
          container.querySelector("h3")?.textContent || category
        }`;
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
    addBtn.textContent = "Замінити";
    addBtn.classList.add("swap-btn");
  }

  const title = getProductDisplayTitle(product.specs);
  const imgUrl = getBuildImage(product);
  const price = product.prices?.Ekua ?? 0;
  const buyLink = getBuyLink(product);

  const partDiv = document.createElement("div");
  partDiv.className = "selected-part";
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
              ? `<a href="${buyLink}" target="_blank" rel="noopener noreferrer" class="sp-buy">Купити</a>`
              : '<span class="sp-buy-na" style="font-size: 0.8em; color: #999;">N/A</span>'
          }
          <button class="sp-remove" title="Видалити">&times;</button>
        </div>
      </div>
    </div>
  `;
  container.append(partDiv);
  updateTotal();
}

// Event Listeners for parts management
document.body.addEventListener("click", (e) => {
  if (e.target.matches(".sp-remove")) {
    const catElement = e.target.closest(".part-category");
    if (!catElement) return;
    const cat = catElement.dataset.cat;
    delete selectedParts[cat];
    e.target.closest(".selected-part")?.remove();

    const addBtn = catElement.querySelector(".add-btn");
    if (addBtn) {
      const categoryTitle =
        catElement.querySelector("h3")?.textContent?.trim() || cat;
      addBtn.textContent = `+ Add ${categoryTitle}`;
      addBtn.classList.remove("swap-btn");
    }
    updateTotal();
    window.dispatchEvent(new Event("buildUpdated")); // Notify that build has changed
  }
});

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

/**
 * Loads the list of saved builds for the current user.
 */
async function loadBuildList() {
  toggleMainLoader(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      buildSelector.innerHTML = '<option value="">Спочатку увійдіть</option>';
      return;
    }
    const res = await fetch(API.list, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(`Не вдалося завантажити список збірок: ${res.status}`);
    const list = await res.json();
    buildSelector.innerHTML = list
      .map((b) => `<option value="${b._id}">${b.name}</option>`)
      .join("");
    if (list.length === 0) {
      buildSelector.innerHTML = '<option value="">Збірок не знайдено</option>';
    }
  } catch (error) {
    console.error("Помилка завантаження списку збірок:", error);
    buildSelector.innerHTML = '<option value="">Помилка завантаження</option>';
  } finally {
    toggleMainLoader(false);
  }
}

/**
 * Loads a specific build by its ID.
 * @param {string} id - The ID of the build to load.
 */
async function loadBuild(id) {
  if (!id) {
    Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
    document.querySelectorAll(".selected-part").forEach((el) => el.remove());
    document.querySelectorAll(".part-category .add-btn").forEach((btn) => {
      const catElement = btn.closest(".part-category");
      const categoryTitle =
        catElement?.querySelector("h3")?.textContent?.trim() ||
        catElement?.dataset.cat ||
        "Part";
      btn.textContent = `+ Add ${categoryTitle}`;
      btn.classList.remove("swap-btn");
    });
    if (buildNameElement) buildNameElement.textContent = "Нова збірка";
    if (buildDateSpan)
      buildDateSpan.textContent = new Date().toLocaleDateString("uk-UA", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (buildAuthorSpan) buildAuthorSpan.textContent = "Ви";
    updateTotal();
    if (buildDescriptionOutput) buildDescriptionOutput.value = ""; // Clear description for new/empty build
    return;
  }
  toggleMainLoader(true);
  if (buildDescriptionOutput) buildDescriptionOutput.value = ""; // Clear previous description

  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(API.load(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
      throw new Error(`Не вдалося завантажити збірку: ${res.status}`);
    const cfg = await res.json();

    currentBuildId = cfg._id;
    if (buildNameElement) buildNameElement.textContent = cfg.name;
    if (buildDateSpan)
      buildDateSpan.textContent = new Date(
        cfg.createdAt || Date.now()
      ).toLocaleDateString("uk-UA", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (buildAuthorSpan)
      buildAuthorSpan.textContent = cfg.authorName || "Анонім";

    Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
    document.querySelectorAll(".selected-part").forEach((el) => el.remove());
    document.querySelectorAll(".part-category .add-btn").forEach((btn) => {
      const catElement = btn.closest(".part-category");
      const categoryTitle =
        catElement?.querySelector("h3")?.textContent?.trim() ||
        catElement?.dataset.cat ||
        "Part";
      btn.textContent = `+ Add ${categoryTitle}`;
      btn.classList.remove("swap-btn");
    });

    if (cfg.components && cfg.components.length > 0) {
      const productsPromises = cfg.components.map((cid) =>
        fetch(API.component(cid), {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => {
          if (!r.ok) {
            console.error(
              `Не вдалося завантажити компонент ${cid}: ${r.status}`
            );
            return null;
          }
          return r.json();
        })
      );
      const products = (await Promise.all(productsPromises)).filter((p) => p); // Filter out nulls from failed fetches
      products.forEach((p) => {
        if (p && p.category) renderPart(p.category, p);
        else console.warn("Отримано недійсний або неповний компонент:", p);
      });
    }
    if (cfg.description && buildDescriptionOutput) {
      // Load saved description
      buildDescriptionOutput.value = cfg.description;
    }
    updateTotal();
  } catch (error) {
    console.error("Помилка завантаження збірки:", error);
  } finally {
    toggleMainLoader(false);
  }
}

// Event listener for "New Build" button
newBuildBtn.addEventListener("click", async () => {
  toggleMainLoader(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Будь ласка, увійдіть, щоб створити нову збірку.");
      return;
    }
    const defaultBuildName =
      "Нова збірка " +
      new Date().toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    const res = await fetch(API.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: defaultBuildName, components: [] }),
    });
    if (!res.ok)
      throw new Error(`Не вдалося створити нову збірку: ${res.status}`);
    const b = await res.json();

    await loadBuildList();
    buildSelector.value = b._id;
    await loadBuild(b._id);
    currentBuildId = b._id;
  } catch (error) {
    console.error("Помилка створення нової збірки:", error);
    alert("Не вдалося створити нову збірку. Спробуйте ще раз.");
  } finally {
    toggleMainLoader(false);
  }
});

// Event listener for build selector change
buildSelector.addEventListener("change", () => {
  if (buildSelector.value) {
    loadBuild(buildSelector.value);
  }
});

// Event listener for build name edit
if (buildNameElement) {
  buildNameElement.addEventListener("blur", async () => {
    const newName = buildNameElement.textContent.trim() || "Без назви";
    buildNameElement.textContent = newName;
    if (!currentBuildId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const optionInSelector = buildSelector.querySelector(
      `option[value="${currentBuildId}"]`
    );
    if (optionInSelector) {
      optionInSelector.textContent = newName;
    }
    // Update current build name in sidebar
    const currentBuildNameDisplay =
      document.getElementById("current-build-name");
    if (currentBuildNameDisplay) currentBuildNameDisplay.textContent = newName;

    try {
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
      // Optionally revert name if API call fails
    }
  });
}

// Auto-save build changes (components and description)
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
    // description: buildDescriptionOutput ? buildDescriptionOutput.value : undefined // Save description too
  };
  // Only include description if the element exists and has a value
  if (buildDescriptionOutput && buildDescriptionOutput.value.trim() !== "") {
    buildDataToSave.description = buildDescriptionOutput.value.trim();
  }

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

/**
 * Gemini API Integration: Generates a build description.
 */
async function handleGenerateDescription() {
  if (!generateDescriptionBtn || !descriptionLoader || !buildDescriptionOutput)
    return;

  if (Object.keys(selectedParts).length === 0) {
    buildDescriptionOutput.value =
      "Будь ласка, додайте компоненти до збірки, щоб згенерувати опис.";
    return;
  }

  generateDescriptionBtn.disabled = true;
  descriptionLoader.style.display = "flex";
  buildDescriptionOutput.value = ""; // Clear previous

  const partNames = Object.values(selectedParts)
    .map((part) => getProductDisplayTitle(part.specs))
    .filter(
      (name) =>
        name && name !== "Невідомий компонент" && name !== "Компонент без назви"
    );

  if (partNames.length === 0) {
    buildDescriptionOutput.value =
      "Не вдалося отримати назви компонентів для генерації опису.";
    descriptionLoader.style.display = "none";
    generateDescriptionBtn.disabled = false;
    return;
  }

  const prompt = `Створи коротке, привабливе та інформативне маркетингове описання для збірки ПК з наступними основними компонентами: ${partNames.join(
    ", "
  )}. Згадай, для яких завдань (наприклад, ігри, робота, навчання, творчість) ця збірка може підійти. Опис має бути на українській мові. Зроби його приблизно 2-4 речення.`;

  try {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Canvas will provide this
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Помилка Gemini API:", errorData);
      throw new Error(
        `Помилка API: ${errorData.error?.message || response.status}`
      );
    }

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      const text = result.candidates[0].content.parts[0].text;
      buildDescriptionOutput.value = text.trim();
      window.dispatchEvent(new Event("buildUpdated")); // Trigger auto-save for the new description
    } else {
      console.error("Неочікувана структура відповіді від Gemini API:", result);
      buildDescriptionOutput.value =
        "Не вдалося згенерувати опис. Спробуйте ще раз.";
    }
  } catch (error) {
    console.error("Помилка при генерації опису:", error);
    buildDescriptionOutput.value = `Помилка: ${error.message}. Перевірте консоль для деталей.`;
  } finally {
    descriptionLoader.style.display = "none";
    generateDescriptionBtn.disabled = false;
  }
}

if (generateDescriptionBtn) {
  generateDescriptionBtn.addEventListener("click", handleGenerateDescription);
}

// Initial load logic
(async function init() {
  await loadBuildList();
  const urlParams = new URLSearchParams(window.location.search);
  const configIdFromUrl = urlParams.get("config");

  let initialBuildId = null;

  if (
    configIdFromUrl &&
    buildSelector.querySelector(`option[value="${configIdFromUrl}"]`)
  ) {
    initialBuildId = configIdFromUrl;
    buildSelector.value = configIdFromUrl;
  } else if (buildSelector.options.length > 0 && buildSelector.value) {
    initialBuildId = buildSelector.value;
  }

  if (initialBuildId) {
    await loadBuild(initialBuildId);
  } else if (localStorage.getItem("token")) {
    newBuildBtn.click();
  } else {
    if (buildNameElement) buildNameElement.textContent = "Увійдіть, щоб почати";
    totalPriceSpan.textContent = "0";
    if (compatibilitySpan) compatibilitySpan.textContent = "-";
    totalTdpSpan.textContent = "0";
    if (buildDateSpan) buildDateSpan.textContent = "-";
    if (buildAuthorSpan) buildAuthorSpan.textContent = "-";
    document
      .querySelectorAll(".part-category .add-btn")
      .forEach((btn) => (btn.disabled = true));
    if (generateDescriptionBtn) generateDescriptionBtn.disabled = true;
  }
})();
