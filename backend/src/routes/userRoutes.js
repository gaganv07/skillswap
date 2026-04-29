const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getAllUsers,
  uploadProfilePic,
  enhanceBio,
  generateBio,
  generateEncryptionKeys,
  getPublicKey,
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { objectIdParam, paginationValidator, updateProfileValidator } = require('../validators/userValidators');
const upload = require('../middleware/upload');

router.get('/', auth, paginationValidator, validate, getAllUsers);
router.get('/:id', objectIdParam('id'), validate, getUserProfile);
router.get('/:userId/public-key', auth, objectIdParam('userId'), validate, getPublicKey);
router.put('/update-profile', auth, upload.single('image'), upload.handleMulterError, updateProfileValidator, validate, updateProfile);
router.put('/:id', auth, upload.single('image'), upload.handleMulterError, updateProfileValidator, validate, updateProfile);
router.post('/upload-profile-pic', auth, upload.single('profilePic'), upload.handleMulterError, uploadProfilePic);
router.post('/enhance-bio', auth, enhanceBio);
router.post('/generate-bio', auth, generateBio);
router.post('/generate-keys', auth, generateEncryptionKeys);

module.exports = router;
