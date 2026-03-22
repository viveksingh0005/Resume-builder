// controllers/resume.controller.js
const mongoose = require('mongoose');
const Resume = require('../models/resume');
const { apiResponse } = require('../utils/apiResponse'); // optional – if you have it
// If you don't have apiResponse util yet, just use plain res.json()



/**
 * Create a new resume
 * POST /api/resumes
 */
const createResume = async (req, res) => {
  console.log("POST /api/resumes received");
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const { userId, title, blocks } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required (must be valid ObjectId)",
      });
    }

    // Quick check if it looks like ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "userId must be a valid 24-character hex string",
      });
    }

    const newResume = new Resume({
      userId: new mongoose.Types.ObjectId(userId), // force ObjectId type
      title: title || "Untitled Resume",
      blocks: blocks || [],
    });

    console.log("Document before save:", newResume.toObject());

    await newResume.save();

    console.log("Saved resume ID:", newResume._id.toString());

    return res.status(201).json({
      success: true,
      message: "Resume created",
      data: newResume,
    });
  } catch (err) {
    console.error("Create resume error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: err.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating resume",
      error: err.message,
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