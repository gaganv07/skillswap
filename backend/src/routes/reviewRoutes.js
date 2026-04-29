const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getMyReviews } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReviewValidator, reviewPaginationValidator, reviewUserParamValidator } = require('../validators/reviewValidators');

router.post('/', auth, createReviewValidator, validate, createReview);
router.get('/my', auth, reviewPaginationValidator, validate, getMyReviews);
router.get('/:userId', [...reviewUserParamValidator, ...reviewPaginationValidator], validate, getUserReviews);

module.exports = router;
