// public/js/app.js
// Set LOCAL_DEV = false before deploying to Vercel.

const LOCAL_DEV        = false;
const LOCAL_GEMINI_KEY = "PASTE_YOUR_GEMINI_KEY_HERE";

let profile       = null;
let history       = [];
let busy          = false;
let captchaToken  = null;
let captchaAnswer = null;
let captchaDone   = false; // true once solved or skipped

// Inline SVG icons for sidebar links
const IC_EMAIL    = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 3l7 6 7-6"/></svg>`;
const IC_GITHUB   = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.32C3.72 14.42 3.26 13 3.26 13c-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
const IC_LINKEDIN = `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/></svg>`;
const IC_WEB      = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7"/><path d="M8 1c-2 2-3 4-3 7s1 5 3 7M8 1c2 2 3 4 3 7s-1 5-3 7M1 8h14"/></svg>`;

(async () => {
  const [data] = await Promise.all([fetchProfile(), delay(1500)]);
  profile = data;
  renderAll(profile);
  document.getElementById("loader").classList.add("out");
  document.getElementById("app").classList.add("ready");
  document.getElementById("app").removeAttribute("aria-busy");
  initScrollSpy();
  initMobileMenu();
  initChat();
  fetchChallenge(); // non-blocking — runs in background
})();

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchProfile() {
  try {
    const r = await fetch("/api/profile");
    if (r.ok) return r.json();
  } catch {}
  return getLocalFallback();
}

function renderAll(p) {
  renderSidebar(p);
  renderHero(p); renderPassion(p); renderCerts(p);
  renderSkills(p); renderProjects(p); renderExperience(p);
  renderVolunteering(p); renderContact(p);
}

function renderSidebar(p) {
  setHTML("sb-name", esc(p.name));
  setHTML("sb-title", `<span class="sb-title-text">${esc(p.title)}</span>`);
  setHTML("sb-links", [
    { icon: IC_EMAIL,    label: p.email,    href: `mailto:${p.email}` },
    { icon: IC_GITHUB,   label: "GitHub",   href: p.github,   ext: true },
    { icon: IC_LINKEDIN, label: "LinkedIn", href: p.linkedin, ext: true },
    ...(p.website ? [{ icon: IC_WEB, label: "CyberVantage ↗", href: p.website, ext: true }] : []),
  ].map(l => `<a href="${l.href}" class="sb-link"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${l.icon}<span>${esc(l.label)}</span></a>`).join(""));
}

function renderHero(p) {
  document.title = `${p.name} — ${p.title}`;
  setHTML("hero-name", esc(p.name));
  setHTML("hero-title", `<span class="mono-tag">${esc(p.title)}</span>`);
  setHTML("hero-summary", esc(p.summary));
  setHTML("hero-tags", `
    <span class="tag tag-green"><span class="status-dot small" style="margin-right:2px"></span>Open to Work</span>
    <span class="tag tag-blue">${esc(p.education.status)} · ${esc(p.education.institution)}</span>
    <span class="tag tag-dim">${esc(p.location)}</span>
  `);
  setHTML("hero-actions", `
    <a href="#contact" class="btn btn-solid">Get in Touch</a>
    <a href="${p.github}"   class="btn btn-ghost" target="_blank" rel="noopener">GitHub ↗</a>
    <a href="${p.linkedin}" class="btn btn-ghost" target="_blank" rel="noopener">LinkedIn ↗</a>
    ${p.website ? `<a href="${p.website}" class="btn btn-ghost" target="_blank" rel="noopener">CyberVantage ↗</a>` : ""}
  `);
}

function renderPassion(p) { setHTML("passion-text", esc(p.passion)); }

function renderCerts(p) {
  setHTML("certs-block", p.certifications.map(c =>
    `<span class="cert-chip">${esc(c.icon)} ${esc(c.name)} <span style="opacity:0.55">· ${esc(c.detail)}</span></span>`
  ).join(""));
}

function renderSkills(p) {
  const DOT = { offense:"var(--r)", forensics:"var(--y)", homelab:"var(--t)", cloud:"var(--v)", dev:"var(--a)", network:"var(--tx3)" };
  setHTML("skills-container", Object.entries(p.skills).map(([cat, group]) => `
    <div class="skill-group">
      <div class="skill-group-header">
        <span class="skill-group-dot" style="background:${DOT[group.type] ?? 'var(--tx3)'}"></span>
        <span class="skill-group-label mono-tag">${esc(cat)}</span>
        <span class="skill-group-count mono-tag">${group.items.length} skills</span>
      </div>
      <div class="skill-tags">${group.items.map(s => `<span class="skill-tag ${group.type ?? ''}">${esc(s)}</span>`).join("")}</div>
    </div>`).join(""));
}

function renderProjects(p) {
  const tagClass = t => /aes|rce|owasp|rbac|exploit|wpa|inject|cve/i.test(t) ? "sec" : /intel|nuc|siem|soar|ids|firewall|mac mini|self-host/i.test(t) ? "infra" : /azure|cloud/i.test(t) ? "cloud" : "";

  // Security domain classification per project
  const SEC = {
    "cybervantage":    [{ label:"Full-Stack Security", cls:"fullstack" }, { label:"Cloud / Azure RBAC", cls:"cloud-sec" }],
    "homelab":         [{ label:"Defensive / Blue Team", cls:"defensive" }, { label:"SIEM & SOAR", cls:"defensive" }],
    "cve-exploit":     [{ label:"Offensive / Red Team", cls:"offensive" }, { label:"CVE Research", cls:"offensive" }],
    "network-pentest": [{ label:"Wireless Pentesting", cls:"offensive" }, { label:"Network Security", cls:"offensive" }],
    "forensics":       [{ label:"DFIR", cls:"forensics" }, { label:"Blue Team", cls:"defensive" }],
  };

  setHTML("projects-container", p.projects.map(pr => {
    const secTags = SEC[pr.id] || [];
    const secRow = secTags.length ? `
      <div class="project-security-row">
        <span class="proj-sec-label">Domain</span>
        ${secTags.map(t => `<span class="proj-sec-tag ${t.cls}">${esc(t.label)}</span>`).join("")}
      </div>` : "";
    return `
    <div class="project-card ${pr.featured ? "featured" : ""}">
      <div class="project-body">
        <div class="project-head">
          <div class="project-head-left">
            <div class="project-em">${pr.emoji}</div>
            <div>
              <div class="project-name">${esc(pr.name)}</div>
              <div class="project-badges">
                ${pr.award ? `<span class="badge-award">🏆 ${esc(pr.award)}</span>` : ""}
                ${pr.status === "Live" || pr.status === "Always On"
                  ? `<span class="badge-status"><span class="dot"></span>${esc(pr.status)}</span>`
                  : `<span class="badge-research">${esc(pr.status)}</span>`}
              </div>
            </div>
          </div>
          <div class="project-links">
            ${pr.liveUrl   ? `<a href="${pr.liveUrl}"   class="project-link" target="_blank" rel="noopener">🌐 Live</a>`   : ""}
            ${pr.githubUrl ? `<a href="${pr.githubUrl}" class="project-link" target="_blank" rel="noopener">🐙 GitHub</a>` : ""}
          </div>
        </div>
        ${secRow}
        <p class="project-desc">${esc(pr.description)}</p>
        ${pr.highlights ? `<div class="project-highlights">${pr.highlights.map(h => `<div class="highlight-item"><span class="highlight-bullet">→</span><span>${esc(h)}</span></div>`).join("")}</div>` : ""}
        <div class="project-skills-label">Technologies &amp; Skills</div>
        <div class="project-tech">${pr.tech.map(t => `<span class="tech-tag ${tagClass(t)}">${esc(t)}</span>`).join("")}</div>
      </div>
    </div>`;
  }).join(""));
}

function renderExperience(p) {
  setHTML("exp-container", `<div class="exp-list">${p.experience.map(e => `
    <div class="exp-row">
      <div class="exp-time">${esc(e.period).replace("—", "—<br>")}</div>
      <div>
        <div class="exp-role">${esc(e.role)}</div>
        <div class="exp-company">${esc(e.company)}${e.current ? `<span class="exp-current">Current</span>` : ""}</div>
        <div class="exp-desc">${esc(e.description)}</div>
      </div>
    </div>`).join("")}</div>`);
}

function renderVolunteering(p) {
  setHTML("vol-container", `<div class="vol-list">${p.volunteering.map(v => `
    <div class="vol-row">
      <span class="vol-icon">◆</span>
      <div class="vol-text">
        <span class="vol-role">${esc(v.role)}</span>
        <span class="vol-org"> · ${esc(v.org)}</span>
        ${v.detail ? `<div class="vol-detail">${esc(v.detail)}</div>` : ""}
      </div>
      <span class="vol-period">${esc(v.period)}</span>
    </div>`).join("")}</div>`);
}

function renderContact(p) {
  const avail = p.availability.charAt(0).toLowerCase() + p.availability.slice(1);
  setHTML("contact-intro", `${esc(p.name)} just graduated and is ${esc(avail)} Feel free to reach out — he responds quickly.`);
  setHTML("contact-links", [
    { icon:"✉️", label:"Email",        val: p.email,                           href: `mailto:${p.email}` },
    { icon:"🐙", label:"GitHub",       val: p.github.replace("https://",""),   href: p.github,    ext: true },
    { icon:"💼", label:"LinkedIn",     val: p.linkedin.replace("https://",""), href: p.linkedin,  ext: true },
    { icon:"🌐", label:"CyberVantage", val: "cybervantage.tech",               href: "https://cybervantage.tech", ext: true },
    { icon:"📄", label:"Resume",       val: "Download PDF",                    href: "/resume.pdf", ext: true },
  ].map(l => `
    <a href="${l.href}" class="contact-row" ${l.ext ? 'target="_blank" rel="noopener"' : ""}>
      <span class="contact-icon">${l.icon}</span>
      <span class="contact-label">${esc(l.label)}</span>
      <span class="contact-val">${esc(l.val)}</span>
    </a>`).join(""));
}

function initScrollSpy() {
  const panels = document.querySelectorAll(".panel");
  const links  = document.querySelectorAll(".snav-link[data-target]");
  panels.forEach(panel => {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const a = document.querySelector(`.snav-link[data-target="${entries[0].target.id}"]`);
        if (a) a.classList.add("active");
      }
    }, { rootMargin: "-30% 0px -60% 0px" }).observe(panel);
  });
}

function initMobileMenu() {
  const btn     = document.getElementById("mobile-menu-btn");
  const overlay = document.getElementById("sidebar-overlay");
  const sidebar = document.getElementById("sidebar");
  btn?.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });
  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });
  document.querySelectorAll(".snav-link").forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    });
  });
}

/* ── CAPTCHA ── */

async function fetchChallenge() {
  try {
    const r = await fetch("/api/challenge");
    if (!r.ok) throw new Error("no challenge");
    const { q, token } = await r.json();
    captchaToken = token;
    setHTML("captcha-q", esc(q));
  } catch {
    // Challenge endpoint unavailable (e.g. local dev without Vercel CLI).
    // Skip captcha gracefully — server also won't enforce if CHALLENGE_SECRET isn't set.
    skipCaptcha();
  }
}

function skipCaptcha() {
  captchaDone = true;
  document.getElementById("chat-captcha")?.classList.add("solved");
  enableChatInput();
}

function enableChatInput() {
  const inp = document.getElementById("chat-input");
  const btn = document.getElementById("chat-send");
  const wrap = document.querySelector(".chat-input-wrap");
  if (inp) inp.disabled = false;
  if (btn) btn.disabled = false;
  wrap?.classList.remove("locked");
}

function initCaptcha() {
  const btn   = document.getElementById("captcha-btn");
  const input = document.getElementById("captcha-input");
  // Disable chat input until captcha is solved
  const chatInput = document.getElementById("chat-input");
  const chatSend  = document.getElementById("chat-send");
  const wrap = document.querySelector(".chat-input-wrap");
  if (chatInput) chatInput.disabled = true;
  if (chatSend)  chatSend.disabled  = true;
  wrap?.classList.add("locked");

  btn?.addEventListener("click",  submitCaptcha);
  input?.addEventListener("keydown", e => { if (e.key === "Enter") submitCaptcha(); });
}

function submitCaptcha() {
  const input = document.getElementById("captcha-input");
  const errEl = document.getElementById("captcha-error");
  const val   = (input?.value ?? "").trim();

  if (!val || !/^\d+$/.test(val)) {
    errEl.textContent = "Please enter a whole number.";
    errEl.hidden = false;
    return;
  }

  errEl.hidden = true;
  captchaAnswer = val;
  captchaDone   = true;
  document.getElementById("chat-captcha")?.classList.add("solved");
  enableChatInput();
  document.getElementById("chat-input")?.focus();
}

function initChat() {
  const input   = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", onKey);
  input.addEventListener("input", () => grow(input));
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => onChip(btn));
  });
  initCaptcha();
}

/* ── Chat ── */
function grow(el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 100) + "px"; }
function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }
function onChip(btn) { document.getElementById("chat-input").value = btn.textContent; send(); }

function appendMsg(role, text) {
  const empty = document.getElementById("chat-empty");
  if (empty && !empty.hidden) empty.hidden = true;

  const box = document.getElementById("chat-messages");
  const d = document.createElement("div");
  d.className = `chat-msg ${role}`;
  if (role === "bot") {
    d.innerHTML = `<div class="chat-msg-av">AG</div><div class="chat-bubble">${esc(text).replace(/\n/g, "<br>")}</div>`;
  } else {
    d.innerHTML = `<div class="chat-bubble">${esc(text).replace(/\n/g, "<br>")}</div>`;
  }
  box.appendChild(d);
  const scrollArea = document.getElementById("chat-scroll-area");
  scrollArea.scrollTop = scrollArea.scrollHeight;
}

function showTyping() {
  const box = document.getElementById("chat-messages");
  const d = document.createElement("div");
  d.id = "typing-el"; d.className = "chat-msg bot";
  d.innerHTML = `<div class="chat-msg-av">AG</div><div class="chat-bubble typing"><span></span><span></span><span></span></div>`;
  box.appendChild(d);
  const scrollArea = document.getElementById("chat-scroll-area");
  scrollArea.scrollTop = scrollArea.scrollHeight;
}
function hideTyping() { document.getElementById("typing-el")?.remove(); }

async function send() {
  const inp = document.getElementById("chat-input");
  const btn = document.getElementById("chat-send");
  const txt = inp.value.trim();
  if (!txt || busy) return;
  inp.value = ""; inp.style.height = "auto"; busy = true; btn.disabled = true;
  appendMsg("user", txt);
  history.push({ role: "user", parts: [{ text: txt }] });
  showTyping();
  try {
    let reply;
    if (LOCAL_DEV) {
      const sys = buildLocalSystemPrompt();
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${LOCAL_GEMINI_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role:"user", parts:[{ text: sys + "\n\nAcknowledge briefly." }] }, { role:"model", parts:[{ text:"Understood." }] }, ...history], generationConfig: { temperature:0.75, maxOutputTokens:512 } }) }
      );
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      reply = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
    } else {
      const body = { messages: history };
      // Include captcha token+answer with the first message only
      if (history.length === 1 && captchaToken && captchaAnswer) {
        body.captcha = { token: captchaToken, answer: captchaAnswer };
      }
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      reply = d.reply;
    }
    history.push({ role: "model", parts: [{ text: reply }] });
    hideTyping(); appendMsg("bot", reply);
  } catch (err) {
    hideTyping(); appendMsg("bot", `⚠️ ${err.message || "Could not connect."}`);
  }
  busy = false; btn.disabled = false;
  document.getElementById("chat-input").focus();
}

function buildLocalSystemPrompt() {
  if (!profile) return "You are a helpful assistant.";
  const p = profile;
  const sk = Object.entries(p.skills).map(([c, g]) => `${c}: ${g.items.join(", ")}`).join("\n");
  const pr = p.projects.map((x, i) => `${i+1}. ${x.name}${x.award ? " ["+x.award+"]" : ""}(${x.status}): ${x.description}`).join("\n");
  const ex = p.experience.map(e => `- ${e.role} @ ${e.company} (${e.period})`).join("\n");
  return `You are a professional AI assistant on ${p.name}'s cybersecurity portfolio. Answer questions warmly and concisely (2-4 sentences). Highlight: the homelab (physical Intel NUC dual-NIC firewall + Mac Mini M4 + SIEM/SOAR — very rare for a graduate), CyberVantage live at cybervantage.tech (award-winning). Refer to him in third person. If unsure, invite them to email ${p.email}.
Name:${p.name}|Title:${p.title}|Location:${p.location}|Graduated:${p.education.institution}
Availability:${p.availability}
Summary:${p.summary}
Skills:\n${sk}
Projects:\n${pr}
Experience:\n${ex}`;
}

function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getLocalFallback() {
  return {
    name:"Ashutosh Gupta", initials:"AG", title:"Cybersecurity Graduate",
    location:"Sydney, NSW, Australia", email:"ashutoshgupta20041@gmail.com",
    github:"https://github.com/ashuthecoder", linkedin:"https://linkedin.com/in/ashutosh-gupta-617529294",
    website:"https://cybervantage.tech",
    availability:"Actively seeking graduate cybersecurity roles — SOC analyst, penetration tester, security engineer, and cloud security positions.",
    summary:"Cybersecurity graduate from Macquarie University with deep hands-on experience across offensive security, digital forensics, cloud security, and secure application development. I don't just study cybersecurity — I live it. My personal homelab runs a physical Intel NUC firewall, a Mac Mini M4 server, full SIEM/SOAR pipelines, and real-time attack simulation and defence.",
    passion:"Cybersecurity isn't just my degree — it's my obsession. Whether I'm analysing a memory dump, crafting a payload in my homelab, or hardening an application against OWASP Top 10, I'm driven by a single question: how does this break, and how do I stop it?",
    education:{ degree:"Bachelor of Cybersecurity", institution:"Macquarie University", period:"Feb 2023 — Dec 2025", status:"Graduated" },
    certifications:[
      { name:"Google Datacenter Hackathon", detail:"Winner — 2023",                                icon:"🏆" },
      { name:"Microsoft Azure SC-900",       detail:"Security, Compliance & Identity Fundamentals", icon:"☁️" },
      { name:"Microsoft Azure AZ-900",       detail:"Azure Fundamentals",                           icon:"☁️" },
      { name:"StationX Cybersecurity",       detail:"Certified",                                    icon:"🔒" },
    ],
    skills:{
      "Offensive Security":      { type:"offense",   items:["Penetration Testing","Exploit Development","Payload Crafting","WPA/WEP Attacks","aircrack-ng / airodump-ng","Packet Injection","Deauth Attacks","CVE Replication","RCE Techniques","GoPhish","OWASP Threat Dragon","Burp Suite"] },
      "Digital Forensics & IR":  { type:"forensics", items:["FTK Imager","Autopsy","Volatility","Memory Dump Analysis","Deleted File Recovery","Attack Timeline Reconstruction","IOC Identification","Incident Reporting","Chain of Custody"] },
      "Homelab & Infrastructure":{ type:"homelab",   items:["Physical Firewall (Dual-NIC Intel NUC)","Network Segmentation","SIEM Pipeline","SOAR Automation","Intrusion Detection (IDS/IPS)","Real-time Attack Simulation","Red Team / Blue Team Exercises","Network Traffic Monitoring","Threat Hunting","Honeypots","Self-hosted Server Administration","Log Aggregation"] },
      "Cloud & Identity":        { type:"cloud",     items:["Microsoft Azure","Azure RBAC","Identity & Access Management","Governance & Compliance","Azure AI Endpoints","CI/CD Fundamentals"] },
      "Secure Development":      { type:"dev",       items:["Python","Flask","Go","Rust","C","Java","AES-256 Encryption","Secure Key Derivation (PBKDF2)","RESTful APIs","Secure SDLC","HTML / CSS / JavaScript","SQLite / SQL"] },
      "Networking & OS":         { type:"network",   items:["Wireshark","Cisco Packet Tracer","TCP/IP Stack","Firewall Configuration","VPN","Kali Linux","Linux (RedHat)","macOS Server"] },
    },
    projects:[
      { id:"cybervantage",    name:"CyberVantage",                   emoji:"🔐", award:"Award Winning", featured:true,  liveUrl:"https://cybervantage.tech",       githubUrl:"https://github.com/ashuthecoder/CyberVantage", status:"Live",      description:"Award-winning secure file encryption platform implementing AES-256-CBC with PBKDF2 key derivation, Azure RBAC, and full OWASP Top 10 mitigations. Built with a modular MVC architecture, comprehensive audit logging, and threat-modelled before the first line of code.", highlights:["AES-256-CBC encryption with PBKDF2 secure key derivation","Azure RBAC enforcing least-privilege access","Complete audit trail — every action logged","OWASP Top 10 mitigated across all endpoints","Threat-modelled with OWASP Threat Dragon pre-development","Live at cybervantage.tech"], skills:["AES-256","RBAC","OWASP","Secure SDLC","Azure","Python","Flask"], tech:["Python","Flask","AES-256","PBKDF2","Azure RBAC","SQLite","OWASP"] },
      { id:"homelab",         name:"Personal Cybersecurity Homelab", emoji:"🏠", award:null,            featured:true,  liveUrl:null,                              githubUrl:null,                                           status:"Always On", description:"Production homelab built for real-world security practice. An Intel NUC with dual Ethernet ports acts as a physical firewall — not a VM, not a cloud instance — creating hard network boundaries. A Mac Mini M4 server runs self-hosted services and attack targets. Full SIEM and SOAR pipelines correlate events across the entire network.", highlights:["Intel NUC dual-NIC physical firewall — full packet inspection","Hard network segmentation: attack lab, monitoring, production zones","SIEM pipeline correlating logs from all devices in real time","SOAR playbooks automating detection-to-response in minutes","Mac Mini M4 server — self-hosted apps, honeypots, live attack targets","Real-time red/blue team: craft attack → observe in SIEM → build defence"], skills:["Physical Firewall","SIEM","SOAR","IDS/IPS","Network Segmentation","Threat Hunting","Red Team","Blue Team"], tech:["Intel NUC","Dual-NIC Firewall","SIEM","SOAR","Mac Mini M4","IDS/IPS","Self-hosted"] },
      { id:"cve-exploit",     name:"CVE-2016-3714 Exploit",          emoji:"💀", award:null,            featured:false, liveUrl:null,                              githubUrl:"https://github.com/ashuthecoder",               status:"Research",  description:"Reproduced the ImageMagick command injection vulnerability (ImageTragick) in a controlled lab. Built the vulnerable PHP upload environment, crafted malicious image payloads, achieved full RCE, then documented the remediation path and patching strategy.", highlights:["Analysed CVE advisory and reverse-engineered exploit mechanism","Crafted malicious payloads targeting ImageMagick policy bypass","Achieved full Remote Code Execution on the controlled target","Documented complete remediation and patch validation process"], skills:["CVE Analysis","Exploit Dev","RCE","Payload Crafting"], tech:["ImageMagick","PHP","Linux","Exploit Dev","RCE"] },
      { id:"network-pentest", name:"Wireless Network Pentest Lab",   emoji:"📡", award:null,            featured:false, liveUrl:null,                              githubUrl:"https://github.com/ashuthecoder",               status:"Research",  description:"Full wireless penetration test using Kali Linux and Alfa AWUS036ACH adapter. Performed WPA2 4-way handshake capture via deauth attacks, packet injection, PMKID attacks, and wordlist-based hash cracking — then documented hardening recommendations.", highlights:["WPA2 handshake capture via targeted deauthentication attacks","Packet injection and PMKID attack execution","Successful hash cracking using rule-based wordlists","Full hardening report: WPA3, certificate-based auth, rogue AP detection"], skills:["Wireless Pen Testing","WPA/WEP Cracking","Deauth Attacks","Packet Injection"], tech:["aircrack-ng","airodump-ng","Wireshark","Kali Linux","Alfa Adapter"] },
      { id:"forensics",       name:"Digital Forensics Investigation", emoji:"🔍", award:null,            featured:false, liveUrl:null,                              githubUrl:"https://github.com/ashuthecoder",               status:"Research",  description:"Simulated incident response on a compromised system image. Acquired and verified the disk image, recovered attacker artefacts, analysed memory dumps to identify injected processes, and reconstructed the full attack timeline from initial access through to data exfiltration.", highlights:["Forensic acquisition and hash verification of disk image","Recovered deleted attacker artefacts and staging tools","Volatility analysis — identified injected processes and C2","Produced structured IR report with IOCs, timeline, and recommendations"], skills:["Disk Forensics","Memory Analysis","IOC Identification","Incident Reporting"], tech:["FTK Imager","Autopsy","Volatility","Memory Analysis","Disk Imaging"] },
    ],
    experience:[
      { role:"Client Services Team Leader", company:"Gema Group",        period:"Jan 2024 — Present",    current:true,  description:"Leads and mentors a team in a data-sensitive customer environment. Applies incident handling procedures, operational risk frameworks, and secure data handling practices across all workflows." },
      { role:"Retail Sales & IT Operations", company:"Michael Hill",      period:"Oct 2024 — Present",    current:true,  description:"Supports internal IT systems and dashboard administration. Maintains data integrity and compliance standards in customer-facing platforms." },
      { role:"Premium Customer Attendant",   company:"Venues Live",       period:"Apr 2023 — Jan 2024",   current:false, description:"Delivered high-pressure service at major events including rapid incident decisions and cross-departmental coordination." },
      { role:"Administration Assistant",     company:"Shree Plastic Works",period:"Aug 2022 — Jan 2023",  current:false, description:"Managed IT operations, data handling, and financial documentation with applied cybersecurity principles throughout." },
    ],
    volunteering:[
      { role:"General Executive",         org:"Macquarie CyberSec Society",   period:"Jan 2025 — Present", detail:"Organises CTFs, workshops, and technical events for the university cybersecurity community." },
      { role:"Technology Volunteer",      org:"The Laptop Initiative",         period:"Ongoing",            detail:"Refurbishes, configures, and security-hardens devices for students." },
      { role:"Student Ambassador",        org:"Studiosity",                    period:"May 2024 — Present", detail:"" },
      { role:"Course Representative",     org:"Macquarie University Open Day", period:"Aug 2024",           detail:"" },
      { role:"Accreditation Coordinator", org:"FIFA Women's World Cup",        period:"2023",               detail:"" },
      { role:"Volunteer Coordinator",     org:"Vivid Sydney",                  period:"2023",               detail:"" },
    ],
  };
}
