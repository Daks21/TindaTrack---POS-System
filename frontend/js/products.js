const savedProducts = localStorage.getItem("products");

let products;
let editingProductId = null;

if (savedProducts === null) {
  products = [
    {
      id: 1,
      name: "Instant Coffee",
      category: "Beverages",
      price: 8,
      cost: 5,
      stock: 20,
      unit: "sachet"
    },
    {
      id: 2,
      name: "Canned Sardines",
      category: "Canned Goods",
      price: 28,
      cost: 22,
      stock: 12,
      unit: "can"
    },
    {
      id: 3,
      name: "Bottled Water",
      category: "Drinks",
      price: 15,
      cost: 10,
      stock: 30,
      unit: "bottle"
    },
    {
      id: 4,
      name: "Laundry Detergent",
      category: "Household",
      price: 12,
      cost: 8,
      stock: 4,
      unit: "pack"
    },
    {
      id: 5,
      name: "Ballpen",
      category: "School Supplies",
      price: 10,
      cost: 6,
      stock: 15,
      unit: "piece"
    }
  ];

  localStorage.setItem("products", JSON.stringify(products));
} else {
  products = JSON.parse(savedProducts);
}

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
const cancelModalButton = document.getElementById("cancel-modal-button");
const productForm = document.getElementById("product-form");

const productSearchInput = document.getElementById("product-search");


productSearchInput.addEventListener("keyup", function () {
  const query = productSearchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(function (product) {
    return product.name.toLowerCase().includes(query);
  });

  renderProducts(filteredProducts);
});

addProductButton.addEventListener("click", function () {
  openAddProductModal();
});

closeModalButton.addEventListener("click", function () {
  closeProductModal();
});

cancelModalButton.addEventListener("click", function () {
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

  renderProducts();

  closeProductModal();
});

productModal.addEventListener("click", function (event) {
  if (event.target === productModal) {
    closeProductModal();
  }
});

function renderProducts(productList = products) {
  productsTableBody.innerHTML = "";

  productList.forEach(function (product, index) {
    const row = document.createElement("tr");

    const stockClass = product.stock < 5 ? "stock-low" : "stock-ok";

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₱${product.price.toLocaleString()}</td>
      <td><span class="${stockClass}">${product.stock}</span></td>
      <td>${product.unit}</td>
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

  renderProducts();
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

renderProducts();