// public/js/quickAdd/productFlow.js
import { getKeySpecs } from "./helpers.js";
import { getFilteredProducts } from "./filters.js";
import { getTranslation, translateDynamicElement } from "../localization.js"; // Исправленный импорт

let currentPage = 1;
let pageSize = 20;
let currentCategory = ""; // Эта переменная должна устанавливаться из listeners.js

export function setPageSize(size) {
  pageSize = size;
}

export function getPageSize() {
  return pageSize;
}

export function setCurrentPage(page) {
  currentPage = page;
}

export function setCurrentCategory(cat) {
  // Убедимся, что эта функция вызывается
  currentCategory = cat;
}

export function renderProductsPage(products) {
  const start = (currentPage - 1) * pageSize;
  const pageItems = products.slice(start, start + pageSize);
  const grid = document.getElementById("productsGrid");

  if (!grid) {
    console.error("Products grid not found!");
    return;
  }

  grid.innerHTML = pageItems
    .map((p) => {
      const s = p.specs || {};
      // Используем getProductDisplayTitle из build.js или создаем аналогичную локальную функцию
      // Для простоты, пока оставим текущую логику формирования title
      // Также, хорошо бы иметь getProductDisplayTitle в localization.js или helpers.js, чтобы избежать дублирования
      const title =
        p.specs?.metadata?.name ||
        [s.manufacturer, s.series, s.model].filter(Boolean).join(" ") ||
        p.opendb_id;
      const price = p.prices?.Ekua ?? 0;
      const imgUrl = p?.storeImg?.Ekua || "/img/placeholder.png";

      // Передаем currentCategory в getKeySpecs
      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => {
          // Пытаемся перевести ключ характеристики. Если его нет в переводах, используем оригинальный ключ.
          // Ключи типа "Cores", "Socket" должны быть в файле localization.js для перевода.
          const translatedKey =
            getTranslation(
              `spec_key_${e.k.toLowerCase().replace(/\s+/g, "_")}`
            ) || e.k;
          return `<li><strong>${translatedKey}:</strong> ${e.v}</li>`;
        })
        .join("");
      const addToBuildText =
        getTranslation("add_to_build_btn_text") || "Add to build";

      return `
        <div class="card" data-id="${p.opendb_id}">
          <div class="card-img">
            <img src="${imgUrl}" alt="${title}" loading="lazy" onerror="this.src='/img/placeholder.png'" />
          </div>
          <div class="card-info">
            <h4 class="card-title multiline-truncate">${title}</h4>
            <p class="card-price">₴${price.toFixed(2).replace(".", ",")}</p>
            <ul class="card-specs">${specsLi}</ul>
            <button class="add-to-build">${addToBuildText}</button>
          </div>
        </div>`;
    })
    .join("");

  renderPagination(products.length);
}

function renderPagination(totalItems) {
  const paginationCtrls = document.getElementById("paginationControls");
  if (!paginationCtrls) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  let pageInfoSpan = paginationCtrls.querySelector(".page-info-span");

  if (totalPages <= 0) {
    paginationCtrls.innerHTML = "";
    return;
  }

  if (!pageInfoSpan) {
    paginationCtrls.innerHTML = `
        <button id="firstPage" title="${
          getTranslation("pagination_first_page") || "First Page"
        }">&laquo;</button>
        <button id="prevPage" title="${
          getTranslation("pagination_prev_page") || "Previous Page"
        }">&lsaquo;</button>
        <span class="page-info-span"></span>
        <button id="nextPage" title="${
          getTranslation("pagination_next_page") || "Next Page"
        }">&rsaquo;</button>
        <button id="lastPage" title="${
          getTranslation("pagination_last_page") || "Last Page"
        }">&raquo;</button>
      `;

    paginationCtrls
      .querySelector("#firstPage")
      ?.addEventListener("click", () => {
        setCurrentPage(1);
        rerenderCurrentPage();
      });
    paginationCtrls
      .querySelector("#prevPage")
      ?.addEventListener("click", () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
          rerenderCurrentPage();
        }
      });
    paginationCtrls
      .querySelector("#nextPage")
      ?.addEventListener("click", () => {
        // Пересчитываем totalPages здесь, так как количество отфильтрованных продуктов могло измениться
        const currentTotalPages = Math.ceil(
          getFilteredProducts().length / getPageSize()
        );
        if (currentPage < currentTotalPages) {
          setCurrentPage(currentPage + 1);
          rerenderCurrentPage();
        }
      });
    paginationCtrls
      .querySelector("#lastPage")
      ?.addEventListener("click", () => {
        const currentTotalPages = Math.ceil(
          getFilteredProducts().length / getPageSize()
        );
        setCurrentPage(currentTotalPages);
        rerenderCurrentPage();
      });
    pageInfoSpan = paginationCtrls.querySelector(".page-info-span"); // Получаем span снова после создания
  }

  if (pageInfoSpan) {
    pageInfoSpan.textContent = getTranslation(
      "pagination_page_info",
      undefined,
      { currentPage, totalPages }
    );
  }

  const firstBtn = paginationCtrls.querySelector("#firstPage");
  const prevBtn = paginationCtrls.querySelector("#prevPage");
  const nextBtn = paginationCtrls.querySelector("#nextPage");
  const lastBtn = paginationCtrls.querySelector("#lastPage");

  if (firstBtn) firstBtn.disabled = currentPage === 1;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  // Обновляем totalPages для кнопок next/last, так как они могли измениться
  const currentTotalPagesForButtons = Math.ceil(totalItems / pageSize);
  if (nextBtn)
    nextBtn.disabled =
      currentPage === currentTotalPagesForButtons ||
      currentTotalPagesForButtons === 0;
  if (lastBtn)
    lastBtn.disabled =
      currentPage === currentTotalPagesForButtons ||
      currentTotalPagesForButtons === 0;
}

function rerenderCurrentPage() {
  const products = getFilteredProducts();
  renderProductsPage(products);
}

// Убедитесь, что эти ключи добавлены в ваш файл localization.js:
// en: {
//    ...
//    add_to_build_btn_text: "Add to build",
//    pagination_page_info: "Page {currentPage} of {totalPages}",
//    pagination_first_page: "First Page",
//    pagination_prev_page: "Previous Page",
//    pagination_next_page: "Next Page",
//    pagination_last_page: "Last Page",
//    spec_key_form_factor: "Form Factor", // Пример для перевода ключей характеристик
//    spec_key_cores: "Cores",
//    spec_key_threads: "Threads",
//    // ... и так далее для всех ключей из getKeySpecs
//    ...
// }
// uk: {
//    ...
//    add_to_build_btn_text: "Додати до збірки",
//    pagination_page_info: "Сторінка {currentPage} з {totalPages}",
//    pagination_first_page: "Перша сторінка",
//    pagination_prev_page: "Попередня сторінка",
//    pagination_next_page: "Наступна сторінка",
//    pagination_last_page: "Остання сторінка",
//    spec_key_form_factor: "Форм-фактор",
//    spec_key_cores: "Ядра",
//    spec_key_threads: "Потоки",
//    // ... и так далее
//    ...
// }
