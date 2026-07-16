# 🧠 PrivateMind Enterprise

### *The Zero-Knowledge, Offline-First Local AI Vault & Second Brain.*

🚀 **Live Production Deployment:** [https://privatemind.vercel.app/](https://privatemind.vercel.app/)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-emerald?style=flat-square&logo=vercel)](https://privatemind.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Architecture: Local--First](https://img.shields.io/badge/Architecture-Local--First-blue?style=flat-square)](#strategic-vision--impact-architecture)
[![Security: AES--GCM--256](https://img.shields.io/badge/Security-AES--GCM--256-success?style=flat-square)](#1-cryptographic-specification--key-lifecycle)

**PrivateMind** is an enterprise-grade, high-performance knowledge management platform engineered for maximum privacy and offline velocity. It fuses hardware-accelerated, client-side Large Language Models (LLMs) running inside a browser sandbox with military-grade **256-bit AES-GCM encryption** to ensure your intellectual property, notes, and dynamic telemetry data never touch a centralized cloud server.

---

---

## 🖼️ Visual Workspace Tour

<div align="center">
  <img src="./public/screenshots/vault-gateway.png" alt="Zero-Knowledge Cryptographic Gateway Login Modal" width="100%" style="border-radius: 8px; border: 1px solid #27272a; margin-bottom: 16px;" />
  <p><em>Figure 1: The Secure Zero-Knowledge Gateway Portal utilizing localized client-side SHA-256 validation tokens.</em></p>
</div>

<br />

<div align="center">
  <img src="./public/screenshots/dashboard-main.png" alt="PrivateMind Enterprise Secure Dashboard View" width="100%" style="border-radius: 8px; border: 1px solid #27272a; margin-bottom: 16px;" />
  <p><em>Figure 2: The Core Workspace Dashboard highlighting live sandbox metrics telemetry and active client-side AES-GCM encryption engines.</em></p>
</div>

<br />

<div align="center">
  <img src="./public/screenshots/editor-canvas.png" alt="PrivateMind Markdown Dynamic Editor Canvas" width="100%" style="border-radius: 8px; border: 1px solid #27272a; margin-bottom: 16px;" />
  <p><em>Figure 3: The custom Markdown dynamic document management pane featuring unified state metrics.</em></p>
</div>

<br />

<div align="center">
  <img src="./public/screenshots/ai-download.png" alt="Local Hardware Offline AI Sub-Thread Hydration" width="350px" style="border-radius: 8px; border: 1px solid #27272a; margin-bottom: 16px;" />
  <p><em>Figure 4: The off-thread web worker local LLM instance caching engine resources directly inside the browser sandbox.</em></p>
</div>


---

## 📺 Project Walkthrough & Demo Video

To see the zero-knowledge security vault, custom markdown engine, and the multi-threaded browser AI Copilot running live in real-time, watch our 2-minute demo:

[![PrivateMind Enterprise Demo](https://img.youtube.com/vi/6GmA8_ygMQY/0.jpg)](https://youtu.be/6GmA8_ygMQY)

👉 **[Click Here to Watch the Full Video Demo on YouTube](https://youtu.be/6GmA8_ygMQY)**

---

## 🚀 Core Architectural Pillars

*   **🔒 Complete Zero-Knowledge Isolation:** Every byte of data—from folder hierarchies to text content—is encrypted locally before being committed to persistent storage. No master password ever leaves volatile React memory.
*   **🧠 Hardware-Accelerated Local AI:** Leverages an asynchronous Web Worker architecture to run contextual LLM text generation entirely client-side, eliminating cloud API costs and third-party privacy leakage.
*   **📊 Real-Time Sandbox Telemetry:** Features an on-board storage footprint monitoring engine that computes physical storage utilization directly from localized Dexie IndexedDB instances.
*   **⌨️ Productivity-First Core Design:** Features full structural undo/redo state stacks, modern metadata categorization tagging, markdown serialization rendering interfaces, and an instant keyboard-driven spotlight command palette (`Ctrl + K`).

---

## 🎯 Strategic Vision & Impact Architecture

### 1. The Core Problem Statement
Modern digital note-taking platforms and corporate knowledge bases present a severe, systemic vulnerability trap: the **Privacy-Utility Paradox**. 
* **The Cloud Privacy Trap:** Popular second-brain tools (e.g., Notion, Evernote) require user data to sync through centralized cloud infrastructure. This exposes intellectual property, corporate research, and personal keys to data breaches, third-party data mining, and server outages.
* **The AI Surveillance Loop:** Integrating commercial LLM features (like ChatGPT or Claude API integrations) requires transmitting raw, plaintext document data over external networks. For enterprise teams, security-cleared personnel, and privacy-focused developers, this constitutes a non-negotiable compliance failure.
* **The Performance Drag:** Existing local-first frameworks often compromise on advanced user interfaces, high-speed full-text keyword searches, and interactive automation to remain completely native.

### 2. The PrivateMind Solution
PrivateMind completely shatters this paradox by engineering a **Zero-Cloud, Cryptographically Gated Local Ecosystem** that operates with the velocity of an enterprise web tool but the absolute security of an isolated, hardware-bound vault. 

By binding a robust, transactional database (`Dexie.js`) directly to the browser’s native `Web Crypto` runtime array and splitting heavy machine learning pipelines off into background sub-threads (`Web Workers`), PrivateMind delivers instant client-side AI document orchestration without a single outbound packet ever reaching an external server.

### 3. Core Architectural Advantages
* **Absolute Cryptographic Sovereignty:** Data exists in only two states: volatile, short-lived in-memory plaintext strings within React state, or 256-bit AES-GCM ciphertext blocks securely resting on local disk blocks. Even if a malicious agent compromises the local machine, your data matrix remains mathematically unreadable without the master vault key.
* **Predictable Zero-Cost Scaling:** Traditional cloud-based AI tools scale processing costs aggressively per user. PrivateMind utilizes the client's own idle local GPU/CPU hardware compute blocks via in-browser execution threads, achieving limitless scale at literally $0/month in cloud API infrastructure overhead.
* **Extreme Data Portability:** Users are shielded from ecosystem lock-in. The atomic JSON bundle exporter preserves the application's underlying schema index mappings, enabling safe data migration across devices with full cryptographic integrity checks intact.

### 4. Who PrivateMind Serves & How It Helps
* **Security Engineers & Cryptographers:** Provides a sandbox environment to map sensitive keys, architecture diagrams, and system configurations with structural peace of mind.
* **Academic & Enterprise Researchers:** Enables local ingestion of copyrighted literature, proprietary data formulas, and medical logs into an offline AI context panel without risking compliance breaches.
* **High-Speed Productivity Power Users:** Empowers developers and writers with fluid keyboard-driven workflows (`Ctrl + K`), dynamic markdown rendering previews, and live database telemetry tracking to see exactly how their device memory scales.

---

## 🛠️ System Architecture & Data Flow

```text
                [ Client Web Browser Framework Sandbox ]
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
 [ UI / React Layer ]                            [ Asynchronous Worker Node ]
 • State Hydration Pipeline                      • Hardware-Accelerated Model Layer
 • Volatile Master Keys Only                     • Isolated Context Processing Thread
             │                                               │
             └───────────────┬───────────────────────────────┘
                             ▼
                 [ Cryptographic Gateway ]
                 • Native Web Crypto API
                 • 256-Bit AES-GCM Engine
                             │
                             ▼
                [ Persistent Storage Layer ]
                • Dexie.js + IndexedDB Matrix
                • Pure Ciphertext Target Arrays
                
```

## 📁 Repository File Architecture

The codebase is engineered strictly with modular separation of concerns, isolating the cryptographic gateway, database handlers, and the heavy background AI engine sub-threads into distinct domains:

```text

privatemind/
├── public/                 # Static asset delivery pipeline
│   └── screenshots/        # High-resolution workspace application tour images                 
├── src/
│   ├── components/         # Premium UI component layer
│   │   ├── Dashboard.jsx   # Master workspace panel & state hub
│   │   └── LoginModal.jsx  # Zero-Knowledge cryptographic entry portal
│   ├── db/
│   │   └── index.js        # Transactional Dexie.js IndexedDB schema rules
│   ├── utils/
│   │   └── crypto.js       # Web Crypto API AES-GCM encryption/decryption pipes
│   ├── worker/
│   │   └── ai.worker.js    # Off-thread browser LLM worker execution node
│   ├── App.jsx             # Root layout initialization
│   ├── index.css           # Global Tailwind system theme tokens
│   └── main.jsx            # Application structural mounting node
├── index.html              # Document framework base
├── package.json            # Verified system dependency definitions
├── package-lock.json       # Strict deterministic dependency tree lockfile
├── postcss.config.js       # Tailwind CSS post-processing pipeline layout
├── tailwind.config.js      # Custom glassmorphic blur profile configurations
├── vite.config.js          # Vite build optimization and worker configuration
└── README.md               # Enterprise-grade systems documentation

```

# 📑 Deep-Dive Technical Specifications

## 1. Cryptographic Specification & Key Lifecycle

PrivateMind adheres strictly to a zero-knowledge data architecture model utilizing the native **W3C Web Crypto API**:

* **Authentication Hashing:**
    When a master key is registered or provided, it undergoes non-reversible, one-way structural verification hashing via native SHA-256. The computed hex digest is stored in localStorage strictly for login gating comparisons.

* **Volatile In-Memory Keying:** 
    The raw password string is never committed to persistent disk spaces. It resides exclusively in volatile React component state (encryptionKey), ensuring that a memory dump or a system sleep action cannot expose keys.

* **Data Transit Encryption:**
    All content payloads are processed through an AES-GCM (Advanced Encryption Standard - Galois/Counter Mode) engine using a dynamically generated Cryptographically Strong Pseudo-Random Number (CSPRNG) Initialization Vector (IV). Payload strings are explicitly prefixed with "ENCRYPTED:" post-transformation before hitting the database engine, completely preventing accidental plaintext leaks.

## 2. Multi-Threaded Asynchronous AI Orchestration

To prevent user interface freezing during heavy text generation or inference sequences, the AI compilation pipeline is completely decoupled from the React main rendering thread:

* **Web Worker Sub-Thread Integration:**
    The system provisions a dedicated worker instance (ai.worker.js) using explicit Vite module instantiation patterns (new URL(..., import.meta.url)).

* **Volatile Context Injection:**
    When a prompt query is dispatched, the React layer packages the contextually active, decrypted in-memory text variables into a transient event post-message. The encrypted database ciphertext blocks are never exposed to the AI pipeline, ensuring absolute data purity.

* **Real-Time Token Streaming:**
    The worker pipes raw token stream data back across the main boundary using atomic STREAM_TOKEN event handlers, resulting in fluent, real-time UI generation rendering updates.

## 3. Transactional Offline Database Layer

The data persistence layout is constructed over Dexie.js, transforming standard relational indexes into optimized, high-velocity local storage blocks:

* **Atomic Transacting Cascades:**
    Folder deletions utilize a read-write database transaction hook (db.transaction('rw', ...)). If a folder deletion succeeds but its cascading sub-notes database drop experiences an interrupt, the complete transaction rolls back automatically to protect database integrity.

* **Optimized Index Sorting:**
    Custom query structures leverage native primary key mappings (++id) and explicit compound index order configurations (orderBy('updatedAt').reverse()) to handle high-volume data streams with sub-millisecond seek speeds.

# 💎 Enterprise Product Feature Matrix

## 1. Global Spotlight Search Command Palette (Ctrl + K)

Instantly toggle a centralized productivity panel. Search effortlessly through multi-note context indexes or type automated system operational directive calls:

* **/lock** — Triggers an instant structural memory purge, clearing encryption vectors and locking down app layers.

* **/burn** — Initiates an emergency cryptographic destruct sequence, completely wiping all local database instances, local configuration flags, and volatile storage frameworks instantly.

* **/clear-filter** — Drops active metadata tag arrays and resets navigation view parameters.

## 2. Live Sandbox Footprint Telemetry Engine

The main system metrics grid actively tracks data volatility weights:

* **Physical Footprint:**
    Computes precision data storage consumption rates dynamically using native URI component character string measurements (encodeURIComponent), tracking exactly how many real bytes of storage space your data occupies on the device hard drive.

* **Worker State Watcher:**
    Monitors sub-thread hydration logs, displaying live download progress percentages during background engine model caching.

## 3. Markdown Canvas & Dual View Rendering Framework

Switch dynamically between real-time data input and highly polished output arrays:

Includes built-in regex-driven header tracking pipelines, typographic emphasis matching, and inline code parsing blocks.

Features a persistent real-time word/character count ticker row tracking target document boundaries.

## 4. Advanced Differential Revision Stack

Maintains runtime execution states by pushing active state markers onto internal stack arrays (historyStack & redoStack). Allows full structural history rollbacks or re-application steps using dedicated UI triggers without creating physical database bloat.

## 5. Data Portability and Secure Backups

Allows users to seamlessly manage local data structures:

* **Export:** 
    Packs folder matrix nodes, tag metadata, and ciphertext record arrays cleanly into a portable .json backup archive sheet.

* **Import Integration:** 
    Restores complete secure database states while preserving structural database indexes fully offline.

# 💻 Tech Stack & Dependencies

* **Frontend Engine:** React 18, Vite Bundling Framework

* **Styling Architecture:** Tailwind CSS Engine (Layered Glassmorphic Visual System Tokens)

* **Database Engine:** Dexie.js (Transactional IndexedDB Wrapper)

* **Cryptography Modules:** Native W3C Web Crypto API Framework

* **Concurrence Layer:** Web Worker Multi-Thread Native Sub-Pipelines

# 📥 Local Installation & Setup

To replicate this application workspace locally, execute the following commands inside your development terminal:

```bash

# Clone the target repository configuration
git clone [https://github.com/shambhushekharsinha-engg/privatemind.git](https://github.com/shambhushekharsinha-engg/privatemind.git)

# Navigate into the project workspace root
cd privatemind

# Install verified system library dependencies
npm install

# Initialize the local Vite hot-reloading development server
npm run dev

# To prepare an optimized static distribution layout bundle target
npm run build

```
# 🔒 Automated Idle Security Enforcement

PrivateMind contains an internal activity tracker hook that listens to global browser framework mouse movements, keystrokes, and touch events. If the system remains inactive for 120,000 milliseconds (2 minutes), the application drops the master cryptographic key array, clears internal layout caches, blurs viewport elements, and re-engages the zero-knowledge entry portal automatically.

## 👥 Developer Profile
 **Shambhu Shekhar Sinha**
 Role: Lead Software & Cryptographic Architecture Engineer  
 Specialization: Computer Science & Engineering (Artificial Intelligence & Machine Learning)
 Institution: Greater Noida Institute of Technology (GNIOT) · Dr. A.P.J. Abdul Kalam Technical University (AKTU)  Location: Greater Noida, India  
 GitHub: @shambhushekharsinha-engg
 
 # 📄 License

 Distributed under the **MIT License**. See below for full legal runtime permissions:

 ```text

 Copyright (c) 2026 Shambhu Shekhar Sinha

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 ```
