// backend/public/js/saved.js

document.addEventListener("DOMContentLoaded", async () => {
  // Apply localization first to ensure `strings` object is populated
  // This assumes applyLocalization is globally available from localization.js
  if (typeof applyLocalization === "function") {
    applyLocalization();
  } else {
    console.error(
      "applyLocalization function not found. Ensure localization.js is loaded correctly."
    );
    // Fallback strings object to prevent errors, though localization will be broken
    window.strings = window.strings || {
      noSavedConfigs: "No saved configurations found (fallback).",
      errorLoadingConfigs: "Error loading configurations (fallback).",
      confirmDeleteTitle: "Confirm Deletion (fallback)",
      confirmDeleteText:
        "Are you sure you want to delete this configuration? (fallback)",
      cancel: "Cancel (fallback)",
      deleteButton: "Delete (fallback)",
      loadButton: "Load (fallback)",
      viewButton: "View (fallback)",
      configDeleted: "Configuration deleted (fallback).",
      errorDeletingConfig: "Error deleting configuration (fallback).",
      modalPriceNA: "N/A (fallback)",
      currencyRU: "руб. (fallback)",
      currencyEN: "$ (fallback)",
    };
  }

  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login if not authenticated.
    // Ensure localization.js has loaded if any strings are needed for this redirect page or messages.
    window.location.href = "login.html";
    return; // Stop further execution
  }

  // Load and display configurations for the modal and the page (if on saved.html)
  await loadAndDisplaySavedConfigs();

  // If there's a specific element for saved.html page title that uses data-translate,
  // applyLocalization should handle it. If it's dynamic, update it here.
  const pageTitleElement = document.querySelector("h1"); // Example: if main title needs update
  if (pageTitleElement && strings.savedBuildsTitle) {
    // pageTitleElement.textContent = strings.savedBuildsTitle; // If it wasn't covered by data-translate
  }
});

async function loadAndDisplaySavedConfigs() {
  const token = localStorage.getItem("token");
  // Try to get the container for the main saved.html page
  const savedConfigsContainerPage = document.getElementById(
    "saved-configs-container"
  );
  // Try to get the container for the modal
  const myBuildsModalBody = document.getElementById("myBuildsModalBody");

  if (!savedConfigsContainerPage && !myBuildsModalBody) {
    // console.log("No container found for saved configs (page or modal).");
    return;
  }

  if (myBuildsModalBody) myBuildsModalBody.innerHTML = ""; // Clear previous modal content
  if (savedConfigsContainerPage) savedConfigsContainerPage.innerHTML = ""; // Clear previous page content

  try {
    const response = await fetch("/api/configs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const configs = await response.json();

    if (configs.length === 0) {
      const noConfigsMessage =
        strings.noSavedConfigs || "No saved configurations found.";
      if (myBuildsModalBody)
        myBuildsModalBody.innerHTML = `<p class="text-center text-gray-500">${noConfigsMessage}</p>`;
      if (savedConfigsContainerPage)
        savedConfigsContainerPage.innerHTML = `<p class="text-center text-gray-500">${noConfigsMessage}</p>`;
      return;
    }

    // Create table for modal
    const table = document.createElement("table");
    table.className =
      "min-w-full divide-y divide-gray-200 dark:divide-gray-700";
    const thead = document.createElement("thead");
    thead.innerHTML = `
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300" data-translate="configName">${
                  strings.configName || "Name"
                }</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300" data-translate="totalPrice">${
                  strings.totalPrice || "Total Price"
                }</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300" data-translate="actions">${
                  strings.actions || "Actions"
                }</th>
            </tr>
        `;
    const tbody = document.createElement("tbody");
    tbody.className =
      "bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700";

    configs.forEach((config) => {
      const row = tbody.insertRow();
      row.className = "hover:bg-gray-50 dark:hover:bg-gray-700";

      const nameCell = row.insertCell();
      nameCell.className =
        "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white";
      nameCell.textContent = config.name;

      const priceCell = row.insertCell();
      priceCell.className =
        "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300";

      let formattedPrice;
      const currentLang = localStorage.getItem("language") || "en";

      if (
        config.totalPrice === null ||
        typeof config.totalPrice === "undefined" ||
        isNaN(parseFloat(config.totalPrice))
      ) {
        formattedPrice =
          strings.modalPriceNA || (currentLang === "ru" ? "недоступно" : "N/A");
      } else {
        const price = parseFloat(config.totalPrice);
        if (currentLang === "ru") {
          const currencySymbol = strings.currencyRU || "руб.";
          formattedPrice = `${price.toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${currencySymbol}`;
        } else {
          const currencySymbol = strings.currencyEN || "$";
          formattedPrice = `${currencySymbol}${price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }
      }
      priceCell.textContent = formattedPrice;

      const actionsCell = row.insertCell();
      actionsCell.className =
        "px-6 py-4 whitespace-nowrap text-right text-sm font-medium";

      // View/Load Button
      const loadButton = document.createElement("button");
      loadButton.textContent = strings.loadButton || "Load";
      loadButton.className =
        "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3";
      loadButton.onclick = () => loadConfigToBuilder(config._id);

      // Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = strings.deleteButton || "Delete";
      deleteButton.className =
        "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200";
      deleteButton.onclick = () => confirmDeleteConfig(config._id, config.name);

      actionsCell.appendChild(loadButton);
      actionsCell.appendChild(deleteButton);

      // If rendering for the main saved.html page, clone the row or create a different display format
      if (savedConfigsContainerPage) {
        // For saved.html, you might want a card-based layout or a similar table.
        // This example just reuses the table structure for simplicity if both are tables.
        // If savedConfigsContainerPage is not a table body, adjust accordingly.
        const pageRow = row.cloneNode(true);
        // Re-attach event listeners if cloneNode doesn't copy them deeply for complex elements
        pageRow.cells[2].childNodes[0].onclick = () =>
          loadConfigToBuilder(config._id); // Load
        pageRow.cells[2].childNodes[1].onclick = () =>
          confirmDeleteConfig(config._id, config.name); // Delete

        // If savedConfigsContainerPage is the direct container, it needs its own table structure
        // For this example, assume savedConfigsContainerPage is a tbody element or similar
        // This part needs to be adapted to the actual structure of saved.html
      }
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    if (myBuildsModalBody) {
      // Populate modal
      myBuildsModalBody.appendChild(table);
    }

    if (savedConfigsContainerPage) {
      // Populate page content
      // If savedConfigsContainerPage is meant to hold the table directly:
      const pageTable = table.cloneNode(true); // Clone the whole table for the page
      // Re-attach event listeners for all buttons in the cloned table
      const pageTbody = pageTable.querySelector("tbody");
      if (pageTbody) {
        Array.from(pageTbody.rows).forEach((row, index) => {
          const originalConfig = configs[index];
          const actions = row.cells[2];
          if (actions && actions.children.length >= 2) {
            actions.children[0].onclick = () =>
              loadConfigToBuilder(originalConfig._id); // Load
            actions.children[1].onclick = () =>
              confirmDeleteConfig(originalConfig._id, originalConfig.name); // Delete
          }
        });
      }
      savedConfigsContainerPage.appendChild(pageTable);
    }
  } catch (error) {
    console.error("Error loading configurations:", error);
    const errorMessage =
      strings.errorLoadingConfigs || "Error loading configurations.";
    if (myBuildsModalBody)
      myBuildsModalBody.innerHTML = `<p class="text-center text-red-500">${errorMessage}</p>`;
    if (savedConfigsContainerPage)
      savedConfigsContainerPage.innerHTML = `<p class="text-center text-red-500">${errorMessage}</p>`;
  }
}

function loadConfigToBuilder(configId) {
  // Store the config ID to be loaded by build.js
  localStorage.setItem("loadConfigId", configId);
  // Redirect to the build page
  window.location.href = "build.html";
  // Close the modal if it's open (assuming Bootstrap modal)
  const modalElement = document.getElementById("myBuildsModal");
  if (
    modalElement &&
    typeof bootstrap !== "undefined" &&
    bootstrap.Modal.getInstance(modalElement)
  ) {
    bootstrap.Modal.getInstance(modalElement).hide();
  }
}

async function confirmDeleteConfig(configId, configName) {
  // Use a custom modal for confirmation if available, otherwise window.confirm
  // For this example, using window.confirm but ideally replace with a styled modal
  const title = strings.confirmDeleteTitle || "Confirm Deletion";
  const text = (
    strings.confirmDeleteText ||
    "Are you sure you want to delete this configuration: {configName}?"
  ).replace("{configName}", configName);

  if (window.confirm(`${title}\n${text}`)) {
    await deleteConfig(configId);
  }
}

async function deleteConfig(configId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`/api/configs/${configId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to delete configuration." }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    // alert(strings.configDeleted || 'Configuration deleted.');
    showToast(strings.configDeleted || "Configuration deleted.", "success");
    loadAndDisplaySavedConfigs(); // Refresh the list
  } catch (error) {
    console.error("Error deleting configuration:", error);
    // alert((strings.errorDeletingConfig || 'Error deleting configuration.') + ` ${error.message}`);
    showToast(
      (strings.errorDeletingConfig || "Error deleting configuration.") +
        ` ${error.message}`,
      "error"
    );
  }
}

// Simple Toast Notification Function (add to your global JS or here)
function showToast(message, type = "info") {
  const toastContainer =
    document.getElementById("toast-container") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `p-4 mb-4 text-sm rounded-lg shadow-lg`;

  if (type === "success") {
    toast.className +=
      " bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100";
  } else if (type === "error") {
    toast.className +=
      " bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100";
  } else {
    // info
    toast.className +=
      " bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100";
  }

  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

function createToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-5 right-5 z-50";
    document.body.appendChild(container);
  }
  return container;
}

// Ensure this function is globally available if called from localization.js changeLanguage
window.loadAndDisplaySavedConfigs = loadAndDisplaySavedConfigs;
