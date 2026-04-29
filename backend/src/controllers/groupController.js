const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// @desc      Create a new group
// @route     POST /api/groups
// @access    Private
exports.createGroup = asyncHandler(async (req, res) => {
  const { name, description, memberIds } = req.body;

  if (!name) {
    throw new AppError('Group name is required', 400);
  }

  // Validate members exist
  const members = [req.user.id]; // Admin is always a member
  if (memberIds && memberIds.length > 0) {
    const validMembers = await User.find({ _id: { $in: memberIds } });
    if (validMembers.length !== memberIds.length) {
      throw new AppError('Some member IDs are invalid', 400);
    }
    members.push(...memberIds);
  }

  const group = await Group.create({
    name,
    description,
    admin: req.user.id,
    members,
  });

  await group.populate('members', 'name email profileImage');
  await group.populate('admin', 'name email profileImage');

  return successResponse(res, {
    statusCode: 201,
    message: 'Group created successfully',
    data: { group },
  });
});

// @desc      Get user's groups
// @route     GET /api/groups
// @access    Private
exports.getUserGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    members: req.user.id,
    isActive: true,
  })
    .populate('members', 'name email profileImage')
    .populate('admin', 'name email profileImage')
    .sort({ updatedAt: -1 });

  return successResponse(res, {
    data: { groups },
  });
});

// @desc      Get group details
// @route     GET /api/groups/:groupId
// @access    Private
exports.getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId)
    .populate('members', 'name email profileImage')
    .populate('admin', 'name email profileImage');

  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check if user is a member
  if (!group.members.some(member => member._id.toString() === req.user.id)) {
    throw new AppError('Not authorized to view this group', 403);
  }

  return successResponse(res, {
    data: { group },
  });
});

// @desc      Add member to group
// @route     POST /api/groups/:groupId/members
// @access    Private (Admin only)
exports.addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check if user is admin
  if (group.admin.toString() !== req.user.id) {
    throw new AppError('Only group admin can add members', 403);
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if already a member
  if (group.members.includes(userId)) {
    throw new AppError('User is already a member', 400);
  }

  group.members.push(userId);
  await group.save();
  await group.populate('members', 'name email profileImage');

  return successResponse(res, {
    message: 'Member added successfully',
    data: { group },
  });
});

// @desc      Remove member from group
// @route     DELETE /api/groups/:groupId/members/:userId
// @access    Private (Admin only)
exports.removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check if user is admin
  if (group.admin.toString() !== req.user.id) {
    throw new AppError('Only group admin can remove members', 403);
  }

  // Cannot remove admin
  if (req.params.userId === group.admin.toString()) {
    throw new AppError('Cannot remove group admin', 400);
  }

  // Check if member exists in group
  const memberIndex = group.members.indexOf(req.params.userId);
  if (memberIndex === -1) {
    throw new AppError('User is not a member of this group', 400);
  }

  group.members.splice(memberIndex, 1);
  await group.save();
  await group.populate('members', 'name email profileImage');

  return successResponse(res, {
    message: 'Member removed successfully',
    data: { group },
  });
});

// @desc      Update group
// @route     PUT /api/groups/:groupId
// @access    Private (Admin only)
exports.updateGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Check if user is admin
  if (group.admin.toString() !== req.user.id) {
    throw new AppError('Only group admin can update group', 403);
  }

  if (name) group.name = name;
  if (description !== undefined) group.description = description;

  await group.save();
  await group.populate('members', 'name email profileImage');
  await group.populate('admin', 'name email profileImage');

  return successResponse(res, {
    message: 'Group updated successfully',
    data: { group },
  });
});

// @desc      Leave group
// @route     DELETE /api/groups/:groupId/leave
// @access    Private
exports.leaveGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) {
    throw new AppError('Group not found', 404);
  }

  // Cannot leave if you're the admin
  if (group.admin.toString() === req.user.id) {
    throw new AppError('Group admin cannot leave the group. Transfer admin rights first.', 400);
  }

  // Check if member exists in group
  const memberIndex = group.members.indexOf(req.user.id);
  if (memberIndex === -1) {
    throw new AppError('You are not a member of this group', 400);
  }

  group.members.splice(memberIndex, 1);
  await group.save();

  return successResponse(res, {
    message: 'Successfully left the group',
  });
});