const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  getSentRequests,
} = require('../controllers/requestController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { objectIdParam } = require('../validators/userValidators');

router.post('/', auth, sendRequest);
router.get('/incoming', auth, getIncomingRequests);
router.get('/sent', auth, getSentRequests);
router.put('/:id/accept', auth, objectIdParam('id'), validate, acceptRequest);
router.put('/:id/reject', auth, objectIdParam('id'), validate, rejectRequest);

module.exports = router;