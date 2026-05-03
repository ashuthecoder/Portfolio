// api/_logger.js
// Structured JSON logger — compatible with Vercel, Datadog, Logtail, Axiom.
// Secrets are auto-redacted before writing.

const LEVELS    = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN       = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;
const SERVICE   = "portfolio-api";
const SECRET_RE = /key|secret|token|password|auth|bearer|credential/i;

function redact(obj, depth = 0) {
  if (depth > 3 || !obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SECRET_RE.test(k))                    out[k] = "[REDACTED]";
    else if (typeof v === "string" && v.length > 400) out[k] = v.slice(0, 400) + "…";
    else if (typeof v === "object")           out[k] = redact(v, depth + 1);
    else                                      out[k] = v;
  }
  return out;
}

function write(level, event, data = {}) {
  if (LEVELS[level] < MIN) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(), level, service: SERVICE,
    env: process.env.VERCEL_ENV ?? "local", event, ...redact(data),
  });
  level === "error" ? console.error(line) : console.log(line);
}

const logger = {
  debug: (e, d) => write("debug", e, d),
  info:  (e, d) => write("info",  e, d),
  warn:  (e, d) => write("warn",  e, d),
  error: (e, d) => write("error", e, d),

  req(req, extra = {}) {
    write("info", "http.request", {
      method: req.method,
      path:   req.url,
      ip:     (req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim(),
      origin: req.headers.origin ?? "",
      ua:     (req.headers["user-agent"] ?? "").slice(0, 100),
      ...extra,
    });
  },

  res(status, ms, extra = {}) {
    write(status >= 500 ? "error" : status >= 400 ? "warn" : "info",
      "http.response", { status, durationMs: ms, ...extra });
  },
};

module.exports = logger;