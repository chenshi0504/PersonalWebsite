/**
 * Personal Agent 模块 — IDE 风格布局 + 日程管家
 * 左：工具栏 / 日程 / 文件树
 * 中上：日程面板 / 文件查看器
 * 中下：终端/日志
 * 右：对话区
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
        this.agentLogs = [];
        this.activeLeftTab = 'schedule';
        this.selectedModel = 'auto';
        this.availableModels = [];
        this.openFiles = [];
        this.activeFileIdx = -1;
        // Schedule state
        this.scheduleEvents = [];
        this.scheduleDate = new Date().toISOString().slice(0, 10);
        this.scheduleRange = 'today';
        // Center panel mode
        this.centerMode = 'schedule'; // 'schedule' | 'file'
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
                this.fetchModels();
                this.fetchSchedule();
            }
        } catch {
            this.backendOnline = false;
            this.addLog('warn', 'Backend offline');
        }
        const dot = document.querySelector('.agent-status');
        if (dot) {
            dot.className = `agent-status ${this.backendOnline ? 'online' : 'offline'}`;
            dot.innerHTML = `<span class="status-dot"></span>${this.backendOnline ? I18N.t('agent.status.online') : I18N.t('agent.status.offline')}`;
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
                this.addLog('system', `Models: ${this.availableModels.filter(m => m.available).map(m => m.key).join(', ') || 'none'}`);
            }
        } catch { /* silent */ }
    }

    // ---- Schedule API ----
    async fetchSchedule() {
        try {
            const url = `http://localhost:3000/api/agent/schedule?range=${this.scheduleRange}&date=${this.scheduleDate}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
            if (res.ok) {
                const data = await res.json();
                this.scheduleEvents = data.events || [];
                this.addLog('system', `Schedule loaded: ${this.scheduleEvents.length} events`);
                this.refreshSchedulePanel();
            }
        } catch (e) {
            this.addLog('warn', 'Failed to load schedule');
        }
    }

    async addScheduleEvent(title, date, time, type, priority) {
        try {
            const res = await fetch('http://localhost:3000/api/agent/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, time, type: type || 'other', priority: priority || 'medium' })
            });
            if (res.ok) {
                const data = await res.json();
                this.addLog('success', `Added: ${title}`);
                await this.fetchSchedule();
                return data;
            }
        } catch (e) {
            this.addLog('error', `Failed to add event: ${e.message}`);
        }
    }

    async toggleScheduleComplete(id, completed) {
        try {
            const res = await fetch(`http://localhost:3000/api/agent/schedule/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            if (res.ok) {
                await this.fetchSchedule();
            }
        } catch (e) {
            this.addLog('error', `Failed to update: ${e.message}`);
        }
    }

    async deleteScheduleEvent(id) {
        try {
            const res = await fetch(`http://localhost:3000/api/agent/schedule/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.addLog('success', 'Event deleted');
                await this.fetchSchedule();
            }
        } catch (e) {
            this.addLog('error', `Failed to delete: ${e.message}`);
        }
    }

    refreshModelSelector() {
        const sel = document.getElementById('model-selector');
        if (!sel) return;
        sel.innerHTML = this.renderModelOptions();
        sel.value = this.selectedModel;
    }

    renderModelOptions() {
        const zh = I18N.currentLang === 'zh';
        let opts = `<option value="auto">${zh ? '自动' : 'Auto'}</option>`;
        if (this.availableModels.length > 0) {
            this.availableModels.forEach(m => {
                const disabled = !m.available ? ' disabled' : '';
                const tag = !m.available ? ' ⚠️' : '';
                opts += `<option value="${m.key}"${disabled}>${m.label}${tag}</option>`;
            });
        } else {
            [{ key: 'deepseek-v3', label: 'DeepSeek-V3' }, { key: 'deepseek-r1', label: 'DeepSeek-R1' }]
                .forEach(m => { opts += `<option value="${m.key}">${m.label}</option>`; });
        }
        return opts;
    }

    addLog(type, text) {
        const ts = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.agentLogs.unshift({ type, text, ts });
        if (this.agentLogs.length > 80) this.agentLogs.pop();
        this.refreshLogs();
    }

    refreshLogs() {
        const el = document.getElementById('agent-logs');
        if (!el) return;
        el.innerHTML = this.agentLogs.map(l => `<div class="log-line log-${l.type}"><span class="log-ts">${l.ts}</span><span class="log-text">${this.escapeHtml(l.text)}</span></div>`).join('');
    }

    // ---- File viewer ----
    async openFile(filePath, fileName) {
        this.centerMode = 'file';
        const existing = this.openFiles.findIndex(f => f.path === filePath);
        if (existing >= 0) { this.activeFileIdx = existing; this.refreshCenterPanel(); return; }
        this.addLog('info', `Opening: ${filePath}`);
        try {
            const res = await fetch(this.agentEndpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Please read this file and show me its content: ${filePath}`, history: [] })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            let content = '';
            if (data.toolCallLog) {
                const readCall = data.toolCallLog.find(tc => tc.tool === 'read_file');
                if (readCall && readCall.result && readCall.result.content) content = readCall.result.content;
            }
            if (!content) content = data.reply || 'Unable to read file';
            this.openFiles.push({ name: fileName, path: filePath, content });
            this.activeFileIdx = this.openFiles.length - 1;
            this.addLog('success', `Opened: ${fileName}`);
        } catch (e) {
            this.openFiles.push({ name: fileName, path: filePath, content: `Error: ${e.message}` });
            this.activeFileIdx = this.openFiles.length - 1;
            this.addLog('error', `Failed: ${e.message}`);
        }
        this.refreshCenterPanel();
    }

    closeFile(idx) {
        this.openFiles.splice(idx, 1);
        if (this.activeFileIdx >= this.openFiles.length) this.activeFileIdx = this.openFiles.length - 1;
        if (this.openFiles.length === 0) this.centerMode = 'schedule';
        this.refreshCenterPanel();
    }

    // ---- Main render ----
    render() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;
        const zh = I18N.currentLang === 'zh';
        const isOnline = this.backendOnline;

        mainContent.innerHTML = `
        <div class="workstation">
            <!-- LEFT SIDEBAR -->
            <aside class="ws-left">
                <div class="ws-left-header">
                    <div class="ws-agent-brand">
                        <span class="ws-logo">🤖</span>
                        <div>
                            <div class="ws-agent-name">${I18N.t('agent.title')}</div>
                            <div class="agent-status ${isOnline ? 'online' : 'offline'}">
                                <span class="status-dot"></span>
                                ${isOnline ? I18N.t('agent.status.online') : I18N.t('agent.status.offline')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ws-left-tabs">
                    <button class="ws-tab-btn ${this.activeLeftTab === 'schedule' ? 'active' : ''}" data-tab="schedule">📅 ${zh ? '日程' : 'Schedule'}</button>
                    <button class="ws-tab-btn ${this.activeLeftTab === 'tools' ? 'active' : ''}" data-tab="tools">🔧 ${zh ? '工具' : 'Tools'}</button>
                    <button class="ws-tab-btn ${this.activeLeftTab === 'files' ? 'active' : ''}" data-tab="files">📁 ${zh ? '文件' : 'Files'}</button>
                </div>
                <div class="ws-left-body" id="ws-left-body">
                    ${this.activeLeftTab === 'schedule' ? this.renderScheduleSidebar(zh) : this.activeLeftTab === 'tools' ? this.renderToolsPanel(zh) : this.renderFilesPanel(zh)}
                </div>
                <div class="ws-sessions">
                    <div class="ws-section-title">${zh ? '对话历史' : 'Sessions'}</div>
                    <button class="btn btn-accent ws-new-btn" id="agent-new-chat">+ ${I18N.t('agent.newChat')}</button>
                    <div id="agent-sessions">${this.renderSessionList()}</div>
                </div>
            </aside>

            <!-- CENTER: schedule/file viewer (top) + terminal (bottom) -->
            <div class="ws-center">
                <div class="ws-editor-area" id="center-panel">
                    ${this.centerMode === 'schedule' ? this.renderScheduleCenter(zh) : this.renderFileViewer(zh)}
                </div>
                <div class="ws-terminal-area">
                    <div class="ws-panel-header">
                        <span>⚡ ${zh ? '终端 / 日志' : 'Terminal / Logs'}</span>
                        <button class="ws-clear-btn" id="clear-logs" title="${zh ? '清空日志' : 'Clear logs'}">🗑</button>
                    </div>
                    <div class="ws-logs-body" id="agent-logs">
                        <div class="log-line log-system"><span class="log-ts">${new Date().toLocaleTimeString()}</span><span class="log-text">${zh ? '工作站已就绪' : 'Workstation ready'}</span></div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Chat -->
            <div class="ws-right-chat">
                <div class="ws-center-header">
                    <span class="ws-chat-title" id="chat-title">${this.activeSession.title}</span>
                    <div class="ws-header-right">
                        <select id="model-selector" class="model-selector" title="${zh ? '选择模型' : 'Select model'}">${this.renderModelOptions()}</select>
                        <button class="btn btn-ghost btn-sm" id="agent-clear">🗑</button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    ${this.activeSession.messages.length === 0 ? this.renderWelcome() : this.activeSession.messages.map(m => this.renderMessage(m)).join('')}
                </div>
                <div class="ws-input-area">
                    <div class="ws-input-wrapper">
                        <textarea id="chat-input" class="chat-input" placeholder="${I18N.t('agent.inputPlaceholder')}" rows="1"></textarea>
                        <button class="chat-send-btn" id="chat-send" aria-label="${I18N.t('agent.send')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        this.bindEvents();
        this.scrollToBottom();
        this.refreshLogs();
    }

    // ---- Schedule sidebar (left panel) ----
    renderScheduleSidebar(zh) {
        const today = new Date().toISOString().slice(0, 10);
        const events = this.scheduleEvents;
        const now = new Date().toTimeString().slice(0, 5);

        return `<div class="ws-schedule-sidebar">
            <div class="ws-section-title">${zh ? '今日日程' : "Today's Schedule"}</div>
            <div class="schedule-date-bar">
                <span class="schedule-today-label">${new Date().toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                <button class="ws-clear-btn schedule-refresh-btn" id="schedule-refresh" title="${zh ? '刷新' : 'Refresh'}">↻</button>
            </div>
            ${events.length === 0
                ? `<div class="ws-empty-hint">${zh ? '今日暂无日程安排' : 'No events today'}</div>`
                : `<div class="schedule-list">${events.map(e => {
                    const isPast = e.time < now && !e.completed;
                    const isDone = e.completed;
                    return `<div class="schedule-item ${isDone ? 'done' : ''} ${isPast ? 'past' : ''}" data-id="${e.id}">
                        <div class="schedule-item-check" data-id="${e.id}" data-done="${isDone ? '1' : '0'}">${isDone ? '✅' : '⬜'}</div>
                        <div class="schedule-item-body">
                            <div class="schedule-item-time">${e.time}${e.endTime ? ' - ' + e.endTime : ''}</div>
                            <div class="schedule-item-title ${isDone ? 'line-through' : ''}">${this.escapeHtml(e.title)}</div>
                        </div>
                        <span class="schedule-item-type type-${e.type}">${this.typeIcon(e.type)}</span>
                    </div>`;
                }).join('')}</div>`
            }
            <button class="btn btn-accent ws-new-btn" id="schedule-add-btn">+ ${zh ? '添加日程' : 'Add Event'}</button>
            <div class="ws-section-title" style="margin-top:10px">${zh ? '快捷操作' : 'Quick Actions'}</div>
            <button class="ws-tool-btn" data-action="daily_brief"><span class="ws-tool-icon">📋</span><span class="ws-tool-label">${zh ? '每日简报' : 'Daily Brief'}</span><span class="ws-tool-arrow">→</span></button>
            <button class="ws-tool-btn" data-action="get_tasks"><span class="ws-tool-icon">✅</span><span class="ws-tool-label">${zh ? '任务列表' : 'Tasks'}</span><span class="ws-tool-arrow">→</span></button>
            <button class="ws-tool-btn" data-action="week_schedule"><span class="ws-tool-icon">📆</span><span class="ws-tool-label">${zh ? '本周日程' : 'This Week'}</span><span class="ws-tool-arrow">→</span></button>
        </div>`;
    }

    typeIcon(type) {
        const icons = { research: '🔬', meeting: '👥', coding: '💻', writing: '✍️', planning: '📋', personal: '🏠', other: '📌' };
        return icons[type] || '📌';
    }

    // ---- Schedule center panel ----
    renderScheduleCenter(zh) {
        const events = this.scheduleEvents;
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);

        return `<div class="schedule-center">
            <div class="schedule-center-header">
                <h3>📅 ${zh ? '日程管家' : 'Schedule Manager'}</h3>
                <span class="schedule-center-date">${now.toLocaleDateString(zh ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
            </div>
            <div class="schedule-timeline" id="schedule-timeline">
                ${this.renderTimeline(events, timeStr, zh)}
            </div>
        </div>`;
    }

    renderTimeline(events, nowTime, zh) {
        // Generate timeline from 7:00 to 23:00
        const hours = [];
        for (let h = 7; h <= 23; h++) hours.push(h);
        const nowHour = parseInt(nowTime.split(':')[0]);

        return `<div class="timeline-grid">
            ${hours.map(h => {
                const hStr = String(h).padStart(2, '0');
                const hourEvents = events.filter(e => e.time.startsWith(hStr + ':'));
                const isNow = h === nowHour;
                return `<div class="timeline-row ${isNow ? 'now' : ''} ${h < nowHour ? 'past' : ''}">
                    <div class="timeline-hour">${hStr}:00</div>
                    <div class="timeline-content">
                        ${isNow ? '<div class="timeline-now-line"></div>' : ''}
                        ${hourEvents.map(e => `<div class="timeline-event type-bg-${e.type} ${e.completed ? 'completed' : ''}" data-id="${e.id}">
                            <span class="timeline-event-time">${e.time}</span>
                            <span class="timeline-event-title">${this.escapeHtml(e.title)}</span>
                            <span class="timeline-event-type">${this.typeIcon(e.type)}</span>
                            <button class="timeline-event-del" data-id="${e.id}" title="${zh ? '删除' : 'Delete'}">×</button>
                        </div>`).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    renderFileViewer(zh) {
        if (this.openFiles.length === 0) {
            return `<div class="ws-empty-hint">${zh ? '点击左侧文件打开查看' : 'Click a file on the left to open'}</div>`;
        }
        const tabs = this.openFiles.map((f, i) => `
            <div class="file-tab ${i === this.activeFileIdx ? 'active' : ''}" data-idx="${i}">
                <span class="file-tab-name">${f.name}</span>
                <span class="file-tab-close" data-idx="${i}">×</span>
            </div>`).join('');
        const active = this.openFiles[this.activeFileIdx];
        return `<div class="ws-editor-tabs" id="file-tabs">${tabs}</div>
            <div class="ws-editor-body" id="file-viewer-body">
                ${active ? `<div class="file-path-bar">${this.escapeHtml(active.path)}</div><pre class="file-content-pre">${this.escapeHtml(active.content)}</pre>` : ''}
            </div>`;
    }

    refreshCenterPanel() {
        const panel = document.getElementById('center-panel');
        if (!panel) return;
        const zh = I18N.currentLang === 'zh';
        panel.innerHTML = this.centerMode === 'schedule' ? this.renderScheduleCenter(zh) : this.renderFileViewer(zh);
        this.bindCenterEvents();
    }

    refreshSchedulePanel() {
        // Refresh both sidebar and center
        const body = document.getElementById('ws-left-body');
        if (body && this.activeLeftTab === 'schedule') {
            body.innerHTML = this.renderScheduleSidebar(I18N.currentLang === 'zh');
            this.bindScheduleSidebarEvents();
        }
        if (this.centerMode === 'schedule') this.refreshCenterPanel();
    }

    renderToolsPanel(zh) {
        const tools = [
            { action: 'daily_brief', icon: '📋', label: zh ? '每日简报' : 'Daily Brief' },
            { action: 'get_tasks', icon: '✅', label: zh ? '任务列表' : 'Tasks' },
            { action: 'get_workflow', icon: '🔄', label: zh ? '工作流' : 'Workflow' },
            { action: 'get_research_status', icon: '🔬', label: zh ? '科研进度' : 'Research' },
        ];
        return `<div class="ws-tools">
            <div class="ws-section-title">${zh ? '快捷工具' : 'Quick Tools'}</div>
            ${tools.map(t => `<button class="ws-tool-btn" data-action="${t.action}"><span class="ws-tool-icon">${t.icon}</span><span class="ws-tool-label">${t.label}</span><span class="ws-tool-arrow">→</span></button>`).join('')}
            <div class="ws-section-title" style="margin-top:12px">${zh ? '能力' : 'Capabilities'}</div>
            <div class="ws-caps">
                <div class="ws-cap">${I18N.t('agent.cap1')}</div>
                <div class="ws-cap">${I18N.t('agent.cap2')}</div>
                <div class="ws-cap">${I18N.t('agent.cap3')}</div>
                <div class="ws-cap">${I18N.t('agent.cap4')}</div>
            </div>
        </div>`;
    }

    renderFilesPanel(zh) {
        const fileTree = [
            { folder: 'PersonalWebsite', files: [
                { name: 'index.html', path: 'PersonalWebsite/index.html' },
                { name: 'agent-module.js', path: 'PersonalWebsite/js/components/agent-module.js' },
                { name: 'main.css', path: 'PersonalWebsite/css/main.css' },
            ]},
            { folder: 'AgentSystem', files: [
                { name: 'chat.ts', path: 'AgentSystem/backend/src/routes/chat.ts' },
                { name: 'scheduleTools.ts', path: 'AgentSystem/backend/src/tools/scheduleTools.ts' },
                { name: 'memoryTools.ts', path: 'AgentSystem/backend/src/tools/memoryTools.ts' },
            ]},
            { folder: 'OpenClaw', files: [
                { name: 'LLMRouter.ts', path: 'OpenClaw/src/llm/LLMRouter.ts' },
                { name: 'README.md', path: 'OpenClaw/README.md' },
            ]},
        ];
        return `<div class="ws-files">
            <div class="ws-section-title">${zh ? '工作区文件' : 'Workspace'}</div>
            <div class="ws-file-tree">
                ${fileTree.map(g => `<div class="ws-file-folder open"><span>📂 ${g.folder}</span><div class="ws-file-children">${g.files.map(f => `<div class="ws-file-item" data-filepath="${f.path}" data-filename="${f.name}">📄 ${f.name}</div>`).join('')}</div></div>`).join('')}
            </div>
        </div>`;
    }

    renderSessionList() {
        return this.sessions.map(s => `<div class="session-item ${s.id === this.activeSessionId ? 'active' : ''}" data-id="${s.id}"><span>💬</span><span class="session-title">${this.escapeHtml(s.title)}</span></div>`).join('');
    }

    renderWelcome() {
        const zh = I18N.currentLang === 'zh';
        return `<div class="chat-welcome">
            <div class="welcome-icon">🤖</div>
            <div class="welcome-text">
                <p class="welcome-greeting">${zh ? '你好，我是你的<strong>日程管家 & 科研助理</strong>。' : "Hi, I'm your <strong>Schedule Manager & Research Assistant</strong>."}</p>
                <div class="welcome-about">
                    <div class="about-item">📅 ${zh ? '"帮我加个日程：明天下午2点开组会"' : '"Add a meeting tomorrow at 2pm"'}</div>
                    <div class="about-item">✅ ${zh ? '"添加任务：完成论文初稿"' : '"Add task: finish paper draft"'}</div>
                    <div class="about-item">📋 ${zh ? '"今天有什么安排？"' : '"What\'s on my schedule today?"'}</div>
                    <div class="about-item">🔬 ${zh ? '也可以聊科研、分析、写作。' : 'Also: research, analysis, writing.'}</div>
                </div>
            </div>
        </div>`;
    }

    renderMessage(msg) {
        const isUser = msg.role === 'user';
        return `<div class="chat-message ${isUser ? 'user' : 'assistant'}">
            ${!isUser ? '<div class="msg-avatar">🤖</div>' : ''}
            <div class="msg-bubble">${this.formatContent(msg.content)}</div>
            ${isUser ? '<div class="msg-avatar user-avatar">👤</div>' : ''}
        </div>`;
    }

    // ---- Event binding ----
    bindEvents() {
        document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('agent-clear')?.addEventListener('click', () => this.confirmAction(
            I18N.currentLang === 'zh' ? '确定要清空当前对话吗？' : 'Clear current chat?',
            () => this.clearChat()
        ));
        document.getElementById('agent-new-chat')?.addEventListener('click', () => this.newChat());
        document.getElementById('clear-logs')?.addEventListener('click', () => this.confirmAction(
            I18N.currentLang === 'zh' ? '确定要清空日志吗？' : 'Clear all logs?',
            () => { this.agentLogs = []; this.refreshLogs(); }
        ));

        const modelSel = document.getElementById('model-selector');
        if (modelSel) {
            modelSel.value = this.selectedModel;
            modelSel.addEventListener('change', e => {
                this.selectedModel = e.target.value;
                this.addLog('system', `Model: ${this.selectedModel}`);
            });
        }

        const input = document.getElementById('chat-input');
        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
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
                document.querySelectorAll('.ws-tab-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const body = document.getElementById('ws-left-body');
                const zh = I18N.currentLang === 'zh';
                if (body) {
                    if (this.activeLeftTab === 'schedule') body.innerHTML = this.renderScheduleSidebar(zh);
                    else if (this.activeLeftTab === 'tools') body.innerHTML = this.renderToolsPanel(zh);
                    else body.innerHTML = this.renderFilesPanel(zh);
                }
                // Switch center panel
                if (this.activeLeftTab === 'schedule') { this.centerMode = 'schedule'; this.refreshCenterPanel(); }
                else if (this.activeLeftTab === 'files' && this.openFiles.length > 0) { this.centerMode = 'file'; this.refreshCenterPanel(); }
                this.bindAllSubEvents();
            });
        });

        this.bindAllSubEvents();
        this.bindCenterEvents();
        this.bindWheelScroll();
    }

    // Ensure mouse wheel scrolls the panel under the cursor, not the outer page
    bindWheelScroll() {
        const scrollables = [
            document.getElementById('chat-messages'),
            document.getElementById('agent-logs'),
            document.getElementById('center-panel'),
            document.getElementById('ws-left-body'),
            document.getElementById('schedule-timeline'),
        ];
        scrollables.forEach(el => {
            if (!el) return;
            el.addEventListener('wheel', e => {
                // Only intercept if the element is scrollable
                const canScroll = el.scrollHeight > el.clientHeight;
                if (!canScroll) return;
                const atTop = el.scrollTop <= 0 && e.deltaY < 0;
                const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && e.deltaY > 0;
                // If not at boundary, prevent outer scroll
                if (!atTop && !atBottom) {
                    e.stopPropagation();
                }
            }, { passive: true });
        });
        // Also prevent the workstation grid from scrolling the whole page
        const ws = document.querySelector('.workstation');
        if (ws) {
            ws.addEventListener('wheel', e => {
                // Find the closest scrollable child under the cursor
                const target = document.elementFromPoint(e.clientX, e.clientY);
                if (!target) return;
                const scrollParent = target.closest('.chat-messages, .ws-logs-body, .ws-editor-area, .ws-left-body, .schedule-timeline');
                if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
                    // Let the child handle it, prevent page scroll
                    e.preventDefault();
                    scrollParent.scrollTop += e.deltaY;
                }
            }, { passive: false });
        }
    }

    bindAllSubEvents() {
        this.bindToolBtns();
        this.bindFileBtns();
        this.bindScheduleSidebarEvents();
    }

    bindScheduleSidebarEvents() {
        document.getElementById('schedule-refresh')?.addEventListener('click', () => this.fetchSchedule());
        document.getElementById('schedule-add-btn')?.addEventListener('click', () => this.showAddScheduleDialog());
        // Check/uncheck events
        document.querySelectorAll('.schedule-item-check').forEach(el => {
            el.addEventListener('click', e => {
                const id = e.currentTarget.dataset.id;
                const isDone = e.currentTarget.dataset.done === '1';
                this.toggleScheduleComplete(id, !isDone);
            });
        });
        // Quick action buttons in schedule sidebar
        this.bindToolBtns();
    }

    bindCenterEvents() {
        // Timeline delete buttons
        document.querySelectorAll('.timeline-event-del').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.deleteScheduleEvent(btn.dataset.id);
            });
        });
        // File tabs
        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                if (e.target.classList.contains('file-tab-close')) return;
                this.activeFileIdx = parseInt(tab.dataset.idx);
                this.refreshCenterPanel();
            });
        });
        document.querySelectorAll('.file-tab-close').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.closeFile(parseInt(btn.dataset.idx));
            });
        });
    }

    showAddScheduleDialog() {
        const zh = I18N.currentLang === 'zh';
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date();
        const nextHour = String(now.getHours() + 1).padStart(2, '0') + ':00';

        // Simple inline form in the center panel
        const panel = document.getElementById('center-panel');
        if (!panel) return;
        panel.innerHTML = `<div class="schedule-add-form">
            <h3>📅 ${zh ? '添加日程' : 'Add Schedule Event'}</h3>
            <div class="form-row"><label>${zh ? '标题' : 'Title'}</label><input id="sched-title" type="text" placeholder="${zh ? '例如：组会讨论' : 'e.g. Team meeting'}" /></div>
            <div class="form-row"><label>${zh ? '日期' : 'Date'}</label><input id="sched-date" type="date" value="${today}" /></div>
            <div class="form-row"><label>${zh ? '时间' : 'Time'}</label><input id="sched-time" type="time" value="${nextHour}" /></div>
            <div class="form-row"><label>${zh ? '类型' : 'Type'}</label>
                <select id="sched-type">
                    <option value="meeting">${zh ? '会议' : 'Meeting'}</option>
                    <option value="research">${zh ? '科研' : 'Research'}</option>
                    <option value="coding">${zh ? '编程' : 'Coding'}</option>
                    <option value="writing">${zh ? '写作' : 'Writing'}</option>
                    <option value="planning">${zh ? '规划' : 'Planning'}</option>
                    <option value="personal">${zh ? '个人' : 'Personal'}</option>
                    <option value="other">${zh ? '其他' : 'Other'}</option>
                </select>
            </div>
            <div class="form-row"><label>${zh ? '优先级' : 'Priority'}</label>
                <select id="sched-priority">
                    <option value="medium">${zh ? '中' : 'Medium'}</option>
                    <option value="high">${zh ? '高' : 'High'}</option>
                    <option value="low">${zh ? '低' : 'Low'}</option>
                </select>
            </div>
            <div class="form-actions">
                <button class="btn btn-accent" id="sched-submit">${zh ? '添加' : 'Add'}</button>
                <button class="btn btn-ghost" id="sched-cancel">${zh ? '取消' : 'Cancel'}</button>
            </div>
        </div>`;

        document.getElementById('sched-submit')?.addEventListener('click', async () => {
            const title = document.getElementById('sched-title').value.trim();
            const date = document.getElementById('sched-date').value;
            const time = document.getElementById('sched-time').value;
            const type = document.getElementById('sched-type').value;
            const priority = document.getElementById('sched-priority').value;
            if (!title) return;
            await this.addScheduleEvent(title, date, time, type, priority);
            this.centerMode = 'schedule';
            this.refreshCenterPanel();
        });
        document.getElementById('sched-cancel')?.addEventListener('click', () => {
            this.centerMode = 'schedule';
            this.refreshCenterPanel();
        });
        document.getElementById('sched-title')?.focus();
    }

    bindToolBtns() {
        document.querySelectorAll('.ws-tool-btn').forEach(btn => {
            btn.addEventListener('click', e => this.runQuickAction(e.currentTarget.dataset.action));
        });
    }

    bindFileBtns() {
        document.querySelectorAll('.ws-file-item').forEach(item => {
            item.addEventListener('click', e => {
                const fp = e.currentTarget.dataset.filepath;
                const fn = e.currentTarget.dataset.filename;
                if (fp && fn) this.openFile(fp, fn);
            });
        });
    }

    // ---- Chat logic ----
    async sendMessage() {
        if (this.isLoading) return;
        const input = document.getElementById('chat-input');
        const text = input?.value.trim();
        if (!text) return;
        input.value = '';

        const session = this.activeSession;
        if (session.messages.length === 0) {
            session.title = text.slice(0, 20) + (text.length > 20 ? '…' : '');
            document.getElementById('chat-title').textContent = session.title;
            this.refreshSessionList();
        }

        session.messages.push({ role: 'user', content: text });
        this.appendMessage({ role: 'user', content: text });

        const chatMessages = document.getElementById('chat-messages');
        chatMessages?.querySelector('.chat-welcome')?.remove();
        const assistantId = 'msg-' + Date.now();
        chatMessages?.insertAdjacentHTML('beforeend',
            `<div class="chat-message assistant" id="${assistantId}">
                <div class="msg-avatar">🤖</div>
                <div class="msg-bubble" id="${assistantId}-bubble">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>`);
        this.scrollToBottom();
        this.isLoading = true;
        this.setInputDisabled(true);
        this.addLog('info', `Sending: ${text.slice(0, 40)}…`);

        try {
            const reply = await this.callAgent(text, session.messages, assistantId);
            session.messages.push({ role: 'assistant', content: reply });
            this.addLog('success', 'Response received');
            // Auto-refresh schedule if the message might have changed it
            if (/日程|schedule|add_schedule|delete_schedule|update_schedule/i.test(text + reply)) {
                this.fetchSchedule();
            }
        } catch (e) {
            const bubble = document.getElementById(`${assistantId}-bubble`);
            if (bubble) bubble.innerHTML = this.formatContent(I18N.currentLang === 'zh' ? '请求失败，请检查后端。' : 'Request failed.');
            this.addLog('error', e?.message || 'Failed');
        } finally {
            this.isLoading = false;
            this.setInputDisabled(false);
            this.scrollToBottom();
            document.getElementById('chat-input')?.focus();
        }
    }

    async callAgent(message, history, assistantId) {
        const body = { message, history: history.slice(-10), model: this.selectedModel === 'auto' ? undefined : this.selectedModel };
        const bubble = assistantId ? document.getElementById(`${assistantId}-bubble`) : null;
        let fullText = '';

        try {
            const res = await fetch('http://localhost:3000/api/chat/stream', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const raw = line.slice(6).trim();
                    if (raw === '[DONE]') break;
                    try {
                        const evt = JSON.parse(raw);
                        if (evt.chunk) {
                            fullText += evt.chunk;
                            if (bubble) bubble.innerHTML = this.formatContent(fullText);
                            this.scrollToBottom();
                        } else if (evt.tool) {
                            this.addLog('tool', `Tool: ${evt.tool} ${evt.status === 'running' ? '⚙️' : '✅'}`);
                            // Auto-refresh schedule when schedule tools are called
                            if (evt.tool.includes('schedule') && evt.status === 'done') this.fetchSchedule();
                        } else if (evt.done && evt.model) {
                            this.addLog('system', `Model: ${evt.model}`);
                        } else if (evt.error) {
                            throw new Error(evt.error);
                        }
                    } catch { /* skip malformed */ }
                }
            }
        } catch (e) {
            this.addLog('warn', 'Stream failed, fallback');
            const res = await fetch(this.agentEndpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            fullText = data.reply || '';
            if (bubble) bubble.innerHTML = this.formatContent(fullText);
            if (data.model) this.addLog('system', `Model: ${data.model}`);
        }
        return fullText;
    }

    async runQuickAction(action) {
        const zh = I18N.currentLang === 'zh';
        this.addLog('tool', `Running: ${action}`);

        if (action === 'week_schedule') {
            this.scheduleRange = 'week';
            await this.fetchSchedule();
            this.addLog('success', 'Week schedule loaded');
            return;
        }

        const epMap = {
            daily_brief: { url: 'http://localhost:3000/api/agent/daily-brief', method: 'POST' },
            get_schedule: { url: 'http://localhost:3000/api/agent/schedule', method: 'GET' },
            get_tasks: { url: 'http://localhost:3000/api/agent/tasks', method: 'GET' },
            get_workflow: { url: 'http://localhost:3000/api/agent/workflow', method: 'GET' },
            get_research_status: { url: 'http://localhost:3000/api/agent/research-status', method: 'GET' },
        };

        try {
            const ep = epMap[action];
            if (!ep) return;
            const res = await fetch(ep.url, { method: ep.method, headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.addLog('success', `Done: ${action}`);
            const labels = { daily_brief: zh ? '📋 每日简报' : '📋 Daily Brief', get_tasks: zh ? '✅ 任务列表' : '✅ Tasks', get_workflow: zh ? '🔄 工作流' : '🔄 Workflow', get_research_status: zh ? '🔬 科研进度' : '🔬 Research' };
            const summary = JSON.stringify(data, null, 2).slice(0, 300);
            this.activeSession.messages.push({ role: 'assistant', content: `${labels[action] || action}:\n${summary}` });
            this.appendMessage({ role: 'assistant', content: `${labels[action] || action}:\n${summary}` });
        } catch (e) {
            this.addLog('error', `Failed: ${e?.message}`);
        }
    }

    // ---- Utility methods ----
    confirmAction(message, onConfirm) {
        const zh = I18N.currentLang === 'zh';
        const overlay = document.createElement('div');
        overlay.className = 'ws-confirm-overlay';
        overlay.innerHTML = `<div class="ws-confirm-dialog">
            <p>${message}</p>
            <div class="ws-confirm-actions">
                <button class="btn btn-cancel">${zh ? '取消' : 'Cancel'}</button>
                <button class="btn btn-danger">${zh ? '确定' : 'Confirm'}</button>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
        overlay.querySelector('.btn-danger').addEventListener('click', () => { overlay.remove(); onConfirm(); });
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    }

    appendMessage(msg) {
        const el = document.getElementById('chat-messages');
        if (!el) return;
        el.querySelector('.chat-welcome')?.remove();
        el.insertAdjacentHTML('beforeend', this.renderMessage(msg));
        this.scrollToBottom();
    }

    clearChat() {
        const session = this.activeSession;
        session.messages = [];
        session.title = 'New Chat';
        const el = document.getElementById('chat-messages');
        if (el) el.innerHTML = this.renderWelcome();
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
        // Use marked.js if available for markdown rendering
        if (typeof marked !== 'undefined') {
            try {
                return marked.parse(String(text));
            } catch {
                return this.escapeHtml(text).replace(/\n/g, '<br>');
            }
        }
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

window.AgentModule = AgentModule;
