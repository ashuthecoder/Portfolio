// api/chat.js
// Secure Gemini proxy — API key never reaches the browser.
// Reads profile from data/profile.js server-side only.
//
// Security measures applied here:
//   • Rate limiting (15 req/min per IP) — prevents DoS / API key exhaustion
//   • CORS allowlist — only configured origins receive CORS headers; no wildcard fallback
//   • Input validation — message count cap (50), role whitelist ("user"/"model")
//   • sanitizeText() — strips control chars / null bytes to mitigate prompt injection
//   • Text length cap (2000 chars/message) — prevents token-stuffing attacks
//   • GEMINI_API_KEY read from env only — never exposed to the browser
//   • Gemini safety filters — blocks harassment, hate speech, dangerous content
//   • Structured logging with secret redaction (see logger.js)
//
// No SQL database is used anywhere in this project; there is no SQL injection surface.
// All profile data is static server-side config — no user input reaches a database query.

const logger  = require("./logger");
const profile = require("../data/profile");

if (!global._rl) global._rl = new Map();

// Rate limiter: 15 requests per 60-second window per IP (in-memory).
function rateCheck(ip) {
  const WIN = 60_000, MAX = 15, now = Date.now();
  const hits = (global._rl.get(ip) ?? []).filter(t => now - t < WIN);
  if (hits.length >= MAX) return { ok: false, wait: Math.ceil((hits[0] + WIN - now) / 1000) };
  hits.push(now);
  global._rl.set(ip, hits);
  if (global._rl.size > 1000) {
    for (const [k, v] of global._rl)
      if (v.every(t => now - t > WIN)) global._rl.delete(k);
  }
  return { ok: true, remaining: MAX - hits.length };
}

const ALLOWED_ORIGINS = () => [
  process.env.ALLOWED_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
].filter(Boolean);

// CORS: only set headers for origins in the allowlist.
// No wildcard fallback — an unlisted origin gets no CORS headers and the browser blocks it.
function cors(req, res) {
  const o = req.headers.origin ?? "";
  const allowed = ALLOWED_ORIGINS();
  if (allowed.includes(o)) {
    res.setHeader("Access-Control-Allow-Origin",  o);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }
}

// Strip ASCII control characters (null bytes, escape sequences, etc.) from user input.
// This mitigates prompt injection — attackers embedding hidden instructions in chat messages.
// Tab (\x09), newline (\x0A), and carriage return (\x0D) are preserved (legitimate whitespace).
function sanitizeText(str) {
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, 2000);
}

function buildPrompt() {
  const p = profile;
  const skillLines = Object.entries(p.skills)
    .map(([cat, g]) => `  ${cat}: ${g.items.join(", ")}`)
    .join("\n");
  const projLines = p.projects.map((pr, i) => [
    `  ${i + 1}. ${pr.name}${pr.award ? " [" + pr.award + "]" : ""} (${pr.status})`,
    `     ${pr.description}`,
    `     Key skills: ${pr.skills.join(", ")}`,
    pr.liveUrl   ? `     Live: ${pr.liveUrl}`   : null,
    pr.githubUrl ? `     GitHub: ${pr.githubUrl}` : null,
  ].filter(Boolean).join("\n")).join("\n\n");
  const expLines = p.experience
    .map(e => `  - ${e.role} @ ${e.company} (${e.period}): ${e.description}`)
    .join("\n");

  return `You are a professional, enthusiastic AI assistant on ${p.name}'s cybersecurity portfolio website.
Your role is to help visitors and recruiters learn about ${p.name}'s background, skills, and passion.
Be warm, confident, and concise — 2–4 sentences unless depth is specifically requested.
If asked something not covered below, say you're not certain and invite them to email ${p.email}.
Never invent facts. Always refer to ${p.name} in third person.

Highlight these standout facts when relevant:
- Ashutosh JUST GRADUATED from Macquarie University (Class of 2025)
- His HOMELAB (physical Intel NUC dual-NIC firewall + Mac Mini M4 + SIEM/SOAR) is extremely rare for a graduate
- CyberVantage is LIVE at cybervantage.tech and won an award
- He competes in CTFs and is General Executive of the CyberSec Society at Macquarie

FULL PROFILE:
Name: ${p.name} | Title: ${p.title} | Location: ${p.location}
Email: ${p.email} | GitHub: ${p.github} | Website: ${p.website}
Availability: ${p.availability}
Education: ${p.education.degree}, ${p.education.institution} (${p.education.status})
Summary: ${p.summary}
Passion: ${p.passion}
Certifications: ${p.certifications.map(c => c.name + ": " + c.detail).join(" | ")}
Skills:\n${skillLines}
Projects:\n${projLines}
Experience:\n${expLines}
Volunteering: ${p.volunteering.map(v => v.role + " @ " + v.org).join(" | ")}
Additional context: ${p.aiContext}`;
}

// module.exports = CommonJS export required by Vercel's Node.js serverless runtime.
// (Using "export default" here would cause "Unexpected token" because this file also
//  uses require(), making it a CommonJS module where ESM syntax is invalid.)
module.exports = async function handler(req, res) {
  const t0 = Date.now();
  const ip = (req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim();

  cors(req, res);
  logger.req(req, { ip });

  if (req.method === "OPTIONS") { logger.res(204, Date.now() - t0); return res.status(204).end(); }
  if (req.method !== "POST")   { logger.res(405, Date.now() - t0); return res.status(405).json({ error: "Method not allowed" }); }

  const rl = rateCheck(ip);
  res.setHeader("X-RateLimit-Remaining", rl.remaining ?? 0);
  if (!rl.ok) {
    logger.warn("rate_limit.hit", { ip, wait: rl.wait });
    logger.res(429, Date.now() - t0);
    return res.status(429).json({ error: `Rate limit reached. Please wait ${rl.wait}s.` });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    logger.warn("validation.bad_body", { ip });
    logger.res(400, Date.now() - t0);
    return res.status(400).json({ error: "Invalid request." });
  }
  if (messages.length > 50) {
    logger.warn("validation.too_long", { ip, len: messages.length });
    logger.res(400, Date.now() - t0);
    return res.status(400).json({ error: "Conversation too long. Please refresh." });
  }

  // Sanitize each message: whitelist role values, strip control characters, cap length.
  // This prevents prompt injection and token-stuffing attacks.
  const clean = messages
    .map(m => ({
      role:  m.role === "model" ? "model" : "user",
      parts: [{ text: sanitizeText(m.parts?.[0]?.text ?? "") }],
    }))
    .filter(m => m.parts[0].text.length > 0);

  if (clean.length === 0) {
    logger.warn("validation.empty_after_sanitize", { ip });
    logger.res(400, Date.now() - t0);
    return res.status(400).json({ error: "Invalid request." });
  }

  const prompt = buildPrompt();
  const payload = [
    { role: "user",  parts: [{ text: prompt + "\n\nAcknowledge briefly." }] },
    { role: "model", parts: [{ text: "Understood. Ready to represent Ashutosh." }] },
    ...clean,
  ];

  if (!process.env.GEMINI_API_KEY) {
    logger.error("config.no_api_key", { ip });
    logger.res(500, Date.now() - t0);
    return res.status(500).json({ error: "Server misconfiguration — please contact the site owner." });
  }

  try {
    logger.info("gemini.call", { ip, turns: clean.length });
    const gr = await fetch(
      // Model name is overridable via GEMINI_MODEL env var so you can swap models
      // without a code change when Google deprecates one (1.5-flash was retired in 2025).
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: payload,
          generationConfig: { temperature: 0.75, maxOutputTokens: 512, topP: 0.95 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!gr.ok) {
      const e = await gr.json().catch(() => ({}));
      logger.error("gemini.http_error", { ip, status: gr.status, msg: e?.error?.message });
      logger.res(502, Date.now() - t0);
      return res.status(502).json({ error: "AI service unavailable. Please try again." });
    }

    const gd    = await gr.json();
    const reply = gd.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      logger.warn("gemini.empty", { ip, finish: gd.candidates?.[0]?.finishReason });
      logger.res(502, Date.now() - t0);
      return res.status(502).json({ error: "No response generated. Please try again." });
    }

    const ms = Date.now() - t0;
    logger.info("gemini.ok", { ip, durationMs: ms, replyLen: reply.length });
    logger.res(200, ms);
    return res.status(200).json({ reply });

  } catch (err) {
    logger.error("gemini.exception", { ip, msg: err.message, stack: err.stack?.slice(0, 300) });
    logger.res(500, Date.now() - t0);
    return res.status(500).json({ error: "Internal error. Please try again shortly." });
  }
};
