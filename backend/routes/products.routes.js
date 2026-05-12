const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/products.controller');
const { authMiddleware: auth } = require('../middleware/auth.middleware');

router.get('/',     controller.getAll);
router.get('/:id',  controller.getOne);

router.post('/',    auth, controller.create);
router.put('/:id',  auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;
