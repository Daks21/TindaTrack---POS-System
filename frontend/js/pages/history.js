checkAuth();

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const salesTableBody = document.getElementById("sales-table-body");
const salesEmptyState = document.getElementById("sales-empty-state");
const historySummary = document.getElementById("history-summary");

const savedSales = localStorage.getItem("sales");

const fromDateInput = document.getElementById("from-date");
const toDateInput = document.getElementById("to-date");
const receiptSearchInput = document.getElementById("receipt-search");
const resetFiltersButton = document.getElementById("reset-filters-button");

let sales = [];

if (savedSales !== null) {
  sales = JSON.parse(savedSales);
}


fromDateInput.addEventListener("change", function () {
  filterSales();
});

toDateInput.addEventListener("change", function () {
  filterSales();
});

receiptSearchInput.addEventListener("keyup", function () {
  filterSales();
});

resetFiltersButton.addEventListener("click", function () {
  fromDateInput.value = "";
  toDateInput.value = "";
  receiptSearchInput.value = "";

  renderSales(sales);
});

function formatReceiptNumber(saleId) {
  return `RCPT-${saleId}`;
}

function renderSales(salesArray) {
  salesTableBody.innerHTML = "";

  if (salesArray.length === 0) {
    salesEmptyState.style.display = "block";
    historySummary.textContent = "Showing 0 transactions | Total: ₱0.00";
    return;
  }

  salesEmptyState.style.display = "none";

  salesArray.forEach(function (sale) {
    const row = document.createElement("tr");

    const saleDate = new Date(sale.timestamp);
    const itemCount = sale.items.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);

    row.innerHTML = `
      <td>${formatReceiptNumber(sale.id)}</td>
      <td>${saleDate.toLocaleDateString("en-PH")}</td>
      <td>${saleDate.toLocaleTimeString("en-PH", { hour: '2-digit', minute: '2-digit' })}</td>
      <td>${itemCount}</td>
      <td>${formatPeso(sale.total)}</td>
      <td>${sale.cashier}</td>
      <td>
        <button type="button" class="table-button edit-button view-sale-button" data-id="${sale.id}">
          View
        </button>
      </td>
    `;

    salesTableBody.appendChild(row);
  });

  attachViewSaleEvents();

  const totalSalesAmount = salesArray.reduce(function (sum, sale) {
    return sum + sale.total;
  }, 0);

  historySummary.textContent = `Showing ${salesArray.length} transaction(s) | Total: ${formatPeso(totalSalesAmount)}`;
}

function filterSales() {
  let filteredSales = [...sales];

  const fromDate = fromDateInput.value;
  const toDate = toDateInput.value;
  const receiptSearch = receiptSearchInput.value.trim().toLowerCase();

  if (fromDate !== "") {
    filteredSales = filteredSales.filter(function (sale) {
      return new Date(sale.timestamp) >= new Date(fromDate);
    });
  }

  if (toDate !== "") {
    filteredSales = filteredSales.filter(function (sale) {
      const saleDate = new Date(sale.timestamp);
      const endDate = new Date(toDate);

      endDate.setHours(23, 59, 59, 999);

      return saleDate <= endDate;
    });
  }

  if (receiptSearch !== "") {
    filteredSales = filteredSales.filter(function (sale) {
      const receiptNumber = formatReceiptNumber(sale.id).toLowerCase();

      return receiptNumber.includes(receiptSearch);
    });
  }

  renderSales(filteredSales);
}

function attachViewSaleEvents() {
  const viewButtons = document.querySelectorAll(".view-sale-button");

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const saleId = Number(button.dataset.id);
      openSaleDetailModal(saleId);
    });
  });
}

function openSaleDetailModal(saleId) {
  const sale = sales.find(function (sale) {
    return sale.id === saleId;
  });

  if (!sale) {
    return;
  }

  showReceipt(sale);
}

renderSales(sales);