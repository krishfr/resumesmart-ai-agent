const express = require('express');
const router = express.Router();

const ragController = require('../controllers/rag.controller');
const validator = require('../middleware/validator');

router.post('/query', ragController.query);
router.post('/query/stream', ragController.queryStream);

router.get(
  '/context/:resumeId',
  validator.validateResumeId,
  ragController.getContext
);

module.exports = router;
