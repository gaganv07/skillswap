const express = require('express');
const router = express.Router();
const {
  createGroup,
  getUserGroups,
  getGroup,
  addMember,
  removeMember,
  updateGroup,
  leaveGroup,
} = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

router.use(auth); // All group routes require authentication

router.route('/')
  .get(getUserGroups)
  .post(createGroup);

router.route('/:groupId')
  .get(getGroup)
  .put(updateGroup);

router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:userId', removeMember);
router.delete('/:groupId/leave', leaveGroup);

module.exports = router;