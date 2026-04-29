const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const Conversation = require('../models/Conversation');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { pushService } = require('../services/pushService');

// @desc      Get messages for a room (direct or group)
// @route     GET /api/chat/room/:roomId
// @access    Private
exports.getRoomMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { roomId } = req.params;

  // Check permissions for group chats
  if (roomId.startsWith('group_')) {
    const groupId = roomId.replace('group_', '');
    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }
    if (!group.members.includes(req.user.id)) {
      throw new AppError('Not authorized to view this group chat', 403);
    }
  } else if (roomId.startsWith('direct_')) {
    // For direct messages, ensure user is part of the conversation
    const otherUserId = roomId.replace('direct_', '').replace(req.user.id, '');
    const user = await User.findById(otherUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
  }

  const [messages, total] = await Promise.all([
    Message.find({ roomId })
      .populate('sender', 'name email profileImage')
      .populate('seenBy', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ roomId }),
  ]);

  return successResponse(res, {
    data: {
      messages,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Send message to a room
// @route     POST /api/chat/room
// @access    Private
exports.sendRoomMessage = asyncHandler(async (req, res) => {
  const { roomId, content, type = 'text', fileUrl, fileName, fileSize } = req.body;

  if (!roomId || !content) {
    throw new AppError('Room ID and content are required', 400);
  }

  // Check permissions for group chats
  let participants = [];
  let isGroup = false;
  let groupId = null;

  if (roomId.startsWith('group_')) {
    const groupIdStr = roomId.replace('group_', '');
    const group = await Group.findById(groupIdStr);
    if (!group) {
      throw new AppError('Group not found', 404);
    }
    if (!group.members.includes(req.user.id)) {
      throw new AppError('Not authorized to send messages to this group', 403);
    }
    participants = group.members;
    isGroup = true;
    groupId = group._id;
  } else if (roomId.startsWith('direct_')) {
    // For direct messages, ensure user is part of the conversation
    const otherUserId = roomId.replace('direct_', '').replace(req.user.id, '');
    const user = await User.findById(otherUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    participants = [req.user.id, otherUserId];
  }

  const message = await Message.create({
    roomId,
    sender: req.user.id,
    content,
    type,
    fileUrl,
    fileName,
    fileSize,
    isGroupMessage: isGroup,
  });

  await message.populate('sender', 'name email profileImage');

  // Update or create conversation
  await Conversation.findOneAndUpdate(
    { roomId },
    {
      participants,
      isGroup,
      groupId,
      lastMessage: {
        content: type === 'text' ? content : `[${type}]`,
        sender: req.user.id,
        type,
      },
      lastMessageAt: new Date(),
      $inc: {
        // Increment unread count for all participants except sender
        ...participants
          .filter(p => p.toString() !== req.user.id)
          .reduce((acc, participant) => {
            acc[`unreadCounts.${participant}`] = 1;
            return acc;
          }, {})
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  // Emit real-time message
  const io = req.app.locals.io;
  if (io) {
    io.to(roomId).emit('message:new', {
      message,
      roomId,
    });
  }

  // Send push notifications to other participants
  try {
    const otherParticipants = participants.filter(p => p.toString() !== req.user.id);
    for (const participantId of otherParticipants) {
      await pushService.sendMessageNotification(participantId, req.user, message);
    }
  } catch (pushError) {
    console.error('Push notification failed:', pushError);
    // Don't fail the message send if push fails
  }

  return successResponse(res, {
    message: 'Message sent successfully',
    data: { message },
  });
});

// @desc      Mark room messages as read
// @route     PUT /api/chat/room/:roomId/read
// @access    Private
exports.markRoomAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  // Check permissions for group chats
  if (roomId.startsWith('group_')) {
    const groupId = roomId.replace('group_', '');
    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', 404);
    }
    if (!group.members.includes(req.user.id)) {
      throw new AppError('Not authorized to access this group', 403);
    }
  }

  // Mark messages as seen
  await Message.updateMany(
    { roomId, seenBy: { $ne: req.user.id } },
    { $addToSet: { seenBy: req.user.id } }
  );

  // Reset unread count in conversation
  await Conversation.findOneAndUpdate(
    { roomId },
    { $set: { [`unreadCounts.${req.user.id}`]: 0 } }
  );

  // Emit real-time read status
  const io = req.app.locals.io;
  if (io) {
    io.to(roomId).emit('message:seen', {
      roomId,
      userId: req.user.id,
    });
  }

  return successResponse(res, {
    message: 'Messages marked as read',
  });
});

// @desc      Get all chat rooms for user
// @route     GET /api/chat/rooms
// @access    Private
exports.getChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get conversations for this user
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name email profileImage')
    .populate('lastMessage.sender', 'name')
    .populate('groupId', 'name description avatar')
    .sort({ lastMessageAt: -1 });

  const rooms = conversations.map(conv => {
    const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
    const unreadCount = conv.unreadCounts.get(userId.toString()) || 0;

    if (conv.isGroup) {
      return {
        id: conv.roomId,
        type: 'group',
        name: conv.groupId?.name || 'Group Chat',
        description: conv.groupId?.description,
        avatar: conv.groupId?.avatar,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        participants: conv.participants,
      };
    } else {
      return {
        id: conv.roomId,
        type: 'direct',
        name: otherParticipant?.name || 'Unknown User',
        email: otherParticipant?.email,
        avatar: otherParticipant?.profileImage,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        participant: otherParticipant,
      };
    }
  });

  return successResponse(res, {
    data: { rooms },
  });
});

// LEGACY FUNCTIONS (for backward compatibility)

// @desc      Get messages between two users (legacy)
// @route     GET /api/chat/:userId
// @access    Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const otherUserId = req.params.userId;
  const currentUserId = req.user.id;

  // Create room ID for direct messages
  const roomId = `direct_${[currentUserId, otherUserId].sort().join('_')}`;

  const [messages, total] = await Promise.all([
    Message.find({
      $or: [
        { roomId },
        // Legacy support for old message structure
        {
          $and: [
            { sender: currentUserId, receiver: otherUserId },
            { receiver: { $exists: true } }
          ]
        },
        {
          $and: [
            { sender: otherUserId, receiver: currentUserId },
            { receiver: { $exists: true } }
          ]
        }
      ]
    })
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({
      $or: [
        { roomId },
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }),
  ]);

  return successResponse(res, {
    data: {
      messages,
      pagination: buildPaginationMeta({ page, limit, total }),
    },
  });
});

// @desc      Send message to user (legacy)
// @route     POST /api/chat
// @access    Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content, type = 'text', fileUrl, fileName, fileSize } = req.body;

  if (!receiverId || !content) {
    throw new AppError('Receiver ID and content are required', 400);
  }

  // Verify receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new AppError('Receiver not found', 404);
  }

  // Create room ID for direct messages
  const roomId = `direct_${[req.user.id, receiverId].sort().join('_')}`;

  const message = await Message.create({
    roomId,
    sender: req.user.id,
    receiver: receiverId, // Keep for legacy support
    content,
    type,
    fileUrl,
    fileName,
    fileSize,
    isGroupMessage: false,
  });

  await message.populate('sender', 'name email profileImage');
  await message.populate('receiver', 'name email profileImage');

  return successResponse(res, {
    message: 'Message sent successfully',
    data: { message },
  });
});