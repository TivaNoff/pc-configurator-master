// productFlow.js

import { getKeySpecs } from "./helpers.js";
import { getFilteredProducts } from "./filters.js";

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

  grid.innerHTML = pageItems
    .map((p) => {
      const s = p.specs || {};
      const title =
        p.specs?.metadata?.name ||
        [s.manufacturer, s.series, s.model].filter(Boolean).join(" ") ||
        p.opendb_id;
      const price = p.prices?.Ekua ?? 0;
      const imgUrl = p?.storeImg?.Ekua || "/img/placeholder.png";
      const specsLi = getKeySpecs(s, currentCategory)
        .map((e) => `<li><strong>${e.k}:</strong> ${e.v}</li>`)
        .join("");

      return `
        <div class="card" data-id="${p.opendb_id}">
          <div class="card-img">
            <img src="${imgUrl}" alt="${title}" onerror="this.src='/img/placeholder.png'" />
          </div>
          <div class="card-info">
            <h4 class="card-title multiline-truncate">${title}</h4>
            <p class="card-price">${price} грн</p>
            <ul class="card-specs">${specsLi}</ul>
            <button class="add-to-build">Add to build</button>
          </div>
        </div>`;
    })
    .join("");

  renderPagination(products.length);
}

function renderPagination(totalItems) {
  const paginationCtrls = document.getElementById("paginationControls");
  const totalPages = Math.ceil(totalItems / pageSize);

  paginationCtrls.innerHTML = `
    <button id="firstPage" ${
      currentPage === 1 ? "disabled" : ""
    }>&laquo;</button>
    <button id="prevPage" ${
      currentPage === 1 ? "disabled" : ""
    }>&lsaquo;</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button id="nextPage" ${
      currentPage === totalPages ? "disabled" : ""
    }>&rsaquo;</button>
    <button id="lastPage" ${
      currentPage === totalPages ? "disabled" : ""
    }>&raquo;</button>
  `;

  paginationCtrls.querySelector("#firstPage").onclick = () => {
    setCurrentPage(1);
    rerenderCurrentPage();
  };
  paginationCtrls.querySelector("#prevPage").onclick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      rerenderCurrentPage();
    }
  };
  paginationCtrls.querySelector("#nextPage").onclick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      rerenderCurrentPage();
    }
  };
  paginationCtrls.querySelector("#lastPage").onclick = () => {
    setCurrentPage(totalPages);
    rerenderCurrentPage();
  };
}

function rerenderCurrentPage() {
  const products = getFilteredProducts();
  renderProductsPage(products);
}
