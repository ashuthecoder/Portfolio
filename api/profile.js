// api/profile.js
// Serves safe public profile data to the browser.
//
// Security measures applied here:
//   • aiContext field stripped before response — recruiter coaching notes never reach the browser
//   • CORS allowlist — only configured origins receive CORS headers; no wildcard fallback
//   • Cache-Control headers — reduces load; no user data is cached (profile is public-read-only)
//   • module.exports (CommonJS) — avoids ESM/CJS mismatch that would cause "Unexpected token"

const logger  = require("./logger");
const profile = require("../data/profile");

const ALLOWED_ORIGINS = () => [
  process.env.ALLOWED_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
].filter(Boolean);

module.exports = function handler(req, res) {
  const t0     = Date.now();
  const origin = req.headers.origin ?? "";
  const allowed = ALLOWED_ORIGINS();

  // Only set CORS headers for allowed origins — no wildcard fallback.
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin",  origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  logger.info("profile.request", {
    ip: (req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim(),
  });

  // Destructure aiContext out — it contains recruiter coaching notes and must never
  // be sent to the browser. Everything else in the profile is safe to expose publicly.
  const { aiContext, ...safe } = profile;

  logger.res(200, Date.now() - t0, { event: "profile.served" });
  return res.status(200).json(safe);
};
