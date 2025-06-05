import { getTranslation } from "../localization.js";

export function renderCheckboxList(containerId, values, changeCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const translatedValues = Array.from(values).map((value) => {
    const translated =
      getTranslation(
        `filter_value_${String(value).toLowerCase().replace(/\s+/g, "_")}`
      ) || String(value);
    return { original: String(value), translated: translated };
  });

  translatedValues.sort((a, b) =>
    a.translated.localeCompare(b.translated, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  translatedValues.forEach(({ original, translated }) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = original;
    checkbox.name = containerId;
    checkbox.addEventListener("change", changeCallback);
    label.append(checkbox, original);
    container.append(label);
  });
}

export function getCheckedValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll("input:checked")).map(
    (cb) => cb.value
  );
}

export function debounce(func, delay) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}

export function getKeySpecs(specs, category) {
  if (!specs) return [];
  const keySpecs = [];
  const maxSpecsToShow = 3;

  if (specs.metadata?.manufacturer)
    keySpecs.push({
      k: getTranslation("spec_key_manufacturer"),
      v: specs.metadata.manufacturer,
    });
  else if (specs.manufacturer)
    keySpecs.push({
      k: getTranslation("spec_key_manufacturer"),
      v: specs.manufacturer,
    });

  if (specs.series)
    keySpecs.push({ k: getTranslation("spec_key_series"), v: specs.series });

  switch (category) {
    case "CPU":
      if (specs.socket)
        keySpecs.push({
          k: getTranslation("spec_key_socket"),
          v: specs.socket,
        });
      if (specs.cores?.total)
        keySpecs.push({
          k: getTranslation("spec_key_cores_total"),
          v: `${specs.cores.total} (${
            specs.cores.threads || specs.cores.total
          } ${getTranslation("threads_label") || "threads"})`,
        });
      if (specs.clocks?.performance?.base)
        keySpecs.push({
          k: getTranslation("spec_key_clocks_performance_base"),
          v: `${specs.clocks.performance.base} GHz`,
        });
      if (specs.specifications?.tdp_w || specs.specifications?.tdp)
        keySpecs.push({
          k: getTranslation("spec_key_tdp_w"),
          v: `${specs.specifications.tdp_w || specs.specifications.tdp}W`,
        });
      break;
    case "GPU":
      if (specs.chipset)
        keySpecs.push({
          k: getTranslation("spec_key_chipset"),
          v: specs.chipset,
        });
      if (specs.memory) {
        let memType = specs.memory_type || "";
        keySpecs.push({
          k: getTranslation("spec_key_memory"),
          v: `${specs.memory}GB ${memType}`,
        });
      }
      if (specs.core_boost_clock)
        keySpecs.push({
          k: getTranslation("spec_key_core_boost_clock"),
          v: `${specs.core_boost_clock} MHz`,
        });
      if (specs.length_mm || specs.length)
        keySpecs.push({
          k: getTranslation("spec_key_length_mm"),
          v: `${specs.length_mm || specs.length}mm`,
        });
      break;
    case "Motherboard":
      if (specs.socket)
        keySpecs.push({
          k: getTranslation("spec_key_socket"),
          v: specs.socket,
        });
      if (specs.form_factor)
        keySpecs.push({
          k: getTranslation("spec_key_form_factor"),
          v: specs.form_factor,
        });
      if (specs.chipset)
        keySpecs.push({
          k: getTranslation("spec_key_chipset"),
          v: specs.chipset,
        });
      if (specs.memory?.ram_type)
        keySpecs.push({
          k: getTranslation("spec_key_memory_ram_type"),
          v: specs.memory.ram_type,
        });
      break;
    case "RAM":
      if (specs.capacity) {
        let capacityString = `${specs.capacity}GB`;
        if (specs.modules?.quantity && specs.modules?.capacity_gb) {
          capacityString += ` (${specs.modules.quantity}x${specs.modules.capacity_gb}GB)`;
        }
        keySpecs.push({
          k: getTranslation("spec_key_capacity"),
          v: capacityString,
        });
      }
      if (specs.ram_type)
        keySpecs.push({
          k: getTranslation("spec_key_ram_type"),
          v: specs.ram_type,
        });
      if (specs.speed || specs.speed_mhz)
        keySpecs.push({
          k: getTranslation("spec_key_speed_mhz"),
          v: `${specs.speed || specs.speed_mhz} MHz`,
        });
      if (specs.cas_latency)
        keySpecs.push({
          k: getTranslation("spec_key_cas_latency"),
          v: `CL${specs.cas_latency}`,
        });
      break;
    case "Storage":
      if (specs.capacity) {
        let capacityVal = specs.capacity;
        let unit = "GB";
        if (capacityVal >= 1000) {
        }
        keySpecs.push({
          k: getTranslation("spec_key_capacity"),
          v: `${capacityVal}${unit}`,
        });
      }
      if (specs.type)
        keySpecs.push({
          k: getTranslation("spec_key_type"),
          v:
            getTranslation(
              "spec_key_" +
                String(specs.type).toLowerCase().replace(/\s+/g, "_")
            ) || specs.type,
        });
      if (specs.form_factor)
        keySpecs.push({
          k: getTranslation("spec_key_form_factor"),
          v: specs.form_factor,
        });
      if (specs.interface)
        keySpecs.push({
          k: getTranslation("spec_key_interface"),
          v: specs.interface,
        });
      break;
    case "PCCase":
      if (specs.form_factor) {
        const ff = Array.isArray(specs.form_factor)
          ? specs.form_factor.join(", ")
          : specs.form_factor;
        keySpecs.push({ k: getTranslation("spec_key_form_factor"), v: ff });
      }
      if (specs.color?.join)
        keySpecs.push({
          k: getTranslation("spec_key_color"),
          v: specs.color
            .map((c) => getTranslation(`color_${c.toLowerCase()}`) || c)
            .join(", "),
        });
      if (specs.max_video_card_length || specs.max_video_card_length_mm)
        keySpecs.push({
          k: getTranslation("spec_key_max_gpu_length_mm"),
          v: `${
            specs.max_video_card_length || specs.max_video_card_length_mm
          }mm`,
        });
      break;
    case "PSU":
      if (specs.wattage)
        keySpecs.push({
          k: getTranslation("spec_key_wattage"),
          v: `${specs.wattage}W`,
        });
      if (specs.efficiency_rating)
        keySpecs.push({
          k: getTranslation("spec_key_efficiency_rating"),
          v: specs.efficiency_rating,
        });
      if (specs.modular)
        keySpecs.push({
          k: getTranslation("spec_key_modular"),
          v:
            getTranslation(`modular_${specs.modular.toLowerCase()}`) ||
            specs.modular,
        });
      break;
    case "CPUCooler":
      if (specs.height_mm || specs.height)
        keySpecs.push({
          k: getTranslation("spec_key_height_mm"),
          v: `${specs.height_mm || specs.height}mm`,
        });
      if (typeof specs.water_cooled === "boolean")
        keySpecs.push({
          k: getTranslation("spec_key_water_cooled"),
          v: specs.water_cooled
            ? getTranslation("yes_filter")
            : getTranslation("no_filter"),
        });
      if (specs.radiator_size && specs.water_cooled)
        keySpecs.push({
          k: getTranslation("spec_key_radiator_size"),
          v: `${specs.radiator_size}mm`,
        });
      if (specs.min_fan_rpm && specs.max_fan_rpm)
        keySpecs.push({
          k: getTranslation("spec_key_fan_rpm"),
          v: `${specs.min_fan_rpm} - ${specs.max_fan_rpm} RPM`,
        });
      break;
    case "Monitor":
      if (specs.screen_size)
        keySpecs.push({
          k: getTranslation("spec_key_screen_size"),
          v: `${specs.screen_size}"`,
        });
      if (specs.resolution?.horizontalRes && specs.resolution?.verticalRes)
        keySpecs.push({
          k: getTranslation("spec_key_resolution"),
          v: `${specs.resolution.horizontalRes}x${specs.resolution.verticalRes}`,
        });
      if (specs.refresh_rate)
        keySpecs.push({
          k: getTranslation("spec_key_refresh_rate"),
          v: `${specs.refresh_rate}Hz`,
        });
      if (specs.panel_type)
        keySpecs.push({
          k: getTranslation("spec_key_panel_type"),
          v: specs.panel_type,
        });
      break;
    case "CaseFan":
      if (specs.size)
        keySpecs.push({
          k: getTranslation("spec_key_size"),
          v: `${specs.size}mm`,
        });
      if (specs.quantity)
        keySpecs.push({
          k: getTranslation("spec_key_quantity"),
          v: specs.quantity,
        });
      if (typeof specs.pwm === "boolean")
        keySpecs.push({
          k: getTranslation("spec_key_pwm"),
          v: specs.pwm
            ? getTranslation("yes_filter")
            : getTranslation("no_filter"),
        });
      if (specs.led && specs.led !== "None")
        keySpecs.push({ k: getTranslation("spec_key_led"), v: specs.led });
      break;

    default:
      if (
        specs.type &&
        !keySpecs.some((s) => s.k === getTranslation("spec_key_type"))
      )
        keySpecs.push({ k: getTranslation("spec_key_type"), v: specs.type });
      break;
  }
  return keySpecs.slice(0, maxSpecsToShow);
}
