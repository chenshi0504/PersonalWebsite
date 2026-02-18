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
            '/agent/about': () => this.renderModuleAbout('agent'),
            '/research': () => this.renderResearchPage(),
            '/research/about': () => this.renderModuleAbout('research'),
            '/research/:id': (route) => this.renderResearchPage('detail', route.params),
            '/interests': () => this.renderInterestsPage(),
            '/interests/about': () => this.renderModuleAbout('interests'),
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
                            <div class="module-actions">
                                <a href="#/agent/about" class="btn btn-ghost btn-sm">${i('home.learnMore')}</a>
                                <a href="#/agent" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                        <div class="module-card" data-module="research">
                            <div class="module-icon">🔬</div>
                            <h3>${i('home.research.title')}</h3>
                            <p class="module-desc">${i('home.research.desc')}</p>
                            <div class="module-actions">
                                <a href="#/research/about" class="btn btn-ghost btn-sm">${i('home.learnMore')}</a>
                                <a href="#/research" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                        <div class="module-card" data-module="interests">
                            <div class="module-icon">🎨</div>
                            <h3>${i('home.interests.title')}</h3>
                            <p class="module-desc">${i('home.interests.desc')}</p>
                            <div class="module-actions">
                                <a href="#/interests/about" class="btn btn-ghost btn-sm">${i('home.learnMore')}</a>
                                <a href="#/interests" class="btn btn-accent btn-sm">${i('home.enter')}</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        this.renderContent(content);
    }

    /**
     * 渲染模块介绍子页面
     */
    renderModuleAbout(module) {
        const zh = I18N.currentLang === 'zh';
        const back = zh ? '← 返回首页' : '← Back to Home';
        const enterLabel = zh ? '进入 →' : 'Enter →';

        const pages = {
            agent: {
                icon: '🤖',
                title: zh ? '个人助理' : 'Personal Agent',
                tagline: zh
                    ? '你的 AI 科研伙伴，随时待命'
                    : 'Your AI research partner, always ready',
                desc: zh
                    ? '基于 OpenClaw 智能体框架构建的个人科研助理，专为陈实的研究工作流设计。它不只是一个聊天机器人——它会逐渐理解你的研究方向、思维习惯和偏好，成为真正懂你的助手。'
                    : 'A personal research assistant built on the OpenClaw agent framework, designed specifically for Shi Chen\'s research workflow. More than a chatbot — it gradually learns your research focus, thinking style, and preferences.',
                sections: [
                    {
                        icon: '🎯', title: zh ? '设计理念' : 'Design Philosophy',
                        content: zh
                            ? '以用户为中心的渐进式学习。每一次对话都是一次了解你的机会。助理会记住你的研究兴趣、常用术语、偏好的回答风格，随着时间推移提供越来越个性化的支持。'
                            : 'User-centered progressive learning. Every conversation is an opportunity to understand you better. The assistant remembers your research interests, terminology, and preferred response style.'
                    },
                    {
                        icon: '🔬', title: zh ? '科研全流程支持' : 'Full Research Pipeline',
                        content: zh
                            ? '从选题到发表：文献检索与综述 → 研究问题提炼 → 实验设计建议 → 数据分析指导 → 论文写作辅助 → 投稿策略建议。覆盖科研的每一个关键节点。'
                            : 'From ideation to publication: literature search → research question refinement → experiment design → data analysis → paper writing → submission strategy. Covering every key milestone.'
                    },
                    {
                        icon: '⚡', title: zh ? '技术架构' : 'Technical Architecture',
                        content: zh
                            ? '基于 OpenClaw 框架，支持 OpenAI GPT-4、Anthropic Claude 和本地 Ollama 模型。后端运行在 AgentSystem/backend，通过 REST API 与前端通信，支持多会话管理和上下文保持。'
                            : 'Built on OpenClaw framework, supporting OpenAI GPT-4, Anthropic Claude, and local Ollama models. Backend runs on AgentSystem/backend, communicating via REST API with multi-session management.'
                    },
                    {
                        icon: '🌱', title: zh ? '持续进化' : 'Continuous Evolution',
                        content: zh
                            ? '这个助理会随着你的使用不断成长。计划中的功能包括：论文数据库集成、个人知识库构建、研究进度追踪、自动生成周报等。'
                            : 'This assistant grows with your usage. Planned features include: paper database integration, personal knowledge base, research progress tracking, and automated weekly reports.'
                    }
                ],
                enterHref: '#/agent'
            },
            research: {
                icon: '🔬',
                title: zh ? '科研项目' : 'Research Projects',
                tagline: zh ? '记录每一个探索的足迹' : 'Documenting every step of exploration',
                desc: zh
                    ? '这里汇集了陈实的科研项目与学术成果。从 AI 智能体系统到应用研究，每个项目都代表着对某个问题的深入探索。不只是展示结果，更是记录思考过程。'
                    : 'A collection of Shi Chen\'s research projects and academic achievements. From AI agent systems to applied research, each project represents a deep exploration of a problem.',
                sections: [
                    {
                        icon: '🧪', title: zh ? '研究方向' : 'Research Areas',
                        content: zh
                            ? '主要研究方向包括：AI 智能体系统与框架设计、大语言模型应用、个人生产力工具、人机交互。当前重点项目：OpenClaw 智能体框架 & AgentSystem 个人助理系统。'
                            : 'Main research areas: AI agent systems and framework design, LLM applications, personal productivity tools, human-computer interaction. Current focus: OpenClaw agent framework & AgentSystem personal assistant.'
                    },
                    {
                        icon: '📑', title: zh ? '成果展示' : 'Outputs',
                        content: zh
                            ? '项目页面展示每个研究的背景、方法、结果和代码仓库链接。支持按状态筛选（进行中/已完成）、按标签分类，以及全文搜索。'
                            : 'Each project page shows background, methodology, results, and code repository links. Filter by status (ongoing/completed), tags, and full-text search.'
                    },
                    {
                        icon: '🔗', title: zh ? '开放协作' : 'Open Collaboration',
                        content: zh
                            ? '所有项目代码均托管在 GitHub。欢迎学术交流与合作，可通过 chenshi.edu@gmail.com 联系。'
                            : 'All project code is hosted on GitHub. Academic exchange and collaboration welcome — contact via chenshi.edu@gmail.com.'
                    },
                    {
                        icon: '📊', title: zh ? '数据与方法' : 'Data & Methods',
                        content: zh
                            ? '每个项目详情页包含：研究问题、数据集说明、实验设置、关键结果、局限性分析和未来工作方向。力求透明、可复现。'
                            : 'Each project detail page includes: research question, dataset description, experimental setup, key results, limitations, and future directions. Aiming for transparency and reproducibility.'
                    }
                ],
                enterHref: '#/research'
            },
            interests: {
                icon: '🎨',
                title: zh ? '生活画廊' : 'Gallery',
                tagline: zh ? '科研之外，生活本身也是一场探索' : 'Beyond research, life itself is an exploration',
                desc: zh
                    ? '这里是陈实的个人生活空间。记录旅行、摄影、音乐和日常点滴。科研需要专注，但生活需要广度。这个模块是对"完整的人"的记录。'
                    : 'A personal space for Shi Chen\'s life outside research. Travel, photography, music, and daily moments. Research requires focus, but life requires breadth.',
                sections: [
                    {
                        icon: '📷', title: zh ? '摄影与旅行' : 'Photography & Travel',
                        content: zh
                            ? '用镜头记录走过的地方。香港的霓虹、山间的云雾、城市的街角——每一张照片都是一个瞬间的定格。旅行不只是移动，更是换一个视角看世界。'
                            : 'Capturing places through the lens. The neon of Hong Kong, mountain mist, city corners — each photo freezes a moment. Travel is not just movement, but seeing the world from a different angle.'
                    },
                    {
                        icon: '🎵', title: zh ? '音乐与文化' : 'Music & Culture',
                        content: zh
                            ? '音乐是另一种语言。从古典到现代，从东方到西方。记录听过的音乐、看过的展览、读过的书——这些构成了思维的底色。'
                            : 'Music is another language. From classical to modern, East to West. Recording music heard, exhibitions visited, books read — these form the backdrop of thought.'
                    },
                    {
                        icon: '🌱', title: zh ? '日常记录' : 'Daily Life',
                        content: zh
                            ? '生活的质感在细节里。咖啡馆的一个下午、实验室的深夜、朋友间的对话——这些碎片拼成了真实的生活。'
                            : 'The texture of life is in the details. An afternoon in a café, late nights in the lab, conversations with friends — these fragments compose real life.'
                    },
                    {
                        icon: '💭', title: zh ? '思考与感悟' : 'Reflections',
                        content: zh
                            ? '偶尔记录一些思考：关于科研的意义、关于技术与人文的关系、关于如何在快节奏中保持内心的平静。'
                            : 'Occasional reflections: on the meaning of research, the relationship between technology and humanities, and how to maintain inner calm in a fast-paced world.'
                    }
                ],
                enterHref: '#/interests'
            }
        };

        const p = pages[module];
        if (!p) { this.router.navigate('/', true); return; }

        const sectionsHtml = p.sections.map(s => `
            <div class="about-section-card">
                <div class="about-section-icon">${s.icon}</div>
                <div class="about-section-body">
                    <h3>${s.title}</h3>
                    <p>${s.content}</p>
                </div>
            </div>
        `).join('');

        const content = `
            <div class="module-about-page">
                <div class="container">
                    <a href="#/" class="back-link">${back}</a>

                    <div class="module-about-hero">
                        <div class="module-about-icon">${p.icon}</div>
                        <h1>${p.title}</h1>
                        <p class="module-about-tagline">${p.tagline}</p>
                        <p class="module-about-desc">${p.desc}</p>
                        <a href="${p.enterHref}" class="btn btn-accent btn-lg">${enterLabel}</a>
                    </div>

                    <div class="about-sections">
                        ${sectionsHtml}
                    </div>
                </div>
            </div>
        `;
        this.renderContent(content);
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
     * 渲染管理页面（需要密码）
     */
    async renderAdminPage(tab = 'articles') {
        // 密码验证
        const ADMIN_KEY = 'admin_authed';
        const authed = sessionStorage.getItem(ADMIN_KEY);
        if (!authed) {
            this.renderAdminLogin();
            return;
        }

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
     * 渲染 Admin 登录页
     */
    renderAdminLogin() {
        const content = `
            <div class="admin-login-page">
                <div class="admin-login-box">
                    <div class="admin-login-icon">🔐</div>
                    <h2>Admin Access</h2>
                    <p>Enter password to continue</p>
                    <div class="admin-login-form">
                        <input type="password" id="admin-pwd" class="admin-pwd-input" placeholder="Password" autocomplete="current-password" />
                        <button class="btn btn-accent" id="admin-login-btn">Enter</button>
                    </div>
                    <p class="admin-login-error hidden" id="admin-login-error">Incorrect password</p>
                </div>
            </div>
        `;
        this.renderContent(content);

        const input = document.getElementById('admin-pwd');
        const btn = document.getElementById('admin-login-btn');
        const errEl = document.getElementById('admin-login-error');

        const tryLogin = () => {
            if (input.value === '6578u6') {
                sessionStorage.setItem('admin_authed', '1');
                this.renderAdminPage();
            } else {
                errEl.classList.remove('hidden');
                input.value = '';
                input.focus();
            }
        };

        btn.addEventListener('click', tryLogin);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
        input.focus();
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