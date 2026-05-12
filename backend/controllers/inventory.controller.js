const Product = require('../models/product.model');

const VALID_TYPES   = ['restock', 'adjustment', 'damage', 'return'];
const REMOVING_TYPES = ['damage', 'adjustment'];

const getAll = (req, res) => {
  const levels = Product.getStockLevels();
  res.json({ success: true, data: levels });
};

const getLowStock = (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 50;
  if (threshold <= 0) {
    return res.status(400).json({ success: false, message: 'threshold must be a positive number' });
  }
  const items = Product.getLowStock(threshold);
  res.json({ success: true, threshold, count: items.length, data: items });
};

const getSummary = (req, res) => {
  const threshold    = parseInt(req.query.threshold, 10) || 50;
  const total        = Product.getAll().length;
  const lowStockItems = Product.getLowStock(threshold);
  const outOfStock   = Product.getOutOfStock();

  res.json({
    success: true,
    data: {
      totalProducts:   total,
      lowStockCount:   lowStockItems.length,
      outOfStockCount: outOfStock.length,
      lowStockItems,
    }
  });
};

const adjust = (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  const { quantity, type, notes } = req.body;

  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `type must be one of: ${VALID_TYPES.join(', ')}`
    });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'quantity must be a positive integer'
    });
  }

  const product = Product.getById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const delta   = REMOVING_TYPES.includes(type) ? -quantity : quantity;
  const updated = Product.adjustStock(productId, delta, type);

  res.json({
    success: true,
    data: {
      product: { id: updated.id, name: updated.name, stock: updated.stock, unit: updated.unit },
      adjustment: {
        type,
        quantity,
        notes:      notes || null,
        adjustedBy: req.user.fullName || req.user.email,
        timestamp:  new Date().toISOString(),
      }
    }
  });
};

module.exports = { getAll, getLowStock, getSummary, adjust };
