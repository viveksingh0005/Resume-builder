// // routes/resume.routes.js
// const express = require('express');
// const router = express.Router();

// const {
//   createResume,
//   getAllResumes,
//   getResumeById,
//   updateResume,
//   deleteResume,
// } = require('../controllers/resume.controller');

// // Routes
// router.route('/')
//   .post(createResume)
//   .get(getAllResumes);

// router.route('/:id')
//   .get(getResumeById)
//   .put(updateResume)
//   .delete(deleteResume);

// // Optional test route (keep or remove)
// router.get('/test', (req, res) => {
//   res.json({ message: 'Resume routes working!' });
// });

// module.exports = router;


// src/routes/resume.routes.js
const express = require('express');
const router = express.Router();

const { generateResumePDF } = require('../controllers/pdf.controller');

router.post('/generate-pdf', generateResumePDF);

// You can add more resume-related routes later, e.g.
// router.post('/save', saveResume);
// router.get('/:id', getResume);

module.exports = router;