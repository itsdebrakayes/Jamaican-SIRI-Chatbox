const suggestedPrompts = [
    "Teach me Patois 🇯🇲",
    "Give me di recipe for Jamaican jerk chicken 🍗",
    "Who are some great reggae musicians? 🎶",
    "Tell me about Jamaica’s best beaches 🏝️",
    "Show me some Jamaican dance moves 💃"
];

const responses = require('./responses.json');

function displaySuggestedPrompts() {
    let promptDiv = document.querySelector(".suggested-prompts");
    promptDiv.innerHTML = "";
    let shuffledPrompts = suggestedPrompts.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    shuffledPrompts.forEach(prompt => {
        let btn = document.createElement("div");
        btn.className = "suggestion-chip";
        btn.innerText = prompt;
        btn.onclick = () => {
            document.getElementById("userInput").value = prompt;
            sendMessage();
        };
        promptDiv.appendChild(btn);
    });
}

function sendMessage() {
    let userInput = document.getElementById("userInput").value.trim().toLowerCase();
    if (!userInput) return;

    let chatHistory = document.querySelector(".chat-history");
    let userMessage = document.createElement("p");
    userMessage.innerHTML = `<strong>You:</strong> ${userInput}`;
    chatHistory.appendChild(userMessage);

    let botResponse = responses[userInput] || "Mi nuh understand, try again! 🤔";
    let botMessage = document.createElement("p");
    botMessage.innerHTML = `<strong>Jamaican AI:</strong> ${botResponse}`;
    chatHistory.appendChild(botMessage);

    document.getElementById("userInput").value = "";
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    displaySuggestedPrompts();
});
