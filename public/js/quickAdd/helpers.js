// public/js/quickAdd/helpers.js

/**
 * Renders a list of checkboxes in the specified container.
 * Optimised to build the HTML string first and then set innerHTML once.
 * @param {string} containerId - The ID of the container element.
 * @param {Set<string>} valuesSet - A Set of unique string values for the checkboxes.
 * @param {function} onChangeCallback - The callback function to execute on checkbox change.
 */
export function renderCheckboxList(containerId, valuesSet, onChangeCallback) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`renderCheckboxList: Container #${containerId} not found.`);
    return;
  }

  let checkboxesHTML = "";
  // Sort values for consistent order
  Array.from(valuesSet)
    .sort()
    .forEach((value) => {
      const label = String(value);
      // Create a safer ID by replacing spaces and special characters
      const safeValueForId = label.replace(/[^a-zA-Z0-9_]/g, "_");
      const id = `${containerId}-${safeValueForId}-${Date.now()}`; // Ensure unique ID
      checkboxesHTML += `
      <label>
        <input type="checkbox" id="${id}" value="${label}">
        ${label}
      </label>
    `;
    });
  container.innerHTML = checkboxesHTML; // Set HTML content once

  // Add event listeners after HTML is inserted
  container.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("input", onChangeCallback);
  });
}

/**
 * Gets the values of checked checkboxes within a given container.
 * @param {string} containerId - The ID of the container element.
 * @returns {string[]} An array of values from checked checkboxes.
 */
export function getCheckedValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`getCheckedValues: Container #${containerId} not found.`);
    return [];
  }
  return Array.from(
    container.querySelectorAll("input[type=checkbox]:checked")
  ).map((cb) => cb.value);
}

/**
 * Gets key specifications for a product based on its category.
 * @param {object} specs - The product's specifications object.
 * @param {string} category - The product category.
 * @returns {Array<{k: string, v: any}>} An array of key-value pairs for specs.
 */
export function getKeySpecs(specs, category) {
  if (!specs) return [];
  const map = {
    Case: [
      ["Form Factor", specs.form_factor || specs.formFactor],
      ["Side Panel", specs.side_panel],
      ["Max GPU Length", specs.max_gpu_length],
    ],
    CPU: [
      ["Cores", specs.cores],
      ["Threads", specs.threads],
      ["Base Clock", specs.base_clock ? specs.base_clock + " GHz" : null],
      ["Socket", specs.socket],
    ],
    Motherboard: [
      ["Form Factor", specs.form_factor],
      ["Socket", specs.socket],
      ["Chipset", specs.chipset],
    ],
    GPU: [
      ["Memory", specs.memory_size ? specs.memory_size + " GB" : null],
      ["Length", specs.length_mm ? specs.length_mm + " mm" : null],
    ],
    RAM: [
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null], // Assuming capacity is in GB
      ["Type", specs.ram_type || specs.type], // Allow for specs.type as fallback
      [
        "Modules",
        specs.modules?.quantity
          ? `${specs.modules.quantity}x${specs.modules.capacity_gb_per_module}GB`
          : null,
      ],
    ],
    Storage: [
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null], // Assuming capacity is in GB
      ["Interface", specs.interface],
      ["Type", specs.type],
    ],
    PSU: [
      ["Wattage", specs.wattage ? specs.wattage + " W" : null],
      ["Modular", specs.modular],
      ["Efficiency", specs.efficiency_rating],
    ],
    CPUCooler: [
      [
        "RPM",
        specs.rpm_min && specs.rpm_max
          ? `${specs.rpm_min} - ${specs.rpm_max}`
          : specs.rpm || null,
      ],
      [
        "Noise Level",
        specs.noise_level_min && specs.noise_level_max
          ? `${specs.noise_level_min} - ${specs.noise_level_max} dBA`
          : specs.noise_level || null,
      ],
      [
        "Water Cooled",
        typeof specs.water_cooled === "boolean"
          ? specs.water_cooled
            ? "Yes"
            : "No"
          : null,
      ],
    ],
    Monitor: [
      ["Screen Size", specs.screen_size ? `${specs.screen_size}"` : null],
      [
        "Resolution",
        specs.resolution?.horizontalRes && specs.resolution?.verticalRes
          ? `${specs.resolution.horizontalRes}x${specs.resolution.verticalRes}`
          : null,
      ],
      ["Refresh Rate", specs.refresh_rate ? `${specs.refresh_rate} Hz` : null],
      ["Panel Type", specs.panel_type],
    ],
    // Add other categories as needed
  };
  return (map[category] || [])
    .filter(([_, v]) => v != null && v !== "") // Also filter out empty strings
    .map(([k, v]) => ({ k, v }));
}

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
export function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
