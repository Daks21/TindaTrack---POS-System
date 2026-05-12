const adjustmentLog = [];

let products = [
  { id: 1, name: 'Instant Coffee',     category: 'Beverages',  price: 8,  cost: 5,  stock: 100, unit: 'sachet' },
  { id: 2, name: 'Canned Sardines',    category: 'Food',       price: 15, cost: 10, stock: 50,  unit: 'can'    },
  { id: 3, name: 'Bottled Water',      category: 'Beverages',  price: 15, cost: 8,  stock: 200, unit: 'bottle' },
  { id: 4, name: 'Laundry Detergent',  category: 'Household',  price: 25, cost: 15, stock: 80,  unit: 'pack'   },
  { id: 5, name: 'Ballpen',            category: 'Stationery', price: 10, cost: 5,  stock: 150, unit: 'piece'  },
];

let nextId = 6;

const getAll = (filters = {}) => {
  let result = products.slice();

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    result = result.filter(p => p.category.toLowerCase() === cat);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }

  return result;
};

const getById = (id) => {
  return products.find(p => p.id === id) || null;
};

const create = (productData) => {
  const product = { id: nextId++, ...productData };
  products.push(product);
  return product;
};

const update = (id, data) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = { ...products[index], ...data, id };
  return products[index];
};

const remove = (id) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;

  products.splice(index, 1);
  return true;
};

const getLowStock = (threshold = 50) => {
  return products.filter(p => p.stock > 0 && p.stock < threshold);
};

const getOutOfStock = () => {
  return products.filter(p => p.stock === 0);
};

const adjustStock = (id, qty, type) => {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const before = products[index].stock;
  products[index].stock = Math.max(0, before + qty);

  adjustmentLog.push({
    id: Date.now(),
    productId: id,
    type,
    qty,
    before,
    after: products[index].stock,
    timestamp: new Date().toISOString(),
  });

  return products[index];
};

const getStockLevels = () => {
  return products.map(({ id, name, stock, unit }) => {
    let status;
    if (stock === 0)        status = 'out-of-stock';
    else if (stock < 50)   status = 'low';
    else                   status = 'in-stock';
    return { id, name, stock, unit, status };
  });
};

const getAdjustmentLog = (productId) => {
  if (productId !== undefined) return adjustmentLog.filter(e => e.productId === productId);
  return adjustmentLog.slice();
};

module.exports = { getAll, getById, create, update, remove, getLowStock, getOutOfStock, adjustStock, getStockLevels, getAdjustmentLog };
