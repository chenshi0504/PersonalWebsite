/**
 * 国际化管理器 (i18n)
 * 支持中文/英文切换
 */
const I18N = {
    currentLang: 'en',

    translations: {
        en: {
            'nav.home': 'Home',
            'nav.agent': 'Personal Agent',
            'nav.research': 'Research',
            'nav.interests': 'Gallery',
            'nav.admin': 'Admin',
            'footer.copyright': '© 2024 Shi Chen. All rights reserved.',

            'home.heroTitle': 'Welcome to My Personal Website',
            'home.subtitle': 'Personal Agent · Research · Gallery',
            'home.cv': 'CV',
            'home.learnMore': 'Learn More ↓',
            'home.collapse': 'Collapse ↑',
            'home.enter': 'Enter →',

            'home.agent.title': 'Personal Agent',
            'home.agent.desc': 'AI-powered research assistant for intelligent Q&A and knowledge management.',
            'home.agent.detail': 'An intelligent assistant built on the OpenClaw agent framework, designed to support your daily research workflow.',
            'home.agent.f1': '📄 Literature review & summarization',
            'home.agent.f2': '🔬 Research Q&A and brainstorming',
            'home.agent.f3': '📊 Data analysis assistance',

            'home.research.title': 'Research Projects',
            'home.research.desc': 'Explore my research work and technical achievements.',
            'home.research.detail': 'A showcase of academic and engineering projects spanning AI, systems, and applied research.',
            'home.research.f1': '🧪 Ongoing & completed projects',
            'home.research.f2': '📑 Publications and reports',
            'home.research.f3': '🔗 Code repositories and demos',

            'home.interests.title': 'Gallery',
            'home.interests.desc': 'Document life moments and personal hobbies.',
            'home.interests.detail': 'A personal space to record life outside of research — travel, photography, and more.',
            'home.interests.f1': '📷 Photography & travel',
            'home.interests.f2': '🎵 Music & culture',
            'home.interests.f3': '🌱 Daily life moments',

            'agent.title': 'Personal Agent',
            'agent.subtitle': 'Your AI-powered research assistant',
            'agent.inputPlaceholder': 'Ask me anything about research, papers, or projects...',
            'agent.send': 'Send',
            'agent.welcome': "Hello! I'm your personal research assistant. I can help with literature review, research questions, and knowledge management. What would you like to explore today?",
            'agent.error': 'Sorry, something went wrong. Please try again.',
            'agent.clearChat': 'Clear Chat',
            'agent.newChat': 'New Chat',
            'agent.capabilities.title': 'Capabilities',
            'agent.cap1': '📄 Literature Review',
            'agent.cap2': '🔬 Research Q&A',
            'agent.cap3': '💡 Brainstorming',
            'agent.cap4': '📊 Data Analysis',
            'agent.status.offline': 'Backend not connected',
            'agent.status.online': 'Connected',

            'research.title': 'Research Projects',
            'research.subtitle': 'Explore my research work and technical achievements',
            'research.total': 'Total',
            'research.completed': 'Completed',
            'research.inProgress': 'In Progress',
            'research.search': 'Search',
            'research.searchPlaceholder': 'Search projects...',
            'research.category': 'Category',
            'research.status': 'Status',
            'research.tags': 'Tech Tags',
            'research.all': 'All',
            'research.statusCompleted': 'Completed',
            'research.statusInProgress': 'In Progress',
            'research.statusPlanning': 'Planning',
            'research.noResults': 'No projects found. Try adjusting your filters.',
            'research.backToList': 'Research Projects',
            'research.found': 'Found',
            'research.projects': 'projects',
            'research.viewDetail': 'View Details',
            'research.demo': 'Demo',
            'research.code': 'Code',
            'research.sort': 'Sort',
            'research.sortNewest': 'Newest',
            'research.sortOldest': 'Oldest',
            'research.sortTitleAZ': 'Title A-Z',
            'research.sortTitleZA': 'Title Z-A',
            'research.grid': 'Grid',
            'research.list': 'List',
            'research.clearFilters': 'Clear All',
            'research.shareFilters': 'Share',
            'research.featured': '⭐ Featured',
            'research.category_label': 'Category:',
            'research.duration_label': 'Duration:',
            'research.status_label': 'Status:',
            'research.notFound': 'Project Not Found',
            'research.notFoundDesc': 'The project you are looking for does not exist or has been removed.',
            'research.backToResearch': 'Back to Projects',
            'research.backToHome': 'Back to Home',
            'research.relatedProjects': 'Related Projects',
            'research.noRelated': 'No related projects',
            'research.techStack': 'Tech Stack',
            'research.screenshots': 'Screenshots',
            'research.projectTags': 'Tags',
            'research.projectInfo': 'Project Info',
            'research.startDate': 'Start Date',
            'research.endDate': 'End Date',
            'research.links': 'Links',
            'research.liveDemo': 'Live Demo',
            'research.sourceCode': 'Source Code',
            'research.share': 'Share',
            'research.statusPaused': 'Paused',

            'interests.title': 'Gallery',
            'interests.subtitle': 'Documenting life moments and personal hobbies',
            'interests.total': 'Total',
            'interests.categories': 'Categories',
            'interests.photos': 'Photos',
            'interests.gridView': '⊞ Grid View',
            'interests.timelineView': '📅 Timeline',
            'interests.all': 'All',
            'interests.timelineTitle': 'Life Timeline',
            'interests.timelineSubtitle': 'Revisiting life moments in chronological order',
            'interests.noResults': 'No items yet. Start sharing your life!',
            'interests.backToList': 'Gallery',
            'interests.viewDetail': 'View Details',
            'interests.tags': 'Tags',
            'interests.album': 'Album',

            'admin.title': 'Content Management',
            'admin.subtitle': 'Manage website content',
        },
        zh: {
            'nav.home': '首页',
            'nav.agent': '个人助理',
            'nav.research': '科研项目',
            'nav.interests': '生活画廊',
            'nav.admin': '管理后台',
            'footer.copyright': '© 2024 陈实. 保留所有权利。',

            'home.heroTitle': '欢迎来到我的个人网站',
            'home.subtitle': '个人助理 · 科研项目 · 生活画廊',
            'home.cv': '简历',
            'home.learnMore': '了解更多 ↓',
            'home.collapse': '收起 ↑',
            'home.enter': '进入 →',

            'home.agent.title': '个人助理',
            'home.agent.desc': 'AI 驱动的科研助理，支持智能问答与知识管理。',
            'home.agent.detail': '基于 OpenClaw 智能体框架构建，专为日常科研工作流设计的个人助手。',
            'home.agent.f1': '📄 文献综述与摘要',
            'home.agent.f2': '🔬 科研问答与头脑风暴',
            'home.agent.f3': '📊 数据分析辅助',

            'home.research.title': '科研项目',
            'home.research.desc': '探索我的科研工作与技术成果。',
            'home.research.detail': '涵盖 AI、系统与应用研究的学术与工程项目展示。',
            'home.research.f1': '🧪 进行中与已完成的项目',
            'home.research.f2': '📑 论文与研究报告',
            'home.research.f3': '🔗 代码仓库与演示',

            'home.interests.title': '生活画廊',
            'home.interests.desc': '记录生活点滴与个人兴趣爱好。',
            'home.interests.detail': '科研之外的个人空间——旅行、摄影与日常记录。',
            'home.interests.f1': '📷 摄影与旅行',
            'home.interests.f2': '🎵 音乐与文化',
            'home.interests.f3': '🌱 日常生活记录',

            'agent.title': '个人助理',
            'agent.subtitle': '你的 AI 科研助手',
            'agent.inputPlaceholder': '问我任何关于科研、论文或项目的问题...',
            'agent.send': '发送',
            'agent.welcome': '你好！我是你的个人科研助理，可以帮助你进行文献综述、解答科研问题和知识管理。今天想探索什么？',
            'agent.error': '抱歉，出现了一些问题，请重试。',
            'agent.clearChat': '清空对话',
            'agent.newChat': '新对话',
            'agent.capabilities.title': '功能',
            'agent.cap1': '📄 文献综述',
            'agent.cap2': '🔬 科研问答',
            'agent.cap3': '💡 头脑风暴',
            'agent.cap4': '📊 数据分析',
            'agent.status.offline': '后端未连接',
            'agent.status.online': '已连接',

            'research.title': '科研项目',
            'research.subtitle': '展示我的研究项目和技术成果',
            'research.total': '总项目',
            'research.completed': '已完成',
            'research.inProgress': '进行中',
            'research.search': '搜索',
            'research.searchPlaceholder': '搜索项目...',
            'research.category': '分类',
            'research.status': '状态',
            'research.tags': '技术标签',
            'research.all': '全部',
            'research.statusCompleted': '已完成',
            'research.statusInProgress': '进行中',
            'research.statusPlanning': '计划中',
            'research.noResults': '没有找到符合条件的项目，请尝试调整筛选条件。',
            'research.backToList': '科研项目',
            'research.found': '找到',
            'research.projects': '个项目',
            'research.viewDetail': '查看详情',
            'research.demo': '演示',
            'research.code': '代码',
            'research.sort': '排序',
            'research.sortNewest': '最新项目',
            'research.sortOldest': '最早项目',
            'research.sortTitleAZ': '标题 A-Z',
            'research.sortTitleZA': '标题 Z-A',
            'research.grid': '网格',
            'research.list': '列表',
            'research.clearFilters': '清除全部',
            'research.shareFilters': '分享筛选',
            'research.featured': '⭐ 精选',
            'research.category_label': '分类:',
            'research.duration_label': '周期:',
            'research.status_label': '状态:',
            'research.notFound': '项目未找到',
            'research.notFoundDesc': '抱歉，您访问的项目不存在或已被删除。',
            'research.backToResearch': '返回项目列表',
            'research.backToHome': '返回首页',
            'research.relatedProjects': '相关项目',
            'research.noRelated': '暂无相关项目',
            'research.techStack': '技术栈',
            'research.screenshots': '项目截图',
            'research.projectTags': '项目标签',
            'research.projectInfo': '项目信息',
            'research.startDate': '开始时间',
            'research.endDate': '结束时间',
            'research.links': '相关链接',
            'research.liveDemo': '在线演示',
            'research.sourceCode': '源代码',
            'research.share': '分享项目',
            'research.statusPaused': '已暂停',

            'interests.title': '生活兴趣',
            'interests.subtitle': '记录生活中的美好时光和个人兴趣爱好',
            'interests.total': '总动态',
            'interests.categories': '兴趣分类',
            'interests.photos': '照片数量',
            'interests.gridView': '⊞ 网格视图',
            'interests.timelineView': '📅 时间线',
            'interests.all': '全部',
            'interests.timelineTitle': '生活时间线',
            'interests.timelineSubtitle': '按时间顺序回顾生活中的精彩瞬间',
            'interests.noResults': '还没有记录任何兴趣爱好，开始分享你的生活吧！',
            'interests.backToList': '生活兴趣',
            'interests.viewDetail': '查看详情',
            'interests.tags': '标签',
            'interests.album': '相册',

            'admin.title': '内容管理',
            'admin.subtitle': '管理网站内容',
        }
    },

    t(key) {
        return (this.translations[this.currentLang] || {})[key]
            || (this.translations['en'] || {})[key]
            || key;
    },

    setLang(lang) {
        this.currentLang = lang;
        localStorage.setItem('preferred-lang', lang);
        this.applyTranslations();
        this.updateLangToggle();
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    },

    init() {
        const saved = localStorage.getItem('preferred-lang');
        this.currentLang = saved || 'en';
        this.applyTranslations();
        this.updateLangToggle();

        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.addEventListener('click', () => {
                this.setLang(this.currentLang === 'en' ? 'zh' : 'en');
            });
        }
    },

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
    },

    updateLangToggle() {
        const label = document.getElementById('lang-label');
        if (label) {
            label.textContent = this.currentLang === 'en' ? '中文' : 'EN';
        }
    }
};

window.I18N = I18N;
