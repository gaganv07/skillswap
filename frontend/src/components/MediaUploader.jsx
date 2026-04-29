import React, { useState, useRef } from 'react';
import api from '../services/api';

/**
 * Media Upload Component
 * Handles file/image uploads for chat messages
 */
const MediaUploader = ({ onUploadComplete, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'image' or 'file'

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDocument = ALLOWED_FILE_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      onError('Unsupported file type. Please upload images, PDF, or documents.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError('File is too large. Maximum size is 10MB.');
      return;
    }

    // Show preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setPreviewType('image');
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(file.name);
      setPreviewType('file');
    }

    // Upload file
    await uploadFile(file, isImage ? 'image' : 'file');
  };

  const uploadFile = async (file, fileType) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const mediaData = response.data.data;

          onUploadComplete({
            type: fileType,
            fileUrl: mediaData.url,
            fileName: mediaData.fileName,
            fileSize: mediaData.fileSize,
          });

          // Reset
          setPreview(null);
          setPreviewType(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });

      xhr.addEventListener('error', () => {
        onError('Upload failed. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.open('POST', `${API_BASE_URL}/media/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      onError(error.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 disabled:bg-gray-300 transition-colors"
        title="Upload Media"
      >
        📎 Upload
      </button>

      {/* Preview Section */}
      {preview && (
        <div className="relative inline-block">
          {previewType === 'image' ? (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-lg border border-gray-300"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center text-xs text-gray-600 text-center p-1">
              📄
              <br />
              {preview.substring(0, 8)}...
            </div>
          )}

          {/* Progress Overlay */}
          {uploading && uploadProgress < 100 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-white text-xs font-semibold">
                {Math.round(uploadProgress)}%
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {uploadProgress === 100 && !uploading && (
            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              ✓
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={() => {
              setPreview(null);
              setPreviewType(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={uploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:bg-gray-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <span className="text-sm text-gray-600">Uploading...</span>
      )}
    </div>
  );
};

export default MediaUploader;