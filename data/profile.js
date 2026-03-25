// data/profile.js
// SINGLE SOURCE OF TRUTH — edit ONLY this file to update the portfolio.
// Loaded server-side only. Never served to the browser.

const profile = {

  name:         "Ashutosh Gupta",
  initials:     "AG",
  title:        "Cybersecurity Graduate",
  tagline:      "Bachelor of Cybersecurity · Macquarie University · Class of 2025",
  location:     "Sydney, NSW, Australia",
  email:        "ashutoshgupta20041@gmail.com",
  github:       "https://github.com/ashuthecoder",
  linkedin:     "https://linkedin.com/in/ashutosh-gupta-617529294",
  website:      "https://cybervantage.tech",
  availability: "Actively seeking graduate cybersecurity roles — SOC analyst, penetration tester, security engineer, and cloud security positions.",

  summary: "Cybersecurity graduate from Macquarie University with deep hands-on experience across offensive security, digital forensics, cloud security, and secure application development. I don't just study cybersecurity — I live it. My personal homelab runs a physical Intel NUC firewall, a Mac Mini M4 server, full SIEM/SOAR pipelines, and real-time attack simulation and defence. I hold Azure SC-900 and AZ-900 certifications, won the Google Datacenter Hackathon 2023, and actively compete in CTFs. I build security-first systems where protection is the architecture, not an afterthought.",

  passion: "Cybersecurity isn't just my degree — it's my obsession. Whether I'm analysing a memory dump, crafting a payload in my homelab, or hardening an application against OWASP Top 10, I'm driven by a single question: how does this break, and how do I stop it? I believe the best defenders think like attackers — and I train both sides every day.",

  certifications: [
    { name: "Google Datacenter Hackathon",  detail: "Winner — 2023",                                icon: "🏆" },
    { name: "Microsoft Azure SC-900",        detail: "Security, Compliance & Identity Fundamentals", icon: "☁️" },
    { name: "Microsoft Azure AZ-900",        detail: "Azure Fundamentals",                           icon: "☁️" },
    { name: "StationX Cybersecurity",        detail: "Certified",                                    icon: "🔒" },
  ],

  skills: {
    "Offensive Security": {
      type: "offense",
      items: [
        "Penetration Testing", "Exploit Development", "Payload Crafting",
        "WPA/WEP Attacks", "aircrack-ng / airodump-ng", "Packet Injection",
        "Deauth Attacks", "CVE Replication", "RCE Techniques",
        "GoPhish Phishing Simulations", "OWASP Threat Dragon", "Burp Suite",
      ],
    },
    "Digital Forensics & IR": {
      type: "forensics",
      items: [
        "FTK Imager", "Autopsy", "Volatility",
        "Memory Dump Analysis", "Deleted File Recovery",
        "Attack Timeline Reconstruction", "Disk Imaging",
        "IOC Identification", "Incident Reporting", "Chain of Custody",
      ],
    },
    "Homelab & Infrastructure": {
      type: "homelab",
      items: [
        "Physical Firewall (Dual-NIC Intel NUC)", "Network Segmentation",
        "SIEM Pipeline", "SOAR Automation", "Intrusion Detection (IDS/IPS)",
        "Real-time Attack Simulation", "Red Team / Blue Team Exercises",
        "Network Traffic Monitoring", "Threat Hunting", "Honeypots",
        "Self-hosted Server Administration", "Log Aggregation",
      ],
    },
    "Cloud & Identity": {
      type: "cloud",
      items: [
        "Microsoft Azure", "Azure RBAC", "Identity & Access Management",
        "Governance & Compliance", "Azure AI Endpoints", "CI/CD Fundamentals",
      ],
    },
    "Secure Development": {
      type: "dev",
      items: [
        "Python", "Flask", "Go", "Rust", "C", "Java",
        "AES-256 Encryption", "Secure Key Derivation (PBKDF2)",
        "RESTful APIs", "Secure SDLC", "Authentication & Authorisation",
        "HTML / CSS / JavaScript", "SQLite / SQL",
      ],
    },
    "Networking & OS": {
      type: "network",
      items: [
        "Wireshark", "Cisco Packet Tracer", "TCP/IP Stack",
        "Firewall Configuration", "VPN", "Network Protocol Analysis",
        "Kali Linux", "Linux (RedHat)", "macOS Server",
      ],
    },
  },

  projects: [
    {
      id:          "cybervantage",
      name:        "CyberVantage",
      emoji:       "🔐",
      award:       "Award Winning",
      featured:    true,
      liveUrl:     "https://cybervantage.tech",
      githubUrl:   "https://github.com/ashuthecoder/CyberVantage",
      status:      "Live",
      description: "Award-winning secure file encryption platform implementing AES-256-CBC with PBKDF2 key derivation, Azure RBAC, and full OWASP Top 10 mitigations. Built with a modular MVC architecture, comprehensive audit logging, and threat-modelled before the first line of code was written. A complete demonstration of enterprise-grade secure SDLC practices.",
      highlights: [
        "AES-256-CBC encryption with PBKDF2 secure key derivation",
        "Azure RBAC enforcing least-privilege access control",
        "Complete audit trail — every action logged and queryable",
        "OWASP Top 10 mitigated across all endpoints",
        "Threat-modelled with OWASP Threat Dragon pre-development",
        "Live at cybervantage.tech",
      ],
      skills: ["AES-256", "Secure Key Derivation", "RBAC", "OWASP Top 10", "Threat Modelling", "Audit Logging", "Secure SDLC", "Azure", "Python", "Flask", "SQLite"],
      tech: ["Python", "Flask", "AES-256", "PBKDF2", "Azure RBAC", "SQLite", "OWASP"],
    },
    {
      id:          "homelab",
      name:        "Personal Cybersecurity Homelab",
      emoji:       "🏠",
      award:       null,
      featured:    true,
      liveUrl:     null,
      githubUrl:   null,
      status:      "Always On",
      description: "Production homelab built for real-world security practice. An Intel NUC with dual Ethernet ports acts as a physical firewall — not a VM, not a cloud instance — creating hard network boundaries between zones. A Mac Mini M4 server sits behind it running self-hosted services and attack targets. Full SIEM and SOAR pipelines correlate events across the entire network. I craft attacks, watch them appear in the SIEM, then build defences in real time.",
      highlights: [
        "Intel NUC dual-NIC physical firewall — full packet inspection and rule management",
        "Hard network segmentation: attack lab, monitoring, and production zones isolated",
        "SIEM pipeline ingesting and correlating logs from all devices",
        "SOAR playbooks automating detection-to-response in minutes",
        "Mac Mini M4 server — self-hosted apps, honeypots, and live attack targets",
        "Real-time red/blue team: craft attack → observe in SIEM → build defence",
        "IDS/IPS with custom rule sets, traffic baselining, and anomaly detection",
      ],
      skills: ["Physical Firewall", "Network Segmentation", "SIEM", "SOAR", "IDS/IPS", "Threat Hunting", "Incident Response", "Log Analysis", "Red Team", "Blue Team", "Attack Simulation", "Network Monitoring"],
      tech: ["Intel NUC", "Dual-NIC Firewall", "SIEM", "SOAR", "Mac Mini M4", "IDS/IPS", "Self-hosted Services"],
    },
    {
      id:          "cve-exploit",
      name:        "CVE-2016-3714 Exploit",
      emoji:       "💀",
      award:       null,
      featured:    false,
      liveUrl:     null,
      githubUrl:   "https://github.com/ashuthecoder",
      status:      "Research",
      description: "Reproduced the ImageMagick command injection vulnerability (ImageTragick) in a controlled lab. Built the vulnerable PHP upload environment, crafted malicious image payloads, achieved full RCE, then documented the remediation path and patching strategy.",
      highlights: [
        "Analysed CVE advisory and reverse-engineered exploit mechanism",
        "Crafted malicious payloads targeting ImageMagick policy bypass",
        "Achieved full Remote Code Execution on the controlled target",
        "Documented complete remediation and patch validation process",
      ],
      skills: ["CVE Analysis", "Exploit Development", "RCE", "Payload Crafting", "PHP Security", "Vulnerability Research"],
      tech: ["ImageMagick", "PHP", "Linux", "Exploit Dev", "RCE"],
    },
    {
      id:          "network-pentest",
      name:        "Wireless Network Pentest Lab",
      emoji:       "📡",
      award:       null,
      featured:    false,
      liveUrl:     null,
      githubUrl:   "https://github.com/ashuthecoder",
      status:      "Research",
      description: "Full wireless penetration test using Kali Linux and Alfa AWUS036ACH adapter. Performed WPA2 4-way handshake capture via deauth attacks, packet injection, PMKID attacks, and wordlist-based hash cracking — then documented hardening recommendations.",
      highlights: [
        "WPA2 handshake capture via targeted deauthentication attacks",
        "Packet injection and PMKID attack execution",
        "Successful hash cracking using rule-based wordlists",
        "Full hardening report: WPA3, certificate-based auth, rogue AP detection",
      ],
      skills: ["Wireless Pen Testing", "WPA/WEP Cracking", "Deauth Attacks", "Packet Injection", "Network Sniffing"],
      tech: ["aircrack-ng", "airodump-ng", "Wireshark", "Kali Linux", "Alfa Adapter"],
    },
    {
      id:          "forensics",
      name:        "Digital Forensics Investigation",
      emoji:       "🔍",
      award:       null,
      featured:    false,
      liveUrl:     null,
      githubUrl:   "https://github.com/ashuthecoder",
      status:      "Research",
      description: "Simulated incident response on a compromised system image. Acquired and verified the disk image, recovered attacker artefacts, analysed memory dumps to identify injected processes, and reconstructed the full attack timeline from initial access through to data exfiltration.",
      highlights: [
        "Forensic acquisition and hash verification of disk image",
        "Recovered deleted attacker artefacts and staging tools",
        "Volatility analysis of memory dump — identified injected processes and C2",
        "Produced structured IR report with IOCs, timeline, and recommendations",
      ],
      skills: ["Disk Forensics", "Memory Analysis", "File Recovery", "IOC Identification", "Incident Reporting"],
      tech: ["FTK Imager", "Autopsy", "Volatility", "Memory Analysis", "Disk Imaging"],
    },
  ],

  experience: [
    {
      role:        "Client Services Team Leader",
      company:     "Gema Group",
      period:      "Jan 2024 — Present",
      current:     true,
      description: "Leads and mentors a team in a data-sensitive customer environment. Applies incident handling procedures, operational risk frameworks, and secure data handling practices across all workflows.",
    },
    {
      role:        "Retail Sales & IT Operations",
      company:     "Michael Hill",
      period:      "Oct 2024 — Present",
      current:     true,
      description: "Supports internal IT systems and dashboard administration. Maintains data integrity and compliance standards in customer-facing platforms.",
    },
    {
      role:        "Premium Customer Attendant",
      company:     "Venues Live",
      period:      "Apr 2023 — Jan 2024",
      current:     false,
      description: "Delivered high-pressure service at major events including rapid incident decisions and cross-departmental coordination.",
    },
    {
      role:        "Administration Assistant",
      company:     "Shree Plastic Works",
      period:      "Aug 2022 — Jan 2023",
      current:     false,
      description: "Managed IT operations, data handling, and financial documentation with applied cybersecurity principles throughout.",
    },
  ],

  volunteering: [
    { role: "General Executive",         org: "Macquarie CyberSec Society",   period: "Jan 2025 — Present", detail: "Organises CTFs, workshops, and technical events for the university cybersecurity community." },
    { role: "Technology Volunteer",      org: "The Laptop Initiative",         period: "Ongoing",            detail: "Refurbishes, configures, and security-hardens devices for students." },
    { role: "Student Ambassador",        org: "Studiosity",                    period: "May 2024 — Present", detail: "" },
    { role: "Course Representative",     org: "Macquarie University Open Day", period: "Aug 2024",           detail: "" },
    { role: "Accreditation Coordinator", org: "FIFA Women's World Cup",        period: "2023",               detail: "" },
    { role: "Volunteer Coordinator",     org: "Vivid Sydney",                  period: "2023",               detail: "" },
  ],

  education: {
    degree:      "Bachelor of Cybersecurity",
    institution: "Macquarie University",
    period:      "Feb 2023 — Dec 2025",
    status:      "Graduated",
  },

  aiContext: `
Ashutosh just graduated from Macquarie University with a Bachelor of Cybersecurity (Class of 2025).
He is actively job hunting and would love to hear from recruiters. His standout differentiators are:

1. The homelab — running a physical dual-NIC Intel NUC firewall, Mac Mini M4 server, SIEM/SOAR
   pipelines, and conducting real red/blue team exercises. This is extremely rare for a new graduate
   and demonstrates infrastructure depth, SIEM/SOAR experience, and genuine passion.

2. CyberVantage (cybervantage.tech) — an award-winning secure encryption platform he built to
   production quality. It implements AES-256, RBAC, audit logging, and full OWASP mitigations.

3. Hands-on offensive skills: he has replicated CVEs, cracked wireless networks, and analysed
   real forensic images — not just read about them.

If anyone asks about the homelab, go into detail. Emphasise that it is physical hardware, not a VM,
and that he runs real SIEM/SOAR tooling, creates and defends live attacks, and maintains it actively.

He competes in CTFs through Macquarie CyberSec Society (he is a General Executive there).
He is based in Sydney but open to remote work. He responds to emails quickly.
Direct recruiters to cybervantage.tech to see his live work and github.com/ashuthecoder for code.
  `,
};

module.exports = profile;