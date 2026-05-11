checkAuth();

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const totalSalesToday = document.getElementById("total-sales-today");
const totalProducts = document.getElementById("total-products");
const lowStockItems = document.getElementById("low-stock-items");
const transactionsToday = document.getElementById("transactions-today");

const dashboardData = {
  totalSalesToday: 12500,
  totalProducts: 45,
  lowStockItems: 6,
  transactionsToday: 28
};

if (currentUser) {
  userName.textContent = currentUser.fullName;
}

totalSalesToday.textContent = `₱${dashboardData.totalSalesToday.toLocaleString()}`;
totalProducts.textContent = dashboardData.totalProducts;
lowStockItems.textContent = dashboardData.lowStockItems;
transactionsToday.textContent = dashboardData.transactionsToday;

