// Jamaican AI - Frontend JavaScript Implementation
// Updated for First Edition Style with Advanced Features

class JamaicanAI {
    constructor() {
        this.chatHistory = [];
        this.currentChatId = null;
        this.savedChats = this.getSavedChats();
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isWaitingForResponse = false;
        
        this.init();
    }
    
    // Use in-memory storage instead of localStorage for artifact compatibility
    getSavedChats() {
        // In a real implementation, this would connect to your backend
        return [];
    }
    
    saveChatData() {
        // In a real implementation, this would save to your backend
        console.log('Saving chat data:', this.savedChats);
    }
    
    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadChatHistory();
        this.displayWelcomeMessage();
    }
    
    setupEventListeners() {
        // Sidebar toggles
        const sidebarToggle = document.querySelector('.toggle-sidebar');
        const mobileSidebarToggle = document.querySelector('.mobile-sidebar-toggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (mobileSidebarToggle) {
            mobileSidebarToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }
        
        // Overlay click
        const overlay = document.querySelector('.overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeMobileSidebar());
        }
        
        // New chat buttons
        const newChatBtn = document.querySelector('.new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.startNewChat());
        }
        
        // Message input handling
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');
        
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea();
                this.toggleSendButton();
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Voice recognition button
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        }
        
        // Suggestion chips click handler
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const message = e.target.textContent;
                this.sendMessage(message);
            }
        });
        
        // Message action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                this.copyMessage(e.target.closest('.copy-btn') || e.target);
            }
            if (e.target.classList.contains('regenerate-btn') || e.target.closest('.regenerate-btn')) {
                this.regenerateResponse();
            }
            if (e.target.classList.contains('speak-btn') || e.target.closest('.speak-btn')) {
                const messageContent = e.target.closest('.message-content');
                const text = this.extractTextFromMessage(messageContent);
                this.speakResponse(text);
            }
        });
    }
    
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('messageInput').value = transcript;
                this.autoResizeTextarea();
                this.toggleSendButton();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton();
            };
        }
    }
    
    // UI Control Methods
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }
    
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        }
    }
    
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        }
    }
    
    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }
    
    toggleSendButton() {
        const sendBtn = document.querySelector('.send-btn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn && messageInput) {
            const hasText = messageInput.value.trim().length > 0;
            sendBtn.disabled = !hasText || this.isWaitingForResponse;
        }
    }
    
    // Voice Recognition Methods
    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.showNotification('Speech recognition not supported in this browser', 'error');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
            this.isListening = true;
            this.updateVoiceButton();
        }
    }
    
    updateVoiceButton() {
        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            const icon = voiceBtn.querySelector('i');
            if (icon) {
                icon.className = this.isListening ? 'fas fa-stop' : 'fas fa-microphone';
            }
            voiceBtn.style.color = this.isListening ? '#ef4444' : '';
        }
    }
    
    speakResponse(text) {
        if (this.synth && text) {
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            
            // Try to find a suitable voice
            const voices = this.synth.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('English') && 
                (voice.name.includes('US') || voice.name.includes('UK'))
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            this.synth.speak(utterance);
        }
    }
    
    // Chat Management Methods
    startNewChat() {
        this.currentChatId = Date.now().toString();
        this.chatHistory = [];
        this.clearChatMessages();
        this.displayWelcomeMessage();
        this.updateActiveChatItem(null);
        this.closeMobileSidebar();
    }
    
    displayWelcomeMessage() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
        }
    }
    
    hideWelcomeMessage() {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
    }
    
    clearChatMessages() {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            const welcomeMessage = chatMessages.querySelector('.welcome-message');
            chatMessages.innerHTML = '';
            if (welcomeMessage) {
                chatMessages.appendChild(welcomeMessage);
            }
        }
    }
    
    loadChatHistory() {
        this.updateChatSidebar();
    }
    
    updateChatSidebar() {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        this.savedChats.forEach(chat => {
            const chatItem = this.createChatItem(chat);
            chatList.appendChild(chatItem);
        });
    }
    
    createChatItem(chat) {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.dataset.chatId = chat.id;
        
        const title = chat.title || 'New Chat';
        const timestamp = new Date(chat.timestamp).toLocaleDateString();
        
        item.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-title">${this.escapeHtml(title)}</div>
                <div class="chat-timestamp">${timestamp}</div>
            </div>
            <div class="chat-actions">
                <button class="chat-action-btn delete-chat" data-chat-id="${chat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-actions')) {
                this.loadChat(chat.id);
            }
        });
        
        const deleteBtn = item.querySelector('.delete-chat');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteChat(chat.id);
        });
        
        return item;
    }
    
    updateActiveChatItem(chatId) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.classList.toggle('active', item.dataset.chatId === chatId);
        });
    }
    
    loadChat(chatId) {
        const chat = this.savedChats.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.chatHistory = [...chat.messages];
        this.renderChatHistory();
        this.updateActiveChatItem(chatId);
        this.closeMobileSidebar();
    }
    
    deleteChat(chatId) {
        if (confirm('Are you sure you want to delete this chat?')) {
            this.savedChats = this.savedChats.filter(c => c.id !== chatId);
            this.saveChatData();
            this.updateChatSidebar();
            
            if (this.currentChatId === chatId) {
                this.startNewChat();
            }
        }
    }
    
    renderChatHistory() {
        this.hideWelcomeMessage();
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        this.chatHistory.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }
    
    // Message Handling Methods
    async sendMessage(messageText = null) {
        const messageInput = document.getElementById('messageInput');
        const message = messageText || messageInput?.value.trim();
        
        if (!message || this.isWaitingForResponse) return;
        
        // Clear input and hide welcome message
        if (messageInput) {
            messageInput.value = '';
            this.autoResizeTextarea();
        }
        this.hideWelcomeMessage();
        this.toggleSendButton();
        
        // Add user message to chat
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        this.chatHistory.push(userMessage);
        this.addMessageToChat(userMessage);
        
        // Show typing indicator
        this.showTypingIndicator();
        this.isWaitingForResponse = true;
        
        try {
            // Simulate AI response (replace with actual API call)
            const response = await this.getAIResponse(message);
            
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: response,
                timestamp: new Date()
            };
            
            this.chatHistory.push(aiMessage);
            this.hideTypingIndicator();
            this.addMessageToChat(aiMessage);
            
            // Save chat
            this.saveCurrentChat();
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.showNotification('Sorry, there was an error processing your message', 'error');
        } finally {
            this.isWaitingForResponse = false;
            this.toggleSendButton();
        }
    }
    
    async getAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Simple response generation (replace with actual AI API)
        const responses = [
            "Wah gwaan! Mi understand yuh question. Let mi help yuh with dat.",
            "Bredrin, dat's a good question! Mi a go explain it fi yuh.",
            "Big up yuself! Mi see weh yuh a ask bout. Check dis out...",
            "Yuh know say mi always ready fi help! Here's weh mi think bout dat.",
            "Respect! Dat's something weh nuff people wonder bout. Let mi break it down fi yuh."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add some context based on the message
        let contextualResponse = randomResponse;
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            contextualResponse = "Wah gwaan, bredrin! How yuh doing today? Mi ready fi help yuh with anything yuh need!";
        } else if (message.toLowerCase().includes('thanks') || message.toLowerCase().includes('thank you')) {
            contextualResponse = "No problem at all, mi friend! Mi glad fi help yuh. Anytime yuh need something, just holla at mi!";
        }
        
        return contextualResponse;
    }
    
    addMessageToChat(message) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const messageElement = this.createMessageElement(message);
        chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.dataset.messageId = message.id;
        
        const avatar = message.type === 'user' ? 
            '<div class="avatar user-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>';
        
        const actions = message.type === 'assistant' ? `
            <div class="message-actions">
                <button class="action-btn copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn speak-btn" title="Read aloud">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="action-btn regenerate-btn" title="Regenerate response">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        ` : '';
        
        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message.content)}</div>
                <div class="message-timestamp">${this.formatTimestamp(message.timestamp)}</div>
                ${actions}
            </div>
        `;
        
        return messageDiv;
    }
    
    formatMessage(text) {
        // Basic formatting - convert newlines to <br> and handle basic markdown-like syntax
        return this.escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showTypingIndicator() {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="avatar ai-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Message Action Methods
    copyMessage(button) {
        const messageContent = button.closest('.message-content');
        const messageText = this.extractTextFromMessage(messageContent);
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(messageText).then(() => {
                this.showNotification('Message copied to clipboard', 'success');
            }).catch(() => {
                this.fallbackCopy(messageText);
            });
        } else {
            this.fallbackCopy(messageText);
        }
    }
    
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Message copied to clipboard', 'success');
        } catch (err) {
            this.showNotification('Failed to copy message', 'error');
        }
        
        document.body.removeChild(textArea);
    }
    
    extractTextFromMessage(messageContent) {
        const messageText = messageContent.querySelector('.message-text');
        return messageText ? messageText.textContent : '';
    }
    
    async regenerateResponse() {
        if (this.chatHistory.length < 2) return;
        
        // Remove the last AI response
        const lastMessage = this.chatHistory[this.chatHistory.length - 1];
        if (lastMessage.type === 'assistant') {
            this.chatHistory.pop();
            
            // Remove from UI
            const lastMessageElement = document.querySelector(`[data-message-id="${lastMessage.id}"]`);
            if (lastMessageElement) {
                lastMessageElement.remove();
            }
            
            // Get the user's last message and regenerate response
            const lastUserMessage = this.chatHistory[this.chatHistory.length - 1];
            if (lastUserMessage && lastUserMessage.type === 'user') {
                this.showTypingIndicator();
                this.isWaitingForResponse = true;
                
                try {
                    const response = await this.getAIResponse(lastUserMessage.content);
                    
                    const aiMessage = {
                        id: Date.now().toString(),
                        type: 'assistant',
                        content: response,
                        timestamp: new Date()
                    };
                    
                    this.chatHistory.push(aiMessage);
                    this.hideTypingIndicator();
                    this.addMessageToChat(aiMessage);
                    this.saveCurrentChat();
                    
                } catch (error) {
                    console.error('Error regenerating response:', error);
                    this.hideTypingIndicator();
                    this.showNotification('Failed to regenerate response', 'error');
                } finally {
                    this.isWaitingForResponse = false;
                    this.toggleSendButton();
                }
            }
        }
    }
    
    // Chat Saving Methods
    saveCurrentChat() {
        if (!this.currentChatId || this.chatHistory.length === 0) return;
        
        const chatTitle = this.generateChatTitle();
        const existingChatIndex = this.savedChats.findIndex(c => c.id === this.currentChatId);
        
        const chatData = {
            id: this.currentChatId,
            title: chatTitle,
            messages: [...this.chatHistory],
            timestamp: Date.now()
        };
        
        if (existingChatIndex >= 0) {
            this.savedChats[existingChatIndex] = chatData;
        } else {
            this.savedChats.unshift(chatData);
        }
        
        // Keep only the latest 50 chats
        if (this.savedChats.length > 50) {
            this.savedChats = this.savedChats.slice(0, 50);
        }
        
        this.saveChatData();
        this.updateChatSidebar();
    }
    
    generateChatTitle() {
        if (this.chatHistory.length === 0) return 'New Chat';
        
        const firstUserMessage = this.chatHistory.find(m => m.type === 'user');
        if (!firstUserMessage) return 'New Chat';
        
        let title = firstUserMessage.content.substring(0, 50);
        if (firstUserMessage.content.length > 50) {
            title += '...';
        }
        
        return title;
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jamaicanAI = new JamaicanAI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JamaicanAI;
}