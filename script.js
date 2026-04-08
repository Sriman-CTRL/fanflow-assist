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

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    addBotMessage("👋 Hi! I'm your FanFlow AI assistant. I can help you find facilities, predict wait times, and navigate the stadium. What would you like to know?");
    renderFacilities();
    generateRushPredictions();
    startRealTimeUpdates();
}

// Chat Functions
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addUserMessage(message);
    input.value = '';

    setTimeout(() => {
        processQuery(message);
    }, 600);
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
            <div class="message-text">${text}</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function addBotMessage(html) {
    const container = document.getElementById('messagesContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">${html}</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function processQuery(query) {
    const lower = query.toLowerCase();

    // Fixed: Better intent matching
    if (lower.includes('seat') || lower.includes('upgrade') || lower.includes('better') || lower.includes('view')) {
        handleSeatUpgrade();
    } else if (lower.includes('restroom') || lower.includes('toilet') || lower.includes('bathroom') || lower.includes('washroom')) {
        if (lower.includes('clean')) {
            findCleanestRestrooms();
        } else {
            findBestFacility('restrooms');
        }
    } else if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry') || lower.includes('drink') || lower.includes('beverage')) {
        findBestFacility('foodStalls');
    } else if (lower.includes('exit') || lower.includes('leave') || lower.includes('out') || lower.includes('gate')) {
        findBestFacility('exits');
    } else {
        addBotMessage("I can help you with:<br><br>🚻 Find restrooms<br>🍔 Locate food & drinks<br>🚪 Navigate to exits<br>🎟️ Check seat upgrades<br>♿ Accessible routes<br><br>What would you like to know?");
    }
}

function handleSeatUpgrade() {
    addBotMessage(`
        <strong>🎟️ Great news! Premium seats available:</strong><br><br>
        
        <strong>1. East Wing - Section E12</strong><br>
        📍 Row 5, Seats 8-10<br>
        💰 ₹2,500 upgrade (50% off!)<br>
        👁️ Perfect center view<br>
        ♿ Wheelchair accessible<br><br>
        
        <strong>2. North Stand - VIP Box 3</strong><br>
        📍 Premium lounge access<br>
        💰 ₹5,000 upgrade<br>
        🍽️ Complimentary food & drinks<br>
        📺 Personal screen<br><br>
        
        <strong>3. South Stand - Section S8</strong><br>
        📍 Row 3, Seats 15-17<br>
        💰 ₹1,800 upgrade<br>
        🎵 Near team dugout<br><br>
        
        Would you like me to reserve any of these?
    `);
}

function findBestFacility(type) {
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
    const typeIcon = type === 'restrooms' ? '🚻' : type === 'foodStalls' ? '🍔' : '🚪';
    const typeName = type === 'restrooms' ? 'Restrooms' : type === 'foodStalls' ? 'Food Stalls' : 'Exits';

    let response = `<strong>${typeIcon} Best ${typeName} for you:</strong><br><br>`;

    top3.forEach((facility, index) => {
        const crowdEmoji = facility.crowdLevel === 'low' ? '🟢' : facility.crowdLevel === 'medium' ? '🟡' : '🔴';
        const waitInfo = facility.waitTime ? `⏱️ ${facility.waitTime} min wait` : '✅ No wait';
        const accessEmoji = facility.accessible ? '♿ Accessible' : '';
        const cleanInfo = facility.cleanliness ? `⭐ ${facility.cleanliness}/5 clean` : '';
        const ratingInfo = facility.rating ? `⭐ ${facility.rating}/5 rated` : '';

        response += `<strong>${index + 1}. ${facility.name}</strong><br>`;
        response += `📍 ${facility.zone}<br>`;
        response += `${crowdEmoji} ${facility.crowdLevel} crowd | ${waitInfo}`;
        if (accessEmoji) response += ` | ${accessEmoji}`;
        if (cleanInfo) response += ` | ${cleanInfo}`;
        if (ratingInfo) response += ` | ${ratingInfo}`;
        response += '<br><br>';
    });

    addBotMessage(response);
}

function findCleanestRestrooms() {
    let restrooms = [...stadiumData.restrooms];

    if (accessibilityMode) {
        restrooms = restrooms.filter(r => r.accessible);
    }

    restrooms.sort((a, b) => b.cleanliness - a.cleanliness);
    const top3 = restrooms.slice(0, 3);

    let response = '<strong>✨ Cleanest Restrooms:</strong><br><br>';

    top3.forEach((r, index) => {
        response += `<strong>${index + 1}. ${r.name}</strong><br>`;
        response += `⭐ ${r.cleanliness}/5 cleanliness rating<br>`;
        response += `📍 ${r.zone} | ⏱️ ${r.waitTime} min wait<br>`;
        if (r.accessible) response += '♿ Wheelchair accessible<br>';
        response += '<br>';
    });

    addBotMessage(response);
}

function clearChat() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    addBotMessage("Chat cleared! How can I help you?");
}

// Facilities Rendering
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
    renderFacilities();
}

// Accessibility Toggle
function toggleAccessibility() {
    accessibilityMode = !accessibilityMode;
    const btn = document.querySelector('.accessibility-btn');

    if (accessibilityMode) {
        btn.classList.add('active');
        document.getElementById('accessIconNav').textContent = '✅';
        addBotMessage("♿ Accessibility mode enabled. Showing only wheelchair-accessible facilities.");
    } else {
        btn.classList.remove('active');
        document.getElementById('accessIconNav').textContent = '♿';
    }

    renderFacilities();
}

// Rush Predictions
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
            reason: phase === 'halftime' ? 'Halftime rush in 5 min. Wait for 70% less crowd.' : 'Perfect timing! Go now before the rush.'
        },
        {
            name: "Pizza Paradise",
            now: 6,
            later: phase === 'pre-match' ? 12 : 4,
            recommendation: phase === 'pre-match' ? 'wait' : 'go',
            reason: phase === 'pre-match' ? 'Pre-match rush. Wait 8 min for faster service.' : 'Queue shortening. Go now!'
        },
        {
            name: "Main Exit Gate A",
            now: 2,
            later: phase === 'post-game' ? 20 : 0,
            recommendation: phase === 'post-game' ? 'wait' : 'go',
            reason: phase === 'post-game' ? 'Post-game crowd building. Use Gate B instead.' : 'Clear path available now.'
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

// Emergency Functions
function triggerEmergency(type) {
    const alert = document.getElementById('emergencyAlert');
    const alertText = document.getElementById('alertText');

    const messages = {
        medical: '🚑 Medical team alerted! Help arriving at your location. Nearest station: North Stand Medical Bay.',
        lost: '👶 Security notified! Lost child alert activated. Please proceed to nearest information desk.',
        exit: '🚪 Emergency route activated! Follow green path markers to nearest safe exit.'
    };

    alertText.textContent = messages[type];
    alert.classList.remove('hidden');

    addBotMessage(`<strong>⚠️ EMERGENCY RESPONSE ACTIVATED</strong><br><br>${messages[type]}`);

    setTimeout(() => {
        alert.classList.add('hidden');
    }, 10000);
}

function closeAlert() {
    document.getElementById('emergencyAlert').classList.add('hidden');
}

// Zone Selection
function selectZone(zone) {
    currentZone = zone;
    document.getElementById('zoneSelector').value = zone;
    addBotMessage(`📍 You selected ${zone}. Showing nearby facilities...`);
    renderFacilities();
}

// Real-time Updates
function startRealTimeUpdates() {
    setInterval(() => {
        updateWaitTimes();
        updateTime();
    }, 30000); // Every 30 seconds
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

// Scroll to Section
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Console Easter Egg
console.log('%c🏟️ FanFlow Assist', 'font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cBuilt with Google Antigravity for PromptWars 2024', 'font-size: 14px; color: #6366F1;');
console.log('%cTry: "Where is the cleanest restroom?" or "Upgrade my seat"', 'font-size: 12px; color: #10B981;');