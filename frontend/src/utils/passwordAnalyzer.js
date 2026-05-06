/**
 * src/utils/passwordAnalyzer.js
 * Client-side password analysis (runs instantly without API call)
 * Mirrors the logic in backend/routes/password.js
 */

const COMMON_PASSWORDS = new Set([
  'password','123456','password123','admin','qwerty','letmein','welcome',
  'monkey','1234567890','dragon','master','hello','freedom','whatever',
  'shadow','sunshine','princess','football','charlie','password1',
  'iloveyou','starwars','superman','batman','trustno1','abc123',
  'login','passw0rd','master123','admin123','root','toor','pass',
  'test','guest','default','temp','changeme','secret','hunter2',
]);

export function analyzePassword(password) {
  if (!password) return null;

  const len = password.length;
  const hasUpper  = /[A-Z]/.test(password);
  const hasLower  = /[a-z]/.test(password);
  const hasNum    = /[0-9]/.test(password);
  const hasSym    = /[^A-Za-z0-9]/.test(password);
  const isCommon  = COMMON_PASSWORDS.has(password.toLowerCase());

  const upperCount = (password.match(/[A-Z]/g) || []).length;
  const lowerCount = (password.match(/[a-z]/g) || []).length;
  const numCount   = (password.match(/[0-9]/g) || []).length;
  const symCount   = (password.match(/[^A-Za-z0-9]/g) || []).length;

  // Charset size for entropy
  let charsetSize = 0;
  if (hasUpper) charsetSize += 26;
  if (hasLower) charsetSize += 26;
  if (hasNum)   charsetSize += 10;
  if (hasSym)   charsetSize += 32;
  if (!charsetSize) charsetSize = 1;

  const entropy = Math.round(len * Math.log2(charsetSize));

  // Score
  let score = 0;
  if (len >= 8)  score += 15;
  if (len >= 12) score += 15;
  if (len >= 16) score += 10;
  if (hasUpper)  score += 15;
  if (hasLower)  score += 15;
  if (hasNum)    score += 15;
  if (hasSym)    score += 20;
  if (isCommon)  score = Math.min(score, 15);
  score = Math.min(score, 100);

  // Crack time
  const combinations = Math.pow(charsetSize, len);
  const guessesPerSec = 1e10;
  const seconds = combinations / guessesPerSec;
  let crackTime = '';
  if (seconds < 1)           crackTime = 'Instantly';
  else if (seconds < 60)     crackTime = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600)   crackTime = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400)  crackTime = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 3.154e9) crackTime = `${Math.round(seconds / 31536000)} years`;
  else crackTime = '> centuries';

  // Strength label
  const strength =
    isCommon || score < 20 ? 'CRITICAL' :
    score < 40 ? 'WEAK' :
    score < 60 ? 'FAIR' :
    score < 80 ? 'GOOD' : 'STRONG';

  // Feedback
  const feedback = [];
  if (isCommon)   feedback.push('This is a very common password — avoid it entirely.');
  if (len < 8)    feedback.push('Use at least 8 characters.');
  if (len < 12)   feedback.push('Consider 12+ characters for stronger security.');
  if (!hasUpper)  feedback.push('Add uppercase letters (A–Z).');
  if (!hasLower)  feedback.push('Add lowercase letters (a–z).');
  if (!hasNum)    feedback.push('Include at least one number.');
  if (!hasSym)    feedback.push('Add special characters like !@#$%^&*.');
  if (feedback.length === 0) feedback.push('Great password! Store it in a password manager.');

  return {
    score, strength, entropy, crackTime, isCommon,
    composition: { upperCount, lowerCount, numCount, symCount },
    criteria: {
      hasMinLength: len >= 8,
      hasUppercase: hasUpper,
      hasLowercase: hasLower,
      hasNumbers:   hasNum,
      hasSymbols:   hasSym,
      hasGoodLength: len >= 12,
    },
    feedback,
  };
}

export function getStrengthColor(strength) {
  const colors = {
    CRITICAL: '#f04f4f',
    WEAK:     '#f5803a',
    FAIR:     '#f5a623',
    GOOD:     '#7cc96b',
    STRONG:   '#63dcb4',
  };
  return colors[strength] || '#6b7a96';
}
