// controllers/resume.controller.js
const Resume = require('../models/resume');
const { apiResponse } = require('../utils/apiResponse'); // optional – if you have it
// If you don't have apiResponse util yet, just use plain res.json()

/**
 * Create a new resume
 * POST /api/resumes
 */
const createResume = async (req, res) => {
  try {
    const { title, blocks } = req.body;

    // Optional: If you add auth later → req.user.id
    // For now: either from body or leave undefined (guest/anonymous resume)
    const userId = req.body.userId || null;

    const resume = new Resume({
      userId,
      title: title || 'Untitled Resume',
      blocks: blocks || [],
    });

    await resume.save();

    res.status(201).json({
      success: true,
      data: resume,
      message: 'Resume created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create resume',
      error: error.message,
    });
  }
};

/**
 * Get all resumes (optionally filtered by userId)
 * GET /api/resumes
 */
const getAllResumes = async (req, res) => {
  try {
    const { userId } = req.query; // ?userId=...

    const filter = userId ? { userId } : {};
    const resumes = await Resume.find(filter)
      .sort({ createdAt: -1 }) // newest first
      .limit(20); // reasonable default

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message,
    });
  }
};

/**
 * Get single resume by ID
 * GET /api/resumes/:id
 */
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: error.message,
    });
  }
};

/**
 * Update resume (full or partial)
 * PUT /api/resumes/:id   (or PATCH)
 */
const updateResume = async (req, res) => {
  try {
    const { title, blocks, version } = req.body;

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Optional version check to prevent overwrite conflicts
    if (version && resume.version !== version) {
      return res.status(409).json({
        success: false,
        message: 'Resume was updated by someone else. Please reload.',
      });
    }

    if (title !== undefined) resume.title = title;
    if (blocks !== undefined) resume.blocks = blocks;
    resume.version = (resume.version || 1) + 1;

    await resume.save();

    res.status(200).json({
      success: true,
      data: resume,
      message: 'Resume updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error.message,
    });
  }
};

/**
 * Delete resume
 * DELETE /api/resumes/:id
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message,
    });
  }
};

module.exports = {
  createResume,
  getAllResumes,
  getResumeById,
  updateResume,
  deleteResume,
};