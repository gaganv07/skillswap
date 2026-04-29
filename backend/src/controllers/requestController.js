const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { pushService } = require('../services/pushService');

// @desc      Send connection request
// @route     POST /api/requests
// @access    Private
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;

    // Validate required fields
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    // Prevent self-request
    if (req.user.id === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send request to yourself'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for existing request in both directions
    const existingRequest = await Request.findOne({
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id }
      ]
    });

    if (existingRequest) {
      let message = 'Request already exists between these users';

      // Provide more specific messages based on status
      if (existingRequest.status === 'pending') {
        message = 'You already have a pending request with this user';
      } else if (existingRequest.status === 'accepted') {
        message = 'You are already connected with this user';
      } else if (existingRequest.status === 'rejected') {
        // Allow re-sending after rejection
        console.log('Previous request was rejected, allowing new request');
      }

      // If not rejected, return error
      if (existingRequest.status !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: message
        });
      }

      // If rejected, we'll allow creating a new request
      // The userPair uniqueness will be handled by the database
    }

    // Create the request
    const request = await Request.create({
      sender: req.user.id,
      receiver: receiverId,
    });

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      type: 'request',
      message: `${req.user.name} sent you a connection request`,
      relatedUserId: req.user.id,
      relatedRequestId: request._id,
    });

    // Emit real-time notification
    const io = req.app.locals.io;
    if (io) {
      io.emitNotification(receiverId, {
        type: 'REQUEST',
        message: `${req.user.name} sent you a connection request`,
        relatedUserId: req.user.id,
        relatedRequestId: request._id,
      });
    }

    // Send push notification
    try {
      await pushService.sendRequestNotification(receiverId, req.user);
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
      // Don't fail the request if push fails
    }

    console.log('Request sent successfully:', request._id);

    return res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: { request }
    });

  } catch (error) {
    console.error('SEND REQUEST ERROR:', error);

    // Handle MongoDB duplicate key error (11000)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.userPair) {
      return res.status(409).json({
        success: false,
        message: 'A request already exists between these users'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle custom pre-save errors (self-request)
    if (error.message === 'Cannot send request to yourself') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Get incoming requests
// @route     GET /api/requests/incoming
// @access    Private
exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      receiver: req.user.id,
      status: 'pending',
    })
      .populate('sender', 'name email profileImage teachSkills learnSkills')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { requests }
    });

  } catch (error) {
    console.error('GET INCOMING REQUESTS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Accept request
// @route     PUT /api/requests/:id/accept
// @access    Private
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    request.status = 'accepted';
    await request.save();

    // Create notification for sender
    await Notification.create({
      userId: request.sender,
      type: 'request',
      message: `${req.user.name} accepted your connection request`,
      relatedUserId: req.user.id,
      relatedRequestId: request._id,
    });

    // Emit real-time notification
    const io = req.app.locals.io;
    if (io) {
      io.emitNotification(request.sender.toString(), {
        type: 'ACCEPTED',
        message: `${req.user.name} accepted your connection request`,
        relatedUserId: req.user.id,
        relatedRequestId: request._id,
      });
    }

    console.log('Request accepted:', request._id);

    return res.json({
      success: true,
      message: 'Request accepted successfully',
      data: { request }
    });

  } catch (error) {
    console.error('ACCEPT REQUEST ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Reject request
// @route     PUT /api/requests/:id/reject
// @access    Private
exports.rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    request.status = 'rejected';
    await request.save();

    console.log('Request rejected:', request._id);

    return res.json({
      success: true,
      message: 'Request rejected',
      data: { request }
    });

  } catch (error) {
    console.error('REJECT REQUEST ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc      Get sent requests
// @route     GET /api/requests/sent
// @access    Private
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      sender: req.user.id,
    })
      .populate('receiver', 'name email profileImage teachSkills learnSkills')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { requests }
    });

  } catch (error) {
    console.error('GET SENT REQUESTS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};