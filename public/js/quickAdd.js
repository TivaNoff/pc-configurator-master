import {
  setupCpuFiltersHTML,
  setupGpuFiltersHTML,
  setupMbFiltersHTML,
  setupCaseFiltersHTML,
  setupCoolerFiltersHTML,
  setupRamFiltersHTML,
  setupStorageFiltersHTML,
  setupPsuFiltersHTML,
  setupMonitorFiltersHTML,
} from "./quickAdd/uiSetup.js";
import { setupListeners } from "./quickAdd/listeners.js";

document.addEventListener("DOMContentLoaded", () => {
  setupCpuFiltersHTML();
  setupGpuFiltersHTML();
  setupMbFiltersHTML();
  setupCaseFiltersHTML();
  setupCoolerFiltersHTML();
  setupRamFiltersHTML();
  setupStorageFiltersHTML();
  setupPsuFiltersHTML();
  setupMonitorFiltersHTML();

  setupListeners();
});
