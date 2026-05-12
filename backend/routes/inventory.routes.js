const express = require('express');
const router  = express.Router();
const controller = require('../controllers/inventory.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.get('/',                   authMiddleware,                controller.getAll);
router.get('/low-stock',          authMiddleware,                controller.getLowStock);
router.get('/summary',            authMiddleware,                controller.getSummary);
router.post('/:productId/adjust', authMiddleware, adminMiddleware, controller.adjust);

module.exports = router;
