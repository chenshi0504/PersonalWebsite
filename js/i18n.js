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
