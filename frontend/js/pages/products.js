let products = JSON.parse(localStorage.getItem("products") || "[]");
let editingProductId = null;

checkAuth();

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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

function applyFilters() {
  const query = productSearchInput.value.trim().toLowerCase();
  let filtered = products.slice();

  if (activeCategory !== 'All') {
    filtered = filtered.filter(function (p) { return p.category === activeCategory; });
  }

  if (query !== '') {
    filtered = filtered.filter(function (p) { return p.name.toLowerCase().includes(query); });
  }

  renderProducts(filtered);
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

productForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const productData = {
    name: productNameInput.value.trim(),
    category: productCategoryInput.value.trim(),
    price: Number(productPriceInput.value),
    cost: Number(productCostInput.value),
    stock: Number(productStockInput.value),
    unit: productUnitInput.value
  };

  if (editingProductId === null) {
    const newProduct = {
      id: Date.now(),
      name: productData.name,
      category: productData.category,
      price: productData.price,
      cost: productData.cost,
      stock: productData.stock,
      unit: productData.unit
    };

    products.push(newProduct);
  } else {
    products = products.map(function (product) {
      if (product.id === editingProductId) {
        return {
          id: product.id,
          name: productData.name,
          category: productData.category,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          unit: productData.unit
        };
      }

      return product;
    });
  }

  localStorage.setItem("products", JSON.stringify(products));

  renderCategorySelect();
  renderProductsSummary();
  applyFilters();

  closeProductModal();
});

productModal.addEventListener("click", function (event) {
  if (event.target === productModal) {
    closeProductModal();
  }
});

function renderProducts(productList = products) {
  productsTableBody.innerHTML = "";

  productList.forEach(function (product) {
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
  const editButtons = document.querySelectorAll(".edit-button");
  const deleteButtons = document.querySelectorAll(".delete-button");

  editButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(button.dataset.id);
      openEditProductModal(productId);
    });
  });

  deleteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(button.dataset.id);
      deleteProduct(productId);
    });
  });
}

function openEditProductModal(productId) {
  const product = products.find(function (product) {
    return product.id === productId;
  });

  if (!product) {
    return;
  }

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

function deleteProduct(productId) {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");

  if (!confirmDelete) {
    return;
  }

  products = products.filter(function (product) {
    return product.id !== productId;
  });

  localStorage.setItem("products", JSON.stringify(products));

  renderCategorySelect();
  renderProductsSummary();
  applyFilters();
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
  var summary = document.getElementById('products-summary');
  if (!summary) return;

  var totalAssets = products.reduce(function (sum, p) { return sum + (p.cost || 0) * (p.stock || 0); }, 0);
  var totalProfit = products.reduce(function (sum, p) { return sum + ((p.price || 0) - (p.cost || 0)) * (p.stock || 0); }, 0);

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

renderCategorySelect();
renderProductsSummary();
renderProducts();