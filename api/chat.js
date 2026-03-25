export default async function handler(req, res) {
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Server configuration error." });
  const allowedOrigins = [process.env.ALLOWED_ORIGIN, "http://localhost:3000"].filter(Boolean);
  const origin = req.headers.origin || "";
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!global._rateMap) global._rateMap = {};
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  global._rateMap[ip] = (global._rateMap[ip] || []).filter(t => now - t < 60000);
  if (global._rateMap[ip].length >= 15) return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  global._rateMap[ip].push(now);

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid request" });
  if (messages.length > 40) return res.status(400).json({ error: "Conversation too long" });

  const sanitized = messages.map(m => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: String(m.parts?.[0]?.text || "").slice(0, 2000) }]
  }));

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: sanitized,
          generationConfig: { temperature: 0.75, maxOutputTokens: 512 },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      }
    );
    if (!geminiRes.ok) return res.status(500).json({ error: "AI service error. Try again." });
    const data = await geminiRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return res.status(500).json({ error: "No response from AI." });
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
}




