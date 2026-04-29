const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/matchController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { paginationValidator } = require('../validators/userValidators');

router.get('/', auth, paginationValidator, validate, getMatches);

module.exports = router;
