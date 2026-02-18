/**
 * Personal Agent 模块
 * AI 科研助理完整前端
 */
class AgentModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.sessions = [{ id: 'default', title: 'New Chat', messages: [] }];
        this.activeSessionId = 'default';
        this.isLoading = false;
        this.isInitialized = false;
        this.agentEndpoint = null; // 后端接入后配置此 URL
    }

    get activeSession() {
        return this.sessions.find(s => s.id === this.activeSessionId);
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        document.addEventListener('langchange', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.querySelector('.agent-page')) this.render();
        });
    }

    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        const i = k => I18N.t(k);
        const isOnline = !!this.agentEndpoint;

        mainContent.innerHTML = `
            <div class="agent-page">
                <!-- 侧边栏 -->
                <aside class="agent-sidebar">
                    <div class="agent-sidebar-header">
                        <span class="agent-logo">🤖</span>
                        <div>
                            <div class="agent-name">${i('agent.title')}</div>
                            <div class="agent-status ${isOnline ? 'online' : 'offline'}">
                                <span class="status-dot"></span>
                                ${isOnline ? i('agent.status.online') : i('agent.status.offline')}
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-accent agent-new-btn" id="agent-new-chat">
                        + ${i('agent.newChat')}
                    </button>

                    <div class="agent-sessions" id="agent-sessions">
                        ${this.renderSessionList()}
                    </div>

                    <div class="agent-capabilities">
                        <div class="cap-title">${i('agent.capabilities.title')}</div>
                        <div class="cap-list">
                            <div class="cap-item">${i('agent.cap1')}</div>
                            <div class="cap-item">${i('agent.cap2')}</div>
                            <div class="cap-item">${i('agent.cap3')}</div>
                            <div class="cap-item">${i('agent.cap4')}</div>
                        </div>
                    </div>
                </aside>

                <!-- 主聊天区 -->
                <div class="agent-main">
                    <div class="agent-chat-header">
                        <span class="agent-chat-title" id="chat-title">${this.activeSession.title}</span>
                        <button class="btn btn-ghost btn-sm" id="agent-clear" title="${i('agent.clearChat')}">
                            🗑 ${i('agent.clearChat')}
                        </button>
                    </div>

                    <div class="chat-messages" id="chat-messages">
                        ${this.activeSession.messages.length === 0
                            ? this.renderWelcome()
                            : this.activeSession.messages.map(m => this.renderMessage(m)).join('')}
                    </div>

                    <div class="chat-input-area">
                        <div class="chat-input-wrapper">
                            <textarea
                                id="chat-input"
                                class="chat-input"
                                placeholder="${i('agent.inputPlaceholder')}"
                                rows="1"
                            ></textarea>
                            <button class="chat-send-btn" id="chat-send" aria-label="${i('agent.send')}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.scrollToBottom();
    }

    renderSessionList() {
        return this.sessions.map(s => `
            <div class="session-item ${s.id === this.activeSessionId ? 'active' : ''}" data-id="${s.id}">
                <span class="session-icon">💬</span>
                <span class="session-title">${this.escapeHtml(s.title)}</span>
            </div>
        `).join('');
    }

    renderWelcome() {
        return `
            <div class="chat-welcome">
                <div class="welcome-icon">🤖</div>
                <p>${I18N.t('agent.welcome')}</p>
            </div>
        `;
    }

    renderMessage(msg) {
        const isUser = msg.role === 'user';
        return `
            <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                ${!isUser ? '<div class="msg-avatar">🤖</div>' : ''}
                <div class="msg-bubble">${this.formatContent(msg.content)}</div>
                ${isUser ? '<div class="msg-avatar user-avatar">👤</div>' : ''}
            </div>
        `;
    }

    renderThinking() {
        return `
            <div class="chat-message assistant" id="thinking-msg">
                <div class="msg-avatar">🤖</div>
                <div class="msg-bubble thinking-bubble">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('agent-clear')?.addEventListener('click', () => this.clearChat());
        document.getElementById('agent-new-chat')?.addEventListener('click', () => this.newChat());

        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
            });
            // 自动调整高度
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }

        // 会话切换
        document.getElementById('agent-sessions')?.addEventListener('click', e => {
            const item = e.target.closest('.session-item');
            if (item) this.switchSession(item.dataset.id);
        });
    }

    async sendMessage() {
        if (this.isLoading) return;
        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';

        const session = this.activeSession;
        // 更新会话标题（取第一条消息前20字）
        if (session.messages.length === 0) {
            session.title = text.slice(0, 20) + (text.length > 20 ? '…' : '');
            const titleEl = document.getElementById('chat-title');
            if (titleEl) titleEl.textContent = session.title;
            this.refreshSessionList();
        }

        session.messages.push({ role: 'user', content: text });
        this.appendMessage({ role: 'user', content: text });

        const chatMessages = document.getElementById('chat-messages');
        chatMessages?.insertAdjacentHTML('beforeend', this.renderThinking());
        this.scrollToBottom();

        this.isLoading = true;
        this.setInputDisabled(true);

        try {
            const reply = await this.callAgent(text, session.messages);
            session.messages.push({ role: 'assistant', content: reply });
            document.getElementById('thinking-msg')?.remove();
            this.appendMessage({ role: 'assistant', content: reply });
        } catch {
            document.getElementById('thinking-msg')?.remove();
            this.appendMessage({ role: 'assistant', content: I18N.t('agent.error') });
        } finally {
            this.isLoading = false;
            this.setInputDisabled(false);
            this.scrollToBottom();
            document.getElementById('chat-input')?.focus();
        }
    }

    async callAgent(message, history) {
        if (this.agentEndpoint) {
            const res = await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: history.slice(-10) })
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            return data.reply || data.message || data.content;
        }
        // 占位回复
        await new Promise(r => setTimeout(r, 900));
        return `[Backend not connected]\n\nYou asked: "${message}"\n\nOnce the OpenClaw agent system is integrated, I'll provide intelligent responses here.`;
    }

    appendMessage(msg) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        // 移除欢迎屏
        chatMessages.querySelector('.chat-welcome')?.remove();
        chatMessages.insertAdjacentHTML('beforeend', this.renderMessage(msg));
        this.scrollToBottom();
    }

    clearChat() {
        const session = this.activeSession;
        session.messages = [];
        session.title = 'New Chat';
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = this.renderWelcome();
        const titleEl = document.getElementById('chat-title');
        if (titleEl) titleEl.textContent = I18N.t('agent.newChat');
        this.refreshSessionList();
    }

    newChat() {
        const id = 'session-' + Date.now();
        this.sessions.unshift({ id, title: 'New Chat', messages: [] });
        this.activeSessionId = id;
        this.render();
    }

    switchSession(id) {
        this.activeSessionId = id;
        this.render();
    }

    refreshSessionList() {
        const el = document.getElementById('agent-sessions');
        if (el) el.innerHTML = this.renderSessionList();
    }

    scrollToBottom() {
        const el = document.getElementById('chat-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    setInputDisabled(disabled) {
        const input = document.getElementById('chat-input');
        const btn = document.getElementById('chat-send');
        if (input) input.disabled = disabled;
        if (btn) btn.disabled = disabled;
    }

    formatContent(text) {
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

window.AgentModule = AgentModule;
