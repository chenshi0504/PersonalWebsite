/**
 * 个人网站主应用类
 */
class PersonalWebsite {
    constructor() {
        this.router = null;
        this.themeManager = null;
        this.navigationManager = null;
        this.notificationManager = null;
        this.fileManager = null;
        this.dataManager = null;
        this.currentModule = null;
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('正在初始化个人网站应用...');

            // 显示加载指示器
            this.showLoading();

            // 初始化核心管理器
            await this.initializeManagers();

            // 初始化路由
            this.initializeRouter();

            // 绑定事件监听器
            this.bindEventListeners();

            // 初始化主题
            this.themeManager.init();

            // 初始化导航
            this.navigationManager.init();

            // 初始化 i18n
            I18N.init();

            // 监听语言切换，重新渲染当前页面
            document.addEventListener('langchange', () => {
                I18N.applyTranslations();
                const path = this.router.currentPath || '/';
                if (path === '/') this.renderHomePage();
            });

            // 初始化文件管理器
            this.fileManager.init();

            // 加载初始数据
            await this.loadInitialData();

            // 启动路由
            this.router.start();

            this.isInitialized = true;
            console.log('个人网站应用初始化完成');

        } catch (error) {
            console.error('应用初始化失败:', error);
            this.notificationManager.showError('应用初始化失败，请刷新页面重试');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 初始化管理器
     */
    async initializeManagers() {
        // 初始化通知管理器
        this.notificationManager = new NotificationManager();

        // 初始化主题管理器
        this.themeManager = new ThemeManager();

        // 初始化导航管理器
        this.navigationManager = new NavigationManager();

        // 初始化文件管理器
        this.fileManager = new FileManager();

        // 初始化数据管理器
        this.dataManager = new DataManager();
        await this.dataManager.init();

        console.log('核心管理器初始化完成');
    }

    /**
     * 初始化路由
     */
    initializeRouter() {
        this.router = new Router({
            '/': () => this.renderHomePage(),
            '/agent': () => this.renderAgentPage(),
            '/research': () => this.renderResearchPage(),
            '/research/:id': (route) => this.renderResearchPage('detail', route.params),
            '/interests': () => this.renderInterestsPage(),
            '/interests/timeline': () => this.renderInterestsPage('timeline'),
            '/interests/category/:category': (route) => this.renderInterestsPage('category', route.params),
            '/interests/:id': (route) => this.renderInterestsPage('detail', route.params),
            '/admin': () => this.renderAdminPage()
        });

        // 设置路由变化回调
        this.router.onRouteChange = (path) => {
            // 非 agent 页面移除全屏 class
            if (path !== '/agent') {
                document.getElementById('main-content')?.classList.remove('agent-fullscreen');
            }
            this.scrollToTop();
        };

        console.log('路由系统初始化完成');
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 导航菜单点击事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                if (href && href.startsWith('#/')) {
                    this.router.navigate(href.substring(1));
                }
            }
        });

        // 移动端菜单切换
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // 窗口大小变化事件
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // 键盘导航支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        console.log('事件监听器绑定完成');
    }

    /**
     * 加载初始数据
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.dataManager.loadProjects(),
                this.dataManager.loadArticles(),
                this.dataManager.loadInterests()
            ]);
            console.log('初始数据加载完成');
        } catch (error) {
            console.error('初始数据加载失败:', error);
            this.notificationManager.showWarning('部分数据加载失败，某些功能可能受限');
        }
    }

    /**
     * 渲染首页
     */
    renderHomePage() {
        const i = (key) => I18N.t(key);
        const content = `
            <div class="hero-section">
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title">${i('home.heroTitle')}</h1>
                        <p class="hero-subtitle">${i('home.subtitle')}</p>
                        <div class="hero-actions">
                            <a href="images/SHI+CHEN-CV.pdf" target="_blank" class="btn btn-accent">${i('home.cv')}</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modules-preview">
                <div class="container">
                    <div class="modules-grid">

                        <div class="module-card" data-module="agent">
                            <div class="module-icon">🤖</div>
                            <h3>${i('home.agent.title')}</h3>
                            <p class="module-desc">${i('home.agent.desc')}</p>
                            <div class="module-detail">
                                <p>${i('home.agent.detail')}</p>
                                <ul class="module-features">
                                    <li>${i('home.agent.f1')}</li>
                                    <li>${i('home.agent.f2')}</li>
                                    <li>${i('home.agent.f3')}</li>
                                </ul>
                            </div>
                            <div class="module-actions">
                                <button class="btn btn-ghost btn-sm module-expand-btn">${i('home.learnMore')}</button>
                                <a href="#/agent" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                        <div class="module-card" data-module="research">
                            <div class="module-icon">🔬</div>
                            <h3>${i('home.research.title')}</h3>
                            <p class="module-desc">${i('home.research.desc')}</p>
                            <div class="module-detail">
                                <p>${i('home.research.detail')}</p>
                                <ul class="module-features">
                                    <li>${i('home.research.f1')}</li>
                                    <li>${i('home.research.f2')}</li>
                                    <li>${i('home.research.f3')}</li>
                                </ul>
                            </div>
                            <div class="module-actions">
                                <button class="btn btn-ghost btn-sm module-expand-btn">${i('home.learnMore')}</button>
                                <a href="#/research" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                        <div class="module-card" data-module="interests">
                            <div class="module-icon">🎨</div>
                            <h3>${i('home.interests.title')}</h3>
                            <p class="module-desc">${i('home.interests.desc')}</p>
                            <div class="module-detail">
                                <p>${i('home.interests.detail')}</p>
                                <ul class="module-features">
                                    <li>${i('home.interests.f1')}</li>
                                    <li>${i('home.interests.f2')}</li>
                                    <li>${i('home.interests.f3')}</li>
                                </ul>
                            </div>
                            <div class="module-actions">
                                <button class="btn btn-ghost btn-sm module-expand-btn">${i('home.learnMore')}</button>
                                <a href="#/interests" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        this.renderContent(content);

        // 绑定展开/收起按钮
        document.querySelectorAll('.module-expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.module-card');
                const detail = card.querySelector('.module-detail');
                const expanded = card.classList.toggle('expanded');
                detail.style.display = expanded ? 'block' : 'none';
                btn.textContent = expanded ? I18N.t('home.collapse') : I18N.t('home.learnMore');
            });
        });
    }

    /**
     * 渲染 Personal Agent 页面
     */
    async renderAgentPage() {
        this.showContentLoading();
        await Utils.delay(100);

        this.renderWithErrorBoundary(() => {
            if (!this.currentModule || this.currentModule.constructor.name !== 'AgentModule') {
                this.currentModule = new AgentModule(this.dataManager, this.notificationManager);
                this.currentModule.init();
            }
            // agent 页面全屏，移除 padding
            document.getElementById('main-content').classList.add('agent-fullscreen');
            this.currentModule.render();
        }, 'Agent page failed to load');
    }

    /**
     * 渲染科研项目页面
     */
    async renderResearchPage(view = 'list', params = {}) {
        this.showContentLoading();
        await Utils.delay(100); // 让骨架屏显示
        
        this.renderWithErrorBoundary(() => {
            if (!this.currentModule || this.currentModule.constructor.name !== 'ResearchModule') {
                this.currentModule = new ResearchModule(this.dataManager, this.notificationManager);
                this.currentModule.init();
            }
            this.currentModule.render(view, params);
        }, '科研项目页面加载失败');
    }

    /**
     * 渲染知识共享页面（已移除，保留空方法以防旧链接）
     */
    async renderKnowledgePage(view = 'list', params = {}) {
        this.router.navigate('/', true);
    }

    /**
     * 渲染生活兴趣页面
     */
    async renderInterestsPage(view = 'grid', params = {}) {
        this.showContentLoading();
        await Utils.delay(100);
        
        this.renderWithErrorBoundary(() => {
            if (!this.currentModule || this.currentModule.constructor.name !== 'InterestsModule') {
                this.currentModule = new InterestsModule(this.dataManager, this.notificationManager);
                this.currentModule.init();
            }
            this.currentModule.render(view, params);
        }, '生活兴趣页面加载失败');
    }

    /**
     * 渲染管理页面
     */
    async renderAdminPage(tab = 'articles') {
        this.showContentLoading();
        await Utils.delay(100);
        
        this.renderWithErrorBoundary(() => {
            if (!this.currentModule || this.currentModule.constructor.name !== 'AdminModule') {
                this.currentModule = new AdminModule(this.dataManager, this.notificationManager);
                this.currentModule.init();
            }
            this.currentModule.render(tab);
        }, '管理页面加载失败');
    }

    /**
     * 渲染内容到主容器
     */
    renderContent(html) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = html;
        }
    }

    /**
     * 使用错误边界渲染
     * @param {Function} renderFn - 渲染函数
     * @param {string} fallbackMessage - 错误提示信息
     */
    renderWithErrorBoundary(renderFn, fallbackMessage = '页面加载失败') {
        try {
            renderFn();
        } catch (error) {
            console.error('渲染错误:', error);
            this.renderErrorPage(error, fallbackMessage);
        }
    }

    /**
     * 渲染错误页面
     * @param {Error} error - 错误对象
     * @param {string} message - 错误信息
     */
    renderErrorPage(error, message = '页面加载失败') {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <div class="container">
                        <div class="error-content">
                            <div class="error-icon">⚠️</div>
                            <h1>出错了</h1>
                            <p class="error-message">${message}</p>
                            <p class="error-detail">${error.message}</p>
                            <div class="error-actions">
                                <button class="btn btn-primary" onclick="location.reload()">
                                    刷新页面
                                </button>
                                <a href="#/" class="btn btn-secondary">返回首页</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 显示内容加载状态
     */
    showContentLoading() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="loading-content">
                    <div class="container">
                        <div class="skeleton-grid">
                            ${Array(6).fill(0).map(() => `
                                <div class="skeleton-card">
                                    <div class="skeleton-image"></div>
                                    <div class="skeleton-title"></div>
                                    <div class="skeleton-text"></div>
                                    <div class="skeleton-text short"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }



    /**
     * 滚动到页面顶部
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 关闭移动端菜单
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');

        if (window.innerWidth > 768) {
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    }

    /**
     * 处理键盘导航
     */
    handleKeyboardNavigation(e) {
        // ESC 键关闭移动端菜单
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            navMenu?.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    }

    /**
     * 显示加载指示器
     */
    showLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
    }

    /**
     * 隐藏加载指示器
     */
    hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 应用实例
let app;

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    app = new PersonalWebsite();
    await app.init();
});

// 导出应用实例供其他模块使用
window.PersonalWebsite = PersonalWebsite;