const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,      // Firebase UID
    required: true,
    index: true,
  },
  itemId: {
    type: String,      // HN story ID or Algolia objectID
    required: true,
    index: true,  
  },

  parentId: { type: String, default: null, index: true },

  text: {
    type: String,      // comment body
    required: true,
    trim: true,
  }
}, {
  timestamps: true     // adds createdAt & updatedAt
});

module.exports = mongoose.model('Comment', commentSchema);
