// routes/auth.js
const express = require('express');
const axios   = require('axios');
const admin   = require('../firebase');    // Admin SDK still initialized in firebase.js
const router  = express.Router();

// Pull the API key directly from the env
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * POST /api/auth/signup
 * Body: { email, password }
 * Creates a new Firebase user.
 */
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({
      uid:   userRecord.uid,
      email: userRecord.email,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Uses Firebase Auth REST API to sign in and return an ID token.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const resp = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      { email, password, returnSecureToken: true }
    );
    // Return the tokens to the client
    res.json({
      idToken:      resp.data.idToken,
      refreshToken: resp.data.refreshToken,
      expiresIn:    resp.data.expiresIn,
      localId:      resp.data.localId,
    });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('Login error:', msg);
    res.status(400).json({ error: msg });
  }
});

/**
 * Middleware to protect routes.
 * Expects `Authorization: Bearer <ID_TOKEN>` header.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
  const idToken = header.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;   // make user info available downstream
    next();
  } catch (err) {
    console.error('Token verify error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { router, authenticate };
