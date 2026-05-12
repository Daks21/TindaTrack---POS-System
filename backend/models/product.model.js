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

module.exports = { getAll, getById, create, update, remove };
