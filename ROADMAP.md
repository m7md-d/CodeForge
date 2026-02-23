# CodeForge: Architectural Roadmap & Vision

## 🎯 The Vision
CodeForge was born out of a critical need in the software engineering education space: **The closed-source nature of elite coding bootcamps (e.g., Holberton School).** While the curriculum and strict constraints (C89, Valgrind, Betty linter) produce exceptional low-level engineers, the proprietary platforms gatekeep this rigorous learning style. 

CodeForge aims to be the premier **Open-Source, Self-Hosted Low-Level Academy**. It shifts the paradigm from a flat "To-Do list" to a mathematically rigorous, Sprint-weighted learning environment with deep GitHub-integrated auto-checking.

---

## 🟢 Phase 1: The Core Engine (Completed)
*Status: V1.0 - Localhost Ready*
- [x] **Zero-State Architecture:** Built the foundational FastAPI + SQLite backend.
- [x] **CodeForge Glassmorphism UI:** Deployed the highly structured, dark-themed React frontend with RTL (Arabic) support.
- [x] **Macro-Injection Engine:** Implemented bulk JSON curriculum ingestion via LLM payloads.
- [x] **True XP Mathematics:** Shifted task-level arbitrary points to Project-level `skill_tags` for a realistic Skill Tree radar.
- [x] **Dockerization:** Containerized the entire stack for immediate one-click deployment (`docker compose up -d`).

---

## 🟡 Phase 2: Refinement & Data Integrity
*Status: In Progress*
- [ ] **Omni-Delete Capabilities:** Implement cascading `DELETE` endpoints for Sprints/Projects to safely prune the SQLite database without orphans.
- [ ] **Profile Customization:** Build the UI/UX for users to modify their avatar, handle, and display name dynamically.
- [ ] **UI/UX Polishing:** Calibrate all flexbox constraints, mobile responsiveness, and Glassmorphism hover states.

---

## 🟠 Phase 3: Cloud Migration & The Multiplayer Shift
*Status: Planned Architecture*
- [ ] **Database Up-Armor:** Migrate from SQLite to **PostgreSQL** to support massive concurrent I/O.
- [ ] **Authentication Engine:** Implement JWT-based Auth (Login/Signup) to isolate user progression and protect specific Sprint data.
- [ ] **Social Synchronization:** Add the ability to track friends, view live progression on shared Sprints, and compare Skill Tree radars to drive competition.

---

## 🔴 Phase 4: The Holberton-Style Auto-Checker (GitHub Integration)
*Status: The Core Innovation*
This phase transforms CodeForge from a tracking UI into an active evaluation engine.
- [ ] **GitHub OAuth Integration:** Users link their GitHub accounts and specify their CodeForge workspace repository.
- [ ] **Directory Mapping Constraints:** The DB schema will enforce strict `directory_name` and `file_name` expectations per project.
- [ ] **Webhook Listener Engine:** FastAPI will expose endpoints to catch GitHub `push` event payloads.
- [ ] **Ephemeral Ubuntu Sandboxing:** Upon a push, the system spins up an isolated, ephemeral Docker container (Ubuntu 20.04 LTS).
- [ ] **The Execution Pipeline:** The sandbox clones the repo, navigates to the directory, and executes the hidden grading scripts (`gcc`, `valgrind`, `betty`).
- [ ] **Telemetry Feedback:** The sandbox destroys itself and returns a Pass/Fail matrix to the frontend, automatically updating the user's XP and completion status.

---

## 🟣 Phase 5: The Curriculum Marketplace & Governance
*Status: Long-Term Horizon*
- [ ] **The Sprint Hub:** A global repository where users can publish, share, and fork custom-built Sprints.
- [ ] **Sprint Telemetry:** Display adoption rates, completion percentages, and user ratings (1-5 stars) for public Sprints.
- [ ] **Role-Based Access Control (RBAC):** Implement `Student`, `Creator`, and `Admin` roles.
- [ ] **The Moderation Pipeline:** Prevent the influx of low-quality or hallucinated LLM content by instituting a peer-review or Admin-approval gateway before a Sprint is awarded the "Verified CodeForge Curriculum" badge.

---

## 🤝 Contributing
CodeForge is built by engineers, for engineers. If you are passionate about Systems Programming, React Architecture, or Docker Sandboxing, check out the open issues and submit a PR. Let's democratize hardcore software engineering.
