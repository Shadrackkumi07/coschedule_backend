const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,          // Firebase UID
    required: true,
    index: true,
  },
  itemId: {
    type: String,          // HackerNews story ID or Algolia objectID
    required: true,
    index: true,
  },
  value: {
    type: Number,          // 1–5 stars
    required: true,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true         // auto-manage createdAt & updatedAt
});

module.exports = mongoose.model('Rating', ratingSchema);
