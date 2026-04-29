const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getMySwapRequests,
  updateSwapRequest,
  getSwapRequest
} = require('../controllers/swapController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../validators/userValidators');
const { createSwapValidator, updateSwapValidator, swapPaginationValidator } = require('../validators/swapValidators');

router.post('/', auth, createSwapValidator, validate, createSwapRequest);
router.get('/', auth, swapPaginationValidator, validate, getMySwapRequests);
router.get('/:id', auth, objectIdParam('id'), validate, getSwapRequest);
router.put('/:id', auth, updateSwapValidator, validate, updateSwapRequest);

module.exports = router;
