let products = [];
let editingProductId = null;

checkAuth();

const productsTableBody = document.getElementById("products-table-body");

const productModal = document.getElementById("product-modal");
const modalTitle = document.getElementById("modal-title");

const productNameInput = document.getElementById("product-name");
const productCategoryInput = document.getElementById("product-category");
const productPriceInput = document.getElementById("product-price");
const productCostInput = document.getElementById("product-cost");
const productStockInput = document.getElementById("product-stock");
const productUnitInput = document.getElementById("product-unit");

const addProductButton = document.getElementById("add-product-button");
const closeModalButton = document.getElementById("close-modal-button");
const productForm = document.getElementById("product-form");
const submitButton = productForm.querySelector('[type="submit"]');

const productSearchInput = document.getElementById("product-search");
const productCategorySelect = document.getElementById('product-category-select');

let activeCategory = 'All';

function renderCategorySelect() {
  if (!productCategorySelect) return;

  const categories = ['All', ...new Set(
    products.map(function (p) { return p.category; }).filter(Boolean)
  )];

  productCategorySelect.innerHTML = '';
  categories.forEach(function (category) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'All' ? 'All Categories' : category;
    if (category === activeCategory) option.selected = true;
    productCategorySelect.appendChild(option);
  });
}

async function applyFilters() {
  const query = productSearchInput.value.trim();
  const params = {};
  if (query) params.search = query;
  if (activeCategory !== 'All') params.category = activeCategory;

  showLoading('#products-table-body');
  try {
    const result = await getProducts(params);
    if (result && result.success) {
      renderProducts(result.data || []);
    } else {
      showApiError(result ? result.message : 'Failed to filter products.');
    }
  } catch (err) {
    showApiError('Network error. Is the server running?');
  } finally {
    hideLoading('#products-table-body');
  }
}

async function refreshProducts() {
  showLoading('#products-table-body');
  try {
    const result = await getProducts();
    if (result && result.success) {
      products = result.data || [];
    } else {
      showApiError(result ? result.message : 'Failed to load products.');
    }
  } catch (err) {
    showApiError('Network error. Is the server running?');
  } finally {
    hideLoading('#products-table-body');
  }
  renderCategorySelect();
  renderProductsSummary();
  await applyFilters();
}

productSearchInput.addEventListener("keyup", applyFilters);

if (productCategorySelect) {
  productCategorySelect.addEventListener('change', function () {
    activeCategory = productCategorySelect.value;
    applyFilters();
  });
}

addProductButton.addEventListener("click", function () {
  openAddProductModal();
});

closeModalButton.addEventListener("click", function () {
  closeProductModal();
});

productForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const productData = {
    name: productNameInput.value.trim(),
    category: productCategoryInput.value.trim(),
    price: Number(productPriceInput.value),
    cost: Number(productCostInput.value),
    stock: Number(productStockInput.value),
    unit: productUnitInput.value
  };

  if (submitButton) submitButton.disabled = true;

  try {
    let result;
    if (editingProductId === null) {
      result = await createProduct(productData);
    } else {
      result = await updateProduct(editingProductId, productData);
    }

    if (result && result.success) {
      await refreshProducts();
      closeProductModal();
    } else {
      showApiError(result ? result.message : 'Failed to save product.');
    }
  } catch (err) {
    showApiError('Network error. Is the server running?');
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

productModal.addEventListener("click", function (event) {
  if (event.target === productModal) {
    closeProductModal();
  }
});

function renderProducts(productList) {
  productsTableBody.innerHTML = "";

  (productList || products).forEach(function (product) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₱${product.price.toLocaleString()}</td>
      <td>₱${product.cost.toLocaleString()}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="table-button edit-button" data-id="${product.id}">
            Edit
          </button>
          <button type="button" class="table-button delete-button" data-id="${product.id}">
            Delete
          </button>
        </div>
      </td>
    `;

    productsTableBody.appendChild(row);
  });

  attachProductActionEvents();
}

function attachProductActionEvents() {
  document.querySelectorAll(".edit-button").forEach(function (button) {
    button.addEventListener("click", function () {
      openEditProductModal(button.dataset.id);
    });
  });

  document.querySelectorAll(".delete-button").forEach(function (button) {
    button.addEventListener("click", function () {
      handleDeleteProduct(button.dataset.id);
    });
  });
}

function openEditProductModal(productId) {
  const product = products.find(function (p) { return p.id == productId; });
  if (!product) return;

  editingProductId = productId;
  modalTitle.textContent = "Edit Product";

  productNameInput.value = product.name;
  productCategoryInput.value = product.category;
  productPriceInput.value = product.price;
  productCostInput.value = product.cost;
  productStockInput.value = product.stock;
  productUnitInput.value = product.unit;

  productModal.style.display = "flex";
}

async function handleDeleteProduct(productId) {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    const result = await deleteProduct(productId);
    if (result && result.success) {
      await refreshProducts();
    } else {
      showApiError(result ? result.message : 'Failed to delete product.');
    }
  } catch (err) {
    showApiError('Network error. Is the server running?');
  }
}

function openAddProductModal() {
  editingProductId = null;
  modalTitle.textContent = "Add Product";
  productForm.reset();
  productModal.style.display = "flex";
}

function closeProductModal() {
  productModal.style.display = "none";
  productForm.reset();
  editingProductId = null;
}

function renderProductsSummary() {
  const summary = document.getElementById('products-summary');
  if (!summary) return;

  const totalAssets = products.reduce(function (sum, p) { return sum + (p.cost || 0) * (p.stock || 0); }, 0);
  const totalProfit = products.reduce(function (sum, p) { return sum + ((p.price || 0) - (p.cost || 0)) * (p.stock || 0); }, 0);

  function peso(n) {
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  summary.innerHTML =
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value products-stat-value">' + peso(totalAssets) + '</p>' +
      '<p class="inventory-stat-label">Total Assets - Cost</p>' +
    '</div>' +
    '<div class="inventory-stat">' +
      '<p class="inventory-stat-value products-stat-value" style="color:var(--color-primary);">' + peso(totalProfit) + '</p>' +
      '<p class="inventory-stat-label">Calculated Profit</p>' +
    '</div>';
}

refreshProducts();
