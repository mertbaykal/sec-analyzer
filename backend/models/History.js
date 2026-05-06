/**
 * models/History.js
 * Stores password analysis history for authenticated users
 */

const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Store masked password for display (never plain text)
    maskedPassword: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strength: {
      type: String,
      enum: ['CRITICAL', 'WEAK', 'FAIR', 'GOOD', 'STRONG'],
      required: true,
    },
    entropy: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    hasUppercase: Boolean,
    hasLowercase: Boolean,
    hasNumbers: Boolean,
    hasSymbols: Boolean,
    isCommonPassword: Boolean,
    crackTimeEstimate: String,
    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
