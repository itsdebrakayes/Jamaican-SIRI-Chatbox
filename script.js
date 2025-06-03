// Jamaican AI - Frontend JavaScript Implementation
// Ready for backend integration

class JamaicanAI {
    constructor() {
        this.chatHistory = [];
        this.currentChatId = null;
        this.savedChats = JSON.parse(localStorage.getItem('jamaicanAI_chats') || '[]');
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isWaitingForResponse = false;
        
        this.init();
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
        
        const newChatHeader = document.querySelector('.new-chat-header');
        if (newChatHeader) {
            newChatHeader.addEventListener('click', () => this.startNewChat());
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
            voiceBtn.style.color = this.isListening ? '#ef4444' : '#666';
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
            welcomeMessage.style.display = 'flex';
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
    
    // Message Handling Methods
    async sendMessage(message = null) {
        const messageInput = document.getElementById('messageInput');
        const text = message || messageInput?.value.trim();
        
        if (!text || this.isWaitingForResponse) return;
        
        // Hide welcome message on first message
        this.hideWelcomeMessage();
        
        // Add user message to UI
        this.addMessage('user', text);
        
        // Clear input
        if (messageInput) {
            messageInput.value = '';
            messageInput.style.height = 'auto';
        }
        
        // Update state
        this.isWaitingForResponse = true;
        this.toggleSendButton();
        
        // Add message to history
        this.chatHistory.push({ 
            role: 'user', 
            content: text, 
            timestamp: new Date().toISOString() 
        });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // TODO: Replace with actual API call to your backend
            const response = await this.callBackendAPI(text);
            
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
            
            // Add response to history
            this.chatHistory.push({ 
                role: 'assistant', 
                content: response, 
                timestamp: new Date().toISOString() 
            });
            
            this.saveChatHistory();
            
        } catch (error) {
            console.error('Error getting response:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', "Sorry, mi having some technical difficulties right now. Please try again later!");
        } finally {
            this.isWaitingForResponse = false;
            this.toggleSendButton();
        }
    }
    
    // TODO: Replace this with your actual backend API call
    async callBackendAPI(message) {
        // Simulate API call for now - replace with your backend endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("This is a placeholder response. Connect this to your Jamaican AI backend!");
            }, 1000 + Math.random() * 2000);
        });
        
        /* 
        // Example of how to integrate with your backend:
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                chatId: this.currentChatId,
                history: this.chatHistory
            })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        return data.response;
        */
    }
    
    addMessage(role, content) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Handle message content (could be enhanced for markdown/formatting)
        const textDiv = document.createElement('div');
        textDiv.textContent = content;
        messageContent.appendChild(textDiv);
        
        // Add action buttons
        const messageActions = this.createMessageActions(role, content);
        messageContent.appendChild(messageActions);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    createMessageActions(role, content) {
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        
        if (role === 'assistant') {
            messageActions.innerHTML = `
                <button class="action-btn copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn regenerate-btn" title="Regenerate response">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="action-btn speak-btn" title="Speak message">
                    <i class="fas fa-volume-up"></i>
                </button>
            `;
        } else {
            messageActions.innerHTML = `
                <button class="action-btn copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
            `;
        }
        
        return messageActions;
    }
    
    showTypingIndicator() {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
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
        const text = this.extractTextFromMessage(messageContent);
        
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.color = '#10a37f';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showNotification('Failed to copy message', 'error');
        });
    }
    
    extractTextFromMessage(messageContent) {
        const textDiv = messageContent.querySelector('div:not(.message-actions)');
        return textDiv ? textDiv.textContent.trim() : '';
    }
    
    async regenerateResponse() {
        if (this.isWaitingForResponse) return;
        
        const messages = document.querySelectorAll('.message');
        if (messages.length >= 2) {
            const lastUserMessage = messages[messages.length - 2];
            const userText = this.extractTextFromMessage(lastUserMessage.querySelector('.message-content'));
            
            // Remove last assistant message from UI and history
            const lastAssistantMessage = messages[messages.length - 1];
            lastAssistantMessage.remove();
            this.chatHistory.pop();
            
            // Generate new response
            this.isWaitingForResponse = true;
            this.showTypingIndicator();
            
            try {
                const response = await this.callBackendAPI(userText);
                this.hideTypingIndicator();
                this.addMessage('assistant', response);
                
                this.chatHistory.push({ 
                    role: 'assistant', 
                    content: response, 
                    timestamp: new Date().toISOString() 
                });
                
                this.saveChatHistory();
            } catch (error) {
                console.error('Error regenerating response:', error);
                this.hideTypingIndicator();
                this.addMessage('assistant', "Sorry, mi having some technical difficulties right now. Please try again later!");
            } finally {
                this.isWaitingForResponse = false;
            }
        }
    }
    
    // Chat History Management
    saveChatHistory() {
        if (this.currentChatId && this.chatHistory.length > 0) {
            const existingChatIndex = this.savedChats.findIndex(chat => chat.id === this.currentChatId);
            const chatData = {
                id: this.currentChatId,
                title: this.generateChatTitle(),
                messages: this.chatHistory,
                timestamp: new Date().toISOString()
            };
            
            if (existingChatIndex >= 0) {
                this.savedChats[existingChatIndex] = chatData;
            } else {
                this.savedChats.unshift(chatData);
            }
            
            // Keep only last 50 chats
            this.savedChats = this.savedChats.slice(0, 50);
            localStorage.setItem('jamaicanAI_chats', JSON.stringify(this.savedChats));
            this.updateChatList();
        }
    }
    
    generateChatTitle() {
        const userMessages = this.chatHistory.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
            const firstMessage = userMessages[0].content;
            return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        }
        return 'New Chat';
    }
    
    loadChatHistory() {
        this.updateChatList();
    }
    
    updateChatList() {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;
        
        chatList.innerHTML = '';
        
        this.savedChats.forEach(chat => {
            const chatItem = document.createElement('button');
            chatItem.className = 'chat-item';
            chatItem.textContent = chat.title;
            chatItem.dataset.chatId = chat.id;
            chatItem.addEventListener('click', () => this.loadChat(chat.id));
            chatList.appendChild(chatItem);
        });
    }
    
    loadChat(chatId) {
        const chat = this.savedChats.find(c => c.id === chatId);
        if (chat) {
            this.currentChatId = chatId;
            this.chatHistory = [...chat.messages];
            this.displayChat();
            this.updateActiveChatItem(chatId);
            this.closeMobileSidebar();
        }
    }
    
    displayChat() {
        this.clearChatMessages();
        this.hideWelcomeMessage();
        
        this.chatHistory.forEach(message => {
            this.addMessage(message.role, message.content);
        });
    }
    
    updateActiveChatItem(chatId) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.chatId === chatId) {
                item.classList.add('active');
            }
        });
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        // Simple notification system - you can enhance this
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10a37f'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the Jamaican AI when the page loads
let jamaicanAI;

document.addEventListener('DOMContentLoaded', () => {
    jamaicanAI = new JamaicanAI();
    
    // Global function for inline event handlers (if needed)
    window.jamaicanAI = jamaicanAI;
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JamaicanAI;
}