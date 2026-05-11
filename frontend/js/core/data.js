// ── Shared utilities ──

function formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

// ── Stock color defaults ──
var STOCK_COLOR_DEFAULTS = { ok: '#5a9e6f', low: '#eab308', out: '#dc2626' };

function getStockColors() {
  try {
    var saved = localStorage.getItem('stockColors');
    return saved ? JSON.parse(saved) : STOCK_COLOR_DEFAULTS;
  } catch (e) {
    return STOCK_COLOR_DEFAULTS;
  }
}

function applyStockColors() {
  var c = getStockColors();
  var root = document.documentElement;
  root.style.setProperty('--stock-color-ok',  c.ok);
  root.style.setProperty('--stock-color-low', c.low);
  root.style.setProperty('--stock-color-out', c.out);
}

applyStockColors();

// ── Low stock threshold ──
var LOW_STOCK_THRESHOLD_DEFAULT = 50;

function getLowStockThreshold() {
  var saved = parseInt(localStorage.getItem('lowStockThreshold'), 10);
  return isNaN(saved) ? LOW_STOCK_THRESHOLD_DEFAULT : saved;
}

// ── Seed default data into localStorage on first load ──

if (localStorage.getItem("products") === null || localStorage.getItem("products") === "[]") {
  var defaultProducts = [
    { id: 1, name: "Instant Coffee",     category: "Beverages",       price: 8,  cost: 5,  stock: 20, unit: "sachet" },
    { id: 2, name: "Canned Sardines",    category: "Canned Goods",    price: 28, cost: 22, stock: 12, unit: "can"    },
    { id: 3, name: "Bottled Water",      category: "Drinks",          price: 15, cost: 10, stock: 30, unit: "bottle" },
    { id: 4, name: "Laundry Detergent",  category: "Household",       price: 12, cost: 8,  stock: 4,  unit: "pack"   },
    { id: 5, name: "Ballpen",            category: "School Supplies", price: 10, cost: 6,  stock: 15, unit: "piece"  }
  ];
  localStorage.setItem("products", JSON.stringify(defaultProducts));
}

// ── Seed demo sales data ──
if (localStorage.getItem("sales") === null) {
  var seedProducts = JSON.parse(localStorage.getItem("products") || "[]");
  if (seedProducts.length > 0) {
    var seedSales = [];
    for (var daysAgo = 30; daysAgo >= 0; daysAgo--) {
      var seedDate = new Date();
      seedDate.setDate(seedDate.getDate() - daysAgo);
      seedDate.setHours(0, 0, 0, 0);

      var numSalesDay = Math.floor(Math.random() * 4) + 1;
      for (var si = 0; si < numSalesDay; si++) {
        var hour = 8 + Math.floor(Math.random() * 10);
        var saleDate = new Date(seedDate);
        saleDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        var usedIds = [];
        var saleItems = [];
        var numItems = Math.floor(Math.random() * 3) + 1;
        for (var ii = 0; ii < numItems; ii++) {
          var available = seedProducts.filter(function (p) {
            return usedIds.indexOf(p.id) === -1 && p.price > 0;
          });
          if (available.length === 0) break;
          var rp = available[Math.floor(Math.random() * available.length)];
          var qty = Math.floor(Math.random() * 3) + 1;
          usedIds.push(rp.id);
          saleItems.push({
            productId: rp.id,
            name: rp.name,
            price: rp.price,
            quantity: qty,
            lineTotal: rp.price * qty
          });
        }

        var subtotal = saleItems.reduce(function (s, i) { return s + i.lineTotal; }, 0);
        var rawPayment = subtotal + Math.floor(Math.random() * 4) * 5;
        seedSales.push({
          id: saleDate.getTime() + si,
          items: saleItems,
          subtotal: subtotal,
          tax: 0,
          taxRate: 0,
          total: subtotal,
          payment: rawPayment,
          change: rawPayment - subtotal,
          timestamp: saleDate.toISOString(),
          cashier: "Demo User"
        });
      }
    }
    localStorage.setItem("sales", JSON.stringify(seedSales));
  }
}
