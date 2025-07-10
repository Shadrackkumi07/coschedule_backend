const express = require('express');
const Rating = require('../models/Rating');
const { authenticate } = require('./auth');

const router = express.Router();

/**
 * POST /api/ratings
 * Body: { itemId, value }
 * Create a new rating (or replace existing by same user on same item)
 */
router.post('/', authenticate, async (req, res) => {
  const { itemId, value } = req.body;
  const userId = req.user.uid;

  if (!itemId || !value) {
    return res.status(400).json({ error: 'itemId and value are required' });
  }

  try {
    // Optional: prevent duplicate by upserting
    const rating = await Rating.findOneAndUpdate(
      { userId, itemId },
      { value },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(rating);
  } catch (err) {
    console.error('Error creating rating:', err);
    res.status(500).json({ error: 'Could not save rating' });
  }
});

/**
 * GET /api/ratings
 * Query: ?itemId=<id>
 * Fetch all ratings for a story; if no itemId, returns all ratings (admin use)
 */
router.get('/', async (req, res) => {
  const { itemId } = req.query;
  const filter = itemId ? { itemId } : {};
  try {
    const ratings = await Rating.find(filter);
    res.json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Could not fetch ratings' });
  }
});

/**
 * GET /api/ratings/:id
 * Fetch a single rating by its Mongo _id
 */
router.get('/:id', async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ error: 'Could not fetch rating' });
  }
});

/**
 * PUT /api/ratings/:id
 * Body: { value }
 * Update a rating (only the owner can)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    if (rating.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    rating.value = req.body.value;
    await rating.save();
    res.json(rating);
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ error: 'Could not update rating' });
  }
});

/**
 * DELETE /api/ratings/:id
 * Remove a rating (only the owner can)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    if (rating.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await rating.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ error: 'Could not delete rating' });
  }
});

module.exports = router;
