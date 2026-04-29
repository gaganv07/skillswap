const SwapRequest = require('../models/SwapRequest');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc      Create swap request
// @route     POST /api/swap
// @access    Private
exports.createSwapRequest = asyncHandler(async (req, res) => {
  const { responderId, requesterSkill, responderSkill, message, proposedDate } = req.body;

  const swapRequest = await SwapRequest.create({
    requester: req.user.id,
    responder: responderId,
    requesterSkill,
    responderSkill,
    message,
    proposedDate
  });

  await swapRequest.populate('requester responder', '-password');

  return successResponse(res, {
    statusCode: 201,
    message: 'Swap request created successfully',
    data: { swapRequest },
  });
});

// @desc      Get my swap requests
// @route     GET /api/swap
// @access    Private
exports.getMySwapRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {
    $or: [{ requester: req.user.id }, { responder: req.user.id }]
  };

  const [requests, total] = await Promise.all([
    SwapRequest.find(query)
      .populate('requester responder', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SwapRequest.countDocuments(query),
  ]);

  return successResponse(res, {
    data: {
      requests,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Update swap request status
// @route     PUT /api/swap/:id
// @access    Private
exports.updateSwapRequest = asyncHandler(async (req, res) => {
  let swapRequest = await SwapRequest.findById(req.params.id);

  if (!swapRequest) {
    throw new AppError('Swap request not found', 404);
  }

  if (swapRequest.responder.toString() !== req.user.id) {
    throw new AppError('Not authorized to update this request', 403);
  }

  const { status } = req.body;

  swapRequest = await SwapRequest.findByIdAndUpdate(
    req.params.id,
    { status, completedAt: status === 'completed' ? new Date() : null },
    { new: true, runValidators: true }
  ).populate('requester responder', '-password');

  return successResponse(res, {
    message: 'Swap request updated successfully',
    data: { swapRequest },
  });
});

// @desc      Get swap request by ID
// @route     GET /api/swap/:id
// @access    Private
exports.getSwapRequest = asyncHandler(async (req, res) => {
  const swapRequest = await SwapRequest.findById(req.params.id).populate('requester responder', '-password');

  if (!swapRequest) {
    throw new AppError('Swap request not found', 404);
  }

  return successResponse(res, {
    data: { swapRequest },
  });
});
