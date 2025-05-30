// public/js/build.js

const API = {
  list: "/api/configs",
  create: "/api/configs",
  load: (id) => `/api/configs/${id}`,
  update: (id) => `/api/configs/${id}`,
};

let currentBuildId = null;
let isSaving = false;
export const selectedParts = {};

const overlay = document.getElementById("quickAddOverlay");
const buildName = document.getElementById("build-name");
const buildSelector = document.getElementById("build-selector");
const newBuildBtn = document.getElementById("new-build");
const totalPriceSpan = document.getElementById("totalPrice");
const compatibilitySpan = document.getElementById("compatibility");
const totalTdpSpan = document.getElementById("totalTdp");
const mark3dSpan = document.getElementById("mark3d");
const buildDateSpan = document.getElementById("build-date");
const buildAuthorSpan = document.getElementById("build-author");

export function checkCompatibility(parts) {
  const cpu = parts["CPU"];
  const motherboard = parts["Motherboard"];
  const ram = parts["RAM"];
  const psu = parts["PSU"];
  const pcCase = parts["PCCase"];
  const cpuCooler = parts["CPUCooler"];
  const gpu = parts["GPU"];
  const storage = parts["Storage"];
  const networkCard = parts["NetworkCard"];
  const caseFan = parts["CaseFan"];
  const monitor = parts["Monitor"];
  const soundCard = parts["SoundCard"];

  // Сравнение строк без учета регистра и лишних пробелов
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

  const totalTdpElement = document.getElementById("totalTdp");
  let totalTdp = totalTdpElement ? parseInt(totalTdpElement.textContent) : 0;
  totalTdp += 50; // Добавляем запас в 50W для других компонентов

  // 1. CPU & Motherboard: сокеты должны совпадать
  if (cpu && motherboard) {
    const cpuSocket = cpu.specs?.socket;
    const mbSocket = motherboard.specs?.socket;
    if (!cpuSocket || !mbSocket || !eqIgnoreCase(cpuSocket, mbSocket))
      return false;

    // Проверка поддержки CPU chipset материнской платой
    if (cpu.specs?.chipset && motherboard.specs?.chipset) {
      if (!eqIgnoreCase(cpu.specs.chipset, motherboard.specs.chipset)) {
        // Если чипсеты не совпадают — несовместимо
        return false;
      }
    }
  }

  // 2. Motherboard & RAM: тип, форм-фактор памяти и поддержка частоты должны совпадать
  if (ram && motherboard) {
    const ramType = ram.specs?.ram_type || ram.specs?.type;
    const mbRamType =
      motherboard.specs?.memory?.ram_type || motherboard.specs?.ram_type;
    if (!ramType || !mbRamType || !eqIgnoreCase(ramType, mbRamType))
      return false;

    // Проверка Registered и ECC RAM
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

    // Проверка максимальной емкости RAM
    if (ram.specs?.capacity_gb && motherboard.specs?.memory?.max) {
      if (ram.specs.capacity_gb > motherboard.specs?.memory?.max) return false;
    }
    if (motherboard.specs?.memory?.max && ram.specs?.capacity_gb) {
      if (ram.specs.capacity_gb > motherboard.specs?.memory?.max) return false;
    }
  }
  // 3. CPU Cooler & CPU: поддержка сокета кулером
  if (cpuCooler && cpu) {
    const coolerSockets = cpuCooler.specs?.cpu_sockets || [];
    const cpuSocket = cpu.specs?.socket;
    if (
      coolerSockets.length > 0 &&
      !coolerSockets.some((s) => eqIgnoreCase(s, cpuSocket))
    )
      return false;

    // Проверка высоты кулера и ограничения корпуса
    if (
      pcCase?.specs?.max_cpu_cooler_height &&
      cpuCooler.specs?.height &&
      cpuCooler.specs.height > pcCase.specs.max_cpu_cooler_height
    )
      return false;
  }

  // 4. PC Case & Motherboard: поддержка форм-фактора
  if (pcCase && motherboard) {
    const caseFormFactorRaw = pcCase.specs?.form_factor || "";
    const mbFormFactor = motherboard.specs?.form_factor;
    if (!caseFormFactorRaw || !mbFormFactor) return false;

    const caseFormFactors = caseFormFactorRaw.toLowerCase().split(/,\s*/);
    if (!caseFormFactors.includes(mbFormFactor.toLowerCase())) return false;

    // Проверка длины GPU
    const maxGpuLength = pcCase.specs?.max_video_card_length;
    if (maxGpuLength && gpu?.specs?.length && gpu.specs.length > maxGpuLength)
      return false;
  }

  // 5. PSU: мощность должна покрывать TDP CPU+GPU (+ запас)
  if (psu) {
    const psuWattage = psu.specs?.wattage;
    if (psuWattage && totalTdp && psuWattage < totalTdp) return false; // Сравнение PSU с totalTdp
  }

  // 6. Storage & Motherboard: интерфейс и форм-фактор
  if (storage && motherboard) {
    const storageInterface = storage.specs?.interface;
    const mbStorageInterfaces = motherboard.specs?.storage_interfaces || [];

    if (
      storageInterface &&
      mbStorageInterfaces.length > 0 &&
      !mbStorageInterfaces.some((intf) => eqIgnoreCase(intf, storageInterface))
    )
      return false;

    const storageFormFactor = storage.specs?.form_factor;
    const mbStorageFormFactors =
      motherboard.specs?.supported_storage_form_factors || [];

    if (
      storageFormFactor &&
      mbStorageFormFactors.length > 0 &&
      !mbStorageFormFactors.some((f) => eqIgnoreCase(f, storageFormFactor))
    )
      return false;
  }

  // 8. NetworkCard & Motherboard: проверка интерфейса (например, PCIe)
  if (networkCard && motherboard) {
    const netInterface = networkCard.specs?.interface;
    const mbPcieSlots = motherboard.specs?.pcie_slots || [];
    if (
      netInterface &&
      mbPcieSlots.length > 0 &&
      !mbPcieSlots.some((slot) => eqIgnoreCase(slot.type, netInterface))
    )
      return false;
  }

  // 9. CaseFan & PC Case: проверка размера вентилятора и поддержки корпуса
  if (caseFan && pcCase) {
    const fanSize = caseFan.specs?.size_mm;
    const supportedFanSizesRaw = pcCase.specs?.supported_fan_sizes_mm || "";
    if (fanSize && supportedFanSizesRaw) {
      const supportedFanSizes = supportedFanSizesRaw
        .toString()
        .toLowerCase()
        .split(/,\s*/);
      if (!supportedFanSizes.includes(String(fanSize).toLowerCase()))
        return false;
    }
  }

  // 11. SoundCard & Motherboard: проверка интерфейса (PCIe, USB)
  if (soundCard && motherboard) {
    const soundInterface = soundCard.specs?.interface;
    const mbPcieSlots = motherboard.specs?.pcie_slots || [];
    if (
      soundInterface &&
      mbPcieSlots.length > 0 &&
      !mbPcieSlots.some((slot) => eqIgnoreCase(slot.type, soundInterface))
    )
      return false;
  }

  // 12. Проверка поддержки RGB (если нужно)
  // if (
  //   rgbComponent && motherboard && motherboard.specs?.supports_rgb !== undefined
  // ) {
  //   if (rgbComponent.specs.rgb && !motherboard.specs.supports_rgb) return false;
  // }

  // 13. Проверка количества слотов RAM и их совместимости
  if (motherboard && ram) {
    if (
      typeof motherboard.specs?.memory?.slots === "number" &&
      typeof ram.specs?.modules?.quantity === "number"
    ) {
      if (ram.specs.modules?.quantity > motherboard.specs.memory?.slots)
        return false;
    }
  }

  return true;
}

function getBuildTitle(specs) {
  return (
    [specs.manufacturer, specs.series, specs.model, specs.metadata?.name]
      .filter(Boolean)
      .join(" ") ||
    specs.id ||
    "Unnamed"
  );
}

function getBuildImage(product) {
  return product?.storeImg?.Ekua || "/img/placeholder.png";
}

function getBuyLink(product) {
  return product?.storeIds?.Ekua;
}

function updateTotal() {
  const sumPrice = Object.values(selectedParts).reduce((sum, p) => {
    const prices = Object.values(p.prices || {}).filter(
      (v) => typeof v === "number"
    );
    return sum + (prices.length ? Math.min(...prices) : 0);
  }, 0);

  totalPriceSpan.textContent = sumPrice.toFixed(2).replace(".", ",");

  const sumTdp = Object.values(selectedParts).reduce((sum, p) => {
    if (!p.specs) return sum;
    let tdpVal =
      typeof p.specs.tdp === "number"
        ? p.specs.tdp
        : typeof p.specs.specifications?.tdp === "number"
        ? p.specs.specifications.tdp
        : {
            Motherboard: 70,
            RAM: 28.8,
            CPUCooler: 15,
            Storage: 10,
          }[p.category] || 0;
    return sum + tdpVal;
  }, 0);

  totalTdpSpan.textContent = sumTdp;

  // Выводим реальный статус совместимости
  const compatible = checkCompatibility(selectedParts);
  compatibilitySpan.textContent = compatible ? "Compatible" : "Incompatible";
  compatibilitySpan.style.color = compatible ? "#4caf50" : "#f44336";

  mark3dSpan.textContent = "—";
}

function renderPart(category, product) {
  selectedParts[category] = product;
  const container = document.querySelector(
    `.part-category[data-cat="${category}"]`
  );

  container.querySelectorAll(".selected-part").forEach((el) => el.remove());

  const addBtn = container.querySelector(".add-btn");
  addBtn.textContent = "Swap Part";
  addBtn.classList.add("swap-btn");

  const title = getBuildTitle(product.specs);
  const imgUrl = getBuildImage(product);
  const price = product.prices?.Ekua ?? 0;
  const link = getBuyLink(product);

  const partDiv = document.createElement("div");
  partDiv.className = "selected-part";
  partDiv.innerHTML = `
    <img src="${imgUrl}" alt="${title}" class="sp-thumb" onerror="this.src='/img/placeholder.png'" />
    <div class="sp-info">
      <div class="sp-title multiline-truncate-part">${title}</div>
      <div class="sp-buy-sec">
        <div class="sp-price"><p>${price}₴</p></div>
        <div class="sp-actions">
          ${
            link
              ? `<a href="${link}" target="_blank" class="sp-buy">buy</a>`
              : ""
          }
          <button class="sp-remove" title="Remove">&times;</button>
        </div>
      </div>
    </div>
  `;

  container.append(partDiv);
  updateTotal();
}

document.body.addEventListener("click", (e) => {
  // Удаление детали
  if (e.target.matches(".sp-remove")) {
    const cat = e.target.closest(".part-category").dataset.cat;
    delete selectedParts[cat];
    e.target.closest(".selected-part").remove();

    const container = document.querySelector(
      `.part-category[data-cat="${cat}"]`
    );
    const addBtn = container.querySelector(".add-btn");
    addBtn.textContent = `+ Add ${container.querySelector("h3").textContent}`;
    addBtn.classList.remove("swap-btn");

    updateTotal();
    window.dispatchEvent(new Event("buildUpdated"));
  }

  // Открытие QuickAdd при замене детали
  if (e.target.matches(".swap-btn")) {
    overlay.classList.add("active");
  }
});

window.addEventListener("add-component", ({ detail }) => {
  renderPart(detail.category, detail.product);
  window.dispatchEvent(new Event("buildUpdated"));
});

function getCurrentPartsData() {
  return Object.values(selectedParts).map((p) => p.opendb_id);
}

async function loadBuildList() {
  const token = localStorage.getItem("token");
  const res = await fetch(API.list, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = await res.json();
  buildSelector.innerHTML = list
    .map((b) => `<option value="${b._id}">${b.name}</option>`)
    .join("");
}

async function loadBuild(id) {
  if (!id) return;
  const token = localStorage.getItem("token");
  const res = await fetch(API.load(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const cfg = await res.json();

  currentBuildId = cfg._id;
  buildName.textContent = cfg.name;

  buildDateSpan.textContent = new Date(cfg.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
  buildAuthorSpan.textContent = "Anonymous";

  Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
  document.querySelectorAll(".selected-part").forEach((el) => el.remove());
  document.querySelectorAll(".part-category").forEach((cat) => {
    const title = cat.querySelector("h3").textContent.trim();
    cat.querySelector(".add-btn").textContent = `+ Add ${title}`;
  });

  const products = await Promise.all(
    cfg.components.map((cid) =>
      fetch(`/api/components/${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json())
    )
  );

  products.forEach((p) => renderPart(p.category, p));
  updateTotal();
}

newBuildBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(API.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: "Нова збірка", components: [] }),
  });
  const b = await res.json();
  currentBuildId = b._id;

  await loadBuildList();
  buildSelector.value = b._id;
  buildName.textContent = b.name;

  Object.keys(selectedParts).forEach((c) => delete selectedParts[c]);
  document.querySelectorAll(".selected-part").forEach((el) => el.remove());

  updateTotal();
  document.querySelectorAll(".part-category").forEach((cat) => {
    const title = cat.querySelector("h3").textContent.trim();
    cat.querySelector(".add-btn").textContent = `+ Add ${title}`;
    cat.querySelector(".add-btn").classList.remove("swap-btn");
  });
});

buildSelector.addEventListener("change", () => loadBuild(buildSelector.value));

buildName.addEventListener("blur", async () => {
  const newName = buildName.textContent.trim() || "Без назви";
  buildName.textContent = newName;
  if (!currentBuildId) return;

  const token = localStorage.getItem("token");
  await fetch(API.update(currentBuildId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  loadBuild(buildSelector.value);
  loadBuildList();
});

window.addEventListener("buildUpdated", async () => {
  if (!currentBuildId || isSaving) return;
  isSaving = true;
  const token = localStorage.getItem("token");

  try {
    await fetch(API.update(currentBuildId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ components: getCurrentPartsData() }),
    });
  } catch (e) {
    console.error("Auto-save error:", e);
  } finally {
    isSaving = false;
  }
});

(async function init() {
  await loadBuildList();
  if (buildSelector.options.length) {
    buildSelector.value = buildSelector.options[0].value;
    await loadBuild(buildSelector.value);
  } else {
    newBuildBtn.click();
  }
})();
