/**
 * routes/network.js
 * POST /api/network/scan — simulate a port/service scan
 *
 * EDUCATIONAL ONLY: Does NOT perform any real network scanning.
 * Returns pre-defined mock data based on scan type.
 * This is safe, legal, and appropriate for university demos.
 */

const express = require('express');
const router = express.Router();

// ─── Mock Port Data ───────────────────────────────────────────
const MOCK_SCAN_PROFILES = {
  quick: [
    { port: 22,   service: 'SSH',   protocol: 'TCP', state: 'open', risk: 'low',
      description: 'Secure Shell — encrypted remote access' },
    { port: 80,   service: 'HTTP',  protocol: 'TCP', state: 'open', risk: 'low',
      description: 'Unencrypted web server — consider HTTPS redirect' },
    { port: 443,  service: 'HTTPS', protocol: 'TCP', state: 'open', risk: 'none',
      description: 'Encrypted web traffic — good' },
    { port: 3306, service: 'MySQL', protocol: 'TCP', state: 'open', risk: 'high',
      description: 'Database exposed — restrict to internal network' },
  ],
  full: [
    { port: 21,   service: 'FTP',       protocol: 'TCP', state: 'open', risk: 'high',
      description: 'Unencrypted file transfer — use SFTP instead' },
    { port: 22,   service: 'SSH',       protocol: 'TCP', state: 'open', risk: 'low',
      description: 'Secure Shell — ensure key-based auth only' },
    { port: 23,   service: 'Telnet',    protocol: 'TCP', state: 'open', risk: 'critical',
      description: 'Plaintext remote access — disable immediately' },
    { port: 80,   service: 'HTTP',      protocol: 'TCP', state: 'open', risk: 'low',
      description: 'Unencrypted web server' },
    { port: 443,  service: 'HTTPS',     protocol: 'TCP', state: 'open', risk: 'none',
      description: 'Encrypted web traffic — good' },
    { port: 3306, service: 'MySQL',     protocol: 'TCP', state: 'open', risk: 'high',
      description: 'Database exposed — use firewall rules' },
    { port: 8080, service: 'HTTP-Alt',  protocol: 'TCP', state: 'open', risk: 'medium',
      description: 'Alternate HTTP port — check if needed' },
    { port: 8443, service: 'HTTPS-Alt', protocol: 'TCP', state: 'open', risk: 'low',
      description: 'Alternate HTTPS port' },
  ],
  vuln: [
    { port: 21,   service: 'FTP (Anonymous Login)',      protocol: 'TCP', state: 'open', risk: 'critical',
      description: 'Anonymous FTP login enabled — critical vulnerability' },
    { port: 23,   service: 'Telnet (Plaintext)',         protocol: 'TCP', state: 'open', risk: 'critical',
      description: 'Telnet sends credentials in plaintext — CVE-class risk' },
    { port: 445,  service: 'SMB (EternalBlue)',          protocol: 'TCP', state: 'open', risk: 'critical',
      description: 'SMBv1 detected — potentially vulnerable to EternalBlue/WannaCry' },
    { port: 3306, service: 'MySQL (No Auth)',             protocol: 'TCP', state: 'open', risk: 'high',
      description: 'MySQL listening with no password on root' },
    { port: 3389, service: 'RDP',                        protocol: 'TCP', state: 'open', risk: 'high',
      description: 'Remote Desktop exposed — brute-force risk' },
    { port: 6379, service: 'Redis (Unauthenticated)',    protocol: 'TCP', state: 'open', risk: 'high',
      description: 'Redis exposed with no authentication — data exfiltration risk' },
  ],
};

// ─── Risk Advice Map ──────────────────────────────────────────
const RISK_ADVICE = {
  none:     'Service appears secure. Continue monitoring.',
  low:      'Low risk. Monitor access logs for anomalies.',
  medium:   'Restrict with firewall rules if not needed externally.',
  high:     'Restrict to internal network or VPN — high exposure risk.',
  critical: 'Disable or patch immediately. Severe security risk.',
};

// ─── Input Validator ─────────────────────────────────────────
function isValidTarget(target) {
  // Accepts: IP address or domain name (basic validation)
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return ipRegex.test(target) || domainRegex.test(target) || target === 'localhost';
}

// ─── SCAN endpoint ────────────────────────────────────────────
router.post('/scan', (req, res) => {
  const { target, scanType = 'quick' } = req.body;

  if (!target)
    return res.status(400).json({ error: 'Target IP or domain is required.' });

  if (!isValidTarget(target))
    return res.status(400).json({ error: 'Invalid IP address or domain format.' });

  if (!MOCK_SCAN_PROFILES[scanType])
    return res.status(400).json({ error: 'Invalid scan type. Use: quick, full, or vuln.' });

  const ports = MOCK_SCAN_PROFILES[scanType];
  const riskPorts = ports.filter(p => p.risk === 'high' || p.risk === 'critical');
  const criticalPorts = ports.filter(p => p.risk === 'critical');

  // Add contextual advice to each port
  const enrichedPorts = ports.map(p => ({
    ...p,
    advice: RISK_ADVICE[p.risk],
  }));

  res.json({
    target,
    scanType,
    timestamp: new Date().toISOString(),
    disclaimer: 'EDUCATIONAL SIMULATION — No real scanning was performed.',
    summary: {
      totalOpen:    ports.length,
      riskPorts:    riskPorts.length,
      criticalCount: criticalPorts.length,
      services:     [...new Set(ports.map(p => p.service.split(' ')[0]))],
    },
    ports: enrichedPorts,
    overallRisk: criticalPorts.length > 0 ? 'CRITICAL' :
                 riskPorts.length > 0 ? 'HIGH' : 'MEDIUM',
  });
});

module.exports = router;
