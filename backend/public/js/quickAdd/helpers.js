// helpers.js

export function renderCheckboxList(containerId, valuesSet, onChangeCallback) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  Array.from(valuesSet)
    .sort()
    .forEach((value) => {
      const label = String(value);
      const id = `${containerId}-${label.replace(/[^a-zA-Z0-9]/g, "_")}`;
      container.innerHTML += `
      <label>
        <input type="checkbox" id="${id}" value="${label}">
        ${label}
      </label>
    `;
    });
  container.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("input", onChangeCallback);
  });
}

export function getCheckedValues(containerId) {
  return Array.from(
    document.querySelectorAll(`#${containerId} input:checked`)
  ).map((cb) => cb.value);
}

export function getKeySpecs(specs, category) {
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
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null],
      ["Type", specs.type],
    ],
    Storage: [
      ["Capacity", specs.capacity ? specs.capacity + " GB" : null],
      ["Interface", specs.interface],
    ],
    PSU: [
      ["Wattage", specs.wattage ? specs.wattage + " W" : null],
      ["Modular", specs.modular],
    ],
  };
  return (map[category] || [])
    .filter(([_, v]) => v != null)
    .map(([k, v]) => ({ k, v }));
}

export function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
