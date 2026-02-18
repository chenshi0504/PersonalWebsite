/**
 * 知识共享模块
 * 负责文章列表展示、详情页面和文章管理
 */
class KnowledgeModule {
    constructor(dataManager, notificationManager) {
        this.dataManager = dataManager;
        this.notificationManager = notificationManager;
        this.currentView = 'list'; // 'list' | 'detail'
        this.currentArticle = null;
        this.currentFilters = {
            category: '',
            tags: [],
            search: '',
            featured: null
        };
        this.currentSort = {
            field: 'publishDate',
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

        console.log('初始化知识共享模块...');
        this.isInitialized = true;
        console.log('知识共享模块初始化完成');
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
                this.renderArticleDetail(params.id);
                break;
            case 'list':
            default:
                this.renderArticleList();
                break;
        }
    }

    /**
     * 渲染文章列表
     */
    renderArticleList() {
        const articles = this.getFilteredArticles();
        const categories = this.dataManager.getCategories('articles');
        const tags = this.dataManager.getTags('articles');
        const stats = this.dataManager.getStats().articles;

        const html = `
            <div class="page-header">
                <div class="container">
                    <h1 class="page-title">知识共享</h1>
                    <p class="page-subtitle">分享技术文章、学习笔记和经验总结</p>
                    <div class="page-stats">
                        <div class="stat-item">
                            <span class="stat-number">${stats.total}</span>
                            <span class="stat-label">总文章</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.featured}</span>
                            <span class="stat-label">精选文章</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.categories}</span>
                            <span class="stat-label">分类数</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <div class="container">
                    <div class="articles-container">
                        ${articles.length > 0 ? this.renderArticlesGrid(articles) : this.renderEmptyState()}
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindArticleListEvents();
    }

    /**
     * 渲染文章网格
     * @param {Array} articles - 文章列表
     * @returns {string} HTML字符串
     */
    renderArticlesGrid(articles) {
        return `
            <div class="articles-grid">
                ${articles.map(article => this.renderArticleCard(article)).join('')}
            </div>
        `;
    }

    /**
     * 渲染文章卡片
     * @param {Object} article - 文章对象
     * @returns {string} HTML字符串
     */
    renderArticleCard(article) {
        const readTime = article.readTime || this.estimateReadTime(article.content);

        return `
            <article class="article-card" data-article-id="${article.id}">
                <div class="article-content">
                    <h3 class="article-title">
                        <a href="#/knowledge/${article.id}">${article.title}</a>
                    </h3>
                    <p class="article-summary">${article.summary}</p>
                    <div class="article-meta">
                        <span class="category-tag">${article.category}</span>
                        <span class="read-time">⏱️ ${readTime} 分钟</span>
                        ${article.featured ? '<span class="featured-badge">⭐ 精选</span>' : ''}
                    </div>
                    ${article.tags && article.tags.length > 0 ? `
                        <div class="article-tags">
                            ${article.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }

    /**
     * 渲染空状态
     * @returns {string} HTML字符串
     */
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3 class="empty-title">暂无文章</h3>
                <p class="empty-description">还没有发布任何文章，敬请期待！</p>
            </div>
        `;
    }

    /**
     * 渲染文章详情
     * @param {string} articleId - 文章ID
     */
    renderArticleDetail(articleId) {
        const article = this.dataManager.getArticleById(articleId);

        if (!article) {
            this.renderArticleNotFound();
            return;
        }

        this.currentArticle = article;
        const readTime = article.readTime || this.estimateReadTime(article.content);

        const html = `
            <div class="article-detail">
                <div class="page-header">
                    <div class="container">
                        <nav class="breadcrumb">
                            <a href="#/knowledge" class="breadcrumb-link">知识共享</a>
                            <span class="breadcrumb-separator">></span>
                            <span class="breadcrumb-current">${article.title}</span>
                        </nav>
                    </div>
                </div>

                <div class="content-section">
                    <div class="container">
                        <article class="article-content-wrapper">
                            <header class="article-header">
                                <h1 class="article-title">${article.title}</h1>
                                <div class="article-meta">
                                    <span class="category-tag">${article.category}</span>
                                    <span class="read-time">⏱️ ${readTime} 分钟阅读</span>
                                    ${article.featured ? '<span class="featured-badge">⭐ 精选</span>' : ''}
                                </div>
                                ${article.tags && article.tags.length > 0 ? `
                                    <div class="article-tags">
                                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </header>

                            <div class="article-body markdown-content">
                                ${this.renderMarkdown(article.content)}
                            </div>
                        </article>

                        <div class="related-articles-section">
                            <h2>相关文章</h2>
                            <div class="related-articles">
                                ${this.renderRelatedArticles(article)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;

        // 绑定事件
        this.bindArticleDetailEvents();
    }

    /**
     * 渲染相关文章
     * @param {Object} currentArticle - 当前文章
     * @returns {string} HTML字符串
     */
    renderRelatedArticles(currentArticle) {
        const allArticles = this.dataManager.getArticles();
        const relatedArticles = allArticles
            .filter(a => a.id !== currentArticle.id)
            .filter(a =>
                a.category === currentArticle.category ||
                a.tags.some(tag => currentArticle.tags.includes(tag))
            )
            .slice(0, 3);

        if (relatedArticles.length === 0) {
            return '<p class="text-muted">暂无相关文章</p>';
        }

        return `
            <div class="related-articles-grid">
                ${relatedArticles.map(article => `
                    <div class="related-article-card">
                        <h4>
                            <a href="#/knowledge/${article.id}">${article.title}</a>
                        </h4>
                        <p>${article.summary.substring(0, 80)}...</p>
                        <div class="article-meta">
                            <span class="category-tag">${article.category}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 渲染文章未找到页面
     */
    renderArticleNotFound() {
        const html = `
            <div class="not-found-page">
                <div class="container">
                    <div class="empty-state">
                        <div class="empty-icon">📄</div>
                        <h1 class="empty-title">文章未找到</h1>
                        <p class="empty-description">抱歉，您访问的文章不存在或已被删除。</p>
                        <div class="empty-actions">
                            <a href="#/knowledge" class="btn btn-primary">返回文章列表</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = html;
    }

    /**
     * 获取筛选后的文章列表
     * @returns {Array} 筛选后的文章列表
     */
    getFilteredArticles() {
        let articles = this.dataManager.getArticles();

        // 应用分类筛选
        if (this.currentFilters.category) {
            articles = articles.filter(article => article.category === this.currentFilters.category);
        }

        // 应用标签筛选
        if (this.currentFilters.tags.length > 0) {
            articles = articles.filter(article =>
                this.currentFilters.tags.some(tag => article.tags.includes(tag))
            );
        }

        // 应用搜索筛选
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            articles = articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.summary.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm)
            );
        }

        // 应用精选筛选
        if (this.currentFilters.featured !== null) {
            articles = articles.filter(article => article.featured === this.currentFilters.featured);
        }

        // 应用排序
        articles.sort((a, b) => {
            const { field, order } = this.currentSort;
            let aValue = a[field];
            let bValue = b[field];

            // 处理日期字段
            if (field === 'publishDate' || field === 'updateDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (order === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return articles;
    }

    /**
     * 绑定文章列表事件
     */
    bindArticleListEvents() {
        // 文章卡片点击
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const articleId = card.dataset.articleId;
                this.render('detail', { id: articleId });
            });
        });
    }

    /**
     * 绑定文章详情事件
     */
    bindArticleDetailEvents() {
        // 可以添加分享、打印等功能
    }

    /**
     * 渲染Markdown内容
     * @param {string} content - Markdown内容
     * @returns {string} HTML内容
     */
    renderMarkdown(content) {
        // 使用marked.js进行Markdown渲染
        if (typeof marked !== 'undefined' && typeof hljs !== 'undefined') {
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (e) {
                            console.error('代码高亮失败:', e);
                        }
                    }
                    return hljs.highlightAuto(code).value;
                },
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false
            });
            
            try {
                return marked.parse(content);
            } catch (e) {
                console.error('Markdown渲染失败:', e);
                return this.fallbackMarkdownRender(content);
            }
        }
        
        // 降级方案：简单的Markdown渲染
        return this.fallbackMarkdownRender(content);
    }

    /**
     * 降级Markdown渲染（当marked.js不可用时）
     * @param {string} content - Markdown内容
     * @returns {string} HTML内容
     */
    fallbackMarkdownRender(content) {
        return content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            .replace(/`([^`]*)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>');
    }

    /**
     * 估算阅读时间
     * @param {string} content - 文章内容
     * @returns {number} 阅读时间（分钟）
     */
    estimateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }

    /**
     * 销毁模块
     */
    destroy() {
        this.currentView = 'list';
        this.currentArticle = null;
        this.currentFilters = {
            category: '',
            tags: [],
            search: '',
            featured: null
        };
        this.currentSort = {
            field: 'publishDate',
            order: 'desc'
        };
        this.isInitialized = false;
    }
}

// 导出知识模块
window.KnowledgeModule = KnowledgeModule;
