# HearMeOut 🚨

**Emergency Alerts for the Deaf and Hard of Hearing**

HearMeOut is an AI-powered mobile app that listens for real-world emergency sounds (like "fire," "evacuate," or "earthquake") and instantly alerts deaf and hard-of-hearing users through real-time vibration, flashlight signals, and visual on-screen notifications.

---

## 📖 Table of Contents

- [Inspiration](#inspiration)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Demo](#demo)
- [Challenges](#challenges)
- [What's Next](#whats-next)
- [License](#license)

---

## 💡 Inspiration

Millions of deaf individuals miss critical safety alerts daily because emergency systems rely heavily on sound.  
We built HearMeOut to bridge this gap, turning everyday smartphones into life-saving emergency alert systems.

---

## 🚀 Features

- 🎙️ Real-time audio listening through the device microphone
- 🔍 Emergency keyword detection ("fire", "help", "evacuate", etc.)
- 📳 Immediate device vibration upon emergency detection
- 🔦 Flashlight signaling for additional visual alerts
- 🛡️ Emergency alert screen with live transcription
- 🗺️ (Optional) GPS location logging for future upgrades
- 🔥 Powered by AI (Google Cloud Speech-to-Text)

---

## 🛠️ Tech Stack

- React Native (Mobile App)
- Expo
- Supabase (PostgreSQL backend + authentication)
- Google Cloud Speech-to-Text API
- React Native Vibration API
- react-native-torch (Flashlight Control)
- JavaScript

---

## ⚙️ Setup Instructions

1. **Clone this repository:**

```bash
git clone https://github.com/jacksonkasi1/HearMeOut.git
cd HearMeOut
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
# or
bun install
```

3. **Setup environment variables:**

Create a `.env` file in the root directory with your API keys:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_SPEECH_TO_TEXT_API_KEY=your_google_api_key
```

4. **Run the project locally:**

```bash
npx expo start
```

5. **On your mobile device:**

- Scan the QR code from Expo to run the app.
- Ensure microphone and vibration permissions are allowed.

---

## 🎥 Demo

[![Watch the Demo](https://img.youtube.com/vi/yourdemoid/maxresdefault.jpg)](https://www.youtube.com/watch?v=xxxxxxxxx)

_(Replace with your YouTube demo video link!)_

---

## 🧠 Challenges

- Optimizing real-time audio listening without draining battery.
- Handling false positive detections and noisy environments.
- Ensuring cross-platform compatibility (especially for flashlight permissions).
- Managing API usage to stay cost-efficient.

---

## 🌱 What's Next

- Smarter AI filtering to reduce false alarms
- Wearable device integration (smartwatches)
- Partnership with official emergency broadcast systems
- Offline emergency keyword detection (no internet needed)

---

## 📄 License

This project is licensed under the MIT License.

---

> Developed with ❤️ by [Jackson Kasi](https://github.com/jacksonkasi1)