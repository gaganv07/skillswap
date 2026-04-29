const Review = require('../models/Review');
const User = require('../models/User');
const SwapRequest = require('../models/SwapRequest');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc      Create review
// @route     POST /api/review
// @access    Private
exports.createReview = asyncHandler(async (req, res) => {
  const { revieweeId, swapRequestId, rating, feedback, categories } = req.body;

  if (swapRequestId) {
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      throw new AppError('Swap request not found', 404);
    }

    if (swapRequest.status !== 'completed') {
      throw new AppError('Only completed swaps can be reviewed', 400);
    }
  }

  const reviewExists = await Review.findOne({
    reviewer: req.user.id,
    reviewee: revieweeId,
    ...(swapRequestId ? { swapRequest: swapRequestId } : {})
  });

  if (reviewExists) {
    throw new AppError('You have already reviewed this user for this swap', 409);
  }

  const review = await Review.create({
    reviewer: req.user.id,
    reviewee: revieweeId,
    swapRequest: swapRequestId || undefined,
    rating,
    feedback,
    categories
  });

  const ratingStats = await Review.aggregate([
    { $match: { reviewee: revieweeId } },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      }
    }
  ]);

  const stats = ratingStats[0] || { averageRating: rating, count: 1 };

  await User.findByIdAndUpdate(revieweeId, {
    'rating.average': Number(stats.averageRating.toFixed(1)),
    'rating.count': stats.count
  });

  await review.populate('reviewer reviewee', '-password');

  return successResponse(res, {
    statusCode: 201,
    message: 'Review created successfully',
    data: { review },
  });
});

// @desc      Get reviews for a user
// @route     GET /api/review/:userId
// @access    Public
exports.getUserReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { reviewee: req.params.userId };

  const [reviews, total, user] = await Promise.all([
    Review.find(query)
      .populate('reviewer', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(query),
    User.findById(req.params.userId),
  ]);

  return successResponse(res, {
    data: {
      reviews,
      averageRating: user?.rating?.average || 0,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Get my reviews (reviews I received)
// @route     GET /api/review/my
// @access    Private
exports.getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = { reviewee: req.user.id };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewer', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(query),
  ]);

  return successResponse(res, {
    data: {
      reviews,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});
