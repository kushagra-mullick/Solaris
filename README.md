# ☀️ SOLARIS
> **High-Glare, Zero-Signal Field Compliance & Incident Logging Tool**  
> *Built for Bit N Build Dubai 2026* 🇦🇪

[![Demo Video](https://img.shields.io/badge/▶%EF%B8%8E%20Watch-Demo%20Video%20(2%20min)-FFEA00?style=for-the-badge&logo=youtube&logoColor=000000)](https://youtu.be/YOUR_DEMO_VIDEO_LINK_HERE)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20First-00E676?style=for-the-badge)](manifest.json)

> 🎥 **Demo Video Link:** [Click here to watch the 2-Minute Demo](https://youtu.be/YOUR_DEMO_VIDEO_LINK_HERE) *(Ensure Google Drive links are set to "Anyone with the link can view")*

---

## 📖 The Hackathon Genesis & Philosophy

Most field logging applications fail before a worker even types a single word because they are designed in air-conditioned offices on calibrated MacBook displays. In reality, field workers face:

1. **Zero Connectivity:** Concrete basements, steel-frame warehouses, and remote industrial sites have zero Wi-Fi or cellular bars.
2. **Blinding Solar Glare:** Budget smartphone LCD screens (200–350 nits) under direct 10,000+ lux midday sunlight turn dark themes into literal mirrors, while subtle 1px gray borders vanish.
3. **High-Friction Physical Ergonomics:** Workers with dirty hands, thick work gloves, or polarized safety glasses cannot operate tiny 24px dropdowns, small close buttons, or multi-step forms.

### The Four Pillars
* **01 // The obvious idea we did NOT build:**  
  *"Just another responsive web app with a dark mode toggle and a mobile layout."* That is the baseline minimum, not a solution for harsh outdoor field environments.
* **02 // Our idea in one sentence:**  
  *A field compliance tool that remains ultra-visible under direct solar glare, operable one-handed with gloves, and functions 100% offline with zero-friction background sync.*
* **03 // The one moment that must work in the demo:**  
  **Kill the connection, max the phone screen brightness, log an entry one-handed under sunlight — watch it save instantly offline, then reconnect and see it auto-sync seamlessly.**
* **04 // What we deliberately did NOT build (Anti-Scope Creep):**  
  * ❌ No login / auth walls (skips 30 seconds of demo friction; hardcoded single worker profile).  
  * ❌ No complex analytics dashboards or graphs (a clean, high-contrast stream is what field workers need).  
  * ❌ No multi-user permissions or role trees (anyone who opens the app can log immediately).

---

## 📴 Offline-First Architecture & Sync Engine

```
                  ┌──────────────────────────────────────────────┐
                  │              FIELD WORKER ACTION             │
                  │   Log incident, attach photo, select tags    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CLIENT BROWSER (100% Offline via Service Worker)                                │
│                                                                                 │
│  1. App Shell served from local Cache Storage (`sw.js`)                         │
│  2. Entry written to browser-native IndexedDB (`SunLogDB`)                      │
│  3. Status flagged immediately as [ QUEUED ⏳ ]                                 │
│  4. UI updates instantly with Web Audio chime + Vibration confirmation          │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                        [ Network State Listener ]
                 `navigator.onLine` / `window.online` event
                                         │
                                         ▼
                                 Is Wi-Fi / 4G active?
                                ╱                     ╲
                             [NO]                     [YES]
                              │                         │
                              ▼                         ▼
                     Keep stored safely        Trigger `processQueue()` in
                     in local IndexedDB        `sync.js` (or SW Sync Event)
                                                        │
                                                        ▼
                                               Transmit pending records
                                               to remote backend / API
                                                        │
                                                        ▼
                                               Update record status:
                                               [ SYNCED ✅ ] + Green Flash
```

---

## ⚡ Key Features

### 1. ☀️ Solar Glare Anti-Reflection System
Built specifically for cheap smartphone LCD panels under direct sunlight:
* **⚡ Solar Amber Mode:** Pure `#000000` pitch black paired with saturated `#FFEA00` safety yellow, `#FFFFFF` text, and heavy 3px solid borders (zero thin fonts or subtle grey gradients).
* **☀️ Day-White Mode:** An anti-mirror white mode that forces maximum backlight luminance through the glass to overpower sky/face reflections, with high-density jet-black typography.
* **🔍 A+ Zoom Scaling:** Instant 120% font and button magnification for easy reading with scratched screen protectors or polarized safety glasses.

### 2. 📴 Offline-First Engine (IndexedDB)
* Saves logs, GPS/site tags, and photo evidence immediately into local **IndexedDB** (`SunLogDB`).
* Every offline log receives a high-contrast **`[ QUEUED ⏳ ]`** badge.

### 3. 🔄 Automatic Background Sync
* Monitors `navigator.onLine` and network status events.
* When connectivity returns, the queue worker automatically uploads pending items with simulated micro-delays, flipping the badge to **`[ SYNCED ✅ ]`** with haptic & green glow confirmation.

### 4. 👷 High-Friction Ergonomics (Thumb-Zone & Gloved Hands)
* **📡 Live GPS Weather & Solar Radiation Sensor:** Acquires live device GPS coordinates (`navigator.geolocation`) and queries real-time ambient temperature, Apparent Heat Index, direct solar radiation ($W/m^2$), and humidity via Open-Meteo API with offline cache persistence.
* **🎤 Bilingual Hands-Free Voice Dictation (`Web Speech API`):** One-tap speech-to-text with instantaneous **🇬🇧 English (`en-US`)** and **🇦🇪 Arabic (`ar-AE`)** toggle, allowing workers with thick work gloves, grease, or sweat to dictate incident notes in both languages with zero repetition or stutter.
* **🔥 Dynamic Heat Advisory & 1-Tap SOS:** Live color-coded threshold banners (Extreme Heat Danger, High Heat Advisory, Moderate, Normal) with instant `+ HEAT SOS` pre-loaded incident logger for heat stroke/exhaustion emergencies.
* **Giant 64px+ Action Buttons:** One-handed tap targets reachable with one thumb.
* **Icon Grid Category Selector:** 7 high-vis visual category tiles (Safety Issue, Heat Stress, Equipment Fault, Incident, Check Complete, Hazard Area, Delivery/Stock) instead of fiddly dropdowns.
* **One-Tap Quick Phrases:** Preset field notes for instant logging (*"Heat exhaustion rest"*, *"Tripping hazard identified"*, *"Hydraulic leak observed"*, *"PPE non-compliance"*).
* **📥 Offline Shift Export (CSV):** 1-tap local CSV shift download for instant offline supervisor handoffs without internet.
* **Photo Attachment:** Instant capture/upload with live preview and demo photo generator.
* **Multi-Sensory Audio & Haptic Cues:** Synthesized Web Audio tones and vibration patterns (`navigator.vibrate`) give immediate sensory confirmation without needing to squint at the screen.

---

## 🛠️ Technology Stack

* **Frontend Core:** Pure Vanilla HTML5, Modern CSS3 (CSS Variables for instantaneous glare theme switching), and ES6+ JavaScript.
* **Speech Recognition:** Web Speech API (`webkitSpeechRecognition`) for hands-free gloved operation.
* **Offline Persistence:** Client-side **IndexedDB** (`SunLogDB`) for structured logs, Base64 photo storage, and local CSV export.
* **PWA / Service Worker:** `sw.js` and `manifest.json` for full standalone mobile installation and static asset caching.
* **Sensory Feedback:** Web Audio API oscillator synthesis + Vibration API (`navigator.vibrate`).
* **Zero External Dependencies:** Zero build steps required — boots instantly on any static server or CDN.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js (v16+) or any static HTTP server (Python, VS Code Live Server, Caddy, etc.)

### Run Locally
```bash
# 1. Clone the repository
git clone https://github.com/kushagra-mullick/Solaris.git
cd Solaris

# 2. Start the local server
npm start
```
The application will be live at:
👉 **`http://localhost:3456`**

*(Or run with Python: `python -m http.server 3456`)*

---

## 📋 Team Members
- Kushagra Mullick
- Vraj Pandit 
- Yashovardhan Singh
- Aryan Goenka


---

## 📄 License
MIT License. Built for field workers everywhere.
