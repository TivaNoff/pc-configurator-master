import {
  setupCpuFiltersHTML,
  setupGpuFiltersHTML,
  setupMbFiltersHTML,
  setupCaseFiltersHTML,
  setupCoolerFiltersHTML,
  setupRamFiltersHTML, // ← импорт для RAM
  setupStorageFiltersHTML,
  setupPsuFiltersHTML,
  setupMonitorFiltersHTML,
} from "./quickAdd/uiSetup.js";
import { setupListeners } from "./quickAdd/listeners.js"; // ✅ правильно

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
