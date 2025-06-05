import { getKeySpecs } from "./helpers.js";
import { getFilteredProducts } from "./filters.js";
import { getTranslation, translateDynamicElement } from "../localization.js";

let currentPage = 1;
let pageSize = 20;
let currentCategory = "";

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
      const title =
        p.specs?.metadata?.name ||
        [p.specs?.manufacturer, p.specs?.series, p.specs?.model]
          .filter(Boolean)
          .join(" ") ||
        p.opendb_id;
      const price = p.prices?.Ekua ?? 0;
      const imgUrl = p?.storeImg?.Ekua || "/img/placeholder.png";

      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => {
          return `<li><strong>${e.k}:</strong> ${e.v}</li>`;
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
    pageInfoSpan = paginationCtrls.querySelector(".page-info-span");
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
