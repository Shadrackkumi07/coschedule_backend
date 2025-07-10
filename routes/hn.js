// routes/hn.js
const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// Base URL for HackerNews API
const HN_BASE = 'https://hacker-news.firebaseio.com/v0';
// Public Algolia search endpoint for HN
const HN_SEARCH_URL = 'http://hn.algolia.com/api/v1';

// GET /api/topstories
router.get('/topstories', async (req, res) => {
  try {
    // Parse & cap the requested limit
    const raw = parseInt(req.query.limit, 10);
    const limit = Number.isInteger(raw) && raw > 0
      ? Math.min(raw, 50)
      : 10;

    // 1. Fetch all top IDs
    const idsResp  = await axios.get(`${HN_BASE}/topstories.json`);
    const topIds   = idsResp.data.slice(0, limit);

    // 2. Fetch details in parallel
    const stories = await Promise.all(
      topIds.map(id => axios.get(`${HN_BASE}/item/${id}.json`).then(r => r.data))
    );

     // 4. Return the array of story objects
    res.json(stories);

  } catch (err) {
    console.error('❌ Error in /topstories:', err);
    res.status(502).json({ error: 'Failed to fetch top stories' });
  }
});

/**
 * GET /api/search
 * Query params:
 *   • q      (string, required) – the search term
 *   • limit  (int, optional) – max results (default 10, cap 50)
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;
  let limit = parseInt(req.query.limit, 10) || 10;
  limit = Math.min(Math.max(limit, 1), 50);

  if (!q) {
    return res.status(400).json({ error: 'Missing `q` (query) parameter' });
  }

  try {
    // Proxy to Algolia’s HN search
    const resp = await axios.get(`${HN_SEARCH_URL}/search`, {
      params: {
        query:     q,
       hitsPerPage: limit
      }
    });
    // resp.data.hits is an array of story/comment objects
    res.json(resp.data.hits);
  } catch (err) {
    console.error('❌ Error in /search:', err.message);
    res.status(502).json({ error: 'Search failed' });
  }
});

module.exports = router;
