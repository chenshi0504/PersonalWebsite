/**
 * 生活兴趣模块
 * 负责展示个人兴趣、爱好和生活动态
 */
class InterestsModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.currentView = 'grid'; // 'grid' | 'timeline' | 'detail'
        this.currentCategory = '';
        this.currentInterest = null;
        this.currentFilters = {
            category: '',
            type: '',
            search: '',
            dateRange: null
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

        console.log('初始化生活兴趣模块...');
        this.isInitialized = true;
        console.log('生活兴趣模块初始化完成');
    }

    /**
     * 渲染模块
     * @param {string} view - 视图类型
     * @param {Object} params - 参数
     */
    render(view = 'grid', params = {}) {
        this.currentView = view;

        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('找不到主内容容器');
            return;
        }

        switch (view) {
            case 'timeline':
                this.renderTimelineView();
                break;
            case 'detail':
                this.renderInterestDetail(params.id);
                break;
            case 'category':
                this.renderCategoryView(params.category);
                break;
            case 'grid':
            default:
                this.renderGridView();
                break;
        }
    }

    /**
     * 渲染网格视图
     */
    renderGridView() {
        const interests = this.getFilteredInterests();
        const categories = this.dataManager.getCategories('interests');
        const stats = this.dataManager.getStats().interests;

        const html = `
            <div class="page-header">
                <div class="container">
                    <h1 class="page-title">生活兴趣</h1>
                    <p class="page-subtitle">记录生活中的美好时光和个人兴趣爱好</p>
                    <div class="page-stats">
                        <div class="stat-item">
                            <span class="stat-number">${stats.total}</span>
                            <span class="stat-label">总动态</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.categories}</span>
                            <span class="stat-label">兴趣分类</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.photos}</span>
                            <span class="stat-label">照片数量</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="interests-controls">
                        <div class="view-switcher">
                            <button class="btn btn-ghost view-btn ${this.currentView === 'grid' ? 'active' : ''}" data-view="grid">
                                <span>⊞</span> 网格视图
                            </button>
                            <button class="btn btn-ghost view-btn ${this.currentView === 'timeline' ? 'active' : ''}" data-view="timeline">
                                <span>📅</span> 时间线
                            </button>
                        </div>

                        <div class="category-filter">
                            <button class="btn btn-ghost category-btn ${!this.currentCategory ? 'active' : ''}" data-category="">
                                全部
                            </button>
                            ${categories.map(category => `
                                <button class="btn btn-ghost category-btn ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">
                                    ${this.getCategoryIcon(category)} ${category}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="interests-content">
                        ${interests.length > 0 ? this.renderInterestsGrid(interests) : this.renderEmptyState()}
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindGridViewEvents();
    }

    /**
     * 渲染时间线视图
     */
    renderTimelineView() {
        const interests = this.getFilteredInterests().sort((a, b) => new Date(b.date) - new Date(a.date));
        const categories = this.dataManager.getCategories('interests');

        const html = `
            <div class="page-header">
                <div class="container">
                    <h1 class="page-title">生活时间线</h1>
                    <p class="page-subtitle">按时间顺序回顾生活中的精彩瞬间</p>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="interests-controls">
                        <div class="view-switcher">
                            <button class="btn btn-ghost view-btn ${this.currentView === 'grid' ? 'active' : ''}" data-view="grid">
                                <span>⊞</span> 网格视图
                            </button>
                            <button class="btn btn-ghost view-btn ${this.currentView === 'timeline' ? 'active' : ''}" data-view="timeline">
                                <span>📅</span> 时间线
                            </button>
                        </div>

                        <div class="category-filter">
                            <button class="btn btn-ghost category-btn ${!this.currentCategory ? 'active' : ''}" data-category="">
                                全部
                            </button>
                            ${categories.map(category => `
                                <button class="btn btn-ghost category-btn ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">
                                    ${this.getCategoryIcon(category)} ${category}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="timeline-container">
                        ${interests.length > 0 ? this.renderTimeline(interests) : this.renderEmptyState()}
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindTimelineViewEvents();
    }

    /**
     * 渲染兴趣网格
     * @param {Array} interests - 兴趣列表
     * @returns {string} HTML字符串
     */
    renderInterestsGrid(interests) {
        return `
            <div class="interests-grid">
                ${interests.map(interest => this.renderInterestCard(interest)).join('')}
            </div>
        `;
    }

    /**
     * 渲染时间线
     * @param {Array} interests - 兴趣列表
     * @returns {string} HTML字符串
     */
    renderTimeline(interests) {
        const groupedByYear = this.groupInterestsByYear(interests);

        return `
            <div class="timeline">
                ${Object.keys(groupedByYear).sort((a, b) => b - a).map(year => `
                    <div class="timeline-year">
                        <h3 class="year-title">${year}</h3>
                        <div class="timeline-items">
                            ${groupedByYear[year].map(interest => `
                                <div class="timeline-item" data-id="${interest.id}">
                                    <div class="timeline-date">
                                        ${this.formatDate(interest.date)}
                                    </div>
                                    <div class="timeline-content">
                                        <div class="timeline-card">
                                            ${interest.image ? `
                                                <div class="timeline-image">
                                                    <img src="${interest.image}" alt="${interest.title}" loading="lazy">
                                                </div>
                                            ` : ''}
                                            <div class="timeline-info">
                                                <h4 class="timeline-title">${interest.title}</h4>
                                                <p class="timeline-description">${interest.description}</p>
                                                <div class="timeline-meta">
                                                    <span class="category-tag">${this.getCategoryIcon(interest.category)} ${interest.category}</span>
                                                    ${interest.location ? `<span class="location-tag">📍 ${interest.location}</span>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 渲染兴趣卡片
     * @param {Object} interest - 兴趣对象
     * @returns {string} HTML字符串
     */
    renderInterestCard(interest) {
        return `
            <div class="interest-card" data-id="${interest.id}">
                ${interest.image ? `
                    <div class="interest-image">
                        <img src="${interest.image}" alt="${interest.title}" loading="lazy">
                        <div class="interest-overlay">
                            <button class="btn btn-primary view-detail-btn">查看详情</button>
                        </div>
                    </div>
                ` : ''}
                <div class="interest-content">
                    <h3 class="interest-title">${interest.title}</h3>
                    <p class="interest-description">${interest.description}</p>
                    <div class="interest-meta">
                        <span class="category-tag">${this.getCategoryIcon(interest.category)} ${interest.category}</span>
                        <span class="date-tag">📅 ${this.formatDate(interest.date)}</span>
                        ${interest.location ? `<span class="location-tag">📍 ${interest.location}</span>` : ''}
                    </div>
                    ${interest.tags && interest.tags.length > 0 ? `
                        <div class="interest-tags">
                            ${interest.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 渲染分类视图
     * @param {string} category - 分类名称
     */
    renderCategoryView(category) {
        this.currentCategory = category;
        this.renderGridView();
    }

    /**
     * 渲染兴趣详情
     * @param {string} id - 兴趣ID
     */
    renderInterestDetail(id) {
        const interest = this.dataManager.getInterestById(id);
        if (!interest) {
            this.notificationManager.show('兴趣不存在', 'error');
            this.render('grid');
            return;
        }

        this.currentInterest = interest;

        const html = `
            <div class="page-header">
                <div class="container">
                    <nav class="breadcrumb">
                        <a href="#" class="breadcrumb-link" data-action="back">生活兴趣</a>
                        <span class="breadcrumb-separator">></span>
                        <span class="breadcrumb-current">${interest.title}</span>
                    </nav>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="interest-detail">
                        ${interest.image ? `
                            <div class="detail-image">
                                <img src="${interest.image}" alt="${interest.title}">
                            </div>
                        ` : ''}
                        
                        <div class="detail-content">
                            <h1 class="detail-title">${interest.title}</h1>
                            <div class="detail-meta">
                                <span class="category-tag">${this.getCategoryIcon(interest.category)} ${interest.category}</span>
                                <span class="date-tag">📅 ${this.formatDate(interest.date)}</span>
                                ${interest.location ? `<span class="location-tag">📍 ${interest.location}</span>` : ''}
                            </div>
                            
                            <div class="detail-description">
                                ${interest.content || interest.description}
                            </div>

                            ${interest.tags && interest.tags.length > 0 ? `
                                <div class="detail-tags">
                                    <h3>标签</h3>
                                    <div class="tags-list">
                                        ${interest.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${interest.gallery && interest.gallery.length > 0 ? `
                                <div class="detail-gallery">
                                    <h3>相册</h3>
                                    <div class="gallery-grid">
                                        ${interest.gallery.map(image => `
                                            <div class="gallery-item">
                                                <img src="${image.url}" alt="${image.caption || interest.title}" loading="lazy">
                                                ${image.caption ? `<p class="gallery-caption">${image.caption}</p>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindDetailViewEvents();
    }

    /**
     * 渲染空状态
     * @returns {string} HTML字符串
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🎨</div>
                <h3 class="empty-title">暂无兴趣动态</h3>
                <p class="empty-description">还没有记录任何兴趣爱好，开始分享你的生活吧！</p>
            </div>
        `;
    }

    /**
     * 获取过滤后的兴趣列表
     * @returns {Array} 兴趣列表
     */
    getFilteredInterests() {
        let interests = this.dataManager.getInterests();

        // 分类筛选
        if (this.currentCategory) {
            interests = interests.filter(interest => interest.category === this.currentCategory);
        }

        // 其他筛选条件
        if (this.currentFilters.type) {
            interests = interests.filter(interest => interest.type === this.currentFilters.type);
        }

        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            interests = interests.filter(interest =>
                interest.title.toLowerCase().includes(searchTerm) ||
                interest.description.toLowerCase().includes(searchTerm) ||
                (interest.tags && interest.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        return interests;
    }

    /**
     * 按年份分组兴趣
     * @param {Array} interests - 兴趣列表
     * @returns {Object} 按年份分组的兴趣
     */
    groupInterestsByYear(interests) {
        return interests.reduce((groups, interest) => {
            const year = new Date(interest.date).getFullYear();
            if (!groups[year]) {
                groups[year] = [];
            }
            groups[year].push(interest);
            return groups;
        }, {});
    }

    /**
     * 获取分类图标
     * @param {string} category - 分类名称
     * @returns {string} 图标
     */
    getCategoryIcon(category) {
        const icons = {
            '摄影': '📷',
            '旅行': '✈️',
            '美食': '🍽️',
            '运动': '🏃‍♂️',
            '音乐': '🎵',
            '阅读': '📚',
            '电影': '🎬',
            '游戏': '🎮',
            '艺术': '🎨',
            '技术': '💻',
            '生活': '🌟',
            '学习': '📖'
        };
        return icons[category] || '📝';
    }

    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else if (diffDays < 30) {
            return `${Math.floor(diffDays / 7)}周前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    /**
     * 绑定网格视图事件
     */
    bindGridViewEvents() {
        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.render(view);
            });
        });

        // 分类筛选
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.currentCategory = category;
                this.renderGridView();
            });
        });

        // 兴趣卡片点击
        document.querySelectorAll('.interest-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.render('detail', { id });
            });
        });

        // 查看详情按钮
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = e.target.closest('.interest-card');
                const id = card.dataset.id;
                this.render('detail', { id });
            });
        });
    }

    /**
     * 绑定时间线视图事件
     */
    bindTimelineViewEvents() {
        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.render(view);
            });
        });

        // 分类筛选
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.currentCategory = category;
                this.renderTimelineView();
            });
        });

        // 时间线项目点击
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.render('detail', { id });
            });
        });
    }

    /**
     * 绑定详情视图事件
     */
    bindDetailViewEvents() {
        // 返回按钮
        document.querySelectorAll('[data-action="back"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.render('grid');
            });
        });

        // 图片画廊
        document.querySelectorAll('.gallery-item img').forEach(img => {
            img.addEventListener('click', (e) => {
                this.openImageModal(e.target.src);
            });
        });
    }

    /**
     * 打开图片模态框
     * @param {string} imageSrc - 图片源
     */
    openImageModal(imageSrc) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <img src="${imageSrc}" alt="预览图片">
                    <button class="modal-close">&times;</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 销毁模块
     */
    destroy() {
        this.currentView = 'grid';
        this.currentCategory = '';
        this.currentInterest = null;
        this.currentFilters = {
            category: '',
            type: '',
            search: '',
            dateRange: null
        };
        this.isInitialized = false;
    }
}

// 导出生活兴趣模块
window.InterestsModule = InterestsModule;