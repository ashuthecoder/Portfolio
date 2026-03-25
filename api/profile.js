// api/profile.js
// Serves safe public profile data to the browser.
// Strips aiContext — that field never leaves the server.

const logger  = require("./_logger");
const profile = require("../data/profile");

const ALLOWED_ORIGINS = () => [
  process.env.ALLOWED_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
].filter(Boolean);

export default function handler(req, res) {
  const t0     = Date.now();
  const origin = req.headers.origin ?? "";
  const allowed = ALLOWED_ORIGINS();
  const use = allowed.includes(origin) ? origin : (allowed[0] ?? "*");

  res.setHeader("Access-Control-Allow-Origin",  use);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  logger.info("profile.request", {
    ip: (req.headers["x-forwarded-for"] ?? "unknown").split(",")[0].trim(),
  });

  const { aiContext, ...safe } = profile;

  logger.res(200, Date.now() - t0, { event: "profile.served" });
  return res.status(200).json(safe);
}