// api/challenge.js
// Issues a one-time HMAC-signed math CAPTCHA challenge.
// GET /api/challenge → { q: "7 + 4", token: "<signed-payload>" }
//
// The token embeds the correct answer and an expiry, signed with HMAC-SHA256.
// The client sends { token, answer } with the first chat message; the server
// validates it in chat.js without needing any server-side session storage.

const { generateChallenge } = require("./_security");
const logger = require("./_logger");

module.exports = function handler(req, res) {
  const t0 = Date.now();
  const ip = (req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim();

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    logger.res(405, Date.now() - t0);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { a, b, token } = generateChallenge();
  logger.info("challenge.issued", { ip });
  logger.res(200, Date.now() - t0);
  return res.status(200).json({ q: `${a} + ${b}`, token });
};
