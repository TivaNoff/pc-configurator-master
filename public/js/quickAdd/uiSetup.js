// uiSetup.js

export function setupCpuFiltersHTML() {
  const cpuFiltersHTML = `
    <div id="cpu-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">    
    <h5>Socket</h5>
      <div id="socketFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Microarchitecture</h5>
      <div id="microarchitectureFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Integrated Graphics</h5>
      <div id="integratedGraphicsFilter"></div>
    </div>
  `;
  document
    .querySelector(".filter-sidebar")
    .insertAdjacentHTML("beforeend", cpuFiltersHTML);
}

// Добавляем HTML для фильтров GPU
export function setupGpuFiltersHTML() {
  const gpuFiltersHTML = `
    <div id="gpu-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">    
    <h5>Chipset</h5>
      <div id="chipsetFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Memory Type</h5>
      <div id="memoryTypeFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Interface</h5>
      <div id="interfaceFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Manufacturer</h5>
      <div id="manufacturerFilter"></div>
    </div>
  `;
  document
    .querySelector(".filter-sidebar")
    .insertAdjacentHTML("beforeend", gpuFiltersHTML);
}

// Додаємо HTML для фільтрів Motherboard
export function setupMbFiltersHTML() {
  const mbFiltersHTML = `
    <div id="mb-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">    
    <h5>Socket</h5>
      <div id="socketFilterMB"></div>
      <hr class="sidebar-divider">  
      <h5>Form Factor</h5>
      <div id="formFactorFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Chipset</h5>
      <div id="mbChipsetFilter"></div>
      <hr class="sidebar-divider">  
      <h5>RAM Type</h5>
      <div id="ramTypeFilter"></div>
      <hr class="sidebar-divider">  
      <h5>Manufacturer</h5>
      <div id="mbManufacturerFilter"></div>
    </div>
  `;
  document
    .querySelector(".filter-sidebar")
    .insertAdjacentHTML("beforeend", mbFiltersHTML);
}

// Додаём HTML для фильтров PC Case
export function setupCaseFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupCaseFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <div id="case-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">  
    <h5>Form Factor</h5>    
      <div id="caseFormFactorFilter"></div>
      <hr class="sidebar-divider">
      <h5>Side Panel</h5>     
      <div id="sidePanelFilter"></div>
      <hr class="sidebar-divider">
      <h5>Manufacturer</h5>   
      <div id="caseManufacturerFilter"></div>
    </div>
  `
  );
}

// Додаємо HTML для фільтрів CPUCooler
export function setupCoolerFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupCoolerFiltersHTML: .filter-sidebar не знайдено");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    
    <div id="cooler-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">  
    <h5>Manufacturer</h5>
      <div id="coolerManufacturerFilter"></div>
      <hr class="sidebar-divider">
      <h5>Water Cooled</h5>
      <div id="waterCooledFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров RAM
export function setupRamFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupRamFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    
    <div id="ramfilters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">  
    <h5>RAM Type</h5>       
      <div id="ramTypeFilterRAM"></div>
      <hr class="sidebar-divider">
      <h5>Form Factor</h5>    
      <div id="ramFormFactorFilter"></div>
      <hr class="sidebar-divider">
      <h5>ECC</h5>            
      <div id="eccFilter"></div>
      <hr class="sidebar-divider">
      <h5>Registered</h5>     
      <div id="registeredFilter"></div>
      <hr class="sidebar-divider">
      <h5>Manufacturer</h5>   
      <div id="ramManufacturerFilter"></div>
      <hr class="sidebar-divider">
      <h5>Heat Spreader</h5>  
      <div id="heatSpreaderFilter"></div>
      <hr class="sidebar-divider">
      <h5>RGB</h5>            
      <div id="rgbFilter"></div>
    </div>
  `
  );
}

// ———————————————————————————————————————————————————
// Добавляем HTML для фильтров Storage
export function setupStorageFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupStorageFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    
    <div id="storage-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">  
    <h5>Type</h5>         
      <div id="storageTypeFilter"></div>
      <hr class="sidebar-divider">
      <h5>Form Factor</h5>  
      <div id="storageFormFactorFilter"></div>
      <hr class="sidebar-divider">
      <h5>Interface</h5>    
      <div id="storageInterfaceFilter"></div>
      <hr class="sidebar-divider">
      <h5>Manufacturer</h5>
      <div id="storageManufacturerFilter"></div>
      <hr class="sidebar-divider">
      <h5>NVMe</h5>         <div id="nvmeFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров PSU
export function setupPsuFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupPsuFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    
    <div id="psu-filters" style="display:none" class="sidebar-filter-section">
      <hr class="sidebar-divider">
      <h5>Form Factor</h5>       
      <div id="psuFormFactorFilter"></div>
      <hr class="sidebar-divider">
      <h5>Efficiency Rating</h5> 
      <div id="efficiencyRatingFilter"></div>
      <hr class="sidebar-divider">
      <h5>Modularity</h5>        
      <div id="modularFilter"></div>
      <hr class="sidebar-divider">
      <h5>Manufacturer</h5>      
      <div id="psuManufacturerFilter"></div>
    </div>
  `
  );
}

// Добавляем HTML для фильтров Monitor
export function setupMonitorFiltersHTML() {
  const sidebar = document.querySelector(".filter-sidebar");
  if (!sidebar)
    return console.error("setupMonitorFiltersHTML: .filter-sidebar не найден");
  sidebar.insertAdjacentHTML(
    "beforeend",
    `
    <div id="monitor-filters" style="display:none" class="sidebar-filter-section">
    <hr class="sidebar-divider">
      <h5>Brand</h5>
      <div id="monitorBrandFilter"></div>
      <hr class="sidebar-divider">
      <hr class="sidebar-divider">
      <h5>Refresh Rate</h5>
      <div id="refreshRateFilter"></div>
      <hr class="sidebar-divider">
      <h5>Screen Size</h5>
      <div id="screenSizeFilter"></div>
      <hr class="sidebar-divider">
      <h5>Vertical Resolution</h5>
      <div id="verticalResFilter"></div>
      <hr class="sidebar-divider">
      <h5>Horizontal Resolution</h5>
      <div id="horizontalResFilter"></div>
    </div>
  `
  );
}
