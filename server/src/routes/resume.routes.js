// routes/resume.routes.js
const express = require('express');
const router = express.Router();

const {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
} = require('../controllers/resume.controller');

// Routes
router.route('/')
  .post(createResume)
  .get(getAllResumes);

router.route('/:id')
  .get(getResumeById)
  .put(updateResume)
  .delete(deleteResume);

// Optional test route (keep or remove)
router.get('/test', (req, res) => {
  res.json({ message: 'Resume routes working!' });
});

module.exports = router;