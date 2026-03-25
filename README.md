# Portfolio


# Ashutosh Gupta — Cybersecurity Portfolio

> A production-grade personal portfolio with a secure AI chatbot, serverless API proxy,
> structured logging, and security-first architecture — deployed free on Vercel.

**Live site:** [cybervantage.tech](https://cybervantage.tech)  
**GitHub:** [github.com/ashuthecoder](https://github.com/ashuthecoder)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [File Structure](#2-file-structure)
3. [Architecture & Data Flow](#3-architecture--data-flow)
4. [Trust Boundaries & Threat Model](#4-trust-boundaries--threat-model)
5. [Security Controls](#5-security-controls)
6. [Setup — Local Development](#6-setup--local-development)
7. [Deployment — Vercel + GitHub](#7-deployment--vercel--github)
8. [Environment Variables](#8-environment-variables)
9. [Updating Your Portfolio Content](#9-updating-your-portfolio-content)
10. [Logging & Observability](#10-logging--observability)
11. [How the Chatbot Works](#11-how-the-chatbot-works)
12. [Troubleshooting](#12-troubleshooting)
13. [Future Improvements](#13-future-improvements)

---

## 1. Project Overview

This portfolio is a single-page application built with plain HTML, CSS, and JavaScript —
no frontend framework required. It has a left sidebar navigation, a main scrollable content
area with five sections, and a sticky AI chatbot panel on the right.

The chatbot is powered by Google Gemini 1.5 Flash via a **serverless Vercel function** that
acts as a secure proxy. The API key never touches the browser — it lives only in Vercel's
server-side environment variables. This is a deliberate security design decision, and it is
highlighted on the portfolio itself to demonstrate security awareness to recruiters.

**Stack:**
- Frontend: HTML5, CSS3 (custom properties), vanilla JavaScript
- Fonts: Cabinet Grotesk (display), JetBrains Mono (code/mono)
- AI: Google Gemini 1.5 Flash via REST API
- Hosting: Vercel (free tier)
- Serverless functions: Vercel Edge Functions (Node.js)

---

## 2. File Structure

```
portfolio/
│
├── data/
│   └── profile.js          ← SINGLE SOURCE OF TRUTH. Edit only this file.
│                              Loaded server-side only. Never reaches the browser.
│
├── api/
│   ├── _logger.js          ← Structured JSON logger used by all API routes.
│   │                          Outputs JSON lines, redacts secrets automatically.
│   │
│   ├── chat.js             ← Gemini API proxy. Reads API key from env vars,
│   │                          builds system prompt from profile.js, enforces
│   │                          CORS, rate limiting, and input sanitization.
│   │
│   └── profile.js          ← Serves a safe subset of profile data to the browser.
│                              Strips the aiContext field before sending.
│
├── public/
│   ├── index.html          ← HTML shell. Zero hardcoded personal content.
│   │                          All content is injected by app.js at runtime.
│   │
│   ├── css/
│   │   └── style.css       ← All styling. CSS custom properties for theming.
│   │                          Responsive breakpoints at 1120px and 860px.
│   │
│   └── js/
│       └── app.js          ← Fetches /api/profile, renders all DOM sections,
│                              handles chatbot UI and API calls. Has a local
│                              fallback when the API is unavailable (Live Server).
│
├── .env.local              ← Local secrets. NEVER commit this file.
│                              Add these same variables in Vercel dashboard.
│
├── .gitignore              ← Ensures .env.local and node_modules are excluded
│                              from git commits.
│
└── vercel.json             ← Configures API routing rewrites and HTTP security
                               headers applied to every response.
```

### Why this structure?

The key architectural decision is **separation of concerns across trust levels**:

- `data/profile.js` — server-only. Contains all personal data including the `aiContext`
  field (private recruiter notes for the AI). This file is `require()`'d by the API
  functions and never served to the browser directly.

- `api/` — server-only. These are Vercel Serverless Functions. They run in Node.js on
  Vercel's infrastructure. Environment variables (like `GEMINI_API_KEY`) are only
  accessible here, not in the browser.

- `public/` — browser-facing. Contains no secrets, no API keys, and no hardcoded
  personal data. All content is fetched at runtime from `/api/profile`.

---

## 3. Architecture & Data Flow

### Request: Page Load

```
Browser
  │
  ├─ GET /index.html      → Vercel serves static file from public/
  ├─ GET /css/style.css   → Vercel serves static file from public/css/
  ├─ GET /js/app.js       → Vercel serves static file from public/js/
  │
  └─ GET /api/profile     → api/profile.js runs server-side
                               │
                               ├─ require('../data/profile')   ← reads profile.js
                               ├─ strips { aiContext, ... }     ← removes private field
                               └─ returns JSON to browser        ← safe public data only
```

### Request: Chat Message

```
Browser (app.js)
  │
  └─ POST /api/chat  { messages: [...] }
       │
       └─ api/chat.js runs server-side
             │
             ├─ CORS check              ← rejects non-whitelisted origins
             ├─ Rate limit check        ← max 15 req/min per IP
             ├─ Input validation        ← array check, length cap
             ├─ Sanitize messages       ← strip unexpected fields, cap to 2000 chars
             ├─ require('../data/profile')  ← loads full profile including aiContext
             ├─ buildPrompt()           ← constructs Gemini system prompt
             ├─ process.env.GEMINI_API_KEY  ← key injected here, server-side only
             │
             └─ POST https://generativelanguage.googleapis.com/...
                   │
                   └─ Gemini returns reply
                         │
                         └─ api/chat.js returns { reply } to browser
```

The key insight: **the browser never sees the API key**. The browser sends a request to
your own `/api/chat` endpoint. Your server injects the key, calls Gemini, and forwards
only the reply back. A visitor inspecting network traffic will only see requests to
`your-site.vercel.app/api/chat` — not to Gemini directly, and not the key.

---

## 4. Trust Boundaries & Threat Model

The system has three trust zones:

### Zone 1: Untrusted — Internet / Browser
Everything coming from a visitor's browser is untrusted by default. Threats include:

| Threat | Mitigation |
|---|---|
| XSS injection via chat input | All user text is HTML-escaped with `esc()` before DOM insertion. Never use `innerHTML` with unescaped user input. |
| Prompt injection (malicious AI instructions in chat) | Messages are sanitized server-side. Role field is validated. Content is capped at 2000 chars. System prompt is injected by the server, not the user. |
| API key theft | Key exists only in server-side env vars. Never in HTML, JS, or any client-visible response. |
| CORS bypass | `api/chat.js` and `api/profile.js` check `req.headers.origin` against a whitelist. Requests from other origins receive a 403. |
| Rate abuse (burning free Gemini quota) | In-memory rate limiter: 15 requests per IP per minute. Returns 429 with a retry-after duration. |

### Zone 2: Semi-trusted — Vercel Edge
Vercel's infrastructure is trusted to run your code, but the API routes themselves apply
defence-in-depth. HTTP security headers are injected here for every response:

| Header | Value | Purpose |
|---|---|---|
| Content-Security-Policy | `default-src 'self'; ...` | Prevents loading resources from untrusted origins. Blocks inline script injection. |
| X-Frame-Options | `DENY` | Prevents clickjacking — your site cannot be embedded in an iframe. |
| X-Content-Type-Options | `nosniff` | Prevents MIME-type sniffing attacks. |
| X-XSS-Protection | `1; mode=block` | Activates browser XSS filter (legacy browsers). |
| Referrer-Policy | `strict-origin-when-cross-origin` | Limits referrer information sent to third parties. |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Disables browser features your site doesn't need. |

### Zone 3: Trusted — Server Environment
Environment variables and the `data/profile.js` file live here. This zone is the only
one with access to the Gemini API key. The `aiContext` field in `profile.js` contains
private recruiter notes — it is stripped by `api/profile.js` before any data reaches
the browser.

### Trust Boundary Crossing Rules
- **Browser → api/chat:** POST only. Origin checked. Body validated and sanitized.
  Rate limited. API key never returned in any response.
- **Browser → api/profile:** GET only. `aiContext` stripped. Response cached 5 minutes.
- **api/chat → Gemini:** Server-to-server only. Key injected from env. Never proxied
  back to browser.
- **api/* → data/profile.js:** `require()` call — happens at cold start. Profile data
  is in-process memory on the server. Never written to any response as-is.

---

## 5. Security Controls

### API Key Protection
The Gemini API key is stored in Vercel's environment variable system. It is:
- Never present in any file committed to git
- Never present in any file served to the browser
- Never logged (the logger's `SECRET_RE` pattern redacts it automatically)
- Accessible only within the serverless function runtime

### Input Sanitization (server-side, `api/chat.js`)
```js
const clean = messages.map(m => ({
  role:  m.role === "model" ? "model" : "user",  // only two valid roles
  parts: [{ text: String(m.parts?.[0]?.text ?? "").slice(0, 2000) }],  // cap length
}));
```
Only the `role` and `parts[0].text` fields are forwarded. Any extra fields an attacker
might inject (like a fake `system` field) are silently dropped.

### XSS Prevention (client-side, `public/js/app.js`)
```js
function esc(str) {
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}
```
Every piece of data fetched from the API is passed through `esc()` before being inserted
into the DOM via `innerHTML`. This prevents a compromised API response from injecting
executable HTML or JavaScript into the page.

### Rate Limiting (`api/chat.js`)
```js
// 15 requests per IP per 60-second window
const WIN = 60_000, MAX = 15;
```
The rate limiter is in-memory, which means it resets on each serverless cold start. For
a personal portfolio this is sufficient. If you need persistent rate limiting across cold
starts, replace with Vercel KV (key-value store) or Upstash Redis.

### Secret Redaction (`api/_logger.js`)
```js
const SECRET_RE = /key|secret|token|password|auth|bearer|credential/i;
// Any field whose name matches this pattern is replaced with "[REDACTED]"
```
Even if the Gemini API key somehow ended up in a log call, the logger would automatically
replace its value before writing the JSON line.

---

## 6. Setup — Local Development

### Prerequisites

Make sure these are installed:

```bash
node --version   # v18 or higher required
git --version    # any recent version
```

If Node is not installed, download LTS from [nodejs.org](https://nodejs.org).

### Install Vercel CLI

```bash
npm install -g vercel
```

### Clone / create your project folder

Put all project files in `D:\Portfolio\` (or any folder you prefer) matching the
structure shown in section 2.

### Configure local environment

Open `.env.local` and replace the placeholder:

```
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
ALLOWED_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

Get your free Gemini key at [aistudio.google.com](https://aistudio.google.com) →
Get API Key → Create API Key.

### Configure app.js for local testing

Open `public/js/app.js` and set:

```js
const LOCAL_DEV        = true;
const LOCAL_GEMINI_KEY = "AIzaSy_YOUR_ACTUAL_KEY_HERE";
```

`LOCAL_DEV = true` makes the chatbot call Gemini directly from the browser (since
`vercel dev` is not being used). This is safe for local testing only — set it back
to `false` before deploying.

### Run locally

**Option A — Live Server (simplest, chatbot works in LOCAL_DEV mode):**

1. Install the Live Server extension in VS Code (`Ctrl+Shift+X` → search "Live Server")
2. Right-click `public/index.html` → Open with Live Server
3. Browser opens at `http://127.0.0.1:5500`

**Option B — Vercel dev server (full production simulation):**

```bash
cd D:\Portfolio
vercel dev
```

Follow the prompts (link to existing project: N, output directory: public).
Open `http://localhost:3000`. This runs the serverless functions locally, so you can
set `LOCAL_DEV = false` and test the full secure proxy flow.

---

## 7. Deployment — Vercel + GitHub

### Step 1: Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `portfolio`, set visibility to **Public**
3. Click **Create repository** — leave the page open

### Step 2: Push your code

Open VS Code terminal (`Ctrl+\``) in your project folder:

```bash
cd D:\Portfolio
git init
git add .
git status          # verify .env.local does NOT appear (it should be gitignored)
git commit -m "Initial portfolio launch"
git remote add origin https://github.com/YOURUSERNAME/portfolio.git
git branch -M main
git push -u origin main
```

When prompted for a password, use a **Personal Access Token** (not your GitHub password):
GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) →
Generate new token → check `repo` → copy and paste as password.

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project** → import your `portfolio` repo
3. Configure the project:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: *(leave blank)*
   - Output Directory: `public`
4. Click **Deploy**

Your site is live in ~30 seconds at a URL like `portfolio-xyz.vercel.app`.

### Step 4: Add environment variables

1. Vercel Dashboard → your project → **Settings** → **Environment Variables**
2. Add each variable:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | Your key from aistudio.google.com |
| `ALLOWED_ORIGIN` | `https://your-project.vercel.app` (exact URL from step 3) |
| `LOG_LEVEL` | `info` |

3. Click **Save**
4. Go to **Deployments** → click `⋯` on the latest → **Redeploy**

### Step 5: Set LOCAL_DEV = false

Before the final deploy, open `public/js/app.js` and confirm:

```js
const LOCAL_DEV = false;
```

Push this change:

```bash
git add public/js/app.js
git commit -m "Switch to production proxy"
git push
```

Vercel auto-deploys on every push to `main`.

### Future updates

```bash
git add .
git commit -m "Update bio / add project / fix styling"
git push
# Vercel deploys automatically — live in ~30 seconds
```

---

## 8. Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `.env.local` (local) + Vercel dashboard (production) | Authenticates calls to Google Gemini API. Never reaches browser. |
| `ALLOWED_ORIGIN` | `.env.local` + Vercel | CORS whitelist. Only requests from this origin are accepted by `/api/chat` and `/api/profile`. |
| `LOG_LEVEL` | `.env.local` + Vercel | Controls logger verbosity. Options: `debug`, `info`, `warn`, `error`. Default: `info`. |

**Important:** `.env.local` is listed in `.gitignore` — it will never be committed to
GitHub even accidentally. Always add production values through the Vercel dashboard.

---

## 9. Updating Your Portfolio Content

**All content lives in one place: `data/profile.js`.**

To update anything — your bio, a new project, a new job, new skills — edit only
`data/profile.js`. The website and chatbot both update automatically.

### Key fields to know

| Field | What it controls |
|---|---|
| `name`, `title`, `summary` | Hero section text |
| `passion` | The italicised quote block below the hero |
| `certifications[]` | Gold badge chips in the About section |
| `skills{}` | Skills section. Each group has `type` (controls color) and `items[]` |
| `projects[]` | Project cards. Set `featured: true` for the top-section cards with accent stripe |
| `experience[]` | Work history rows |
| `volunteering[]` | Volunteering rows |
| `aiContext` | Private notes for the AI chatbot about how to represent you. Stripped before reaching browser. |

### Skill type → colour mapping

| Type value | Colour |
|---|---|
| `offense` | Red — offensive security tools |
| `forensics` | Amber — forensics and IR tools |
| `homelab` | Teal — infrastructure and homelab |
| `cloud` | Violet — cloud and identity |
| `dev` | Blue — programming and development |
| `network` | Gray — networking and OS |

### Adding a new project

Add an object to the `projects` array:

```js
{
  id:          "my-new-project",
  name:        "Project Name",
  emoji:       "🔧",
  award:       null,            // or "Award Winning"
  featured:    false,           // true = accent stripe, shown first
  liveUrl:     "https://...",   // or null
  githubUrl:   "https://github.com/...",
  status:      "Research",      // "Live" | "Always On" | "Research"
  description: "What it does and why it matters.",
  highlights: [
    "Key technical detail 1",
    "Key technical detail 2",
  ],
  skills: ["Skill A", "Skill B"],
  tech: ["Tool A", "Tool B"],
},
```

---

## 10. Logging & Observability

All API routes use `api/_logger.js` which outputs **structured JSON lines** to stdout/stderr.

### Log format

```json
{
  "ts": "2025-03-25T11:23:45.123Z",
  "level": "info",
  "service": "portfolio-api",
  "env": "production",
  "event": "gemini.ok",
  "ip": "203.0.113.42",
  "durationMs": 847,
  "replyLen": 312
}
```

### Log events

| Event | Level | Meaning |
|---|---|---|
| `http.request` | info | Every inbound request (method, path, IP, user-agent) |
| `http.response` | info/warn/error | Every outbound response (status, duration) |
| `rate_limit.hit` | warn | IP exceeded 15 req/min |
| `validation.bad_body` | warn | Malformed request body |
| `validation.too_long` | warn | Conversation exceeded 50 turns |
| `gemini.call` | info | About to call Gemini (turn count logged) |
| `gemini.ok` | info | Successful Gemini response (duration + reply length) |
| `gemini.http_error` | error | Gemini returned a non-200 status |
| `gemini.empty` | warn | Gemini returned no candidate text |
| `gemini.exception` | error | Network or runtime exception during Gemini call |
| `profile.request` | info | Browser fetched /api/profile |
| `profile.served` | info | Profile data returned successfully |
| `config.no_api_key` | error | `GEMINI_API_KEY` env var not set |

### Viewing logs

**Vercel dashboard:** Project → Logs tab → filter by function name or log level.

**Log drains:** For persistent log storage, connect a drain in Vercel Project → Settings →
Log Drains. Compatible services: Datadog, Logtail, Axiom, Papertrail. All accept JSON
line format.

**Local:** `vercel dev` prints log output to your terminal. Pipe to `jq` for pretty-printing:

```bash
vercel dev 2>&1 | grep '"event"' | jq .
```

### Adjusting verbosity

Change `LOG_LEVEL` environment variable:
- `debug` — everything including verbose internal steps
- `info` — normal operation (default)
- `warn` — only warnings and errors
- `error` — only errors

---

## 11. How the Chatbot Works

### Architecture

The chatbot uses a **double-proxy pattern**:

1. Browser collects conversation history as `[{ role, parts }]` objects
2. Browser POSTs to `/api/chat` — your own endpoint on Vercel
3. `api/chat.js` runs server-side:
   - Validates and sanitizes the message array
   - Loads `data/profile.js` (including `aiContext`)
   - Builds a system prompt using `buildPrompt()`
   - Prepends a "priming" turn pair (user instruction + model acknowledgment)
   - Appends the conversation history
   - Calls Gemini with the API key from env vars
   - Returns only `{ reply }` to the browser
4. Browser appends the reply to the chat UI

### System prompt construction

The system prompt is built dynamically from `data/profile.js`. It includes:
- Identity (name, title, location, availability)
- Full summary and passion statement
- All certifications
- All skills by category
- All project details including highlights and links
- Full work experience
- Volunteering
- The private `aiContext` field (recruiter notes)

The prompt instructs Gemini to:
- Refer to you in third person
- Be warm and concise (2–4 sentences unless more detail is requested)
- Highlight the homelab and CyberVantage as standout differentiators
- Never invent information
- Direct unknown questions to your email

### LOCAL_DEV mode

When `LOCAL_DEV = true` in `app.js`, the browser calls Gemini directly using
`LOCAL_GEMINI_KEY`. This is for local testing only — the key is visible in browser
network traffic. Always set `LOCAL_DEV = false` before deploying.

---

## 12. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Chatbot says "Could not connect" on live site | Env vars not set or not redeployed | Check Vercel → Settings → Environment Variables. Redeploy after adding them. |
| Site shows blank page on Vercel | Output directory wrong | Vercel → Settings → General → Output Directory → set to `public` |
| Chatbot says "Rate limit reached" | 15 req/min exceeded | Wait 60 seconds and try again |
| `git push` fails with auth error | GitHub now requires tokens not passwords | Create a Personal Access Token with `repo` scope at github.com → Settings → Developer settings |
| `.env.local` appears in `git status` | `.gitignore` is in wrong folder | Move `.gitignore` to project root (`D:\Portfolio\`) not inside `public/` |
| Live Site loads but chatbot silent | `LOCAL_DEV = true` still set | Set `LOCAL_DEV = false` in `app.js`, push, redeploy |
| Vercel function returns 403 | `ALLOWED_ORIGIN` env var wrong | Set it to your exact live URL — no trailing slash e.g. `https://portfolio-xyz.vercel.app` |
| Profile not loading, blank sections | `/api/profile` returning error | Check Vercel function logs. Common cause: `data/profile.js` has a syntax error. |

---

## 13. Future Improvements

These are possible enhancements not included in the current build:

**Persistent rate limiting**
Replace the in-memory rate limiter with Vercel KV or Upstash Redis so limits persist
across serverless cold starts. Useful if you expect high traffic.

**Custom domain**
Add your own domain in Vercel → Settings → Domains. Free options include
`yourname.is-a.dev` (requires a GitHub PR approval, takes a few hours).

**Analytics**
Add Vercel Analytics (free tier) for page view and performance data without cookies.
Enable in Vercel → Project → Analytics.

**Resume PDF**
Drop a `resume.pdf` file in `public/` to make the Resume button functional. The HTML
already links to `/resume.pdf`.

**Contact form**
Replace the mailto link with a proper form that submits to a serverless endpoint and
sends an email via Resend or SendGrid.

**Blog / writeups**
Add a `/writeups` section with CTF writeups or security research notes to further
demonstrate technical depth.

---

*Built with security-first principles — API key proxy, CSP headers, rate limiting,
input sanitization, CORS enforcement, audit logging, and XSS protection built in by default.*