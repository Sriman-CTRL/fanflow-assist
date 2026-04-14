// Stadium Data
const stadiumData = {
    restrooms: [
        { id: 1, name: "North Restroom A", zone: "North Stand", waitTime: 3, crowdLevel: "low", accessible: true, cleanliness: 4.8 },
        { id: 2, name: "North Restroom B", zone: "North Stand", waitTime: 8, crowdLevel: "medium", accessible: false, cleanliness: 4.2 },
        { id: 3, name: "South Restroom A", zone: "South Stand", waitTime: 12, crowdLevel: "high", accessible: false, cleanliness: 3.5 },
        { id: 4, name: "South Restroom B", zone: "South Stand", waitTime: 6, crowdLevel: "medium", accessible: true, cleanliness: 4.5 },
        { id: 5, name: "East Restroom", zone: "East Wing", waitTime: 5, crowdLevel: "medium", accessible: true, cleanliness: 4.9 },
        { id: 6, name: "West Restroom", zone: "West Wing", waitTime: 2, crowdLevel: "low", accessible: true, cleanliness: 4.7 }
    ],
    foodStalls: [
        { id: 1, name: "Burger Mania", zone: "North Stand", waitTime: 15, crowdLevel: "high", accessible: true, rating: 4.5 },
        { id: 2, name: "Pizza Paradise", zone: "South Stand", waitTime: 8, crowdLevel: "medium", accessible: true, rating: 4.2 },
        { id: 3, name: "Taco Fiesta", zone: "East Wing", waitTime: 5, crowdLevel: "low", accessible: false, rating: 4.7 },
        { id: 4, name: "Hot Dog Haven", zone: "West Wing", waitTime: 3, crowdLevel: "low", accessible: true, rating: 4.0 },
        { id: 5, name: "Snack Central", zone: "North Stand", waitTime: 10, crowdLevel: "medium", accessible: true, rating: 3.8 },
        { id: 6, name: "Beverage Bar", zone: "South Stand", waitTime: 6, crowdLevel: "medium", accessible: true, rating: 4.1 }
    ],
    exits: [
        { id: 1, name: "Gate A - Main Exit", zone: "North Stand", crowdLevel: "high", accessible: true },
        { id: 2, name: "Gate B - East Exit", zone: "East Wing", crowdLevel: "low", accessible: true },
        { id: 3, name: "Gate C - West Exit", zone: "West Wing", crowdLevel: "medium", accessible: true },
        { id: 4, name: "Gate D - South Exit", zone: "South Stand", crowdLevel: "medium", accessible: false },
        { id: 5, name: "Emergency Exit 1", zone: "North Stand", crowdLevel: "low", accessible: true },
        { id: 6, name: "Emergency Exit 2", zone: "East Wing", crowdLevel: "low", accessible: true }
    ]
};

// Global State
let accessibilityMode = false;
let currentTab = 'all';
let currentZone = 'all';
let userLocation = 'North Stand';
let conversationHistory = [];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    addBotMessage("👋 Hi! I'm your FanFlow AI assistant. I can help you find facilities, predict wait times, and navigate the stadium. Try using voice by clicking the microphone! 🎤");
    renderFacilities();
    generateRushPredictions();
    startRealTimeUpdates();
}

// ===================================
// SMART RESPONSE FUNCTIONS
// ===================================

function fallbackResponse(query) {
    console.log('🔍 Processing query:', query);
    const lower = query.toLowerCase();

    // SEAT UPGRADES
    if (lower.includes('seat') || lower.includes('upgrade') || lower.includes('better') ||
        lower.includes('view') || lower.includes('vip') || lower.includes('premium')) {
        return getSeatUpgradeResponse();
    }

    // RESTROOMS
    if (lower.includes('restroom') || lower.includes('toilet') || lower.includes('bathroom') || lower.includes('washroom')) {
        if (lower.includes('clean')) {
            return getCleanestRestrooms();
        }
        return getFallbackRecommendation('restrooms', '🚻 Best restrooms near you');
    }

    // FOOD
    if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry') ||
        lower.includes('restaurant') || lower.includes('lunch') || lower.includes('dinner') ||
        lower.includes('snack') || lower.includes('drink') || lower.includes('beverage') ||
        lower.includes('pizza') || lower.includes('burger') || lower.includes('hot dog') ||
        lower.includes('taco')) {
        return getFallbackRecommendation('foodStalls', '🍔 Best food options for you');
    }

    // EXITS
    if (lower.includes('exit') || lower.includes('leave') || lower.includes('out') || lower.includes('gate')) {
        return getFallbackRecommendation('exits', '🚪 Nearest exits');
    }

    // EMERGENCY
    if (lower.includes('emergency') || lower.includes('medical') || lower.includes('help') ||
        lower.includes('lost') || lower.includes('child') || lower.includes('police')) {
        if (lower.includes('medical') || lower.includes('hurt')) {
            triggerEmergency('medical');
            return '<strong>🚨 EMERGENCY ALERT DEPLOYED</strong><br><br>Medical assistance is being dispatched to your zone immediately. Please stay calm.';
        } else if (lower.includes('lost') || lower.includes('child') || lower.includes('missing')) {
            triggerEmergency('lost');
            return '<strong>👶 SECURITY ALERT ACTIVATED</strong><br><br>Security has been notified about a lost person. Please stay where you are or find the nearest staff member immediately.';
        } else {
             return '<strong>⚠️ EMERGENCY ASSISTANCE</strong><br><br>Please use the designated Quick Action buttons above to trigger a specific Emergency Alert (Medical, Lost Child, or Nearest Exit).';
        }
    }

    // ACCESSIBLE
    if (lower.includes('accessible') || lower.includes('wheelchair') || lower.includes('disability')) {
        return getAccessibleFacilities();
    }

    // CROWD INFO
    if (lower.includes('crowd') || lower.includes('busy')) {
        return getCrowdInfo();
    }

    // LOCATION
    if (lower.includes('map') || lower.includes('where am i') || lower.includes('location')) {
        return getLocationInfo();
    }

    // DEFAULT
    return getHelpMessage();
}

function getFallbackRecommendation(type, header) {
    let facilities = [...stadiumData[type]];

    if (accessibilityMode) {
        facilities = facilities.filter(f => f.accessible);
    }

    facilities.sort((a, b) => {
        if (a.waitTime && b.waitTime) return a.waitTime - b.waitTime;
        const crowdOrder = { low: 1, medium: 2, high: 3 };
        return crowdOrder[a.crowdLevel] - crowdOrder[b.crowdLevel];
    });

    const top3 = facilities.slice(0, 3);

    let response = `<strong>${header}:</strong><br><br>`;

    top3.forEach((f, i) => {
        const crowdEmoji = f.crowdLevel === 'low' ? '🟢' : f.crowdLevel === 'medium' ? '🟡' : '🔴';

        response += `<strong>${i + 1}. ${f.name}</strong><br>`;
        response += `📍 ${f.zone}<br>`;

        if (f.waitTime) response += `⏱️ ${f.waitTime} min wait | `;
        response += `${crowdEmoji} ${f.crowdLevel} crowd`;

        if (f.cleanliness) response += ` | ⭐ ${f.cleanliness}/5 clean`;
        if (f.rating) response += ` | ⭐ ${f.rating}/5 rated`;
        if (f.accessible) response += ` | ♿ Accessible`;

        response += '<br><br>';
    });

    return response;
}

function getSeatUpgradeResponse() {
    return `<strong>🎟️ Premium Seat Upgrades Available!</strong><br><br>

<strong>1. East Wing - Section E12</strong><br>
📍 Row 5, Seats 8-10<br>
💰 ₹2,500 (50% OFF!)<br>
👁️ Perfect center view of the field<br>
♿ Wheelchair accessible<br>
⭐ Best value!<br><br>

<strong>2. North Stand - VIP Box 3</strong><br>
📍 Premium lounge access included<br>
💰 ₹5,000<br>
🍽️ Complimentary food & drinks<br>
📺 Personal viewing screen<br>
🛋️ Luxury seating<br><br>

<strong>3. South Stand - Section S8</strong><br>
📍 Row 3, Seats 15-17<br>
💰 ₹1,800<br>
🎵 Right near team dugout<br>
📸 Great for photos!<br><br>

Would you like me to reserve any of these for you?`;
}

function getCleanestRestrooms() {
    let restrooms = [...stadiumData.restrooms];

    if (accessibilityMode) {
        restrooms = restrooms.filter(r => r.accessible);
    }

    restrooms.sort((a, b) => b.cleanliness - a.cleanliness);
    const top3 = restrooms.slice(0, 3);

    let response = '<strong>✨ Cleanest Restrooms Right Now:</strong><br><br>';

    top3.forEach((r, i) => {
        response += `<strong>${i + 1}. ${r.name}</strong><br>`;
        response += `⭐ ${r.cleanliness}/5 cleanliness rating<br>`;
        response += `📍 ${r.zone} | ⏱️ ${r.waitTime} min wait<br>`;
        if (r.accessible) response += '♿ Wheelchair accessible<br>';
        response += '<br>';
    });

    return response;
}

function getAccessibleFacilities() {
    const accessible = {
        restrooms: stadiumData.restrooms.filter(r => r.accessible),
        food: stadiumData.foodStalls.filter(f => f.accessible),
        exits: stadiumData.exits.filter(e => e.accessible)
    };

    return `<strong>♿ Accessible Facilities Near You:</strong><br><br>

<strong>Restrooms:</strong><br>
${accessible.restrooms.map(r => `• ${r.name} (${r.zone}) - ${r.waitTime} min wait`).join('<br>')}<br><br>

<strong>Food Stalls:</strong><br>
${accessible.food.map(f => `• ${f.name} (${f.zone}) - ${f.waitTime} min wait`).join('<br>')}<br><br>

<strong>Exits:</strong><br>
${accessible.exits.map(e => `• ${e.name} (${e.zone})`).join('<br>')}<br><br>

All routes shown are wheelchair accessible! 🛤️`;
}

function getCrowdInfo() {
    return `<strong>📊 Current Crowd Levels:</strong><br><br>

<strong>North Stand:</strong> 🟡 Medium<br>
<strong>South Stand:</strong> 🔴 High<br>
<strong>East Wing:</strong> 🟢 Low - Perfect timing!<br>
<strong>West Wing:</strong> 🟡 Medium<br><br>

<strong>💡 Tip:</strong> East Wing has the lowest crowds right now!`;
}

function getLocationInfo() {
    return `<strong>📍 Your Current Location:</strong><br><br>

You're in: <strong>${userLocation}</strong><br><br>

<strong>Nearby Facilities:</strong><br>
• 3 Restrooms within 2 min walk<br>
• 2 Food stalls nearby<br>
• 1 Emergency exit 50m away<br><br>

Tap any zone on the map below to see facilities! 🗺️`;
}

function getHelpMessage() {
    return `<strong>👋 Hi! I'm FanFlow Assistant!</strong><br><br>

I can help you with:<br><br>

🚻 <strong>Restrooms</strong> - "Where's the nearest restroom?"<br>
🍔 <strong>Food & Drinks</strong> - "I'm hungry, what's nearby?"<br>
🚪 <strong>Exits</strong> - "How do I leave?"<br>
🎟️ <strong>Seat Upgrades</strong> - "Can I get better seats?"<br>
♿ <strong>Accessible Options</strong> - "Show accessible facilities"<br>
📊 <strong>Crowd Info</strong> - "Which zone is least crowded?"<br>
✨ <strong>Cleanliness</strong> - "Find cleanest restroom"<br><br>

<strong>🎤 Pro Tip:</strong> Click the microphone to speak!<br><br>

What would you like to know?`;
}

// ===================================
// CHAT FUNCTIONS
// ===================================

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addUserMessage(message);
    input.value = '';

    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        const response = fallbackResponse(message);
        addBotMessage(response);
    }, 800);
}

function showTypingIndicator() {
    const container = document.getElementById('messagesContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function askQuestion(query) {
    document.getElementById('chatInput').value = query;
    sendMessage();
}

function addUserMessage(text) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <div class="message-text">${escapeHtml(text)}</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function addBotMessage(html) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';

    const formattedHtml = html.replace(/\n/g, '<br>');

    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">${formattedHtml}</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function clearChat() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    conversationHistory = [];
    addBotMessage("Chat cleared! How can I help you?");
}

// ===================================
// FACILITIES RENDERING
// ===================================

function renderFacilities() {
    const container = document.getElementById('facilitiesList');
    container.innerHTML = '';

    let allFacilities = [];

    if (currentTab === 'all' || currentTab === 'restrooms') {
        allFacilities = [...allFacilities, ...stadiumData.restrooms.map(f => ({ ...f, type: 'restroom', icon: '🚻' }))];
    }
    if (currentTab === 'all' || currentTab === 'foodStalls') {
        allFacilities = [...allFacilities, ...stadiumData.foodStalls.map(f => ({ ...f, type: 'food', icon: '🍔' }))];
    }
    if (currentTab === 'all' || currentTab === 'exits') {
        allFacilities = [...allFacilities, ...stadiumData.exits.map(f => ({ ...f, type: 'exit', icon: '🚪' }))];
    }

    if (currentZone !== 'all') {
        allFacilities = allFacilities.filter(f => f.zone === currentZone);
    }

    if (accessibilityMode) {
        allFacilities = allFacilities.filter(f => f.accessible);
    }

    allFacilities.forEach(facility => {
        const item = document.createElement('div');
        item.className = 'facility-item';

        const waitInfo = facility.waitTime ? `<span class="facility-stat">⏱️ ${facility.waitTime} min</span>` : '';
        const accessIcon = facility.accessible ? '<span class="facility-stat">♿</span>' : '';
        const cleanInfo = facility.cleanliness ? `<span class="facility-stat">⭐ ${facility.cleanliness}</span>` : '';
        const ratingInfo = facility.rating ? `<span class="facility-stat">⭐ ${facility.rating}</span>` : '';

        item.innerHTML = `
            <div class="facility-item-header">
                <div class="facility-name-group">
                    <span class="facility-type-icon">${facility.icon}</span>
                    <div>
                        <div class="facility-name">${facility.name}</div>
                        <div class="facility-zone">📍 ${facility.zone}</div>
                    </div>
                </div>
                <span class="crowd-status ${facility.crowdLevel}">${facility.crowdLevel}</span>
            </div>
            <div class="facility-stats-row">
                ${waitInfo}
                ${accessIcon}
                ${cleanInfo}
                ${ratingInfo}
            </div>
        `;

        container.appendChild(item);
    });
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderFacilities();
}

function filterZone() {
    currentZone = document.getElementById('zoneSelector').value;
    userLocation = currentZone !== 'all' ? currentZone : 'North Stand';
    renderFacilities();
}

// ===================================
// ACCESSIBILITY TOGGLE
// ===================================

function toggleAccessibility() {
    accessibilityMode = !accessibilityMode;
    const btn = document.querySelector('.accessibility-btn');

    if (accessibilityMode) {
        btn.classList.add('active');
        document.getElementById('accessIconNav').textContent = '✅';
        addBotMessage("♿ Accessibility mode enabled! Showing only wheelchair-accessible facilities.");
    } else {
        btn.classList.remove('active');
        document.getElementById('accessIconNav').textContent = '♿';
    }

    renderFacilities();
}

// ===================================
// RUSH PREDICTIONS
// ===================================

function generateRushPredictions() {
    const container = document.getElementById('rushGrid');
    const minute = new Date().getMinutes();

    let phase = 'pre-match';
    if (minute > 15 && minute < 45) phase = 'mid-game';
    if (minute >= 45 && minute < 55) phase = 'halftime';
    if (minute >= 55) phase = 'post-game';

    const predictions = [
        {
            name: "North Stand Restrooms",
            now: 8,
            later: phase === 'halftime' ? 15 : 3,
            recommendation: phase === 'halftime' ? 'wait' : 'go',
            reason: phase === 'halftime' ? 'Halftime rush in 5 min. Wait for 70% less crowd.' : 'Perfect timing! Go now.'
        },
        {
            name: "Pizza Paradise",
            now: 6,
            later: phase === 'pre-match' ? 12 : 4,
            recommendation: phase === 'pre-match' ? 'wait' : 'go',
            reason: phase === 'pre-match' ? 'Pre-match rush. Wait 8 min.' : 'Queue shortening. Go now!'
        },
        {
            name: "Main Exit Gate A",
            now: 2,
            later: phase === 'post-game' ? 20 : 0,
            recommendation: phase === 'post-game' ? 'wait' : 'go',
            reason: phase === 'post-game' ? 'Post-game crowd. Use Gate B instead.' : 'Clear path now.'
        }
    ];

    container.innerHTML = '';

    predictions.forEach(pred => {
        const card = document.createElement('div');
        card.className = 'rush-card';
        card.innerHTML = `
            <div class="rush-card-header">${pred.name}</div>
            <div class="rush-comparison">
                <div class="rush-time">
                    <div class="rush-label">Now</div>
                    <div class="rush-value">${pred.now} min</div>
                </div>
                <div class="rush-arrow">→</div>
                <div class="rush-time">
                    <div class="rush-label">In 10 min</div>
                    <div class="rush-value">${pred.later} min</div>
                </div>
            </div>
            <div class="rush-recommendation ${pred.recommendation}">
                ${pred.recommendation === 'go' ? '🟢 GO NOW' : '🔴 WAIT 10 MIN'}
            </div>
            <div class="rush-reason">${pred.reason}</div>
        `;
        container.appendChild(card);
    });
}

// ===================================
// EMERGENCY FUNCTIONS
// ===================================

function triggerEmergency(type) {
    const alert = document.getElementById('emergencyAlert');
    const alertText = document.getElementById('alertText');

    const messages = {
        medical: '🚑 Medical team alerted! Help arriving. Nearest station: North Stand Medical Bay.',
        lost: '👶 Security notified! Lost child alert activated. Go to nearest info desk.',
        exit: '🚪 Emergency route activated! Follow green path markers to nearest exit.'
    };

    alertText.textContent = messages[type];
    alert.classList.remove('hidden');

    addBotMessage(`<strong>⚠️ EMERGENCY ACTIVATED</strong><br><br>${messages[type]}`);

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 10000);
}

function closeAlert() {
    document.getElementById('emergencyAlert').classList.add('hidden');
}

// ===================================
// ZONE SELECTION
// ===================================

function selectZone(zone) {
    currentZone = zone;
    userLocation = zone;
    document.getElementById('zoneSelector').value = zone;
    addBotMessage(`📍 Location updated to ${zone}. Showing nearby facilities!`);
    renderFacilities();
}

// ===================================
// REAL-TIME UPDATES
// ===================================

function startRealTimeUpdates() {
    setInterval(() => {
        updateWaitTimes();
        updateTime();
    }, 30000);
}

function updateWaitTimes() {
    Object.keys(stadiumData).forEach(category => {
        stadiumData[category].forEach(facility => {
            if (facility.waitTime !== undefined) {
                const change = Math.floor(Math.random() * 5) - 2;
                facility.waitTime = Math.max(1, Math.min(20, facility.waitTime + change));
            }

            if (Math.random() > 0.8) {
                const levels = ['low', 'medium', 'high'];
                facility.crowdLevel = levels[Math.floor(Math.random() * levels.length)];
            }
        });
    });

    renderFacilities();
    generateRushPredictions();
}

function updateTime() {
    document.getElementById('updateTime').textContent = 'just now';
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// ===================================
// VOICE ASSISTANT
// ===================================

let recognition = null;
let synthesis = window.speechSynthesis;
let isListening = false;

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Speech recognition not supported');
        showToast('⚠️ Voice not supported. Try Chrome!');
        return null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        isListening = true;
        updateVoiceUI(true);
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        console.log('🗣️ User said:', transcript);

        document.getElementById('chatInput').value = transcript;

        setTimeout(() => {
            sendMessage();
        }, 500);

        showToast(`You said: "${transcript}"`);
    };

    recognition.onerror = function (event) {
        console.error('Speech error:', event.error);
        let errorMessage = 'Voice error';
        if (event.error === 'no-speech') errorMessage = 'No speech detected. Try again!';
        if (event.error === 'not-allowed') errorMessage = 'Microphone permission denied';

        showToast(errorMessage);
        updateVoiceUI(false);
        isListening = false;
    };

    recognition.onend = function () {
        updateVoiceUI(false);
        isListening = false;
    };

    return recognition;
}

function toggleVoiceRecognition() {
    if (!recognition) {
        recognition = initializeSpeechRecognition();
        if (!recognition) return;
    }

    if (isListening) {
        recognition.stop();
        showToast('🛑 Stopped listening');
    } else {
        try {
            recognition.start();
            showToast('🎤 Speak now...');
        } catch (error) {
            showToast('⚠️ Could not start voice');
        }
    }
}

function updateVoiceUI(listening) {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceIndicator = document.getElementById('voiceIndicator');
    const voiceIcon = document.getElementById('voiceIcon');

    if (listening) {
        voiceBtn.classList.add('listening');
        voiceIndicator.classList.remove('hidden');
        voiceIcon.textContent = '🔴';
    } else {
        voiceBtn.classList.remove('listening');
        voiceIndicator.classList.add('hidden');
        voiceIcon.textContent = '🎤';
    }
}

function showToast(message) {
    const existingToast = document.getElementById('voiceToast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'voiceToast';
    toast.className = 'voice-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ===================================
// CHARTS & DATA VISUALIZATION
// ===================================

let charts = {};

function initializeCharts() {
    // Chart 1: Wait Time Trends (Line Chart)
    const waitTimeCtx = document.getElementById('waitTimeChart');
    if (waitTimeCtx) {
        charts.waitTime = new Chart(waitTimeCtx, {
            type: 'line',
            data: {
                labels: ['10 min ago', '8 min ago', '6 min ago', '4 min ago', '2 min ago', 'Now'],
                datasets: [{
                    label: 'Restrooms',
                    data: [8, 7, 6, 5, 4, 5],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Food Stalls',
                    data: [12, 11, 10, 9, 8, 8],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Crowd Distribution (Doughnut Chart)
    const crowdCtx = document.getElementById('crowdChart');
    if (crowdCtx) {
        charts.crowd = new Chart(crowdCtx, {
            type: 'doughnut',
            data: {
                labels: ['North Stand', 'South Stand', 'East Wing', 'West Wing'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: [
                        '#F59E0B',
                        '#EF4444',
                        '#10B981',
                        '#3B82F6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Chart 3: Facility Ratings (Bar Chart)
    const ratingsCtx = document.getElementById('ratingsChart');
    if (ratingsCtx) {
        charts.ratings = new Chart(ratingsCtx, {
            type: 'bar',
            data: {
                labels: ['East Restroom', 'West Restroom', 'Taco Fiesta', 'North A', 'Pizza Paradise'],
                datasets: [{
                    label: 'Rating (out of 5)',
                    data: [4.9, 4.8, 4.7, 4.5, 4.2],
                    backgroundColor: [
                        '#10B981',
                        '#10B981',
                        '#34D399',
                        '#34D399',
                        '#6EE7B7'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: 'Star Rating'
                        }
                    }
                }
            }
        });
    }

    // Chart 4: Prediction Chart (Line with forecast)
    const predictionCtx = document.getElementById('predictionChart');
    if (predictionCtx) {
        charts.prediction = new Chart(predictionCtx, {
            type: 'line',
            data: {
                labels: ['Now', '+5 min', '+10 min', '+15 min', '+20 min', '+25 min', '+30 min'],
                datasets: [{
                    label: 'North Stand Restrooms',
                    data: [8, 12, 15, 18, 14, 10, 6],
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderDash: [0, 0, 5, 5, 5, 5, 5]
                }, {
                    label: 'Pizza Paradise',
                    data: [8, 10, 12, 10, 8, 6, 5],
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderDash: [0, 0, 5, 5, 5, 5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Wait Time (min)'
                        }
                    }
                }
            }
        });
    }
}

// Update charts with live data
function updateCharts() {
    if (charts.waitTime) {
        // Simulate live data update
        const newData = stadiumData.restrooms.map(r => r.waitTime);
        const avgWait = (newData.reduce((a, b) => a + b, 0) / newData.length).toFixed(1);
        
        // Update stat cards
        document.getElementById('avgWaitTime').textContent = `${avgWait} min`;
        
        // Shift and add new data point to chart
        charts.waitTime.data.labels.shift();
        charts.waitTime.data.labels.push('Now');
        
        charts.waitTime.data.datasets[0].data.shift();
        charts.waitTime.data.datasets[0].data.push(Math.floor(Math.random() * 5) + 3);
        
        charts.waitTime.update('none'); // Update without animation for smoothness
    }
}

// Animate stat cards on scroll
function animateStatsOnScroll() {
    const stats = document.querySelectorAll('.stat-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 10);
                }, index * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Initialize charts when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeCharts();
        animateStatsOnScroll();
        
        // Update charts every 30 seconds
        setInterval(updateCharts, 30000);
    }, 1000);
});

// Console Easter Egg
console.log('%c🏟️ FanFlow Assist', 'font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%c🎤 Voice Assistant Enabled', 'font-size: 16px; color: #EC4899; font-weight: bold;');
console.log('%cBuilt for PromptWars 2026', 'font-size: 14px; color: #10B981;');