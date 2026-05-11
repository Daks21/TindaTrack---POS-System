checkAuth();

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

const productGrid = document.getElementById("pos-product-grid");

const savedProducts = localStorage.getItem("products");

const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");

const paymentAmountInput = document.getElementById("payment-amount");
const changeAmount = document.getElementById("change-amount");
const paymentWarning = document.getElementById("payment-warning");

const clearCartButton = document.getElementById("clear-cart-button");

const completeSaleButton = document.getElementById("complete-sale-button");
const saleMessage = document.getElementById("sale-message");

let products = [];
let cart = [];

if (savedProducts !== null) {
  products = JSON.parse(savedProducts);
}


clearCartButton.addEventListener("click", function () {
  clearCart();
});

completeSaleButton.addEventListener("click", function () {
  completeSale();
});

paymentAmountInput.addEventListener("input", function () {
  updateChangeDisplay();
});

printReceiptButton.addEventListener("click", function () {
  window.print();
});

newSaleButton.addEventListener("click", function () {
  receiptModal.style.display = "none";

  cart = [];
  paymentAmountInput.value = "";
  changeAmount.textContent = formatPeso(0);
  changeAmount.classList.remove("change-positive");
  changeAmount.classList.remove("change-negative");
  paymentWarning.textContent = "";
  saleMessage.textContent = "";

  renderCart();
  renderProductGrid();
});

function attachCartEvents() {
  const decreaseButtons = document.querySelectorAll(".decrease-button");
  const increaseButtons = document.querySelectorAll(".increase-button");
  const quantityInputs = document.querySelectorAll(".quantity-input");
  const removeButtons = document.querySelectorAll(".remove-cart-item");

  decreaseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(button.dataset.id);
      const cartItem = cart.find(function (item) {
        return item.productId === productId;
      });

      if (cartItem) {
        updateQuantity(productId, cartItem.quantity - 1);
      }
    });
  });

  increaseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(button.dataset.id);
      const cartItem = cart.find(function (item) {
        return item.productId === productId;
      });

      if (cartItem) {
        updateQuantity(productId, cartItem.quantity + 1);
      }
    });
  });

  quantityInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      const productId = Number(input.dataset.id);
      const newQuantity = Number(input.value);

      updateQuantity(productId, newQuantity);
    });
  });

  removeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(button.dataset.id);

      removeFromCart(productId);
    });
  });
}

function formatPeso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function renderProductGrid(productList = products) {
  productGrid.innerHTML = "";

  if (productList.length === 0) {
    productGrid.innerHTML = `
      <p class="cart-empty-message">No products available.</p>
    `;
    return;
  }

  productList.forEach(function (product) {
    const productCard = document.createElement("button");

    productCard.type = "button";
    productCard.className = "pos-product-card";

    if (product.stock === 0) {
      productCard.classList.add("is-disabled");
      productCard.disabled = true;
    }

    productCard.innerHTML = `
      <h3>${product.name}</h3>
      <p class="pos-product-price">${formatPeso(product.price)}</p>
      <p class="pos-product-stock">Stock: ${product.stock} ${product.unit}</p>
    `;

    if (product.stock > 0) {
      productCard.addEventListener("click", function () {
        if (typeof addToCart === "function") {
          addToCart(product.id);
        }
      });
    }

    productGrid.appendChild(productCard);
  });
}

function addToCart(productId) {
  const product = products.find(function (product) {
    return product.id === productId;
  });

  if (!product || product.stock <= 0) {
    return;
  }

  const existingCartItem = cart.find(function (item) {
    return item.productId === productId;
  });

  if (existingCartItem) {
    if (existingCartItem.quantity >= product.stock) {
      return;
    }

    existingCartItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(function (item) {
    return item.productId !== productId;
  });

  renderCart();
}

function updateQuantity(productId, newQuantity) {
  const product = products.find(function (product) {
    return product.id === productId;
  });

  if (!product) {
    return;
  }

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const cartItem = cart.find(function (item) {
    return item.productId === productId;
  });

  if (!cartItem) {
    return;
  }

  if (newQuantity > product.stock) {
    cartItem.quantity = product.stock;
  } else {
    cartItem.quantity = newQuantity;
  }

  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <p class="cart-empty-message">No items added yet.</p>
    `;
  } else {
    cart.forEach(function (item) {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p>${formatPeso(item.price)} each</p>
        </div>

        <div class="cart-item-controls">
          <button type="button" class="quantity-button decrease-button" data-id="${item.productId}">
            -
          </button>

          <input 
            type="number" 
            class="quantity-input" 
            value="${item.quantity}" 
            min="0"
            data-id="${item.productId}"
          />

          <button type="button" class="quantity-button increase-button" data-id="${item.productId}">
            +
          </button>
        </div>

        <div class="cart-item-total">
          <strong>${formatPeso(item.price * item.quantity)}</strong>
          <button type="button" class="remove-cart-item" data-id="${item.productId}">
            Remove
          </button>
        </div>
      `;

      cartItems.appendChild(cartItem);
    });
  }

  const subtotal = getCartTotal();
  const tax = 0;
  const total = subtotal + tax;

  cartSubtotal.textContent = formatPeso(subtotal);
  cartTax.textContent = formatPeso(tax);
  cartTotal.textContent = formatPeso(total);

  attachCartEvents();
  updateChangeDisplay();
}

function clearCart() {
  cart = [];
  renderCart();
}

function getCartTotal() {
  return cart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
}

function updateChangeDisplay() {
  const total = getCartTotal();
  const paymentAmount = Number(paymentAmountInput.value);

  paymentWarning.textContent = "";
  changeAmount.classList.remove("change-positive");
  changeAmount.classList.remove("change-negative");

  if (paymentAmountInput.value === "") {
    changeAmount.textContent = formatPeso(0);
    return;
  }

  const change = paymentAmount - total;

  changeAmount.textContent = formatPeso(change);

  if (change >= 0) {
    changeAmount.classList.add("change-positive");
  } else {
    changeAmount.classList.add("change-negative");
    paymentWarning.textContent = "Payment amount is less than the total.";
  }
}

function completeSale() {
  const total = getCartTotal();
  const paymentAmount = Number(paymentAmountInput.value);

  paymentWarning.textContent = "";
  saleMessage.textContent = "";

  if (cart.length === 0) {
    paymentWarning.textContent = "Cart is empty. Add products before completing a sale.";
    return;
  }

  if (paymentAmountInput.value === "") {
    paymentWarning.textContent = "Please enter the payment amount.";
    return;
  }

  if (paymentAmount < total) {
    paymentWarning.textContent = "Payment amount is less than the grand total.";
    return;
  }

  const change = paymentAmount - total;

  const saleRecord = {
    id: Date.now(),
    items: cart.map(function (item) {
      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity
      };
    }),
    total: total,
    payment: paymentAmount,
    change: change,
    timestamp: new Date().toISOString(),
    cashier: currentUser ? currentUser.fullName : "Unknown Cashier"
  };

  const savedSales = localStorage.getItem("sales");
  let sales = [];

  if (savedSales !== null) {
    sales = JSON.parse(savedSales);
  }

  sales.push(saleRecord);

  localStorage.setItem("sales", JSON.stringify(sales));

  cart.forEach(function (item) {
    const product = products.find(function (product) {
      return product.id === item.productId;
    });

    if (product) {
      product.stock = product.stock - item.quantity;
    }
  });

  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("lastSale", JSON.stringify(saleRecord));

  cart = [];
  paymentAmountInput.value = "";
  changeAmount.textContent = formatPeso(0);
  changeAmount.classList.remove("change-positive");
  changeAmount.classList.remove("change-negative");
  paymentWarning.textContent = "";

  renderCart();
  renderProductGrid();

  saleMessage.textContent = "Sale completed successfully.";
  showReceipt(saleRecord);
}

function showReceipt(sale) {
  const saleDate = new Date(sale.timestamp);

  receiptNumber.textContent = `RCPT-${sale.id}`;
  receiptDate.textContent = saleDate.toLocaleDateString("en-PH");
  receiptTime.textContent = saleDate.toLocaleTimeString("en-PH");
  receiptCashier.textContent = sale.cashier;

  receiptItemsBody.innerHTML = "";

  sale.items.forEach(function (item) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${formatPeso(item.price)}</td>
      <td>${formatPeso(item.lineTotal)}</td>
    `;

    receiptItemsBody.appendChild(row);
  });

  receiptSubtotal.textContent = formatPeso(sale.total);
  receiptGrandTotal.textContent = formatPeso(sale.total);
  receiptPayment.textContent = formatPeso(sale.payment);
  receiptChange.textContent = formatPeso(sale.change);

  receiptModal.style.display = "flex";
}

function resetPOSForNewSale() {
  closeReceiptModal();

  cart = [];
  paymentAmountInput.value = "";
  changeAmount.textContent = formatPeso(0);
  changeAmount.classList.remove("change-positive");
  changeAmount.classList.remove("change-negative");
  paymentWarning.textContent = "";
  saleMessage.textContent = "";

  renderCart();
  renderProductGrid();
}

renderProductGrid();
renderCart();