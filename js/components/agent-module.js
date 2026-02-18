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
        this.agentEndpoint = 'http://localhost:3000/api/chat';
        this.backendOnline = false;
    }

    get activeSession() {
        return this.sessions.find(s => s.id === this.activeSessionId);
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        // Check backend health
        this.checkBackend();
        document.addEventListener('langchange', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.querySelector('.agent-page')) this.render();
        });
    }

    async checkBackend() {
        try {
            const res = await fetch('http://localhost:3000/api/health', { signal: AbortSignal.timeout(3000) });
            this.backendOnline = res.ok;
        } catch {
            this.backendOnline = false;
        }
        // Update status dot if already rendered
        const dot = document.querySelector('.agent-status');
        if (dot) {
            const i = k => I18N.t(k);
            dot.className = `agent-status ${this.backendOnline ? 'online' : 'offline'}`;
            dot.innerHTML = `<span class="status-dot"></span>${this.backendOnline ? i('agent.status.online') : i('agent.status.offline')}`;
        }
    }

    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        const i = k => I18N.t(k);
        const isOnline = this.backendOnline;

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
                        <div class="cap-title" style="margin-top:12px">Quick Actions</div>
                        <div class="quick-actions">
                            <button class="quick-action-btn" data-action="daily_brief">📋 ${I18N.currentLang === 'zh' ? '每日简报' : 'Daily Brief'}</button>
                            <button class="quick-action-btn" data-action="get_schedule">📅 ${I18N.currentLang === 'zh' ? '今日日程' : 'Schedule'}</button>
                            <button class="quick-action-btn" data-action="get_tasks">✅ ${I18N.currentLang === 'zh' ? '任务列表' : 'Tasks'}</button>
                            <button class="quick-action-btn" data-action="get_workflow">🔄 ${I18N.currentLang === 'zh' ? '工作流' : 'Workflow'}</button>
                            <button class="quick-action-btn" data-action="get_research_status">🔬 ${I18N.currentLang === 'zh' ? '科研进度' : 'Research'}</button>
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
        const zh = I18N.currentLang === 'zh';
        return `
            <div class="chat-welcome">
                <div class="welcome-icon">🤖</div>
                <div class="welcome-text">
                    <p class="welcome-greeting">${zh
                        ? '你好，我是你的<strong>个人科研助理</strong>。'
                        : "Hi, I'm your <strong>Personal Research Assistant</strong>."}</p>
                    <p>${zh
                        ? '我基于 <strong>OpenClaw</strong> 智能体框架构建，专为陈实的科研与生活工作流设计。'
                        : "Built on the <strong>OpenClaw</strong> agent framework, designed specifically for Shi Chen's research workflow."}</p>
                    <div class="welcome-about">
                        <div class="about-item">🎯 <strong>${zh ? '设计理念' : 'Design Philosophy'}</strong>：${zh
                            ? '以你为中心，逐渐理解你的研究方向、思维习惯和偏好，成为真正懂你的助手。'
                            : 'You-centered. I gradually learn your research focus and thinking style to become an assistant that truly understands you.'}</div>
                        <div class="about-item">🔬 <strong>${zh ? '科研支持' : 'Research Support'}</strong>：${zh
                            ? '文献综述、论文解读、实验设计、数据分析——覆盖科研全流程。'
                            : 'Literature review, paper analysis, experiment design, data analysis — covering the full research pipeline.'}</div>
                        <div class="about-item">🌱 <strong>${zh ? '持续成长' : 'Continuous Growth'}</strong>：${zh
                            ? '随着对话积累，我会越来越了解你的需求和风格。'
                            : 'As our conversations accumulate, I\'ll better understand your needs and style.'}</div>
                    </div>
                    <p class="welcome-hint">${zh ? '今天想从哪里开始？' : 'Where would you like to start today?'}</p>
                </div>
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

        // Quick action buttons
        document.querySelector('.quick-actions')?.addEventListener('click', async e => {
            const btn = e.target.closest('.quick-action-btn');
            if (!btn) return;
            const action = btn.dataset.action;
            await this.runQuickAction(action);
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
            // If tool result returned, render it as a card
            if (data.toolResult) {
                const toolCard = this.renderToolCard(data.toolName, data.toolResult);
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) chatMessages.insertAdjacentHTML('beforeend', toolCard);
            }
            return data.reply || data.message || data.content;
        }
        // Placeholder reply
        await new Promise(r => setTimeout(r, 900));
        return `[Backend not connected]\n\nYou asked: "${message}"\n\nStart the backend with AgentSystem/start-backend.bat to enable AI responses.`;
    }

    async runQuickAction(action) {
        const zh = I18N.currentLang === 'zh';
        const labels = {
            daily_brief: zh ? '生成每日简报...' : 'Generating daily brief...',
            get_schedule: zh ? '获取今日日程...' : 'Fetching schedule...',
            get_tasks: zh ? '获取任务列表...' : 'Fetching tasks...',
            get_workflow: zh ? '获取工作流建议...' : 'Fetching workflow...',
            get_research_status: zh ? '获取科研进度...' : 'Fetching research status...',
        };
        const userMsg = labels[action] || action;

        const session = this.activeSession;
        if (session.messages.length === 0) {
            session.title = userMsg.slice(0, 20);
            const titleEl = document.getElementById('chat-title');
            if (titleEl) titleEl.textContent = session.title;
            this.refreshSessionList();
        }

        session.messages.push({ role: 'user', content: userMsg });
        this.appendMessage({ role: 'user', content: userMsg });

        const chatMessages = document.getElementById('chat-messages');
        chatMessages?.insertAdjacentHTML('beforeend', this.renderThinking());
        this.scrollToBottom();
        this.setInputDisabled(true);

        try {
            // Call tool endpoint directly
            const toolEndpointMap = {
                daily_brief: { url: 'http://localhost:3000/api/agent/daily-brief', method: 'POST' },
                get_schedule: { url: 'http://localhost:3000/api/agent/schedule', method: 'GET' },
                get_tasks: { url: 'http://localhost:3000/api/agent/tasks', method: 'GET' },
                get_workflow: { url: 'http://localhost:3000/api/agent/workflow', method: 'GET' },
                get_research_status: { url: 'http://localhost:3000/api/agent/research-status', method: 'GET' },
            };
            const endpoint = toolEndpointMap[action];
            let toolData = null;
            if (endpoint) {
                const res = await fetch(endpoint.url, { method: endpoint.method, headers: { 'Content-Type': 'application/json' } });
                if (res.ok) toolData = await res.json();
            }

            document.getElementById('thinking-msg')?.remove();
            if (toolData) {
                const card = this.renderToolCard(action, toolData);
                chatMessages?.insertAdjacentHTML('beforeend', card);
                session.messages.push({ role: 'assistant', content: `[Tool: ${action}]` });
            } else {
                this.appendMessage({ role: 'assistant', content: I18N.t('agent.error') });
            }
        } catch {
            document.getElementById('thinking-msg')?.remove();
            this.appendMessage({ role: 'assistant', content: zh ? '后端未连接，请先启动 AgentSystem/start-backend.bat' : 'Backend not connected. Please start AgentSystem/start-backend.bat' });
        } finally {
            this.setInputDisabled(false);
            this.scrollToBottom();
        }
    }

    renderToolCard(toolName, data) {
        const zh = I18N.currentLang === 'zh';
        let content = '';

        if (toolName === 'get_schedule' || toolName === 'daily_brief') {
            const items = data.schedule || [];
            const scheduleHtml = items.map(s =>
                `<div class="tool-schedule-item">
                    <span class="tool-time">${s.time}</span>
                    <span class="tool-task">${s.task}</span>
                    <span class="tool-type tool-type-${s.type}">${s.type}</span>
                </div>`
            ).join('');

            if (toolName === 'daily_brief') {
                const highlights = (data.highlights || []).map(h => `<div class="tool-highlight">${h}</div>`).join('');
                content = `
                    <div class="tool-card-header">📋 ${data.date || ''} ${data.greeting || ''}</div>
                    <p class="tool-summary">${data.summary || ''}</p>
                    <div class="tool-progress">
                        <span class="tool-stat done">✅ ${data.progress?.completed || 0}</span>
                        <span class="tool-stat wip">🔄 ${data.progress?.inProgress || 0}</span>
                        <span class="tool-stat pending">⏳ ${data.progress?.pending || 0}</span>
                    </div>
                    <div class="tool-highlights">${highlights}</div>
                    <p class="tool-recommendation">💡 ${data.recommendation || ''}</p>
                `;
            } else {
                content = `
                    <div class="tool-card-header">📅 ${zh ? '今日日程' : "Today's Schedule"} — ${data.date || ''}</div>
                    <div class="tool-schedule">${scheduleHtml}</div>
                    ${data.reminder ? `<p class="tool-recommendation">💡 ${data.reminder}</p>` : ''}
                `;
            }
        } else if (toolName === 'get_tasks') {
            const taskHtml = (data.tasks || []).map(t =>
                `<div class="tool-task-item priority-${t.priority}">
                    <span class="tool-task-status">${t.status === 'completed' ? '✅' : t.status === 'in-progress' ? '🔄' : '⏳'}</span>
                    <span class="tool-task-title">${t.title}</span>
                    <span class="tool-task-priority">${t.priority}</span>
                </div>`
            ).join('');
            content = `
                <div class="tool-card-header">✅ ${zh ? '任务列表' : 'Task List'} (${data.total || 0} ${zh ? '项' : 'items'})</div>
                <div class="tool-tasks">${taskHtml}</div>
            `;
        } else if (toolName === 'get_workflow') {
            const stepHtml = (data.recommendedFlow || []).map(s =>
                `<div class="tool-workflow-step status-${s.status}">
                    <span class="step-num">${s.step}</span>
                    <span class="step-action">${s.action}</span>
                    <span class="step-agent">${s.agent}</span>
                    <span class="step-status">${s.status === 'completed' ? '✅' : s.status === 'in-progress' ? '🔄' : '⏳'}</span>
                </div>`
            ).join('');
            content = `
                <div class="tool-card-header">🔄 ${zh ? '工作流' : 'Workflow'} — ${data.currentStage || ''}</div>
                <div class="tool-workflow">${stepHtml}</div>
                <p class="tool-recommendation">➡️ ${data.nextAction || ''}</p>
            `;
        } else if (toolName === 'get_research_status') {
            const projHtml = (data.projects || []).map(p =>
                `<div class="tool-project-item">
                    <div class="tool-project-name">${p.name}</div>
                    <div class="tool-project-bar"><div class="tool-project-fill" style="width:${p.progress}%"></div></div>
                    <div class="tool-project-meta">${p.progress}% — ${p.nextMilestone}</div>
                </div>`
            ).join('');
            content = `
                <div class="tool-card-header">🔬 ${zh ? '科研进度' : 'Research Status'}</div>
                <div class="tool-projects">${projHtml}</div>
            `;
        } else {
            content = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }

        return `
            <div class="chat-message assistant">
                <div class="msg-avatar">🤖</div>
                <div class="msg-bubble tool-result-card">${content}</div>
            </div>
        `;
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
