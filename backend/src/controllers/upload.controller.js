// backend/src/controllers/upload.controller.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const Resume = require('../models/Resume');
const ragService = require('../services/rag.service');
const logger = require('../utils/logger');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
}).single('resume');

class UploadController {
  uploadResume(req, res) {
    console.log('➡️ Upload endpoint hit');

    upload(req, res, async (err) => {
      if (err) {
        console.error('❌ Multer error:', err.message);
        return res.status(400).json({ error: err.message });
      }

      try {
        console.log('📄 File received:', req.file);

        const userId = 1;
        const file = req.file;

        if (!file) {
          console.error('❌ No file on req.file');
          return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('🧠 Creating resume in DB...');

        const resume = await Resume.create(
          userId,
          file.filename,
          file.originalname,
          file.size,
          {}
        );

        console.log('✅ Resume inserted:', resume);

        ragService
          .processResume(resume.id, file.path)
          .catch((e) => logger.error('Resume processing failed', e));

        res.json({
          success: true,
          resume,
        });
      } catch (error) {
        console.error('🔥 UPLOAD CONTROLLER CRASH:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  async getUploadStatus(req, res, next) {
    try {
      const resume = await Resume.findById(req.params.resumeId);
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      res.json({ success: true, resume });
    } catch (e) {
      next(e);
    }
  }

  async listResumes(req, res, next) {
    try {
      const resumes = await Resume.findByUserId(1);
      res.json({ success: true, resumes });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UploadController();
