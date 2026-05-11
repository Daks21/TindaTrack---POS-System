checkAuth();

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userName    = document.getElementById('user-name');

const inventoryTableBody    = document.getElementById('inventory-table-body');
const inventorySearch       = document.getElementById('inventory-search');
const inventorySummary      = document.getElementById('inventory-summary');
const restockColHeader      = document.getElementById('restock-col-header');
const inventoryCategorySelect = document.getElementById('inventory-category-select');
const inventoryStatusSelect   = document.getElementById('inventory-status-select');

const restockModal         = document.getElementById('restock-modal');
const closeRestockModal    = document.getElementById('close-restock-modal');
const confirmRestock       = document.getElementById('confirm-restock');
const restockQuantityInput = document.getElementById('restock-quantity');
const restockProductInfo   = document.getElementById('restock-product-info');
const restockError         = document.getElementById('restock-error');

let products        = [];
let activeStatus    = 'all';
let activeCategory  = 'All';
let restockingId    = null;

// ── Admin check ──
function isAdmin() {
  return currentUser && currentUser.email === 'admin@celsopos.com';
}

// ── Load products ──
function loadProducts() {
  const saved = localStorage.getItem('products');
  products = saved ? JSON.parse(saved) : [];
}

// ── Save products ──
function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

// ── Stock status helper ──
function getStockStatus(stock) {
  var threshold = getLowStockThreshold();
  if (stock === 0)            return { label: 'Out of Stock', cls: 'stock-out', dotCls: 'stock-dot--out', key: 'out' };
  if (stock <= threshold)     return { label: 'Low Stock',    cls: 'stock-low', dotCls: 'stock-dot--low', key: 'low' };
  return                             { label: 'In Stock',     cls: 'stock-ok',  dotCls: 'stock-dot--ok',  key: 'ok'  };
}

// ── Render summary cards ──
function renderSummary() {
  const total = products.length;
  const totalItems = products.reduce(function (sum, p) { return sum + (p.stock || 0); }, 0);
  var thr = getLowStockThreshold();
  const low   = products.filter(function (p) { return p.stock > 0 && p.stock <= thr; }).length;
  const out   = products.filter(function (p) { return p.stock === 0; }).length;

  inventorySummary.innerHTML =
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value">' + total + '</p>' +
      '<p class="inventory-stat-label">Total Products</p>' +
    '</div>' +
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value">' + totalItems + '</p>' +
      '<p class="inventory-stat-label">Total Items</p>' +
    '</div>' +
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value" style="color:var(--stock-color-low);">' + low + '</p>' +
      '<p class="inventory-stat-label">Low Stock</p>' +
    '</div>' +
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value" style="color:var(--stock-color-out);">' + out + '</p>' +
      '<p class="inventory-stat-label">Out of Stock</p>' +
    '</div>';
}

// ── Render category select options ──
function renderCategorySelect() {
  if (!inventoryCategorySelect) return;

  const categories = ['All', ...new Set(
    products.map(function (p) { return p.category; }).filter(Boolean)
  )];

  inventoryCategorySelect.innerHTML = '';
  categories.forEach(function (category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'All' ? 'All Categories' : category;
    if (category === activeCategory) option.selected = true;
    inventoryCategorySelect.appendChild(option);
  });
}

// ── Render inventory table ──
function renderInventory(list) {
  inventoryTableBody.innerHTML = '';

  if (list.length === 0) {
    inventoryTableBody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:40px;' +
      'color:var(--color-text-muted);">No products found.</td></tr>';
    return;
  }

  list.forEach(function (product) {
    const status = getStockStatus(product.stock);
    const row    = document.createElement('tr');

    const restockCell = isAdmin()
      ? '<td style="text-align:center;">' +
          '<button type="button" class="restock-button" data-id="' + product.id + '" title="Restock">' +
            '<i data-lucide="plus-circle"></i>' +
          '</button>' +
        '</td>'
      : '<td></td>';

    row.innerHTML =
      '<td><strong>' + product.name + '</strong></td>' +
      '<td>' + product.category + '</td>' +
      '<td>' + product.unit + '</td>' +
      '<td>' + product.stock + '</td>' +
      '<td style="text-align:center;"><span class="stock-dot ' + status.dotCls + '" title="' + status.label + '"></span></td>' +
      restockCell;

    inventoryTableBody.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
  attachRestockEvents();
}

// ── Attach restock button events ──
function attachRestockEvents() {
  if (!isAdmin()) return;

  document.querySelectorAll('.restock-button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      restockingId = Number(btn.dataset.id);
      openRestockModal(restockingId);
    });
  });
}

// ── Open restock modal ──
function openRestockModal(productId) {
  const product = products.find(function (p) { return p.id === productId; });
  if (!product) return;

  restockProductInfo.innerHTML =
    '<h3>' + product.name + '</h3>' +
    '<p>Current stock: ' + product.stock + ' ' + product.unit + '</p>';

  restockQuantityInput.value = '';
  restockError.textContent   = '';
  restockModal.style.display = 'flex';
}

// ── Close restock modal ──
function closeModal() {
  restockModal.style.display = 'none';
  restockingId = null;
}

// ── Confirm restock ──
function handleRestock() {
  const quantity = Number(restockQuantityInput.value);

  restockError.textContent = '';

  if (!restockQuantityInput.value || isNaN(quantity)) {
    restockError.textContent = 'Please enter a quantity.';
    return;
  }

  if (quantity <= 0) {
    restockError.textContent = 'Quantity must be greater than 0.';
    return;
  }

  const product = products.find(function (p) { return p.id === restockingId; });
  if (!product) return;

  product.stock += quantity;
  saveProducts();
  closeModal();
  applyFilters();
  renderSummary();
}

// ── Apply search + category + status filter ──
function applyFilters() {
  const search = inventorySearch.value.trim().toLowerCase();
  let filtered = products.slice();

  if (activeCategory !== 'All') {
    filtered = filtered.filter(function (p) {
      return p.category === activeCategory;
    });
  }

  if (activeStatus !== 'all') {
    filtered = filtered.filter(function (p) {
      return getStockStatus(p.stock).key === activeStatus;
    });
  }

  if (search !== '') {
    filtered = filtered.filter(function (p) {
      return p.name.toLowerCase().includes(search) ||
             p.category.toLowerCase().includes(search);
    });
  }

  renderInventory(filtered);
}

// ── Event listeners ──
if (currentUser && userName) {
  userName.textContent = currentUser.fullName;
}

inventorySearch.addEventListener('keyup', applyFilters);

if (inventoryCategorySelect) {
  inventoryCategorySelect.addEventListener('change', function () {
    activeCategory = inventoryCategorySelect.value;
    applyFilters();
  });
}

if (inventoryStatusSelect) {
  inventoryStatusSelect.addEventListener('change', function () {
    activeStatus = inventoryStatusSelect.value;
    applyFilters();
  });
}

closeRestockModal.addEventListener('click', closeModal);
confirmRestock.addEventListener('click', handleRestock);

restockModal.addEventListener('click', function (e) {
  if (e.target === restockModal) closeModal();
});

// Show "Action" column header for admin
if (isAdmin() && restockColHeader) {
  restockColHeader.textContent = 'Action';
}

// ── Initialize ──
loadProducts();
renderSummary();
renderCategorySelect();
applyFilters();
