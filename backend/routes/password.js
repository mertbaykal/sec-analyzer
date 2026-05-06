/**
 * routes/password.js
 * POST /api/password/analyze — analyze password strength
 *
 * No authentication required — open to all users.
 * Performs: length check, charset analysis, entropy calc,
 *           common password detection, crack time estimation,
 *           and optional HIBP breach check.
 */

const express = require('express');
const router = express.Router();

// ─── Common Password List (built-in, 50 examples) ────────────
// In production you would use a larger dataset (~10k+)
const COMMON_PASSWORDS = new Set([
  'password','123456','password123','admin','qwerty','letmein','welcome',
  'monkey','1234567890','dragon','master','hello','freedom','whatever',
  'shadow','sunshine','princess','football','charlie','password1',
  'iloveyou','starwars','superman','batman','trustno1','abc123',
  'login','passw0rd','master123','admin123','root','toor','pass',
  'test','guest','default','temp','changeme','secret','hunter2',
  'opensesame','azerty','111111','000000','696969','superman',
  'michael','jessica','letmein1','qwerty123','superman1'
]);

// ─── Entropy Calculator ───────────────────────────────────────
function calcEntropy(password) {
  let charsetSize = 0;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
  if (charsetSize === 0) charsetSize = 1;
  return Math.round(password.length * Math.log2(charsetSize));
}

// ─── Crack Time Estimator ─────────────────────────────────────
// Assumes 10 billion guesses/second (modern GPU)
function estimateCrackTime(password) {
  let charsetSize = 0;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 32;
  if (charsetSize === 0) return 'Instantly';

  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSec = 1e10;
  const seconds = combinations / guessesPerSec;

  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3.154e9) return `${Math.round(seconds / 31536000)} years`;
  return '> centuries';
}

// ─── Score Calculator (0–100) ─────────────────────────────────
function calcScore(password, isCommon) {
  let score = 0;
  const len = password.length;

  if (len >= 8)  score += 15;
  if (len >= 12) score += 15;
  if (len >= 16) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  // Penalize common passwords hard
  if (isCommon) score = Math.min(score, 15);

  return Math.min(score, 100);
}

// ─── Strength Label ───────────────────────────────────────────
function getStrengthLabel(score) {
  if (score < 20) return 'CRITICAL';
  if (score < 40) return 'WEAK';
  if (score < 60) return 'FAIR';
  if (score < 80) return 'GOOD';
  return 'STRONG';
}

// ─── Feedback Generator ───────────────────────────────────────
function generateFeedback(password, isCommon) {
  const tips = [];
  const len = password.length;

  if (isCommon) tips.push('This is a very common password — avoid it entirely.');
  if (len < 8)  tips.push('Use at least 8 characters.');
  if (len < 12) tips.push('Consider 12+ characters for stronger security.');
  if (!/[A-Z]/.test(password)) tips.push('Add uppercase letters (A–Z).');
  if (!/[a-z]/.test(password)) tips.push('Add lowercase letters (a–z).');
  if (!/[0-9]/.test(password)) tips.push('Include at least one number.');
  if (!/[^A-Za-z0-9]/.test(password)) tips.push('Add special characters like !@#$%^&*.');
  if (tips.length === 0) tips.push('Great password! Store it safely in a password manager.');

  return tips;
}

// ─── ANALYZE endpoint ─────────────────────────────────────────
router.post('/analyze', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string')
      return res.status(400).json({ error: 'Password string is required.' });

    // Never log the actual password
    const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());
    const entropy  = calcEntropy(password);
    const score    = calcScore(password, isCommon);
    const strength = getStrengthLabel(score);
    const crackTime = estimateCrackTime(password);
    const feedback = generateFeedback(password, isCommon);

    // Character composition
    const upperCount = (password.match(/[A-Z]/g) || []).length;
    const lowerCount = (password.match(/[a-z]/g) || []).length;
    const numCount   = (password.match(/[0-9]/g) || []).length;
    const symCount   = (password.match(/[^A-Za-z0-9]/g) || []).length;

    // Optional: HIBP API check
    // Uncomment and set HIBP_API_KEY in .env to enable
    // let breachedCount = 0;
    // try {
    //   const { createHash } = require('crypto');
    //   const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    //   const prefix = hash.slice(0, 5);
    //   const suffix = hash.slice(5);
    //   const hibpRes = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    //     headers: { 'hibp-api-key': process.env.HIBP_API_KEY }
    //   });
    //   const text = await hibpRes.text();
    //   const match = text.split('\n').find(l => l.startsWith(suffix));
    //   if (match) breachedCount = parseInt(match.split(':')[1], 10);
    // } catch (_) {}

    res.json({
      score,
      strength,
      entropy,
      crackTimeEstimate: crackTime,
      length: password.length,
      isCommonPassword: isCommon,
      composition: {
        uppercase: upperCount,
        lowercase: lowerCount,
        numbers:   numCount,
        symbols:   symCount,
      },
      criteria: {
        hasMinLength:    password.length >= 8,
        hasUppercase:    upperCount > 0,
        hasLowercase:    lowerCount > 0,
        hasNumbers:      numCount > 0,
        hasSymbols:      symCount > 0,
        hasGoodLength:   password.length >= 12,
      },
      feedback,
      // breachedCount,  // Uncomment when HIBP is enabled
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
