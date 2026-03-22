const mongoose = require('mongoose');
const { Schema } = mongoose;

const blockSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'heading', 'paragraph', 'link', 'bullet-list',
      'experience-entry', 'education-entry', 'skill',
      'divider', 'image', 'two-column', 'custom'
    ]
  },
  order: { type: Number, required: true, min: 0 },
  visible: { type: Boolean, default: true },
  style: { type: Schema.Types.Mixed, default: () => ({}) },
  content: { type: Schema.Types.Mixed, required: true, default: () => ({}) },
}, {
  _id: false,
  minimize: false
});

const resumeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Resume', trim: true },
  blocks: [blockSchema],
  version: { type: Number, default: 1 },
}, {
  timestamps: true   // ← handles createdAt / updatedAt automatically
});

module.exports = mongoose.model('Resume', resumeSchema);