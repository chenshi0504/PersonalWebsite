/**
 * Personal Agent 模块
 * AI 科研助理界面
 */
class AgentModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.messages = [];
        this.isLoading = false;
        this.isInitialized = false;
        // Agent 后端地址，可配置
        this.agentEndpoint = null;
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // 监听语言切换，重新渲染
        document.addEventListener('langchange', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.querySelector('.agent-page')) {
                this.render();
            }
        });
    }

    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const i = (key) => I18N.t(key);

        mainContent.innerHTML = `
            <div class="agent-page">
                <div class="container">
                    <div class="agent-header">
                        <h2>${i('agent.title')}</h2>
                        <p class="agent-subtitle">${i('agent.subtitle')}</p>
                    </div>

                    <div class="agent-layout">
                        <aside class="agent-sidebar">
                            <div class="agent-capabilities">
                                <h4>${i('agent.capabilities.title')}</h4>
                                <ul>
                                    <li>${i('agent.cap1')}</li>
                                    <li>${i('agent.cap2')}</li>
                                    <li>${i('agent.cap3')}</li>
                                    <li>${i('agent.cap4')}</li>
                                </ul>
                            </div>
                            <button class="btn btn-outline btn-sm agent-clear-btn" id="agent-clear">
                                ${i('agent.clearChat')}
                            </button>
                        </aside>

                        <div class="agent-chat">
                            <div class="chat-messages" id="chat-messages">
                                ${this.messages.length === 0 ? this.renderWelcome() : this.messages.map(m => this.renderMessage(m)).join('')}
                            </div>
                            <div class="chat-input-area">
                                <textarea
                                    id="chat-input"
                                    class="chat-input"
                                    placeholder="${i('agent.inputPlaceholder')}"
                                    rows="2"
                                ></textarea>
                                <button class="btn btn-accent chat-send-btn" id="chat-send">
                                    ${i('agent.send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderWelcome() {
        return `
            <div class="chat-message assistant">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">${I18N.t('agent.welcome')}</div>
            </div>
        `;
    }

    renderMessage(msg) {
        const avatar = msg.role === 'user' ? '👤' : '🤖';
        return `
            <div class="chat-message ${msg.role}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-bubble">${this.escapeHtml(msg.content)}</div>
            </div>
        `;
    }

    renderThinking() {
        return `
            <div class="chat-message assistant thinking" id="thinking-indicator">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">
                    <span class="thinking-dots">
                        <span></span><span></span><span></span>
                    </span>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const sendBtn = document.getElementById('chat-send');
        const input = document.getElementById('chat-input');
        const clearBtn = document.getElementById('agent-clear');

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearChat());
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    async sendMessage() {
        if (this.isLoading) return;

        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        if (!text) return;

        input.value = '';

        // 添加用户消息
        this.messages.push({ role: 'user', content: text });
        this.appendMessage({ role: 'user', content: text });

        // 显示思考动画
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.insertAdjacentHTML('beforeend', this.renderThinking());
            this.scrollToBottom();
        }

        this.isLoading = true;
        this.setInputDisabled(true);

        try {
            const reply = await this.callAgent(text);
            this.messages.push({ role: 'assistant', content: reply });

            // 移除思考动画，添加回复
            document.getElementById('thinking-indicator')?.remove();
            this.appendMessage({ role: 'assistant', content: reply });
        } catch (err) {
            document.getElementById('thinking-indicator')?.remove();
            this.appendMessage({ role: 'assistant', content: I18N.t('agent.error') });
        } finally {
            this.isLoading = false;
            this.setInputDisabled(false);
            this.scrollToBottom();
        }
    }

    async callAgent(message) {
        // 如果配置了后端端点，调用真实 API
        if (this.agentEndpoint) {
            const res = await fetch(this.agentEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: this.messages.slice(-10) })
            });
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            return data.reply || data.message || data.content;
        }

        // 占位回复（后端未接入时）
        await new Promise(r => setTimeout(r, 800));
        return `[Agent backend not connected yet] You asked: "${message}"\n\nOnce the OpenClaw agent system is integrated, I'll be able to provide intelligent responses here.`;
    }

    appendMessage(msg) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        chatMessages.insertAdjacentHTML('beforeend', this.renderMessage(msg));
        this.scrollToBottom();
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    setInputDisabled(disabled) {
        const input = document.getElementById('chat-input');
        const btn = document.getElementById('chat-send');
        if (input) input.disabled = disabled;
        if (btn) btn.disabled = disabled;
    }

    clearChat() {
        this.messages = [];
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) chatMessages.innerHTML = this.renderWelcome();
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }
}

window.AgentModule = AgentModule;
