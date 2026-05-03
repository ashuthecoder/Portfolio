// data/resume.js
// AUTHORITATIVE RESUME TEXT — used by the chatbot as the source of truth for facts.
// Keep this in sync with public/resume.pdf. When the resume changes, update both.
// Loaded server-side only; never served to the browser.

const resume = `
ASHUTOSH GUPTA — Cybersecurity Graduate & Technology Analyst
Focus areas: GRC · Cloud Security · Business Analysis · Agile Delivery
Contact: ashutoshgupta20041@gmail.com · 0406 471 880 · Sydney, Australia
Links: linkedin.com/in/ashutosh-gupta-617529294 · github.com/ashuthecoder · ashutoshgupta.me

PROFESSIONAL SUMMARY
Cybersecurity graduate from Macquarie University (Dec 2025) with broad, hands-on experience
across cloud security architecture, GRC, penetration testing, digital forensics, incident response,
and business analysis. A practical technologist who builds things — from production cloud
platforms to forensic frameworks to Jira governance systems — and communicates findings
clearly to both technical teams and senior stakeholders. Fluent in NIST CSF, ISO 27001, and
Essential Eight. Experienced with Agile delivery, requirements elicitation, functional
specifications, and stakeholder facilitation. Equally effective as a solo contributor and as a
collaborative team member within large, complex programs. Holds full Australian work rights
and is pursuing security clearance.

CORE COMPETENCIES
• Security & GRC: NIST CSF, ISO 27001, Essential Eight, Vulnerability Assessment,
  Incident Response, Penetration Testing, DFIR, OWASP Top 10
• Business Analysis: Requirements Elicitation, Functional Specifications, User Stories &
  Acceptance Criteria, Process Mapping, Workshop Facilitation, Traceability, Backlog Refinement
• Cloud & Infra: Microsoft Azure, AWS, IAM, RBAC, APIs & Integrations, Data Flow Analysis,
  Linux / UNIX, Virtualisation
• Tooling: Jira, Confluence, Azure DevOps, Wireshark, Autopsy, FTK Imager, Volatility,
  Kali Linux, SIEM
• Development: Python, Go, Rust, C, Java, SQL, Flask, REST APIs, Git
• Delivery: Agile & Hybrid Delivery, Dependency Management, Risk & Issue Management,
  UAT Support, Stakeholder Engagement, Executive Reporting

CERTIFICATIONS & ACHIEVEMENTS
• Microsoft SC-900 — Security, Compliance & Identity (certified)
• Microsoft AZ-900 — Azure Fundamentals (certified)
• Google Datacenter Hackathon — Winner 2023
• BTL1 — Blue Team Level 1 (in progress)
• AWS Cloud Practitioner (in progress)

EDUCATION
Bachelor of Cybersecurity, Macquarie University — Jan 2023 to Dec 2025, Sydney
Full security stack: cryptography, network security, cloud architecture, digital forensics, GRC,
and secure systems design — with a focus on translating technical complexity into clear,
structured documentation and practical controls.

PROJECTS & TECHNICAL WORK

1) Jira & Confluence Delivery Dashboard — Insolvency Case Management
   Skills: Requirements Elicitation, Jira, Confluence, Workflow Design, Agile, Stakeholder Reporting
   Under the guidance of Matthew Mansour, designed and built a complete Jira project board and
   Confluence knowledge hub to manage a complex insolvency resolution end-to-end — configuring
   custom workflows, sprint cadences, dashboards, decision logs, and escalation procedures
   consumable by non-technical stakeholders. Demonstrates end-to-end BA delivery: elicitation,
   backlog design, traceability, dependency management, and stakeholder sign-off.

2) CyberVantage — Secure File Encryption Platform (github.com/ashuthecoder/CyberVantage)
   Tech: Python, Flask, AES-256, Azure IAM/RBAC, NIST CSF, ISO 27001
   Designed and deployed a cloud-hosted encryption platform on Azure — AES-256, RBAC, IAM,
   audit logging, and monitoring — translating NIST CSF and ISO 27001 controls into
   production-grade infrastructure independently. Architecture documentation and security
   specifications produced throughout. Live at cybervantage.tech.

3) Android Digital Forensics Framework (github.com/ashuthecoder)
   Tech: Python, ADB, Volatility, Autopsy, FTK Imager, SQLite
   Built an end-to-end forensic framework covering memory acquisition, file system examination,
   and artifact extraction. Produced automated chain-of-custody reports aligned to NIST/SANS
   standards.

4) CVE-2016-3714 (ImageMagick) — Exploit Replication & Remediation
   Focus: RCE, Vulnerability Analysis, NIST CSF, Defence-in-Depth, Incident Response
   Reproduced a critical RCE vulnerability in a controlled lab, conducted root cause analysis,
   mapped findings to NIST CSF, and designed a layered defence-in-depth mitigation strategy
   with executive-ready reporting on impact, remediation steps, and residual risk.

5) Wireless Network Penetration Testing Lab
   Tooling: Kali Linux, aircrack-ng, Wireshark
   Captured WPA/WEP handshakes, performed live traffic analysis to identify authentication
   weaknesses, and produced a structured findings and remediation report in client-deliverable
   format.

6) Personal Cybersecurity Homelab (not on resume, but referenced on portfolio)
   Intel NUC dual-NIC physical firewall + Mac Mini M4 server + SIEM/SOAR pipelines. Used for
   real-time red/blue team exercises: craft an attack → observe in SIEM → build a defence.
   Extremely rare for a new graduate to run physical security infrastructure at this level.

WORK EXPERIENCE

Team Leader — F&B & Operations | Gema Group | Sydney | Jan 2024 – Present
• Led a team across a high-throughput venue — managing rostering, real-time incident
  resolution, staff mentoring, and POS/IT troubleshooting. Identified process gaps and
  implemented structured escalation workflows that reduced resolution times.
• Built strong prioritisation discipline, cross-functional communication skills, and composure
  under pressure directly applicable to complex delivery environments.

Sales & Operations Assistant | Michael Hill | Sydney | Oct 2024 – Feb 2026
• Maintained compliance records and resolved system issues via structured troubleshooting in
  a high-accountability environment. Developed clear documentation habits and the ability to
  communicate technical findings to non-technical stakeholders.

Team Leader — Events & Operations | Venues Live | Sydney | Apr 2023 – Jan 2024
• Managed multi-stakeholder teams across large-scale live events — coordinating
  dependencies, adapting delivery plans in real time, and keeping all parties aligned under
  pressure.

Administration & IT Support Assistant | Shree Plastic Works | India | Aug 2022 – Jan 2023
• Managed documentation workflows and IT support with foundational attention to data
  integrity, process compliance, and accurate record-keeping.

COMMUNITY & VOLUNTEERING
• General Executive, Macquarie CyberSec Society — Jun 2024 to Present
  CTF events, workshops, and speaker coordination.
• Event Volunteer, BSides Sydney — Australia's practitioner-led security community.
• Technology Volunteer, The Laptop Initiative — Device refurbishment for underserved
  communities.
• Event Volunteer, Vivid Sydney & FIFA Women's World Cup — Large-scale logistics and
  coordination.

References available on request.
`;

module.exports = resume;
