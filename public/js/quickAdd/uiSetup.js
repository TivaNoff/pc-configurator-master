// public/js/quickAdd/uiSetup.js
import { getTranslation } from "../localization.js"; // *** ДОБАВЛЕН ИМПОРТ ***

// Вспомогательная функция для создания секции фильтра
function createFilterSection(titleKey, filterDivId) {
  // Теперь getTranslation должна быть доступна
  const titleText =
    getTranslation(titleKey) ||
    titleKey
      .split("_")
      .pop()
      .replace(/^\w/, (c) => c.toUpperCase());
  return `
    <hr class="sidebar-divider">    
    <h5 data-translate="${titleKey}">${titleText}</h5> 
    <div id="${filterDivId}"></div>
  `;
}

export function setupCpuFiltersHTML() {
  const cpuFiltersHTML = `
    <div id="cpu-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_socket", "cpuSocketFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "cpuManufacturerFilter"
      )}
      ${createFilterSection("filter_title_core_count", "cpuCoreCountFilter")}
      ${createFilterSection("filter_title_lithography", "cpuLithographyFilter")}
      ${createFilterSection(
        "filter_title_integrated_graphics",
        "cpuIntegratedGraphicsFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", cpuFiltersHTML);
}

export function setupGpuFiltersHTML() {
  const gpuFiltersHTML = `
    <div id="gpu-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_chipset", "gpuChipsetFilter")}
      ${createFilterSection(
        "filter_title_chipset_manufacturer",
        "gpuChipsetManufacturerFilter"
      )}
      ${createFilterSection("filter_title_memory_size", "gpuMemorySizeFilter")}
      ${createFilterSection("filter_title_memory_type", "gpuMemoryTypeFilter")}
      ${createFilterSection("filter_title_interface", "gpuInterfaceFilter")}
      ${createFilterSection("filter_title_frame_sync", "gpuFrameSyncFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "gpuManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", gpuFiltersHTML);
}

export function setupMbFiltersHTML() {
  const mbFiltersHTML = `
    <div id="mb-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_socket", "mbSocketFilter")}
      ${createFilterSection("filter_title_form_factor", "mbFormFactorFilter")}
      ${createFilterSection("filter_title_chipset", "mbChipsetFilter")}
      ${createFilterSection("filter_title_ram_type", "mbRamTypeFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "mbManufacturerFilter"
      )}
      ${createFilterSection("filter_title_memory_slots", "mbMemorySlotsFilter")}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", mbFiltersHTML);
}

export function setupRamFiltersHTML() {
  const ramFiltersHTML = `
    <div id="ramfilters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_ram_type", "ramTypeFilter")}
      ${createFilterSection("filter_title_form_factor", "ramFormFactorFilter")}
      ${createFilterSection("filter_title_speed_mhz", "ramSpeedFilter")}
      ${createFilterSection(
        "filter_title_modules_quantity",
        "ramModulesQuantityFilter"
      )}
      ${createFilterSection(
        "filter_title_capacity_per_module",
        "ramCapacityPerModuleFilter"
      )}
      ${createFilterSection("filter_title_cas_latency", "ramCasLatencyFilter")}
      ${createFilterSection("filter_title_ecc", "ramEccFilter")}
      ${createFilterSection("filter_title_registered", "ramRegisteredFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "ramManufacturerFilter"
      )}
      ${createFilterSection("filter_title_rgb", "ramRgbFilter")}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", ramFiltersHTML);
}

export function setupStorageFiltersHTML() {
  const storageFiltersHTML = `
    <div id="storage-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_type", "storageTypeFilter")}
      ${createFilterSection(
        "filter_title_form_factor",
        "storageFormFactorFilter"
      )}
      ${createFilterSection("filter_title_interface", "storageInterfaceFilter")}
      ${createFilterSection("filter_title_capacity", "storageCapacityFilter")}
      ${createFilterSection("filter_title_nvme", "storageNvmeFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "storageManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", storageFiltersHTML);
}

export function setupCaseFiltersHTML() {
  const caseFiltersHTML = `
    <div id="case-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_form_factor", "caseFormFactorFilter")}
      ${createFilterSection("filter_title_side_panel", "caseSidePanelFilter")}
      ${createFilterSection("filter_title_color", "caseColorFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "caseManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", caseFiltersHTML);
}

export function setupPsuFiltersHTML() {
  const psuFiltersHTML = `
    <div id="psu-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_form_factor", "psuFormFactorFilter")}
      ${createFilterSection(
        "filter_title_efficiency_rating",
        "psuEfficiencyRatingFilter"
      )}
      ${createFilterSection("filter_title_modular", "psuModularFilter")}
      ${createFilterSection("filter_title_wattage", "psuWattageFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "psuManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", psuFiltersHTML);
}

export function setupCoolerFiltersHTML() {
  const coolerFiltersHTML = `
    <div id="cooler-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection(
        "filter_title_manufacturer",
        "coolerManufacturerFilter"
      )}
      ${createFilterSection(
        "filter_title_water_cooled",
        "coolerWaterCooledFilter"
      )}
      ${createFilterSection(
        "filter_title_radiator_size",
        "coolerRadiatorSizeFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", coolerFiltersHTML);
}

export function setupMonitorFiltersHTML() {
  const monitorFiltersHTML = `
    <div id="monitor-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_brand", "monitorBrandFilter")}
      ${createFilterSection(
        "filter_title_screen_size",
        "monitorScreenSizeFilter"
      )}
      ${createFilterSection(
        "filter_title_resolution",
        "monitorResolutionFilter"
      )}
      ${createFilterSection(
        "filter_title_refresh_rate",
        "monitorRefreshRateFilter"
      )}
      ${createFilterSection(
        "filter_title_panel_type",
        "monitorPanelTypeFilter"
      )}
      ${createFilterSection(
        "filter_title_adaptive_sync",
        "monitorAdaptiveSyncFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", monitorFiltersHTML);
}

export function setupCaseFanFiltersHTML() {
  const caseFanFiltersHTML = `
    <div id="casefan-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_size_mm", "fanSizeFilter")}
      ${createFilterSection("filter_title_quantity", "fanQuantityFilter")}
      ${createFilterSection("filter_title_pwm", "fanPwmFilter")}
      ${createFilterSection("filter_title_led", "fanLedFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "fanManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", caseFanFiltersHTML);
}

export function setupCaptureCardFiltersHTML() {
  const captureCardFiltersHTML = `
    <div id="capturecard-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_interface", "captureInterfaceFilter")}
      ${createFilterSection(
        "filter_title_max_video_resolution",
        "captureMaxVideoResolutionFilter"
      )}
      ${createFilterSection(
        "filter_title_manufacturer",
        "captureManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", captureCardFiltersHTML);
}

export function setupSoundCardFiltersHTML() {
  const soundCardFiltersHTML = `
    <div id="soundcard-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection(
        "filter_title_interface",
        "soundcardInterfaceFilter"
      )}
      ${createFilterSection("filter_title_channels", "soundcardChannelsFilter")}
      ${createFilterSection(
        "filter_title_sample_rate",
        "soundcardSampleRateFilter"
      )}
      ${createFilterSection("filter_title_snr", "soundcardSnrFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "soundcardManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", soundCardFiltersHTML);
}

export function setupNetworkCardFiltersHTML() {
  const networkCardFiltersHTML = `
    <div id="networkcard-filters" style="display:none" class="sidebar-filter-section">
      ${createFilterSection("filter_title_interface", "networkInterfaceFilter")}
      ${createFilterSection("filter_title_protocol", "networkProtocolFilter")}
      ${createFilterSection(
        "filter_title_manufacturer",
        "networkManufacturerFilter"
      )}
    </div>
  `;
  const sidebar = document.querySelector(".filter-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", networkCardFiltersHTML);
}
