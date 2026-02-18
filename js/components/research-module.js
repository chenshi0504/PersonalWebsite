/**
 * 科研项目模块
 * 负责项目列表展示、详情页面和项目管理
 */
class ResearchModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.currentView = 'list'; // 'list' | 'detail'
        this.currentProject = null;
        this.currentFilters = {
            category: '',
            status: '',
            tags: [],
            search: ''
        };
        this.currentSort = {
            field: 'startDate',
            order: 'desc'
        };
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
            if (mainContent && mainContent.querySelector('.page-header')) {
                this.render(this.currentView, this.currentProject ? { id: this.currentProject.id } : {});
            }
        });
    }

    /**
     * 渲染模块
     * @param {string} view - 视图类型
     * @param {Object} params - 参数
     */
    render(view = 'list', params = {}) {
        this.currentView = view;

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到主内容容器');
            return;
        }

        switch (view) {
            case 'detail':
                this.renderProjectDetail(params.id);
                break;
            case 'list':
            default:
                this.renderProjectList();
                break;
        }
    }

    /**
     * 渲染项目列表
     */
    renderProjectList() {
        const i = k => I18N.t(k);
        const projects = this.getFilteredProjects();
        const categories = this.dataManager.getCategories('projects');
        const tags = this.dataManager.getTags('projects');
        const stats = this.dataManager.getStats().projects;

        const html = `
            <div class="page-header">
                <div class="container">
                    <h1 class="page-title">${i('research.title')}</h1>
                    <p class="page-subtitle">${i('research.subtitle')}</p>
                    <div class="page-stats">
                        <div class="stat-item">
                            <span class="stat-number">${stats.total}</span>
                            <span class="stat-label">${i('research.total')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.completed}</span>
                            <span class="stat-label">${i('research.completed')}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.inProgress}</span>
                            <span class="stat-label">${i('research.inProgress')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="content-grid">
                        <aside class="sidebar">
                            <div class="sidebar-section">
                                <h3 class="sidebar-title">${i('research.search')}</h3>
                                <div class="search-box">
                                    <input type="text" 
                                           class="search-input input" 
                                           placeholder="${i('research.searchPlaceholder')}"
                                           value="${this.currentFilters.search}">
                                    <span class="search-icon">🔍</span>
                                </div>
                            </div>

                            <div class="sidebar-section">
                                <h3 class="sidebar-title">${i('research.category')}</h3>
                                <div class="filter-group">
                                    <label class="filter-item">
                                        <input type="radio" name="category" value="" ${!this.currentFilters.category ? 'checked' : ''}>
                                        <span>${i('research.all')}</span>
                                    </label>
                                    ${categories.map(category => `
                                        <label class="filter-item">
                                            <input type="radio" name="category" value="${category}" ${this.currentFilters.category === category ? 'checked' : ''}>
                                            <span>${category}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="sidebar-section">
                                <h3 class="sidebar-title">${i('research.status')}</h3>
                                <div class="filter-group">
                                    <label class="filter-item">
                                        <input type="radio" name="status" value="" ${!this.currentFilters.status ? 'checked' : ''}>
                                        <span>${i('research.all')}</span>
                                    </label>
                                    <label class="filter-item">
                                        <input type="radio" name="status" value="completed" ${this.currentFilters.status === 'completed' ? 'checked' : ''}>
                                        <span>${i('research.statusCompleted')}</span>
                                    </label>
                                    <label class="filter-item">
                                        <input type="radio" name="status" value="in-progress" ${this.currentFilters.status === 'in-progress' ? 'checked' : ''}>
                                        <span>${i('research.statusInProgress')}</span>
                                    </label>
                                    <label class="filter-item">
                                        <input type="radio" name="status" value="planning" ${this.currentFilters.status === 'planning' ? 'checked' : ''}>
                                        <span>${i('research.statusPlanning')}</span>
                                    </label>
                                </div>
                            </div>

                            <div class="sidebar-section">
                                <h3 class="sidebar-title">${i('research.tags')}</h3>
                                <div class="tags-filter">
                                    ${tags.map(tag => `
                                        <label class="tag-filter-item">
                                            <input type="checkbox" value="${tag}" ${this.currentFilters.tags.includes(tag) ? 'checked' : ''}>
                                            <span class="tag">${tag}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="sidebar-section">
                                <h3 class="sidebar-title">${i('research.sort')}</h3>
                                <select class="sort-select input">
                                    <option value="startDate-desc" ${this.currentSort.field === 'startDate' && this.currentSort.order === 'desc' ? 'selected' : ''}>${i('research.sortNewest')}</option>
                                    <option value="startDate-asc" ${this.currentSort.field === 'startDate' && this.currentSort.order === 'asc' ? 'selected' : ''}>${i('research.sortOldest')}</option>
                                    <option value="title-asc" ${this.currentSort.field === 'title' && this.currentSort.order === 'asc' ? 'selected' : ''}>${i('research.sortTitleAZ')}</option>
                                    <option value="title-desc" ${this.currentSort.field === 'title' && this.currentSort.order === 'desc' ? 'selected' : ''}>${i('research.sortTitleZA')}</option>
                                </select>
                            </div>

                            ${this.hasActiveFilters() ? `
                                <div class="sidebar-section">
                                    <div class="active-filters">
                                        <div class="filter-summary">${this.getFilterSummary()}</div>
                                        <div class="filter-actions">
                                            <button class="btn btn-ghost btn-small clear-filters">${i('research.clearFilters')}</button>
                                            <button class="btn btn-ghost btn-small share-filters">${i('research.shareFilters')}</button>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </aside>

                        <main class="main-content-area">
                            <div class="projects-header">
                                <div class="projects-count">
                                    ${i('research.found')} <strong>${projects.length}</strong> ${i('research.projects')}
                                </div>
                                <div class="view-controls">
                                    <button class="btn btn-ghost view-btn active" data-view="grid">
                                        <span>⊞</span> ${i('research.grid')}
                                    </button>
                                    <button class="btn btn-ghost view-btn" data-view="list">
                                        <span>☰</span> ${i('research.list')}
                                    </button>
                                </div>
                            </div>

                            <div class="projects-container">
                                ${projects.length > 0 ? this.renderProjectsGrid(projects) : this.renderEmptyState()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 从URL加载筛选条件
        this.loadFiltersFromUrl();

        // 应用筛选条件到表单
        this.applyFiltersToForm();

        // 绑定事件
        this.bindProjectListEvents();

        // 如果有筛选条件，更新项目列表
        if (this.hasActiveFilters()) {
            this.updateProjectList();
        }
    }

    /**
     * 渲染项目网格
     * @param {Array} projects - 项目列表
     * @returns {string} HTML字符串
     */
    renderProjectsGrid(projects) {
        return `
            <div class="projects-grid">
                ${projects.map(project => this.renderProjectCard(project)).join('')}
            </div>
        `;
    }

    /**
     * 渲染项目卡片
     * @param {Object} project - 项目对象
     * @returns {string} HTML字符串
     */
    renderProjectCard(project) {
        const i = k => I18N.t(k);
        const statusClass = this.getStatusClass(project.status);
        const statusText = this.getStatusText(project.status);
        const duration = this.calculateProjectDuration(project);
        const hasImages = project.images && project.images.length > 0;
        const imageUrl = hasImages ? `images/projects/${project.images[0]}` : '';

        return `
            <article class="project-card card" data-project-id="${project.id}">
                ${hasImages ? `
                    <div class="project-image">
                        <img src="${imageUrl}" alt="${project.title}" loading="lazy">
                        <div class="project-image-overlay">
                            <button class="btn btn-primary view-project" data-project-id="${project.id}">
                                ${i('research.viewDetail')}
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                <div class="project-content">
                    <div class="project-header">
                        <h3 class="project-title">
                            <a href="#/research/${project.id}" class="project-link">${project.title}</a>
                        </h3>
                        <div class="project-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            ${project.featured ? `<span class="featured-badge">${i('research.featured')}</span>` : ''}
                        </div>
                    </div>

                    <p class="project-description">${Utils.truncateText(project.description, 120)}</p>

                    <div class="project-meta">
                        <div class="project-category">
                            <span class="meta-label">${i('research.category_label')}</span>
                            <span class="meta-value">${project.category}</span>
                        </div>
                        <div class="project-duration">
                            <span class="meta-label">${i('research.duration_label')}</span>
                            <span class="meta-value">${duration}</span>
                        </div>
                    </div>

                    <div class="project-technologies">
                        ${project.technologies.slice(0, 4).map(tech =>
            `<span class="tag tag-primary">${tech}</span>`
        ).join('')}
                        ${project.technologies.length > 4 ?
                `<span class="tag">+${project.technologies.length - 4}</span>` : ''
            }
                    </div>

                    <div class="project-actions">
                        <button class="btn btn-primary btn-small view-project" data-project-id="${project.id}">
                            ${i('research.viewDetail')}
                        </button>
                        ${project.links?.demo ?
                `<a href="${project.links.demo}" target="_blank" class="btn btn-secondary btn-small">
                                ${i('research.demo')}
                            </a>` : ''
            }
                        ${project.links?.github ?
                `<a href="${project.links.github}" target="_blank" class="btn btn-ghost btn-small">
                                ${i('research.code')}
                            </a>` : ''
            }
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * 渲染空状态
     * @returns {string} HTML字符串
     */
    renderEmptyState() {
        const i = k => I18N.t(k);
        return `
            <div class="empty-state">
                <div class="empty-icon">🔬</div>
                <h3>${i('research.notFound')}</h3>
                <p>${i('research.noResults')}</p>
                <button class="btn btn-primary clear-filters">${i('research.clearFilters')}</button>
            </div>
        `;
    }

    /**
     * 渲染项目详情
     * @param {string} projectId - 项目ID
     */
    renderProjectDetail(projectId) {
        const i = k => I18N.t(k);
        const project = this.dataManager.getProjectById(projectId);

        if (!project) {
            this.renderProjectNotFound();
            return;
        }

        this.currentProject = project;
        const duration = this.calculateProjectDuration(project);
        const statusClass = this.getStatusClass(project.status);
        const statusText = this.getStatusText(project.status);

        const html = `
            <div class="project-detail">
                <div class="project-hero">
                    <div class="container">
                        <nav class="breadcrumb">
                            <a href="#/research" class="breadcrumb-link">${i('research.backToList')}</a>
                            <span class="breadcrumb-separator">›</span>
                            <span class="breadcrumb-current">${project.title}</span>
                        </nav>

                        <div class="project-hero-content">
                            <div class="project-hero-info">
                                <h1 class="project-hero-title">${project.title}</h1>
                                <p class="project-hero-description">${project.description}</p>
                                
                                <div class="project-hero-meta">
                                    <div class="meta-item">
                                        <span class="meta-label">${i('research.status_label')}</span>
                                        <span class="status-badge ${statusClass}">${statusText}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">${i('research.category_label')}</span>
                                        <span class="meta-value">${project.category}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="meta-label">${i('research.duration_label')}</span>
                                        <span class="meta-value">${duration}</span>
                                    </div>
                                    ${project.featured ? `
                                        <div class="meta-item">
                                            <span class="featured-badge">${i('research.featured')}</span>
                                        </div>
                                    ` : ''}
                                </div>

                                <div class="project-hero-actions">
                                    ${project.links?.demo ?
                `<a href="${project.links.demo}" target="_blank" class="btn btn-primary">
                                            <span>🚀</span> ${i('research.liveDemo')}
                                        </a>` : ''
            }
                                    ${project.links?.github ?
                `<a href="${project.links.github}" target="_blank" class="btn btn-secondary">
                                            <span>📂</span> ${i('research.sourceCode')}
                                        </a>` : ''
            }
                                    <button class="btn btn-ghost share-project">
                                        <span>📤</span> ${i('research.share')}
                                    </button>
                                </div>
                            </div>

                            ${project.images && project.images.length > 0 ? `
                                <div class="project-hero-image">
                                    <img src="images/projects/${project.images[0]}" alt="${project.title}" class="hero-image">
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="project-content-section">
                    <div class="container">
                        <div class="project-content-grid">
                            <main class="project-main-content">
                                <section class="project-section">
                                    <h2>${i('research.techStack')}</h2>
                                    <div class="technologies-list">
                                        ${project.technologies.map(tech =>
                `<span class="tag tag-primary">${tech}</span>`
            ).join('')}
                                    </div>
                                </section>

                                ${project.images && project.images.length > 1 ? `
                                    <section class="project-section">
                                        <h2>${i('research.screenshots')}</h2>
                                        <div class="project-gallery">
                                            ${project.images.map((image, index) => `
                                                <div class="gallery-item" data-index="${index}">
                                                    <img src="images/projects/${image}" alt="${project.title} - ${index + 1}" loading="lazy">
                                                </div>
                                            `).join('')}
                                        </div>
                                    </section>
                                ` : ''}

                                <section class="project-section">
                                    <h2>${i('research.projectTags')}</h2>
                                    <div class="project-tags">
                                        ${project.tags.map(tag =>
                `<span class="tag">${tag}</span>`
            ).join('')}
                                    </div>
                                </section>
                            </main>

                            <aside class="project-sidebar">
                                <div class="project-info-card card">
                                    <h3>${i('research.projectInfo')}</h3>
                                    <div class="info-list">
                                        <div class="info-item">
                                            <span class="info-label">${i('research.startDate')}</span>
                                            <span class="info-value">${Utils.formatDate(project.startDate, 'YYYY-MM-DD')}</span>
                                        </div>
                                        ${project.endDate ? `
                                            <div class="info-item">
                                                <span class="info-label">${i('research.endDate')}</span>
                                                <span class="info-value">${Utils.formatDate(project.endDate, 'YYYY-MM-DD')}</span>
                                            </div>
                                        ` : ''}
                                        <div class="info-item">
                                            <span class="info-label">${i('research.status_label')}</span>
                                            <span class="info-value">
                                                <span class="status-badge ${statusClass}">${statusText}</span>
                                            </span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">${i('research.category_label')}</span>
                                            <span class="info-value">${project.category}</span>
                                        </div>
                                    </div>
                                </div>

                                ${project.links && Object.keys(project.links).length > 0 ? `
                                    <div class="project-links-card card">
                                        <h3>${i('research.links')}</h3>
                                        <div class="links-list">
                                            ${project.links.demo ? `
                                                <a href="${project.links.demo}" target="_blank" class="link-item">
                                                    <span class="link-icon">🚀</span>
                                                    <span class="link-text">${i('research.liveDemo')}</span>
                                                    <span class="link-arrow">→</span>
                                                </a>
                                            ` : ''}
                                            ${project.links.github ? `
                                                <a href="${project.links.github}" target="_blank" class="link-item">
                                                    <span class="link-icon">📂</span>
                                                    <span class="link-text">${i('research.sourceCode')}</span>
                                                    <span class="link-arrow">→</span>
                                                </a>
                                            ` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </aside>
                        </div>
                    </div>
                </div>

                <div class="related-projects-section">
                    <div class="container">
                        <h2>${i('research.relatedProjects')}</h2>
                        <div class="related-projects">
                            ${this.renderRelatedProjects(project)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindProjectDetailEvents();
    }

    /**
     * 渲染相关项目
     * @param {Object} currentProject - 当前项目
     * @returns {string} HTML字符串
     */
    renderRelatedProjects(currentProject) {
        const i = k => I18N.t(k);
        const allProjects = this.dataManager.getProjects();
        const relatedProjects = allProjects
            .filter(p => p.id !== currentProject.id)
            .filter(p =>
                p.category === currentProject.category ||
                p.tags.some(tag => currentProject.tags.includes(tag))
            )
            .slice(0, 3);

        if (relatedProjects.length === 0) {
            return `<p class="text-muted">${i('research.noRelated')}</p>`;
        }

        return `
            <div class="related-projects-grid">
                ${relatedProjects.map(project => `
                    <div class="related-project-card card">
                        <h4>
                            <a href="#/research/${project.id}" class="project-link">${project.title}</a>
                        </h4>
                        <p>${Utils.truncateText(project.description, 80)}</p>
                        <div class="project-meta">
                            <span class="status-badge ${this.getStatusClass(project.status)}">
                                ${this.getStatusText(project.status)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 渲染项目未找到页面
     */
    renderProjectNotFound() {
        const i = k => I18N.t(k);
        const html = `
            <div class="not-found-page">
                <div class="container">
                    <div class="not-found-content">
                        <div class="not-found-icon">🔍</div>
                        <h1>${i('research.notFound')}</h1>
                        <p>${i('research.notFoundDesc')}</p>
                        <div class="not-found-actions">
                            <a href="#/research" class="btn btn-primary">${i('research.backToResearch')}</a>
                            <a href="#/" class="btn btn-secondary">${i('research.backToHome')}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;
    }

    /**
     * 绑定项目列表事件
     */
    bindProjectListEvents() {
        const container = document.getElementById('main-content');

        // 搜索功能
        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.updateProjectList();
            }, 300));
        }

        // 分类筛选
        container.addEventListener('change', (e) => {
            if (e.target.name === 'category') {
                this.currentFilters.category = e.target.value;
                this.updateProjectList();
            } else if (e.target.name === 'status') {
                this.currentFilters.status = e.target.value;
                this.updateProjectList();
            }
        });

        // 标签筛选
        container.addEventListener('change', (e) => {
            if (e.target.closest('.tags-filter')) {
                const checkedTags = Array.from(container.querySelectorAll('.tags-filter input:checked'))
                    .map(input => input.value);
                this.currentFilters.tags = checkedTags;
                this.updateProjectList();
            }
        });

        // 排序
        const sortSelect = container.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [field, order] = e.target.value.split('-');
                this.currentSort = { field, order };
                this.updateProjectList();
            });
        }

        // 视图切换
        container.addEventListener('click', (e) => {
            if (e.target.matches('.view-btn')) {
                const viewType = e.target.dataset.view;
                this.switchView(viewType);
            }
        });

        // 项目卡片点击
        container.addEventListener('click', (e) => {
            if (e.target.matches('.view-project')) {
                const projectId = e.target.dataset.projectId;
                this.render('detail', { id: projectId });
            }
        });

        // 清除筛选
        container.addEventListener('click', (e) => {
            if (e.target.matches('.clear-filters')) {
                this.clearFilters();
            }
        });

        // 分享筛选
        container.addEventListener('click', (e) => {
            if (e.target.matches('.share-filters')) {
                this.shareFilters();
            }
        });
    }

    /**
     * 绑定项目详情事件
     */
    bindProjectDetailEvents() {
        const container = document.getElementById('main-content');

        // 分享项目
        container.addEventListener('click', (e) => {
            if (e.target.matches('.share-project')) {
                this.shareProject(this.currentProject);
            }
        });

        // 图片画廊
        container.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-item')) {
                const index = parseInt(e.target.closest('.gallery-item').dataset.index);
                this.openImageGallery(this.currentProject.images, index);
            }
        });
    }

    /**
     * 获取筛选后的项目
     * @returns {Array} 项目列表
     */
    getFilteredProjects() {
        const options = {
            category: this.currentFilters.category,
            status: this.currentFilters.status,
            tags: this.currentFilters.tags,
            search: this.currentFilters.search,
            sortBy: this.currentSort.field,
            sortOrder: this.currentSort.order
        };

        return this.dataManager.getProjects(options);
    }

    /**
     * 更新项目列表
     */
    updateProjectList() {
        const projects = this.getFilteredProjects();
        const projectsContainer = document.querySelector('.projects-container');
        const projectsCount = document.querySelector('.projects-count');

        if (projectsContainer) {
            projectsContainer.innerHTML = projects.length > 0 ?
                this.renderProjectsGrid(projects) :
                this.renderEmptyState();
        }

        if (projectsCount) {
            projectsCount.innerHTML = `找到 <strong>${projects.length}</strong> 个项目`;
        }

        // 更新URL参数
        this.updateUrlParams();
    }

    /**
     * 更新URL参数
     */
    updateUrlParams() {
        const params = new URLSearchParams();

        if (this.currentFilters.search) {
            params.set('search', this.currentFilters.search);
        }

        if (this.currentFilters.category) {
            params.set('category', this.currentFilters.category);
        }

        if (this.currentFilters.status) {
            params.set('status', this.currentFilters.status);
        }

        if (this.currentFilters.tags.length > 0) {
            params.set('tags', this.currentFilters.tags.join(','));
        }

        if (this.currentSort.field !== 'startDate' || this.currentSort.order !== 'desc') {
            params.set('sort', `${this.currentSort.field}-${this.currentSort.order}`);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `#/research?${queryString}` : '#/research';

        // 更新URL但不触发路由变化
        window.history.replaceState(null, '', newUrl);
    }

    /**
     * 从URL参数加载筛选条件
     */
    loadFiltersFromUrl() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

        this.currentFilters.search = urlParams.get('search') || '';
        this.currentFilters.category = urlParams.get('category') || '';
        this.currentFilters.status = urlParams.get('status') || '';
        this.currentFilters.tags = urlParams.get('tags') ? urlParams.get('tags').split(',') : [];

        const sort = urlParams.get('sort');
        if (sort) {
            const [field, order] = sort.split('-');
            this.currentSort = { field, order };
        }
    }

    /**
     * 应用筛选条件到表单
     */
    applyFiltersToForm() {
        const container = document.getElementById('main-content');
        if (!container) return;

        // 搜索框
        const searchInput = container.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = this.currentFilters.search;
        }

        // 分类单选框
        const categoryInputs = container.querySelectorAll('input[name="category"]');
        categoryInputs.forEach(input => {
            input.checked = input.value === this.currentFilters.category;
        });

        // 状态单选框
        const statusInputs = container.querySelectorAll('input[name="status"]');
        statusInputs.forEach(input => {
            input.checked = input.value === this.currentFilters.status;
        });

        // 标签复选框
        const tagInputs = container.querySelectorAll('.tags-filter input');
        tagInputs.forEach(input => {
            input.checked = this.currentFilters.tags.includes(input.value);
        });

        // 排序选择框
        const sortSelect = container.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.value = `${this.currentSort.field}-${this.currentSort.order}`;
        }
    }

    /**
     * 切换视图
     * @param {string} viewType - 视图类型
     */
    switchView(viewType) {
        const viewBtns = document.querySelectorAll('.view-btn');
        const projectsContainer = document.querySelector('.projects-container');

        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });

        if (projectsContainer) {
            projectsContainer.className = `projects-container view-${viewType}`;
        }
    }

    /**
     * 清除筛选条件
     */
    clearFilters() {
        this.resetFilters();

        // 重置表单
        const container = document.getElementById('main-content');
        const searchInput = container.querySelector('.search-input');
        const categoryInputs = container.querySelectorAll('input[name="category"]');
        const statusInputs = container.querySelectorAll('input[name="status"]');
        const tagInputs = container.querySelectorAll('.tags-filter input');
        const sortSelect = container.querySelector('.sort-select');

        if (searchInput) searchInput.value = '';
        categoryInputs.forEach(input => input.checked = input.value === '');
        statusInputs.forEach(input => input.checked = input.value === '');
        tagInputs.forEach(input => input.checked = false);
        if (sortSelect) sortSelect.value = 'startDate-desc';

        this.updateProjectList();

        // 显示成功消息
        this.notificationManager.showSuccess('筛选条件已清除');
    }

    /**
     * 分享筛选条件
     */
    shareFilters() {
        const url = window.location.href;
        const summary = this.getFilterSummary();
        const stats = this.getFilterStats();

        const shareText = `项目筛选结果：${summary}\n找到 ${stats.filtered} 个项目（共 ${stats.total} 个）`;

        if (navigator.share) {
            navigator.share({
                title: '项目筛选结果',
                text: shareText,
                url: url
            }).catch(console.error);
        } else {
            Utils.copyToClipboard(url).then(() => {
                this.notificationManager.showSuccess('筛选链接已复制到剪贴板');
            }).catch(() => {
                this.notificationManager.showError('复制链接失败');
            });
        }
    }

    /**
     * 分享项目
     * @param {Object} project - 项目对象
     */
    shareProject(project) {
        const url = `${window.location.origin}${window.location.pathname}#/research/${project.id}`;
        const text = `查看我的项目：${project.title}`;

        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: text,
                url: url
            }).catch(console.error);
        } else {
            Utils.copyToClipboard(url).then(() => {
                this.notificationManager.showSuccess('项目链接已复制到剪贴板');
            }).catch(() => {
                this.notificationManager.showError('复制链接失败');
            });
        }
    }

    /**
     * 打开图片画廊
     * @param {Array} images - 图片列表
     * @param {number} startIndex - 起始索引
     */
    openImageGallery(images, startIndex = 0) {
        // 这里可以集成第三方图片查看器，如PhotoSwipe
        // 目前简单实现
        console.log('打开图片画廊:', images, startIndex);
    }

    /**
     * 获取状态样式类
     * @param {string} status - 状态
     * @returns {string} 样式类
     */
    getStatusClass(status) {
        const statusClasses = {
            'completed': 'status-completed',
            'in-progress': 'status-in-progress',
            'planning': 'status-planning',
            'paused': 'status-paused'
        };
        return statusClasses[status] || 'status-default';
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态
     * @returns {string} 状态文本
     */
    getStatusText(status) {
        const map = {
            'completed': 'research.statusCompleted',
            'in-progress': 'research.statusInProgress',
            'planning': 'research.statusPlanning',
            'paused': 'research.statusPaused'
        };
        return I18N.t(map[status] || 'research.all');
    }

    /**
     * 计算项目周期
     * @param {Object} project - 项目对象
     * @returns {string} 周期文本
     */
    calculateProjectDuration(project) {
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : new Date();

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} 天`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} 个月`;
        } else {
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            return months > 0 ? `${years} 年 ${months} 个月` : `${years} 年`;
        }
    }

    /**
     * 检查是否有活动的筛选条件
     * @returns {boolean} 是否有筛选条件
     */
    hasActiveFilters() {
        return !!(
            this.currentFilters.search ||
            this.currentFilters.category ||
            this.currentFilters.status ||
            this.currentFilters.tags.length > 0 ||
            this.currentSort.field !== 'startDate' ||
            this.currentSort.order !== 'desc'
        );
    }

    /**
     * 获取筛选条件摘要
     * @returns {string} 筛选摘要
     */
    getFilterSummary() {
        const summary = [];

        if (this.currentFilters.search) {
            summary.push(`搜索: "${this.currentFilters.search}"`);
        }

        if (this.currentFilters.category) {
            summary.push(`分类: ${this.currentFilters.category}`);
        }

        if (this.currentFilters.status) {
            summary.push(`状态: ${this.getStatusText(this.currentFilters.status)}`);
        }

        if (this.currentFilters.tags.length > 0) {
            summary.push(`标签: ${this.currentFilters.tags.join(', ')}`);
        }

        return summary.join(' | ');
    }

    /**
     * 导出筛选条件
     * @returns {Object} 筛选条件对象
     */
    exportFilters() {
        return {
            filters: { ...this.currentFilters },
            sort: { ...this.currentSort }
        };
    }

    /**
     * 导入筛选条件
     * @param {Object} data - 筛选条件数据
     */
    importFilters(data) {
        if (data.filters) {
            this.currentFilters = { ...data.filters };
        }

        if (data.sort) {
            this.currentSort = { ...data.sort };
        }

        this.applyFiltersToForm();
        this.updateProjectList();
    }

    /**
     * 重置筛选条件到默认状态
     */
    resetFilters() {
        this.currentFilters = {
            category: '',
            status: '',
            tags: [],
            search: ''
        };

        this.currentSort = {
            field: 'startDate',
            order: 'desc'
        };
    }

    /**
     * 获取筛选统计信息
     * @returns {Object} 统计信息
     */
    getFilterStats() {
        const allProjects = this.dataManager.getProjects();
        const filteredProjects = this.getFilteredProjects();

        return {
            total: allProjects.length,
            filtered: filteredProjects.length,
            percentage: allProjects.length > 0 ? Math.round((filteredProjects.length / allProjects.length) * 100) : 0
        };
    }

    /**
     * 销毁模块
     */
    destroy() {
        this.currentProject = null;
        this.isInitialized = false;
        console.log('科研项目模块已销毁');
    }
}

// 导出科研项目模块
window.ResearchModule = ResearchModule;