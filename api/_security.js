// api/_security.js
// DFIR (Digital Forensics & Incident Response) + security engine.
//
// Capabilities:
//   Detection   — Pattern library covering prompt injection, XSS, SQLi, path traversal, RCE probes
//   Analysis    — Risk scoring (0–100) with labelled flags per request
//   Containment — In-memory IP blocklist with configurable TTL
//   Response    — Structured incident records (id, ts, severity, evidence)
//   CAPTCHA     — HMAC-SHA256 signed math challenge; replay-proof, expiry-enforced
//
// All state is in-memory (global scope). It resets on Vercel cold starts, which is fine
// for a personal portfolio. Production-scale would use Upstash Redis or Vercel KV.

"use strict";
const crypto = require("crypto");

// ── Challenge config ──────────────────────────────────────────────────────────
const HMAC_SECRET   = process.env.CHALLENGE_SECRET ?? "portfolio-default-secret-set-in-prod";
const CHALLENGE_TTL = 120_000; // 2 minutes

// ── Pattern library ───────────────────────────────────────────────────────────

// HIGH SEVERITY — clear attack indicators
const PATTERNS_HIGH = [
  { id: "prompt_injection",   score: 50, re: /ignore\s+(previous|above|prior|all)\s+(instructions?|prompts?|rules?|context)/i },
  { id: "prompt_injection",   score: 50, re: /you\s+are\s+now\s+|act\s+as\s+|pretend\s+(to\s+be|you\s+are)/i },
  { id: "prompt_injection",   score: 50, re: /system\s+prompt|hidden\s+instructions|jailbreak/i },
  { id: "xss_payload",        score: 50, re: /<script[\s>]|<\/script>|javascript:\s*[a-z]/i },
  { id: "xss_event_handler",  score: 45, re: /\bon(load|error|click|mouseover|focus|blur)\s*=/i },
  { id: "sqli_union",         score: 50, re: /\bunion\s+(all\s+)?select\b/i },
  { id: "sqli_tautology",     score: 40, re: /'\s*(or|and)\s+'?\d+'\s*=\s*'?\d+/i },
  { id: "rce_shell",          score: 50, re: /;\s*(ls|cat|whoami|id|uname|wget|curl|bash|sh)\b/i },
  { id: "path_traversal",     score: 45, re: /(\.\.[\/\\]){2,}|\/etc\/passwd|\/etc\/shadow/i },
  { id: "null_byte",          score: 40, re: /\x00|%00|\\x00/i },
  { id: "template_injection",  score: 45, re: /\{\{.*\}\}|\$\{.*\}|<%.*%>/i },
];

// MEDIUM SEVERITY — suspicious but ambiguous
const PATTERNS_MEDIUM = [
  { id: "escalation_language", score: 15, re: /\b(hack|exploit|bypass|crack|brute.?force|exfiltrat)\b/i },
  { id: "credential_probe",    score: 20, re: /\b(password|passwd|api.?key|access.?key|secret)\b/i },
  { id: "env_probe",           score: 25, re: /process\.env|GEMINI|\.env\b/i },
  { id: "code_execution",      score: 20, re: /\beval\s*\(|\bexec\s*\(|\bspawn\s*\(/i },
  { id: "social_engineering",  score: 15, re: /social\s+engineer|phishing|pretexting/i },
];

// ── Risk scoring ──────────────────────────────────────────────────────────────

/**
 * Score a list of cleaned message objects for suspicious content.
 * Returns { score, risk, flags[] }.
 */
function scoreRequest(messages) {
  const text = messages.map(m => m.parts?.[0]?.text ?? "").join(" ");
  let score = 0;
  const flagSet = new Set();

  for (const p of PATTERNS_HIGH) {
    if (p.re.test(text)) { score += p.score; flagSet.add(p.id); }
  }
  for (const p of PATTERNS_MEDIUM) {
    if (p.re.test(text)) { score += p.score; flagSet.add(p.id); }
  }

  if (text.length > 1500) { score += 15; flagSet.add("long_payload"); }
  if (messages.length > 30) { score += 10; flagSet.add("long_conversation"); }

  score = Math.min(score, 100);
  const risk = score >= 40 ? "high" : score >= 15 ? "medium" : "low";
  return { score, risk, flags: [...flagSet] };
}

// ── IP blocklist ──────────────────────────────────────────────────────────────

if (!global._sec_blocked) global._sec_blocked = new Map(); // ip → unblockAt ms

function isBlocked(ip) {
  const until = global._sec_blocked.get(ip);
  if (!until) return false;
  if (Date.now() >= until) { global._sec_blocked.delete(ip); return false; }
  return true;
}

function blockIP(ip, ms = 600_000) { // 10-minute default
  global._sec_blocked.set(ip, Date.now() + ms);
}

// ── Incident log ──────────────────────────────────────────────────────────────

if (!global._sec_incidents) global._sec_incidents = [];
const MAX_INCIDENTS = 500;

/**
 * Record a security incident.
 * @param {string} type   e.g. "PROMPT_INJECTION_ATTEMPT"
 * @param {string} sev    "critical" | "high" | "medium" | "low"
 * @param {object} data   Arbitrary forensic evidence
 * @returns {object}      The incident record
 */
function logIncident(type, sev, data = {}) {
  const inc = {
    id:  crypto.randomBytes(4).toString("hex"),
    ts:  new Date().toISOString(),
    type, sev,
    // Omit raw message text from incident log — keeps it GDPR-friendlier
    ...data,
  };
  global._sec_incidents.unshift(inc);
  if (global._sec_incidents.length > MAX_INCIDENTS) global._sec_incidents.length = MAX_INCIDENTS;
  return inc;
}

function getIncidents(n = 50) { return global._sec_incidents.slice(0, n); }

// ── CAPTCHA — HMAC-signed math challenge ─────────────────────────────────────

if (!global._sec_used_tokens) global._sec_used_tokens = new Set();

/**
 * Generate a new challenge.
 * Returns { a, b, token } where `token` is self-contained and HMAC-signed.
 * Token format: <id>.<answer>.<expiresMs>.<hmac>
 */
function generateChallenge() {
  const a       = Math.floor(Math.random() * 12) + 1;
  const b       = Math.floor(Math.random() * 12) + 1;
  const answer  = a + b;
  const id      = crypto.randomBytes(8).toString("hex");
  const expires = Date.now() + CHALLENGE_TTL;
  const payload = `${id}.${answer}.${expires}`;
  const sig     = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
  return { a, b, token: `${payload}.${sig}` };
}

/**
 * Validate a challenge token + user answer.
 * Returns { ok: boolean, reason?: string }
 */
function validateChallenge(token, userAnswer) {
  if (!token || userAnswer == null) return { ok: false, reason: "missing_captcha" };

  const parts = String(token).split(".");
  if (parts.length !== 4) return { ok: false, reason: "malformed_token" };
  const [id, answer, expiresStr, sig] = parts;

  // Replay check
  if (global._sec_used_tokens.has(id)) return { ok: false, reason: "token_replayed" };

  // Expiry check
  if (Date.now() > Number(expiresStr)) return { ok: false, reason: "token_expired" };

  // HMAC integrity check — constant-time comparison prevents timing attacks
  const payload  = `${id}.${answer}.${expiresStr}`;
  const expected = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return { ok: false, reason: "invalid_signature" };
    }
  } catch {
    return { ok: false, reason: "malformed_token" };
  }

  // Answer check
  if (Number(userAnswer) !== Number(answer)) return { ok: false, reason: "wrong_answer" };

  // Mark token as used (one-time)
  global._sec_used_tokens.add(id);
  // Prune used token set to prevent unbounded growth
  if (global._sec_used_tokens.size > 2000) {
    const arr = [...global._sec_used_tokens];
    arr.slice(0, 1000).forEach(t => global._sec_used_tokens.delete(t));
  }

  return { ok: true };
}

module.exports = {
  scoreRequest,
  isBlocked, blockIP,
  logIncident, getIncidents,
  generateChallenge, validateChallenge,
};
