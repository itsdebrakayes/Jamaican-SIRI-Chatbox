
// Core Variables
const messageInput = document.getElementById('messageInput');
const sendBtn = document.querySelector('.send-btn');
const chatMessages = document.querySelector('.chat-messages');
const chatList = document.querySelector('.chat-list');
const newChatBtn = document.querySelector('.new-chat-btn');
const suggestionChips = document.querySelectorAll('.suggestion-chip');
const sidebarToggle = document.querySelector('.toggle-sidebar');
const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const voiceBtn = document.querySelector('.voice-btn');

let currentChatId = null;

// Jamaican AI Responses
const jamaican_responses = {
    greetings: [
        "Wah gwaan! How yuh doing today?",
        "Big up yuhself! What can Mike help yuh with?",
        "Irie! Mi ready fi assist yuh, seen?",
        "Respect! Tell mi what yuh need help with."
    ],
    weather: [
        "Mi cyaan check di weather right now, but Jamaica weather usually nice and warm! Around 80-85°F most days.",
        "Di weather inna Jamaica always blessed! Hot sun, warm breeze, and beautiful beaches all year round.",
        "Jamaica weather stay consistent - warm and tropical! Perfect fi beach or just chillin' outside."
    ],
    food: [
        "Yuh want know bout Jamaican food? Try some ackee and saltfish, jerk chicken, curry goat, or some nice rice and peas!",
        "Mi love fi talk bout food! Jamaican cuisine full of flavor - jerk seasoning, curry, and plenty spice!",
        "Some good Jamaican food include: patties, festival, plantain, and don't forget bout di rum cake!"
    ],
    culture: [
        "Jamaica culture rich with reggae music, Rastafari, and plenty love and respect for each other.",
        "We known fi Bob Marley, Usain Bolt, and di beautiful Blue Mountains. One love!",
        "Jamaica small but mighty! We bring reggae, dancehall, and positive vibes to di whole world."
    ],
    help: [
        "Mi here fi help yuh with anything! Ask mi bout Jamaica, get advice, or just have a reasoning.",
        "What yuh need assistance with? Mi can help translate patois, explain Jamaican culture, or just chat!",
        "Don't be shy! Mike ready fi help with whatever yuh curious about."
    ]
};

// Utilities
function createMessageElement(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    return messageDiv;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(input) {
    input = input.toLowerCase();
    if (input.includes("hello") || input.includes("hi") || input.includes("wah gwaan")) return getRandomResponse(jamaican_responses.greetings);
    if (input.includes("weather")) return getRandomResponse(jamaican_responses.weather);
    if (input.includes("food")) return getRandomResponse(jamaican_responses.food);
    if (input.includes("culture") || input.includes("jamaica")) return getRandomResponse(jamaican_responses.culture);
    if (input.includes("help")) return getRandomResponse(jamaican_responses.help);
    return "Mi nuh too sure wah yuh mean. Try ask mi inna different way.";
}

function getRandomResponse(category) {
    return category[Math.floor(Math.random() * category.length)];
}

function saveChatMessage(chatId, message, isUser) {
    const allChats = JSON.parse(localStorage.getItem("jamaicanAIChats") || "{}");
    if (!allChats[chatId]) allChats[chatId] = [];
    allChats[chatId].push({ text: message, isUser });
    localStorage.setItem("jamaicanAIChats", JSON.stringify(allChats));
}

function loadChat(chatId) {
    chatMessages.innerHTML = '';
    const allChats = JSON.parse(localStorage.getItem("jamaicanAIChats") || "{}");
    const messages = allChats[chatId] || [];

    messages.forEach(msg => {
        chatMessages.appendChild(createMessageElement(msg.text, msg.isUser));
    });

    currentChatId = chatId;
    scrollToBottom();
}

function addChatToSidebar(chatId, title = "Chat " + chatId.slice(-4)) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.textContent = title;
    chatItem.addEventListener('click', () => loadChat(chatId));
    chatList.appendChild(chatItem);
}

// New Chat
newChatBtn.addEventListener('click', () => {
    const newId = "chat-" + Date.now();
    currentChatId = newId;
    addChatToSidebar(newId);
    localStorage.setItem("jamaicanAIChats", JSON.stringify({ ...JSON.parse(localStorage.getItem("jamaicanAIChats") || "{}"), [newId]: [] }));
    chatMessages.innerHTML = '';
});

// Send Message
function sendMessage() {
    const userInput = messageInput.value.trim();
    if (!userInput) return;

    const userMsg = createMessageElement(userInput, true);
    chatMessages.appendChild(userMsg);
    saveChatMessage(currentChatId, userInput, true);
    messageInput.value = '';
    sendBtn.disabled = true;

    scrollToBottom();

    setTimeout(() => {
        const botReply = getBotResponse(userInput);
        const botMsg = createMessageElement(botReply);
        chatMessages.appendChild(botMsg);
        saveChatMessage(currentChatId, botReply, false);
        scrollToBottom();
    }, 600);
}

// Toggle sidebar on mobile
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// Send button logic
document.getElementById("sendButton").addEventListener("click", function () {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (message !== "") {
    addMessage("user", message);
    input.value = "";
    // Simulated bot response
    setTimeout(() => {
      addMessage("bot", "Mi hear yuh! But mi nuh ready fi chat yet.");
    }, 1000);
  }
});

// Add message to chat box
function addMessage(sender, text) {
  const chatBox = document.querySelector(".chat-box");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enable send button only if message isn't empty
messageInput.addEventListener('input', () => {
    sendBtn.disabled = messageInput.value.trim().length === 0;
});

// Handle enter key
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Suggestion Chips
suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        messageInput.value = chip.textContent;
        sendBtn.disabled = false;
        sendMessage();
    });
});

// Sidebar Toggle (desktop)
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Sidebar Toggle (mobile)
mobileSidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('visible');
    overlay.classList.toggle('visible');
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('visible');
    overlay.classList.remove('visible');
});

// Voice Input Placeholder
voiceBtn.addEventListener('click', () => {
    alert("Voice input nuh ready yet! Soon come. 😉");
});

// Load Saved Chats on Start
window.addEventListener('DOMContentLoaded', () => {
    const savedChats = JSON.parse(localStorage.getItem("jamaicanAIChats") || "{}");
    const chatIds = Object.keys(savedChats);

    if (chatIds.length > 0) {
        chatIds.forEach(id => addChatToSidebar(id));
        loadChat(chatIds[0]);
    } else {
        const defaultId = "chat-" + Date.now();
        currentChatId = defaultId;
        addChatToSidebar(defaultId);
        localStorage.setItem("jamaicanAIChats", JSON.stringify({ [defaultId]: [] }));
    }
});
