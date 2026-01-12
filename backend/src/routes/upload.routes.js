// backend/src/routes/upload.routes.js
const express = require('express');
const router = express.Router();

const uploadController = require('../controllers/upload.controller');
const validator = require('../middleware/validator');

// Upload resume
router.post(
  '/',
  uploadController.uploadResume
);

// Get upload / processing status
router.get(
  '/status/:resumeId',
  validator.validateResumeId,
  uploadController.getUploadStatus
);

// List resumes for user
router.get(
  '/list',
  uploadController.listResumes
);

// Delete resume
// router.delete(
//   '/:resumeId',
//   validator.validateResumeId,
//   uploadController.deleteResume
// );

// ✅ THIS IS THE ONLY CORRECT EXPORT
module.exports = router;
