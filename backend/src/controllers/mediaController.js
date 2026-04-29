const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { successResponse } = require('../utils/apiResponse');
const cloudinary = require('../config/cloudinary');

// @desc      Upload media file (image/file)
// @route     POST /api/media/upload
// @access    Private
exports.uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { type = 'image' } = req.body;
  const file = req.file;

  try {
    let uploadOptions = {
      folder: 'skillswap-chat',
      resource_type: 'auto',
    };

    // Specific options for different file types
    if (type === 'image') {
      uploadOptions = {
        ...uploadOptions,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
        ],
      };
    } else if (type === 'file') {
      uploadOptions.resource_type = 'raw';
    }

    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    return successResponse(res, {
      statusCode: 201,
      message: 'File uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileSize: file.size,
        type,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('Failed to upload file', 500);
  }
});

// @desc      Delete media file
// @route     DELETE /api/media/:publicId
// @access    Private
exports.deleteMedia = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  try {
    await cloudinary.uploader.destroy(publicId);

    return successResponse(res, {
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Failed to delete file', 500);
  }
});