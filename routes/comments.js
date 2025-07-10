const express   = require('express');
const Comment   = require('../models/Comment');
const { authenticate } = require('./auth');

const router = express.Router();

/**
 * POST /api/comments
 * Body: { itemId, text }
 * Create a new comment.
 */
router.post('/', authenticate, async (req, res) => {
  const { itemId, text, parentId = null } = req.body;
  const userId = req.user.uid;

  if (!itemId || !text) {
    return res.status(400).json({ error: 'itemId and text are required' });
  }

  try {
    const comment = await Comment.create({ userId: req.user.uid, itemId, text, parentId });
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Could not save comment' });
  }
});

/**
 * GET /api/comments
 * Query: ?itemId=<id>
 * Fetch comments for a story (sorted by newest first).
 */
router.get('/', async (req, res) => {
  const { itemId } = req.query;
  if (!itemId) {
    return res.status(400).json({ error: 'Missing itemId query parameter' });
  }
  try {
    const comments = await Comment.find({ itemId })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Could not fetch comments' });
  }
});

/**
 * PUT /api/comments/:id
 * Body: { text }
 * Update a comment (only owner).
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.text = req.body.text || comment.text;
    await comment.save();
    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Could not update comment' });
  }
});

/**
 * DELETE /api/comments/:id
 * Remove a comment (only owner).
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Could not delete comment' });
  }
});

module.exports = router;
