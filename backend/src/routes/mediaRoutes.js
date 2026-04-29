const express = require('express');
const router = express.Router();
const { uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', auth, upload.single('file'), upload.handleMulterError, uploadMedia);
router.delete('/:publicId', auth, deleteMedia);

module.exports = router;