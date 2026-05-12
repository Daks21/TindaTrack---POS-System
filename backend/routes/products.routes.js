const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/products.controller');
const auth       = require('../middleware/auth.middleware');

router.get('/', auth, controller.getAll);

module.exports = router;
