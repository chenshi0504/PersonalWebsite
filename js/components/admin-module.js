/**
 * 管理模块
 * 负责内容管理、新增、编辑和删除功能
 */
class AdminModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.currentTab = 'articles'; // 'articles' | 'projects' | 'interests'
        this.isInitialized = false;
    }

    /**
     * 初始化模块
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        this.isInitialized = true;
        document.addEventListener('langchange', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent && mainContent.querySelector('.admin-container')) {
                this.render(this.currentTab);
            }
        });
    }

    /**
     * 渲染管理页面
     */
    render(tab = 'articles') {
        this.currentTab = tab;
        const i = k => I18N.t(k);

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到主内容容器');
            return;
        }

        const html = `
            <div class="page-header">
                <div class="container">
                    <h1 class="page-title">${i('admin.title')}</h1>
                    <p class="page-subtitle">${i('admin.subtitle')}</p>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="admin-container">
                        <div class="admin-tabs">
                            <button class="admin-tab-btn ${tab === 'agent-outputs' ? 'active' : ''}" data-tab="agent-outputs">
                                🤖 Agent Files
                            </button>
                            <button class="admin-tab-btn ${tab === 'articles' ? 'active' : ''}" data-tab="articles">
                                📚 Articles
                            </button>
                            <button class="admin-tab-btn ${tab === 'projects' ? 'active' : ''}" data-tab="projects">
                                🔬 Projects
                            </button>
                            <button class="admin-tab-btn ${tab === 'interests' ? 'active' : ''}" data-tab="interests">
                                🎨 Gallery
                            </button>
                        </div>

                        <div class="admin-content">
                            ${this.renderTabContent(tab)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = html;
        this.bindEvents();
    }

    /**
     * 渲染标签内容
     */
    renderTabContent(tab) {
        switch (tab) {
            case 'agent-outputs':
                return this.renderAgentOutputsTab();
            case 'articles':
                return this.renderArticlesTab();
            case 'projects':
                return this.renderProjectsTab();
            case 'interests':
                return this.renderInterestsTab();
            default:
                return '';
        }
    }

    /**
     * 渲染 Agent 输出/文件 标签
     */
    renderAgentOutputsTab() {
        const outputs = JSON.parse(localStorage.getItem('agent-admin-outputs') || '[]');
        const zh = I18N.currentLang === 'zh';
        const basePath = 'D:\\chenshi\\Personal-Agent\\PersonalWebsite';

        // Also fetch real files from backend
        return `
            <div class="admin-tab-content">
                <div class="admin-header">
                    <h2>${zh ? 'Agent 生成的文件与输出' : 'Agent Files & Outputs'}</h2>
                    <div style="display:flex;gap:8px">
                        <button class="btn btn-primary" id="admin-refresh-files">🔄 ${zh ? '刷新文件列表' : 'Refresh Files'}</button>
                        <button class="btn btn-secondary" id="admin-clear-outputs">🗑 ${zh ? '清空保存记录' : 'Clear Saved'}</button>
                    </div>
                </div>

                <div class="admin-section">
                    <h3 style="font-size:14px;color:var(--color-text-secondary);margin-bottom:8px">📂 ${zh ? '工作区文件路径' : 'Workspace File Paths'}</h3>
                    <div class="admin-file-paths" style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:8px;padding:12px;font-family:Consolas,Monaco,monospace;font-size:12px;color:var(--color-text-muted);margin-bottom:16px">
                        <div style="margin-bottom:4px">📁 <span style="color:var(--color-accent)">${basePath}\\data\\</span> — ${zh ? '数据文件' : 'Data files'}</div>
                        <div style="margin-bottom:4px">📁 <span style="color:var(--color-accent)">${basePath}\\js\\</span> — ${zh ? '脚本文件' : 'Scripts'}</div>
                        <div style="margin-bottom:4px">📁 <span style="color:var(--color-accent)">${basePath}\\css\\</span> — ${zh ? '样式文件' : 'Styles'}</div>
                        <div style="margin-bottom:4px">📁 <span style="color:var(--color-accent)">D:\\chenshi\\Personal-Agent\\AgentSystem\\backend\\data\\</span> — ${zh ? 'Agent 记忆/任务' : 'Agent memory/tasks'}</div>
                        <div>📁 <span style="color:var(--color-accent)">D:\\chenshi\\Personal-Agent\\AgentSystem\\docs\\</span> — ${zh ? '文档' : 'Docs'}</div>
                    </div>
                </div>

                <div class="admin-section">
                    <h3 style="font-size:14px;color:var(--color-text-secondary);margin-bottom:8px">📋 ${zh ? '最近文件操作' : 'Recent File Operations'}</h3>
                    <div id="admin-file-list" style="margin-bottom:16px">
                        <div style="color:var(--color-text-muted);font-size:12px;font-style:italic;padding:8px">${zh ? '点击"刷新文件列表"加载...' : 'Click "Refresh Files" to load...'}</div>
                    </div>
                </div>

                <div class="admin-section">
                    <h3 style="font-size:14px;color:var(--color-text-secondary);margin-bottom:8px">💾 ${zh ? '保存的 Agent 输出' : 'Saved Agent Outputs'} (${outputs.length})</h3>
                    <div class="admin-list">
                        ${outputs.length > 0 ? outputs.map((o, idx) => `
                            <div class="admin-item">
                                <div class="item-info">
                                    <h4>${this.escapeHtml(o.title)}</h4>
                                    <div class="item-content-preview" style="font-size:12px;color:var(--color-text-muted);max-height:60px;overflow:hidden;margin:4px 0">${o.content || ''}</div>
                                    <div class="item-meta">
                                        <span class="date">${o.savedAt ? new Date(o.savedAt).toLocaleString('zh-CN') : o.ts || ''}</span>
                                    </div>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-small delete-output-btn" data-idx="${idx}">🗑</button>
                                </div>
                            </div>
                        `).join('') : `<p class="empty-message">${zh ? '暂无保存的输出' : 'No saved outputs yet'}</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染文章管理标签
     */
    renderArticlesTab() {
        const articles = this.dataManager.getArticles();

        return `
            <div class="admin-tab-content">
                <div class="admin-header">
                    <h2>Articles</h2>
                    <button class="btn btn-primary add-new-btn" data-type="article">
                        + New Article
                    </button>
                </div>

                <div class="admin-list">
                    ${articles.length > 0 ? articles.map(article => `
                        <div class="admin-item">
                            <div class="item-info">
                                <h4>${article.title}</h4>
                                <p>${article.summary}</p>
                                <div class="item-meta">
                                    <span class="category">${article.category}</span>
                                    <span class="date">${article.publishDate}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-small edit-btn" data-id="${article.id}" data-type="article">Edit</button>
                                <button class="btn btn-small btn-danger delete-btn" data-id="${article.id}" data-type="article">Delete</button>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-message">No articles yet</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 渲染项目管理标签
     */
    renderProjectsTab() {
        const projects = this.dataManager.getProjects();

        return `
            <div class="admin-tab-content">
                <div class="admin-header">
                    <h2>Projects</h2>
                    <button class="btn btn-primary add-new-btn" data-type="project">
                        + New Project
                    </button>
                </div>

                <div class="admin-list">
                    ${projects.length > 0 ? projects.map(project => `
                        <div class="admin-item">
                            <div class="item-info">
                                <h4>${project.title}</h4>
                                <p>${project.description}</p>
                                <div class="item-meta">
                                    <span class="category">${project.category}</span>
                                    <span class="status">${project.status}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-small edit-btn" data-id="${project.id}" data-type="project">Edit</button>
                                <button class="btn btn-small btn-danger delete-btn" data-id="${project.id}" data-type="project">Delete</button>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-message">No projects yet</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 渲染兴趣管理标签
     */
    renderInterestsTab() {
        const interests = this.dataManager.getInterests();

        return `
            <div class="admin-tab-content">
                <div class="admin-header">
                    <h2>Gallery Items</h2>
                    <button class="btn btn-primary add-new-btn" data-type="interest">
                        + New Item
                    </button>
                </div>

                <div class="admin-list">
                    ${interests.length > 0 ? interests.map(interest => `
                        <div class="admin-item">
                            <div class="item-info">
                                <h4>${interest.title}</h4>
                                <p>${interest.description}</p>
                                <div class="item-meta">
                                    <span class="category">${interest.category}</span>
                                    <span class="date">${interest.date}</span>
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-small edit-btn" data-id="${interest.id}" data-type="interest">Edit</button>
                                <button class="btn btn-small btn-danger delete-btn" data-id="${interest.id}" data-type="interest">Delete</button>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-message">No items yet</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 标签切换
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.render(tab);
            });
        });

        // Agent outputs: refresh files
        document.getElementById('admin-refresh-files')?.addEventListener('click', () => this.loadAgentFiles());

        // Agent outputs: clear saved
        document.getElementById('admin-clear-outputs')?.addEventListener('click', () => {
            localStorage.removeItem('agent-admin-outputs');
            this.render('agent-outputs');
        });

        // Agent outputs: delete single
        document.querySelectorAll('.delete-output-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const outputs = JSON.parse(localStorage.getItem('agent-admin-outputs') || '[]');
                outputs.splice(idx, 1);
                localStorage.setItem('agent-admin-outputs', JSON.stringify(outputs));
                this.render('agent-outputs');
            });
        });

        // 新增按钮
        document.querySelectorAll('.add-new-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.showAddForm(type);
            });
        });

        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.showEditForm(type, id);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const type = e.target.dataset.type;
                this.confirmDelete(type, id);
            });
        });
    }

    /**
     * 显示新增表单
     */
    showAddForm(type) {
        const form = this.createForm(type);
        this.showModal(form, `New ${this.getTypeName(type)}`);
    }

    /**
     * 显示编辑表单
     */
    showEditForm(type, id) {
        let item = null;
        if (type === 'article') {
            item = this.dataManager.getArticleById(id);
        } else if (type === 'project') {
            item = this.dataManager.getProjectById(id);
        } else if (type === 'interest') {
            item = this.dataManager.getInterestById(id);
        }

        if (!item) {
            this.notificationManager.showError('Project not found');
            return;
        }

        const form = this.createForm(type, item);
        this.showModal(form, `Edit ${this.getTypeName(type)}`);
    }

    /**
     * 创建表单
     */
    createForm(type, item = null) {
        const isEdit = !!item;

        if (type === 'article') {
            return `
                <form class="admin-form" data-type="article" data-id="${item?.id || ''}">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value="${item?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Summary</label>
                        <textarea name="summary" required>${item?.summary || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Content</label>
                        <textarea name="content" rows="20" required>${item?.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" name="category" value="${item?.category || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated)</label>
                        <input type="text" name="tags" value="${item?.tags?.join(', ') || ''}" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Add'}</button>
                    </div>
                </form>
            `;
        } else if (type === 'project') {
            return `
                <form class="admin-form" data-type="project" data-id="${item?.id || ''}">
                    <div class="form-group">
                        <label>Project Title *</label>
                        <input type="text" name="title" value="${item?.title || ''}" placeholder="e.g., Deep Learning-based Image Recognition System" required>
                    </div>
                    <div class="form-group">
                        <label>Project Description *</label>
                        <textarea name="description" rows="6" placeholder="Describe research background, objectives, methods, and innovations..." required>${item?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Research Field *</label>
                        <input type="text" name="category" value="${item?.category || ''}" placeholder="e.g., Machine Learning, Computer Vision, NLP" required>
                    </div>
                    <div class="form-group">
                        <label>Project Status *</label>
                        <select name="status" required>
                            <option value="planning" ${item?.status === 'planning' ? 'selected' : ''}>Planning</option>
                            <option value="in-progress" ${item?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${item?.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="paused" ${item?.status === 'paused' ? 'selected' : ''}>Paused</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Technologies/Methods *</label>
                        <input type="text" name="technologies" value="${item?.technologies?.join(', ') || ''}" placeholder="e.g., Python, TensorFlow, PyTorch, OpenCV" required>
                    </div>
                    <div class="form-group">
                        <label>Start Date *</label>
                        <input type="date" name="startDate" value="${item?.startDate || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value="${item?.endDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>Tags (comma separated) *</label>
                        <input type="text" name="tags" value="${item?.tags?.join(', ') || ''}" placeholder="e.g., Deep Learning, Image Processing, Publication" required>
                    </div>
                    <div class="form-group">
                        <label>Project Link</label>
                        <input type="url" name="link" value="${item?.link || ''}" placeholder="GitHub, paper link, etc.">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Add'}</button>
                    </div>
                </form>
            `;
        } else if (type === 'interest') {
            return `
                <form class="admin-form" data-type="interest" data-id="${item?.id || ''}">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value="${item?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" required>${item?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <input type="text" name="category" value="${item?.category || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value="${item?.date || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value="${item?.location || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save' : 'Add'}</button>
                    </div>
                </form>
            `;
        }

        return '';
    }

    /**
     * 显示模态框
     */
    showModal(content, title) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal modal-backdrop';
        modal.innerHTML = `
            <div class="modal admin-modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close btn btn-ghost" aria-label="关闭">×</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = modal.querySelector('.admin-form');

        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove();
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(form);
                modal.remove();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * 处理表单提交
     */
    async handleFormSubmit(form) {
        const type = form.dataset.type;
        const id = form.dataset.id;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // 处理数组字段
        if (data.tags) {
            data.tags = data.tags.split(',').map(t => t.trim());
        }
        if (data.technologies) {
            data.technologies = data.technologies.split(',').map(t => t.trim());
        }

        try {
            if (type === 'article') {
                if (id) {
                    data.publishDate = data.publishDate || new Date().toISOString().split('T')[0];
                    await this.dataManager.updateArticle(id, data);
                    this.notificationManager.showSuccess('Article updated successfully');
                } else {
                    data.id = this.dataManager.generateId('article');
                    data.publishDate = new Date().toISOString().split('T')[0];
                    await this.dataManager.addArticle(data);
                    this.notificationManager.showSuccess('Article added successfully');
                }
            } else if (type === 'project') {
                if (id) {
                    await this.dataManager.updateProject(id, data);
                    this.notificationManager.showSuccess('Project updated successfully');
                } else {
                    data.id = this.dataManager.generateId('project');
                    data.startDate = data.startDate || new Date().toISOString().split('T')[0];
                    await this.dataManager.addProject(data);
                    this.notificationManager.showSuccess('Project added successfully');
                }
            } else if (type === 'interest') {
                if (id) {
                    await this.dataManager.updateInterest(id, data);
                    this.notificationManager.showSuccess('Item updated successfully');
                } else {
                    data.id = this.dataManager.generateId('interest');
                    await this.dataManager.addInterest(data);
                    this.notificationManager.showSuccess('Item added successfully');
                }
            }

            // 重新渲染
            this.render(this.currentTab);
        } catch (error) {
            this.notificationManager.showError(`操作失败: ${error.message}`);
        }
    }

    /**
     * 确认删除
     */
    confirmDelete(type, id) {
        this.notificationManager.showConfirm(
            `Are you sure you want to delete this ${this.getTypeName(type)}?`,
            async () => {
                try {
                    if (type === 'article') {
                        await this.dataManager.deleteArticle(id);
                    } else if (type === 'project') {
                        await this.dataManager.deleteProject(id);
                    } else if (type === 'interest') {
                        await this.dataManager.deleteInterest(id);
                    }
                    this.notificationManager.showSuccess('Deleted successfully');
                    this.render(this.currentTab);
                } catch (error) {
                    this.notificationManager.showError(`Delete failed: ${error.message}`);
                }
            },
            () => {
                // 取消删除
            }
        );
    }

    /**
     * 获取类型名称
     */
    getTypeName(type) {
        const names = {
            'article': 'Article',
            'project': 'Project',
            'interest': 'Item'
        };
        return names[type] || type;
    }

    /**
     * 从后端加载 Agent 文件列表
     */
    async loadAgentFiles() {
        const el = document.getElementById('admin-file-list');
        if (!el) return;
        const zh = I18N.currentLang === 'zh';
        el.innerHTML = `<div style="color:var(--color-text-muted);font-size:12px;padding:8px">${zh ? '加载中...' : 'Loading...'}</div>`;

        try {
            // Use the agent chat endpoint to ask for file listing
            const dirs = ['PersonalWebsite/data', 'AgentSystem/backend/data', 'AgentSystem/docs'];
            const results = [];
            for (const dir of dirs) {
                try {
                    const res = await fetch('http://localhost:3000/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: `<tool_call>{"tool":"list_files","args":{"path":"${dir}"}}</tool_call>`, history: [] })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.toolCallLog) {
                            data.toolCallLog.forEach(tc => {
                                if (tc.result && tc.result.entries) {
                                    tc.result.entries.forEach(e => {
                                        results.push({ dir, name: e.name, type: e.type, size: e.size });
                                    });
                                }
                            });
                        }
                    }
                } catch { /* skip */ }
            }

            if (results.length === 0) {
                el.innerHTML = `<div style="color:var(--color-text-muted);font-size:12px;font-style:italic;padding:8px">${zh ? '未找到文件或后端未运行' : 'No files found or backend offline'}</div>`;
                return;
            }

            el.innerHTML = results.map(f => {
                const icon = f.type === 'dir' ? '📂' : '📄';
                const sizeStr = f.size ? ` (${(f.size / 1024).toFixed(1)} KB)` : '';
                return `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;font-size:12px;border-bottom:1px solid var(--color-border)">
                    <span>${icon}</span>
                    <span style="color:var(--color-accent);font-family:Consolas,monospace">${f.dir}/${f.name}</span>
                    <span style="color:var(--color-text-muted);margin-left:auto">${sizeStr}</span>
                </div>`;
            }).join('');
        } catch (e) {
            el.innerHTML = `<div style="color:#ff5555;font-size:12px;padding:8px">Error: ${e.message}</div>`;
        }
    }

    escapeHtml(text) {
        return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * 销毁模块
     */
    destroy() {
        this.currentTab = 'articles';
        this.isInitialized = false;
    }
}

// 导出管理模块
window.AdminModule = AdminModule;
