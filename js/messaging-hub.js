/**
 * Patient Communication Hub JavaScript
 * Handles secure messaging functionality
 */

class MessagingHub {
    constructor() {
        this.currentConversation = null;
        this.currentUser = null;
        this.messages = [];
        this.conversations = [];
        this.unreadCount = 0;
        this.messageRefreshInterval = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCurrentUser();
        await this.loadConversations();
        this.startMessageRefresh();
    }

    setupEventListeners() {
        // Send message on Enter key
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Send button click
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Search conversations
        const searchInput = document.getElementById('conversation-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchConversations(e.target.value));
        }
    }

    async loadCurrentUser() {
        try {
            const response = await fetch('/php/session-auth.php?check_auth=1');
            const data = await response.json();
            if (data.authenticated) {
                this.currentUser = {
                    id: data.user.id,
                    type: data.user.type,
                    name: data.user.name
                };
            }
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }

    async loadConversations() {
        try {
            const response = await fetch('/php/messaging-api.php?action=get_conversations');
            const conversations = await response.json();
            this.conversations = conversations;
            this.displayConversations(conversations);
            await this.updateUnreadCount();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    displayConversations(conversations) {
        const container = document.getElementById('conversations-list');
        if (!container) return;

        if (conversations.length === 0) {
            container.innerHTML = `
                <div class="no-conversations">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet</p>
                    <small>Start messaging with your healthcare providers</small>
                </div>
            `;
            return;
        }

        container.innerHTML = conversations.map(conv => this.createConversationItem(conv)).join('');
    }

    createConversationItem(conversation) {
        const isDoctor = conversation.doctor_id !== undefined;
        const name = isDoctor ? conversation.doctor_name : conversation.patient_name;
        const subtitle = isDoctor ? conversation.specialty : conversation.email;
        const userId = isDoctor ? conversation.doctor_id : conversation.patient_id;
        const userType = isDoctor ? 'doctor' : 'patient';
        const unreadBadge = conversation.unread_count > 0 ? 
            `<span class="unread-badge">${conversation.unread_count}</span>` : '';
        
        const lastMessage = conversation.last_message || 'No messages yet';
        const lastTime = conversation.last_message_time ? 
            this.formatMessageTime(conversation.last_message_time) : '';

        return `
            <div class="conversation-item ${this.currentConversation?.id === userId ? 'active' : ''}" 
                 onclick="messagingHub.selectConversation(${userId}, '${userType}', '${name}')">
                <div class="conversation-avatar">
                    ${conversation.photo_url ? 
                        `<img src="${conversation.photo_url}" alt="${name}">` :
                        `<div class="avatar-placeholder">${name.charAt(0)}</div>`
                    }
                    ${unreadBadge}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4>${name}</h4>
                        <span class="message-time">${lastTime}</span>
                    </div>
                    <p class="conversation-subtitle">${subtitle}</p>
                    <p class="last-message">${this.truncateMessage(lastMessage)}</p>
                </div>
            </div>
        `;
    }

    async selectConversation(userId, userType, userName) {
        this.currentConversation = {
            id: userId,
            type: userType,
            name: userName
        };

        // Update UI
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Update chat header
        this.updateChatHeader(userName, userType);

        // Load messages
        await this.loadMessages(userId, userType);

        // Show chat area
        document.getElementById('chat-area').style.display = 'flex';
        document.getElementById('no-conversation-selected').style.display = 'none';
    }

    updateChatHeader(userName, userType) {
        const header = document.getElementById('chat-header');
        if (header) {
            header.innerHTML = `
                <div class="chat-header-info">
                    <div class="chat-avatar">
                        <div class="avatar-placeholder">${userName.charAt(0)}</div>
                    </div>
                    <div class="chat-details">
                        <h3>${userName}</h3>
                        <span class="user-type">${this.capitalizeFirst(userType)}</span>
                    </div>
                </div>
                <div class="chat-actions">
                    <button class="btn btn-sm btn-outline" onclick="messagingHub.viewProfile(${this.currentConversation.id}, '${userType}')">
                        <i class="fas fa-user"></i> View Profile
                    </button>
                </div>
            `;
        }
    }

    async loadMessages(userId, userType) {
        try {
            const response = await fetch(`/php/messaging-api.php?action=get_messages&other_user_id=${userId}&other_user_type=${userType}`);
            const messages = await response.json();
            this.messages = messages;
            this.displayMessages(messages);
            this.scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    displayMessages(messages) {
        const container = document.getElementById('messages-container');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-comment-dots"></i>
                    <p>No messages yet</p>
                    <small>Start the conversation by sending a message</small>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(message => this.createMessageBubble(message)).join('');
    }

    createMessageBubble(message) {
        const isCurrentUser = message.sender_id == this.currentUser.id && 
                             message.sender_type === this.currentUser.type;
        const messageClass = isCurrentUser ? 'message-sent' : 'message-received';
        const time = this.formatMessageTime(message.created_at);

        return `
            <div class="message-bubble ${messageClass}">
                <div class="message-content">
                    <p>${this.escapeHtml(message.message)}</p>
                    <div class="message-meta">
                        <span class="message-time">${time}</span>
                        ${isCurrentUser && message.is_read ? '<i class="fas fa-check-double read-indicator"></i>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();

        if (!message || !this.currentConversation) return;

        try {
            const response = await fetch('/php/messaging-api.php?action=send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: this.currentConversation.id,
                    receiver_type: this.currentConversation.type,
                    message: message,
                    message_type: 'text'
                })
            });

            const sentMessage = await response.json();
            
            if (sentMessage.id) {
                // Add message to UI
                this.messages.push(sentMessage);
                this.displayMessages(this.messages);
                this.scrollToBottom();
                
                // Clear input
                input.value = '';
                
                // Refresh conversations to update last message
                await this.loadConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message', 'error');
        }
    }

    async updateUnreadCount() {
        try {
            const response = await fetch('/php/messaging-api.php?action=get_unread_count');
            const data = await response.json();
            this.unreadCount = data.unread_count || 0;
            this.updateUnreadBadge();
        } catch (error) {
            console.error('Error updating unread count:', error);
        }
    }

    updateUnreadBadge() {
        const badge = document.getElementById('messages-unread-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    searchConversations(searchTerm) {
        const filteredConversations = this.conversations.filter(conv => {
            const name = conv.doctor_name || conv.patient_name || '';
            const specialty = conv.specialty || '';
            const email = conv.email || '';
            
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   email.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        this.displayConversations(filteredConversations);
    }

    startMessageRefresh() {
        // Refresh messages every 10 seconds if in active conversation
        this.messageRefreshInterval = setInterval(async () => {
            if (this.currentConversation) {
                await this.loadMessages(this.currentConversation.id, this.currentConversation.type);
            }
            await this.updateUnreadCount();
        }, 10000);
    }

    stopMessageRefresh() {
        if (this.messageRefreshInterval) {
            clearInterval(this.messageRefreshInterval);
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    viewProfile(userId, userType) {
        // Implementation depends on existing profile viewing functionality
        if (userType === 'doctor') {
            if (window.patientDashboard) {
                window.patientDashboard.viewDoctorProfile(userId);
            }
        }
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else if (diff < 604800000) { // Less than 1 week
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    truncateMessage(message, length = 50) {
        return message.length > length ? message.substring(0, length) + '...' : message;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize messaging hub when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('messaging-hub')) {
        window.messagingHub = new MessagingHub();
    }
});