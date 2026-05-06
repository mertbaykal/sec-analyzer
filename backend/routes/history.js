/**
 * routes/history.js
 * All routes require authentication (JWT)
 *
 * GET    /api/history       — get user's password check history
 * POST   /api/history       — save a password analysis result
 * DELETE /api/history/:id   — delete one entry
 * DELETE /api/history       — clear all entries
 */

const express = require('express');
const History = require('../models/History');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All history routes are protected
router.use(protect);

// ── Get all history for user ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const records = await History.find({ userId: req.user.id })
      .sort({ checkedAt: -1 })
      .limit(50); // Max 50 records per user

    res.json({ count: records.length, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Save a new history entry ───────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      maskedPassword,
      score,
      strength,
      entropy,
      length,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      isCommonPassword,
      crackTimeEstimate,
    } = req.body;

    // Validate required fields
    if (!maskedPassword || score === undefined || !strength)
      return res.status(400).json({ error: 'Missing required fields.' });

    const record = await History.create({
      userId: req.user.id,
      maskedPassword,
      score,
      strength,
      entropy: entropy || 0,
      length: length || 0,
      hasUppercase: !!hasUppercase,
      hasLowercase: !!hasLowercase,
      hasNumbers: !!hasNumbers,
      hasSymbols: !!hasSymbols,
      isCommonPassword: !!isCommonPassword,
      crackTimeEstimate: crackTimeEstimate || 'Unknown',
    });

    res.status(201).json({ message: 'Saved to history', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete one entry ───────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const record = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // Ensure user owns this record
    });

    if (!record)
      return res.status(404).json({ error: 'Record not found.' });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Clear all history ──────────────────────────────────────────
router.delete('/', async (req, res) => {
  try {
    const result = await History.deleteMany({ userId: req.user.id });
    res.json({ message: `Cleared ${result.deletedCount} records` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
