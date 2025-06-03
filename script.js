// Chat Application JavaScript
class ChatApp {
    constructor() {
        this.chats = [];
        this.currentChatId = null;
        this.messageHistory = new Map();
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadChats();
        this.setupWelcomeScreen();
        this.autoResizeTextarea();
    }

    bindEvents() {
        // Sidebar toggle events
        const toggleSidebarBtn = document.querySelector('.toggle-sidebar');
        const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
        const overlay = document.querySelector('.overlay');
        const sidebar = document.querySelector('.sidebar');

        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        }

        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.closeSidebar());
        }

        // New chat button
        const newChatBtn = document.querySelector('.new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewChat());
        }

        // Message input events
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        const voiceBtn = document.querySelector('.voice-btn');

        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
            messageInput.addEventListener('input', () => this.handleInputChange());
            messageInput.addEventListener('paste', () => {
                setTimeout(() => this.autoResizeTextarea(), 0);
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }

        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                this.handleSuggestionClick(e.target.textContent);
            }
        });

        // Chat item clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-item')) {
                const chatId = e.target.dataset.chatId;
                this.switchToChat(chatId);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        }
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        }
    }

    handleResize() {
        // Close sidebar on desktop view
        if (window.innerWidth > 768) {
            this.closeSidebar();
        }
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            timestamp: new Date(),
            messages: []
        };

        this.chats.unshift(newChat);
        this.messageHistory.set(chatId, []);
        this.currentChatId = chatId;
        
        this.updateChatList();
        this.setupWelcomeScreen();
        this.closeSidebar();
        this.saveChats();
        
        this.showNotification('New chat created');
    }

    switchToChat(chatId) {
        this.currentChatId = chatId;
        this.loadChatMessages(chatId);
        this.updateChatList();
        this.closeSidebar();
    }

    loadChatMessages(chatId) {
        const messages = this.messageHistory.get(chatId) || [];
        const messagesContainer = document.querySelector('.chat-messages');
        
        if (!messagesContainer) return;

        if (messages.length === 0) {
            this.setupWelcomeScreen();
        } else {
            messagesContainer.innerHTML = '';
            messages.forEach(message => {
                this.displayMessage(message.content, message.type, false);
            });
            this.scrollToBottom();
        }
    }

    updateChatList() {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;

        chatList.innerHTML = '';

        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            if (chat.id === this.currentChatId) {
                chatItem.classList.add('active');
            }
            chatItem.dataset.chatId = chat.id;
            chatItem.textContent = chat.title;
            chatList.appendChild(chatItem);
        });
    }

    setupWelcomeScreen() {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-header">
                    <div class="welcome-avatar">🇯🇲</div>
                    <div>
                        <div class="welcome-title">Welcome to JamAI</div>
                        <div class="welcome-subtitle">Your Jamaican AI Assistant</div>
                    </div>
                </div>
                <div class="welcome-text">
                    Hello! I'm your Jamaican AI assistant, ready to help you with questions, creative tasks, 
                    and conversations. Feel free to ask me anything or try one of the suggestions below.
                </div>
                <div class="suggestion-chips">
                    <div class="suggestion-chip">Tell me about Jamaican culture</div>
                    <div class="suggestion-chip">Help me write something creative</div>
                    <div class="suggestion-chip">Explain a complex topic</div>
                    <div class="suggestion-chip">Plan my day</div>
                    <div class="suggestion-chip">Generate some ideas</div>
                </div>
            </div>
        `;
    }

    handleSuggestionClick(suggestion) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = suggestion;
            messageInput.focus();
            this.handleInputChange();
            this.autoResizeTextarea();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput && sendBtn) {
            const hasContent = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasContent;
            
            // Update send button appearance
            if (hasContent) {
                sendBtn.style.background = 'linear-gradient(135deg, #007AFF, #0051D5)';
                sendBtn.style.color = 'white';
            } else {
                sendBtn.style.background = 'rgba(0, 0, 0, 0.1)';
                sendBtn.style.color = '#ccc';
            }
        }
        
        this.autoResizeTextarea();
    }

    autoResizeTextarea() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        // Reset height to auto to get the correct scrollHeight
        messageInput.style.height = 'auto';
        
        // Set height based on content, with min and max constraints
        const scrollHeight = messageInput.scrollHeight;
        const minHeight = 20;
        const maxHeight = 120;
        
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        messageInput.style.height = newHeight + 'px';
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const content = messageInput.value.trim();
        if (!content) return;

        // Clear input and disable send button
        messageInput.value = '';
        this.handleInputChange();

        // Ensure we have a current chat
        if (!this.currentChatId) {
            this.createNewChat();
        }

        // Display user message
        this.displayMessage(content, 'user');
        this.storeMessage(content, 'user');

        // Update chat title if it's the first message
        this.updateChatTitle(content);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate AI response (replace with actual AI integration)
            const response = await this.getAIResponse(content);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Display AI response
            this.displayMessage(response, 'ai');
            this.storeMessage(response, 'ai');
            
        } catch (error) {
            this.hideTypingIndicator();
            this.displayMessage('Sorry, I encountered an error. Please try again.', 'ai');
            this.showNotification('Error sending message', 'error');
        }

        // Focus back on input
        messageInput.focus();
    }

    displayMessage(content, type, shouldScroll = true) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);

        if (shouldScroll) {
            this.scrollToBottom();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.chat-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-message';
        typingDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    storeMessage(content, type) {
        if (!this.currentChatId) return;

        const messages = this.messageHistory.get(this.currentChatId) || [];
        messages.push({
            content,
            type,
            timestamp: new Date()
        });
        
        this.messageHistory.set(this.currentChatId, messages);
        this.saveChats();
    }

    updateChatTitle(firstMessage) {
        const chat = this.chats.find(c => c.id === this.currentChatId);
        if (chat && chat.title === 'New Chat') {
            // Use first few words of the message as title
            const words = firstMessage.split(' ').slice(0, 4);
            chat.title = words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
            this.updateChatList();
            this.saveChats();
        }
    }

    async getAIResponse(userMessage) {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simple response generation (replace with actual AI integration)
        const responses = [
            "That's an interesting question! Let me think about that...",
            "I understand what you're asking. Here's my perspective...",
            "Great point! I'd be happy to help you with that.",
            "That's a fascinating topic. Let me break it down for you...",
            "I appreciate you asking. Here's what I think...",
            "You've raised an important question. Let me explain...",
            "That's something I can definitely help you with!",
            "Interesting! I have some thoughts on that..."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add some context based on the user's message
        if (userMessage.toLowerCase().includes('jamaica')) {
            return "Jamaica is a beautiful Caribbean island nation known for its rich culture, music, and history. " + randomResponse;
        } else if (userMessage.toLowerCase().includes('help')) {
            return "I'm here to help! " + randomResponse;
        } else {
            return randomResponse + " Could you tell me more about what specifically you'd like to know?";
        }
    }

    toggleVoiceInput() {
        // Placeholder for voice input functionality
        this.showNotification('Voice input feature coming soon!');
    }

    scrollToBottom() {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    showNotification(message, type = 'info') {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add different styles based on type
        if (type === 'error') {
            notification.style.background = 'rgba(220, 53, 69, 0.9)';
        } else if (type === 'success') {
            notification.style.background = 'rgba(40, 167, 69, 0.9)';
        }

        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    loadChats() {
        try {
            const savedChats = localStorage.getItem('jamAI_chats');
            const savedMessages = localStorage.getItem('jamAI_messages');
            
            if (savedChats) {
                this.chats = JSON.parse(savedChats);
            }
            
            if (savedMessages) {
                const messagesData = JSON.parse(savedMessages);
                this.messageHistory = new Map(messagesData);
            }
            
            this.updateChatList();
        } catch (error) {
            console.error('Error loading chats:', error);
            this.chats = [];
            this.messageHistory = new Map();
        }
    }

    saveChats() {
        try {
            localStorage.setItem('jamAI_chats', JSON.stringify(this.chats));
            localStorage.setItem('jamAI_messages', JSON.stringify([...this.messageHistory]));
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Initialize the chat application
    window.chatApp = new ChatApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.chatApp) {
        // Refresh the app when user returns to the page
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    }
});

// Handle beforeunload to save state
window.addEventListener('beforeunload', () => {
    if (window.chatApp) {
        window.chatApp.saveChats();
    }
});