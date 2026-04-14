# 🏟️ FanFlow Assist

> AI-powered stadium assistant revolutionizing the live event experience

[![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge)](https://sriman-ctrl.github.io/fanflow-assist/)
[![Built for PromptWars](https://img.shields.io/badge/Built%20for-PromptWars%202026-4285F4?style=for-the-badge&logo=google)](https://promptwars.devfolio.co/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)](https://web.dev/progressive-web-apps/)

---

## 🎯 The Problem

**Challenge:** Physical Event Experience at Large-Scale Sporting Venues

Millions of fans attend sporting events annually, but the experience is often frustrating:

- 🚶‍♂️ **Long queues** - Average 8-12 minute wait times at facilities
- ⏱️ **Unpredictable waits** - No visibility into current conditions
- 🗺️ **Navigation confusion** - Large, unfamiliar venues with poor signage
- ♿ **Limited accessibility** - Wheelchair users struggle to find accessible routes
- 😞 **Missed moments** - Spending game time searching for restrooms/food

**FanFlow Assist solves these pain points with intelligent, real-time assistance.**

---

## 💡 The Solution

An AI-powered stadium companion that uses **predictive analytics**, **voice recognition**, and **real-time data visualization** to transform the attendee experience.

### 🌟 Key Features

#### 🎤 Voice Assistant
- **Hands-free navigation** - Keep your hands free for food, drinks, and cheering
- **Natural language processing** - Ask questions conversationally
- **Speech-to-text & text-to-speech** - Full two-way voice interaction
- **Noise-tolerant** - Designed for loud stadium environments

#### 🤖 Smart Recommendations
- **Context-aware suggestions** - Considers your location, accessibility needs, and preferences
- **Multi-factor ranking** - Balances wait time, crowd level, distance, and ratings
- **Personalized responses** - Adapts to accessibility mode and user context
- **Instant results** - Sub-second query processing

#### ⏰ Beat the Rush™ (Unique Feature!)
- **Predictive analytics** - Forecasts facility congestion 10-30 minutes ahead
- **Game phase detection** - Adjusts predictions for pre-match, halftime, post-game
- **Visual indicators** - Clear 🟢 GO NOW or 🔴 WAIT recommendations
- **Time-saving algorithm** - Helps users make smart timing decisions

#### 📊 Live Analytics Dashboard
- **Real-time visualizations** - 4 interactive charts powered by Chart.js
- **Crowd distribution** - Visual breakdown by stadium zone
- **Wait time trends** - Historical and predicted patterns
- **Facility ratings** - Top-rated locations highlighted
- **Predictive graphs** - Next 30-minute forecast

#### 📱 Progressive Web App (PWA)
- **Installable** - One-click install on any device, no app store needed
- **Offline capable** - Works without internet after first visit
- **Fast loading** - Service Worker caching for instant repeat visits
- **Native feel** - Runs in standalone window like a real app
- **Optimized icons** - 192x192 and 512x512 for all devices

#### ♿ Accessibility First
- **Dedicated mode** - Toggle to show only wheelchair-accessible facilities
- **Visual indicators** - Clear ♿ symbols on accessible options
- **Screen reader support** - Semantic HTML and ARIA labels
- **Keyboard navigation** - Full functionality without mouse
- **High contrast UI** - Easy to read in various lighting conditions

#### 🚨 Emergency Features
- **One-tap alerts** - Medical emergency, lost child, safety concerns
- **Instant routing** - Fastest path to exits or help
- **Visual alerts** - Prominent emergency banner with auto-dismiss
- **Security integration** - (Simulated) Direct connection to venue security

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic, accessible structure
- **CSS3** - Modern styling with Grid, Flexbox, and custom animations
- **Vanilla JavaScript** - Zero dependencies, lightweight and fast
- **Chart.js** - Beautiful, responsive data visualizations

### APIs & Services
- **Web Speech API** - Browser-native voice recognition (Google/Chrome)
- **Service Workers** - PWA offline capability and caching
- **Google Antigravity** - AI-assisted development and rapid prototyping

### Architecture
- **Progressive Web App (PWA)** - Installable, offline-first
- **Mobile-first design** - Responsive from 320px to 4K
- **Component-based structure** - Modular, reusable code
- **Real-time simulation** - Live data updates every 30 seconds

---

## 🚀 Live Demo

**Try it now:** [https://sriman-ctrl.github.io/fanflow-assist/](https://sriman-ctrl.github.io/fanflow-assist/)

### Quick Start Guide

1. **Open in Chrome or Edge** (best voice support)
2. **Allow microphone permission** when prompted
3. **Try voice commands:**
   - Click 🎤 and say: *"Where's the nearest restroom?"*
   - Or: *"I'm hungry, what should I eat?"*
   - Or: *"Can I upgrade my seat?"*
4. **Install as app:** Click the install prompt or browser menu
5. **Explore features:** Beat the Rush, Analytics Dashboard, Stadium Map

---

## 📸 Screenshots

> *Screenshots showcase the app's key features and professional design*

### Main Interface
Beautiful gradient hero section with live stats and intuitive navigation.

### Voice Assistant
Hands-free interaction with visual feedback and "listening" indicators.

### Beat the Rush™
Unique predictive feature showing optimal timing for facility visits.

### Analytics Dashboard  
Real-time charts showing crowd patterns, wait times, and predictions.

### PWA Installation
One-click install works across all devices - phones, tablets, desktops.

---

## 🏗️ Project Structure

**Total Size:** ~480 KB (well under 1 MB requirement) ✅

---

## 💻 Installation & Setup

### Prerequisites
- Modern browser (Chrome/Edge recommended for voice features)
- Microphone access for voice assistant
- Internet connection for initial load

### Running Locally

```bash
# Clone the repository
git clone https://github.com/Sriman-CTRL/fanflow-assist.git

# Navigate to directory
cd fanflow-assist

# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server

# Option 3: Using VS Code Live Server
# Right-click index.html → "Open with Live Server"

# Then visit: http://localhost:8000
```

### Installing as PWA
**Desktop:**
- Visit the app in Chrome/Edge
- Look for install icon (⊕) in address bar
- Click "Install FanFlow Assist"
- App opens in standalone window

**Mobile:**
- Visit the app in mobile browser
- Tap "Add to Home Screen" when prompted
- Or: Menu → "Install App"
- Launch from home screen like any app

---

## 🎯 How It Works

### Voice Recognition Flow

1. User clicks 🎤 microphone button
2. Browser requests microphone permission
3. User speaks: *"Where's the cleanest restroom?"*
4. Web Speech API converts speech → text
5. Natural language processing (keyword matching)
6. Query stadium data
7. Rank by: cleanliness > wait time > accessibility > distance
8. Display top 3 recommendations with details
9. (Optional) Text-to-speech reads response back

### Beat the Rush™ Algorithm

```javascript
// Simplified prediction logic
function predictWaitTime(facility, currentTime) {
    const minute = currentTime.getMinutes();
    let phase = 'normal';
    
    // Determine game phase
    if (minute >= 45 && minute < 55) phase = 'halftime';
    if (minute >= 55) phase = 'post-game';
    
    // Predict based on phase
    if (phase === 'halftime') {
        // Restrooms/food will be 2x busier
        return facility.waitTime * 2;
    } else if (phase === 'post-game') {
        // Exits will be 3x busier
        return facility.type === 'exit' ? 
            facility.waitTime * 3 : facility.waitTime * 0.5;
    } else {
        // Normal fluctuation
        return facility.waitTime * 0.8;
    }
}
```