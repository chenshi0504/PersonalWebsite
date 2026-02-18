/**
 * Personal Agent 模块 — 科研工作站布局
 * 左：工具栏 + 文件树
 * 中：对话区
 * 右上：输出面板
 * 右下：Agent 任务反馈
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
        this.outputLines = [];   // right-top output panel
        this.agentLogs = [];     // right-bottom agent feedback
        this.activeLeftTab = 'tools'; // 'tools' | 'files'
        this.selectedModel = 'auto'; // model key or 'auto'
        this.availableModels = []; // fetched from backend
    }

    get activeSession() {
        return this.sessions.find(s => s.id === this.activeSessionId);
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.checkBackend();
        document.addEventListener('langchange', () => {
            const mc = document.getElementById('main-content');
            if (mc && mc.querySelector('.workstation')) this.render();
        });
    }

    async checkBackend() {
        try {
            const res = await fetch('http://localhost:3000/api/health', { signal: AbortSignal.timeout(3000) });
            this.backendOnline = res.ok;
            if (res.ok) {
                const data = await res.json();
                this.addLog('system', `Backend online · LLM: ${data.llm || 'unknown'}`);
                // Fetch available models
                this.fetchModels();
            }
        } catch {
            this.backendOnline = false;
            this.addLog('warn', 'Backend offline — start AgentSystem/start-backend.bat');
        }
        const dot = document.querySelector('.agent-status');
        if (dot) {
            const i = k => I18N.t(k);
            dot.className = `agent-status ${this.backendOnline ? 'online' : 'offline'}`;
            dot.innerHTML = `<span class="status-dot"></span>${this.backendOnline ? i('agent.status.online') : i('agent.status.offline')}`;
        }
    }

    async fetchModels() {
        try {
            const res = await fetch('http://localhost:3000/api/chat/models', { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
                const data = await res.json();
                this.availableModels = data.models || [];
                if (data.autoSelected) this.selectedModel = data.autoSelected;
                this.refreshModelSelector();
                this.addLog('system', `Models: ${this.availableModels.filter(m => m.available).map(m => m.key).join(', ') || 'none configured'}`);
            }
        } catch { /* silent */ }
    }

    refreshModelSelector() {
        const sel = document.getElementById('model-selector');
        if (!sel) return;
        sel.innerHTML = this.renderModelOptions();
        sel.value = this.selectedModel;
    }

    renderModelOptions() {
        const zh = I18N.currentLang === 'zh';
        const autoLabel = zh ? '自动选择' : 'Auto';
        let opts = `<option value="auto">${autoLabel}</option>`;
        if (this.availableModels.length > 0) {
            this.availableModels.forEach(m => {
                const disabled = !m.available ? ' disabled' : '';
                const tag = !m.available ? ' ⚠️' : '';
                opts += `<option value="${m.key}"${disabled}>${m.label}${tag}</option>`;
            });
        } else {
            const models = [
                { key: 'claude-opus', label: zh ? 'Claude Opus — 深度推理' : 'Claude Opus — Deep Reasoning' },
                { key: 'deepseek-v3', label: zh ? 'DeepSeek-V3 — 综合最强' : 'DeepSeek-V3 — Best Overall' },
                { key: 'deepseek-r1', label: zh ? 'DeepSeek-R1 — 深度推理' : 'DeepSeek-R1 — Deep Reasoning' },
                { key: 'qwen-max', label: zh ? 'Qwen-Max — 中文科研' : 'Qwen-Max — Chinese Research' },
            ];
            models.forEach(m => { opts += `<option value="${m.key}">${m.label}</option>`; });
        }
        return opts;
    }

    addLog(type, text) {
        const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.agentLogs.unshift({ type, text, ts });
        if (this.agentLogs.length > 50) this.agentLogs.pop();
        this.refreshLogs();
    }

    addOutput(title, content) {
        this.outputLines.unshift({ title, content, ts: new Date().toLocaleTimeString() });
        if (this.outputLines.length > 20) this.outputLines.pop();
        this.refreshOutput();
    }

    refreshLogs() {
        const el = document.getElementById('agent-logs');
        if (!el) return;
        el.innerHTML = this.agentLogs.map(l => `
            <div class="log-line log-${l.type}">
                <span class="log-ts">${l.ts}</span>
                <span class="log-text">${this.escapeHtml(l.text)}</span>
            </div>`).join('');
    }

    refreshOutput() {
        const el = document.getElementById('agent-output');
        if (!el) return;
        el.innerHTML = this.outputLines.map((o, idx) => `
            <div class="output-block">
                <div class="output-title">
                    ${o.title} <span class="output-ts">${o.ts}</span>
                    <button class="output-save-btn" data-idx="${idx}" title="保存到管理后台">💾</button>
                </div>
                <div class="output-content">${o.content}</div>
            </div>`).join('');
        // bind save buttons
        el.querySelectorAll('.output-save-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                this.saveOutputToAdmin(this.outputLines[idx]);
            });
        });
    }

    saveOutputToAdmin(output) {
        // Store in localStorage under admin-outputs key
        const key = 'agent-admin-outputs';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift({ ...output, savedAt: new Date().toISOString() });
        if (existing.length > 100) existing.pop();
        localStorage.setItem(key, JSON.stringify(existing));
        this.addLog('success', `已保存到管理后台: ${output.title}`);
        // Show brief notification
        const zh = I18N.currentLang === 'zh';
        if (this.notificationManager) {
            this.notificationManager.show(zh ? '已保存到管理后台' : 'Saved to Admin', 'success');
        }
    }

    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        const i = k => I18N.t(k);
        const zh = I18N.currentLang === 'zh';
        const isOnline = this.backendOnline;

        mainContent.innerHTML = `
        <div class="workstation">

            <!-- ===== LEFT PANEL ===== -->
            <aside class="ws-left">
                <div class="ws-left-header">
                    <div class="ws-agent-brand">
                        <span class="ws-logo">🤖</span>
                        <div>
                            <div class="ws-agent-name">${i('agent.title')}</div>
                            <div class="agent-status ${isOnline ? 'online' : 'offline'}">
                                <span class="status-dot"></span>
                                ${isOnline ? i('agent.status.online') : i('agent.status.offline')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ws-left-tabs">
                    <button class="ws-tab-btn ${this.activeLeftTab === 'tools' ? 'active' : ''}" data-tab="tools">
                        🔧 ${zh ? '工具' : 'Tools'}
                    </button>
                    <button class="ws-tab-btn ${this.activeLeftTab === 'files' ? 'active' : ''}" data-tab="files">
                        📁 ${zh ? '文件' : 'Files'}
                    </button>
                </div>

                <div class="ws-left-body" id="ws-left-body">
                    ${this.activeLeftTab === 'tools' ? this.renderToolsPanel(zh) : this.renderFilesPanel(zh)}
                </div>

                <div class="ws-sessions">
                    <div class="ws-section-title">${zh ? '对话历史' : 'Sessions'}</div>
                    <button class="btn btn-accent ws-new-btn" id="agent-new-chat">+ ${i('agent.newChat')}</button>
                    <div id="agent-sessions">${this.renderSessionList()}</div>
                </div>
            </aside>

            <!-- ===== CENTER: CHAT ===== -->
            <div class="ws-center">
                <div class="ws-center-header">
                    <span class="ws-chat-title" id="chat-title">${this.activeSession.title}</span>
                    <div class="ws-header-right">
                        <select id="model-selector" class="model-selector" title="${zh ? '选择模型' : 'Select model'}">
                            ${this.renderModelOptions()}
                        </select>
                        <button class="btn btn-ghost btn-sm" id="agent-clear">🗑 ${i('agent.clearChat')}</button>
                    </div>
                </div>

                <div class="chat-messages" id="chat-messages">
                    ${this.activeSession.messages.length === 0
                        ? this.renderWelcome()
                        : this.activeSession.messages.map(m => this.renderMessage(m)).join('')}
                </div>

                <div class="ws-input-area">
                    <div class="ws-input-wrapper">
                        <textarea id="chat-input" class="chat-input"
                            placeholder="${i('agent.inputPlaceholder')}" rows="1"></textarea>
                        <button class="chat-send-btn" id="chat-send" aria-label="${i('agent.send')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- ===== RIGHT PANEL ===== -->
            <div class="ws-right">
                <!-- Right Top: Output -->
                <div class="ws-right-top">
                    <div class="ws-panel-header">
                        <span>📤 ${zh ? '输出' : 'Output'}</span>
                        <button class="ws-clear-btn" id="clear-output">✕</button>
                    </div>
                    <div class="ws-output-body" id="agent-output">
                        <div class="ws-empty-hint">${zh ? '工具执行结果将显示在这里' : 'Tool results appear here'}</div>
                    </div>
                </div>

                <!-- Right Bottom: Agent Logs -->
                <div class="ws-right-bottom">
                    <div class="ws-panel-header">
                        <span>⚡ ${zh ? 'Agent 日志' : 'Agent Logs'}</span>
                        <button class="ws-clear-btn" id="clear-logs">✕</button>
                    </div>
                    <div class="ws-logs-body" id="agent-logs">
                        <div class="log-line log-system">
                            <span class="log-ts">${new Date().toLocaleTimeString()}</span>
                            <span class="log-text">${zh ? '工作站已就绪' : 'Workstation ready'}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>`;

        this.bindEvents();
        this.scrollToBottom();
        // Restore logs/output
        this.refreshLogs();
        this.refreshOutput();
    }

    renderToolsPanel(zh) {
        const tools = [
            { action: 'daily_brief',        icon: '📋', label: zh ? '每日简报' : 'Daily Brief' },
            { action: 'get_schedule',        icon: '📅', label: zh ? '今日日程' : 'Schedule' },
            { action: 'get_tasks',           icon: '✅', label: zh ? '任务列表' : 'Tasks' },
            { action: 'get_workflow',        icon: '🔄', label: zh ? '工作流' : 'Workflow' },
            { action: 'get_research_status', icon: '🔬', label: zh ? '科研进度' : 'Research' },
        ];
        return `
            <div class="ws-tools">
                <div class="ws-section-title">${zh ? '快捷工具' : 'Quick Tools'}</div>
                ${tools.map(t => `
                    <button class="ws-tool-btn" data-action="${t.action}">
                        <span class="ws-tool-icon">${t.icon}</span>
                        <span class="ws-tool-label">${t.label}</span>
                        <span class="ws-tool-arrow">→</span>
                    </button>`).join('')}
                <div class="ws-section-title" style="margin-top:16px">${zh ? '能力' : 'Capabilities'}</div>
                <div class="ws-caps">
                    <div class="ws-cap">📄 ${I18N.t('agent.cap1')}</div>
                    <div class="ws-cap">🔬 ${I18N.t('agent.cap2')}</div>
                    <div class="ws-cap">💡 ${I18N.t('agent.cap3')}</div>
                    <div class="ws-cap">📊 ${I18N.t('agent.cap4')}</div>
                </div>
            </div>`;
    }

    renderFilesPanel(zh) {
        return `
            <div class="ws-files">
                <div class="ws-section-title">${zh ? '工作区文件' : 'Workspace'}</div>
                <div class="ws-file-tree">
                    <div class="ws-file-folder open">
                        <span>📂 AgentSystem</span>
                        <div class="ws-file-children">
                            <div class="ws-file-item" data-file="workflow-vision">📄 workflow-vision.md</div>
                            <div class="ws-file-item" data-file="backend-env">⚙️ backend/.env</div>
                        </div>
                    </div>
                    <div class="ws-file-folder open">
                        <span>📂 PersonalWebsite</span>
                        <div class="ws-file-children">
                            <div class="ws-file-item" data-file="agent-module">📄 agent-module.js</div>
                            <div class="ws-file-item" data-file="i18n">📄 i18n.js</div>
                        </div>
                    </div>
                    <div class="ws-file-folder">
                        <span>📂 OpenClaw</span>
                        <div class="ws-file-children">
                            <div class="ws-file-item" data-file="llm-router">📄 LLMRouter.ts</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderSessionList() {
        return this.sessions.map(s => `
            <div class="session-item ${s.id === this.activeSessionId ? 'active' : ''}" data-id="${s.id}">
                <span>💬</span>
                <span class="session-title">${this.escapeHtml(s.title)}</span>
            </div>`).join('');
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
                        ? '基于 <strong>OpenClaw</strong> 框架，专为陈实的科研工作流设计。'
                        : "Built on <strong>OpenClaw</strong>, designed for Shi Chen's research workflow."}</p>
                    <div class="welcome-about">
                        <div class="about-item">🎯 <strong>${zh ? '设计理念' : 'Design'}</strong>：${zh ? '以你为中心，逐渐理解你的研究方向与偏好。' : 'You-centered, learning your research style over time.'}</div>
                        <div class="about-item">🔬 <strong>${zh ? '科研支持' : 'Research'}</strong>：${zh ? '文献综述、实验设计、数据分析、论文写作。' : 'Literature review, experiment design, data analysis, writing.'}</div>
                        <div class="about-item">⚡ <strong>${zh ? '工具调用' : 'Tools'}</strong>：${zh ? '点击左侧工具按钮，或直接告诉我你需要什么。' : 'Use the left panel tools, or just tell me what you need.'}</div>
                    </div>
                    <p class="welcome-hint">${zh ? '今天想从哪里开始？' : 'Where would you like to start today?'}</p>
                </div>
            </div>`;
    }

    renderMessage(msg) {
        const isUser = msg.role === 'user';
        return `
            <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                ${!isUser ? '<div class="msg-avatar">🤖</div>' : ''}
                <div class="msg-bubble">${this.formatContent(msg.content)}</div>
                ${isUser ? '<div class="msg-avatar user-avatar">👤</div>' : ''}
            </div>`;
    }

    renderThinking() {
        return `
            <div class="chat-message assistant" id="thinking-msg">
                <div class="msg-avatar">🤖</div>
                <div class="msg-bubble thinking-bubble">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>`;
    }

    bindEvents() {
        document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('agent-clear')?.addEventListener('click', () => this.clearChat());
        document.getElementById('agent-new-chat')?.addEventListener('click', () => this.newChat());
        document.getElementById('clear-output')?.addEventListener('click', () => { this.outputLines = []; this.refreshOutput(); });
        document.getElementById('clear-logs')?.addEventListener('click', () => { this.agentLogs = []; this.refreshLogs(); });

        const modelSel = document.getElementById('model-selector');
        if (modelSel) {
            modelSel.value = this.selectedModel;
            modelSel.addEventListener('change', e => {
                this.selectedModel = e.target.value;
                this.addLog('system', `Model switched to: ${this.selectedModel}`);
            });
        }

        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
            });
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            });
        }

        document.getElementById('agent-sessions')?.addEventListener('click', e => {
            const item = e.target.closest('.session-item');
            if (item) this.switchSession(item.dataset.id);
        });

        // Left tab switch
        document.querySelectorAll('.ws-tab-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                this.activeLeftTab = e.currentTarget.dataset.tab;
                const zh = I18N.currentLang === 'zh';
                document.querySelectorAll('.ws-tab-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const body = document.getElementById('ws-left-body');
                if (body) body.innerHTML = this.activeLeftTab === 'tools'
                    ? this.renderToolsPanel(zh)
                    : this.renderFilesPanel(zh);
                this.bindToolBtns();
            });
        });

        this.bindToolBtns();
    }

    bindToolBtns() {
        document.querySelectorAll('.ws-tool-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const action = e.currentTarget.dataset.action;
                this.runQuickAction(action);
            });
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
        if (session.messages.length === 0) {
            session.title = text.slice(0, 20) + (text.length > 20 ? '…' : '');
            document.getElementById('chat-title').textContent = session.title;
            this.refreshSessionList();
        }

        session.messages.push({ role: 'user', content: text });
        this.appendMessage({ role: 'user', content: text });

        document.getElementById('chat-messages')?.insertAdjacentHTML('beforeend', this.renderThinking());
        this.scrollToBottom();
        this.isLoading = true;
        this.setInputDisabled(true);
        this.addLog('info', `Sending: ${text.slice(0, 40)}${text.length > 40 ? '…' : ''}`);

        try {
            const reply = await this.callAgent(text, session.messages);
            session.messages.push({ role: 'assistant', content: reply });
            document.getElementById('thinking-msg')?.remove();
            this.appendMessage({ role: 'assistant', content: reply });
            this.addLog('success', 'Response received');
        } catch (e) {
            document.getElementById('thinking-msg')?.remove();
            const zh = I18N.currentLang === 'zh';
            const errMsg = zh ? '请求失败，请检查后端是否运行。' : 'Request failed. Check if backend is running.';
            this.appendMessage({ role: 'assistant', content: errMsg });
            this.addLog('error', e?.message || 'Request failed');
        } finally {
            this.isLoading = false;
            this.setInputDisabled(false);
            this.scrollToBottom();
            document.getElementById('chat-input')?.focus();
        }
    }

    async callAgent(message, history) {
        const body = {
            message,
            history: history.slice(-10),
            model: this.selectedModel === 'auto' ? undefined : this.selectedModel,
        };
        const res = await fetch(this.agentEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.model) this.addLog('system', `Model: ${data.model}`);
        if (data.toolResult) {
            this.addOutput(`Tool: ${data.toolName}`, this.renderToolCardContent(data.toolName, data.toolResult));
            this.addLog('tool', `Tool executed: ${data.toolName}`);
        }
        return data.reply || data.message || data.content || '';
    }

    async runQuickAction(action) {
        const zh = I18N.currentLang === 'zh';
        const labels = {
            daily_brief: zh ? '每日简报' : 'Daily Brief',
            get_schedule: zh ? '今日日程' : 'Schedule',
            get_tasks: zh ? '任务列表' : 'Tasks',
            get_workflow: zh ? '工作流建议' : 'Workflow',
            get_research_status: zh ? '科研进度' : 'Research Status',
        };
        const label = labels[action] || action;
        this.addLog('tool', `Running tool: ${action}`);

        const endpointMap = {
            daily_brief:         { url: 'http://localhost:3000/api/agent/daily-brief', method: 'POST' },
            get_schedule:        { url: 'http://localhost:3000/api/agent/schedule', method: 'GET' },
            get_tasks:           { url: 'http://localhost:3000/api/agent/tasks', method: 'GET' },
            get_workflow:        { url: 'http://localhost:3000/api/agent/workflow', method: 'GET' },
            get_research_status: { url: 'http://localhost:3000/api/agent/research-status', method: 'GET' },
        };

        try {
            const ep = endpointMap[action];
            const res = await fetch(ep.url, { method: ep.method, headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.addOutput(label, this.renderToolCardContent(action, data));
            this.addLog('success', `Tool done: ${action}`);

            // Also show a brief in chat
            const session = this.activeSession;
            const summary = this.toolSummary(action, data, zh);
            session.messages.push({ role: 'assistant', content: summary });
            this.appendMessage({ role: 'assistant', content: summary });
        } catch (e) {
            this.addLog('error', `Tool failed: ${e?.message || action}`);
            const msg = zh ? `工具 ${label} 执行失败，请确认后端已启动。` : `Tool ${label} failed. Make sure backend is running.`;
            this.appendMessage({ role: 'assistant', content: msg });
        }
    }

    toolSummary(action, data, zh) {
        if (action === 'daily_brief') return `📋 ${data.date} — ${data.summary}`;
        if (action === 'get_schedule') return `📅 ${zh ? '今日' : 'Today'} ${data.date}: ${data.schedule?.length || 0} ${zh ? '项日程' : 'items'}`;
        if (action === 'get_tasks') return `✅ ${zh ? '共' : 'Total'} ${data.total} ${zh ? '项任务，' : ' tasks, '} ${data.urgent} ${zh ? '项紧急' : ' urgent'}`;
        if (action === 'get_workflow') return `🔄 ${zh ? '当前阶段：' : 'Stage: '}${data.currentStage} — ${data.nextAction}`;
        if (action === 'get_research_status') return `🔬 ${data.projects?.map(p => `${p.name} ${p.progress}%`).join(' · ')}`;
        return JSON.stringify(data).slice(0, 100);
    }

    renderToolCardContent(toolName, data) {
        const zh = I18N.currentLang === 'zh';
        if (toolName === 'get_schedule') {
            return `<div class="tool-schedule">${(data.schedule || []).map(s =>
                `<div class="tool-schedule-item"><span class="tool-time">${s.time}</span><span class="tool-task">${s.task}</span><span class="tool-type">${s.type}</span></div>`
            ).join('')}</div>${data.reminder ? `<p class="tool-recommendation">💡 ${data.reminder}</p>` : ''}`;
        }
        if (toolName === 'daily_brief') {
            return `<p><strong>${data.date}</strong> ${data.greeting || ''}</p>
                <p>${data.summary}</p>
                <div class="tool-progress">
                    <span class="tool-stat done">✅ ${data.progress?.completed}</span>
                    <span class="tool-stat wip">🔄 ${data.progress?.inProgress}</span>
                    <span class="tool-stat pending">⏳ ${data.progress?.pending}</span>
                </div>
                ${(data.highlights || []).map(h => `<div class="tool-highlight">${h}</div>`).join('')}
                <p class="tool-recommendation">💡 ${data.recommendation}</p>`;
        }
        if (toolName === 'get_tasks') {
            return `<div class="tool-tasks">${(data.tasks || []).map(t =>
                `<div class="tool-task-item priority-${t.priority}">
                    <span>${t.status === 'completed' ? '✅' : t.status === 'in-progress' ? '🔄' : '⏳'}</span>
                    <span class="tool-task-title">${t.title}</span>
                    <span class="tool-task-priority">${t.priority}</span>
                </div>`).join('')}</div>`;
        }
        if (toolName === 'get_workflow') {
            return `<div class="tool-workflow">${(data.recommendedFlow || []).map(s =>
                `<div class="tool-workflow-step status-${s.status}">
                    <span class="step-num">${s.step}</span>
                    <span class="step-action">${s.action}</span>
                    <span class="step-agent">${s.agent}</span>
                    <span>${s.status === 'completed' ? '✅' : s.status === 'in-progress' ? '🔄' : '⏳'}</span>
                </div>`).join('')}</div>
                <p class="tool-recommendation">➡️ ${data.nextAction}</p>`;
        }
        if (toolName === 'get_research_status') {
            return `<div class="tool-projects">${(data.projects || []).map(p =>
                `<div class="tool-project-item">
                    <div class="tool-project-name">${p.name}</div>
                    <div class="tool-project-bar"><div class="tool-project-fill" style="width:${p.progress}%"></div></div>
                    <div class="tool-project-meta">${p.progress}% — ${p.nextMilestone}</div>
                </div>`).join('')}</div>`;
        }
        return `<pre style="font-size:11px;overflow:auto">${JSON.stringify(data, null, 2)}</pre>`;
    }

    appendMessage(msg) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
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
        document.getElementById('chat-title').textContent = I18N.t('agent.newChat');
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
