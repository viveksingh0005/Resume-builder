const mongoose = require('mongoose');
const { Schema } = mongoose;

const blockSchema = new Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: [
            'heading',
            'paragraph',
            'link',
            'bullet-list',
            'experience-entry',
            'education-entry',
            'skill',
            'divider',
            'image',
            'two-column',
            'custom'
        ]
    },
    order: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    style: { type: Schema.Types.Mixed, default: {} },
    content: { type: Schema.Types.Mixed, required: true },
}, {
    _id: false,          // prevents creation of _id for subdocuments
    minimize: false      // keeps empty objects in style/content
});

const resumeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Resume', trim: true },
    blocks: [blockSchema],
    version: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update 'updatedAt' before every save
resumeSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Resume', resumeSchema);