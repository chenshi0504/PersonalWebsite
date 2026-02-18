/**
 * 国际化管理器 (i18n)
 * 支持中文/英文切换
 */
const I18N = {
    currentLang: 'en',

    translations: {
        en: {
            'site.title': 'Shi Chen',
            'nav.home': 'Home',
            'nav.agent': 'Personal Agent',
            'nav.research': 'Research',
            'nav.interests': 'Gallery',
            'nav.admin': 'Admin',
            'footer.copyright': '© 2024 Shi Chen. All rights reserved.',
            'home.subtitle': 'Personal Agent · Research · Gallery',
            'home.cv': 'CV',
            'home.viewProjects': 'View Projects',
            'home.viewGallery': 'View Gallery',
            'home.agent.title': 'Personal Agent',
            'home.agent.desc': 'AI-powered research assistant for intelligent Q&A and knowledge management',
            'home.agent.link': 'Chat Now →',
            'home.research.title': 'Research Projects',
            'home.research.desc': 'Explore my research work and technical achievements',
            'home.research.link': 'Learn More →',
            'home.interests.title': 'Gallery',
            'home.interests.desc': 'Document life moments and personal hobbies',
            'home.interests.link': 'Learn More →',
            'agent.title': 'Personal Agent',
            'agent.subtitle': 'Your AI-powered research assistant',
            'agent.inputPlaceholder': 'Ask me anything about research, papers, or projects...',
            'agent.send': 'Send',
            'agent.welcome': 'Hello! I\'m your personal research assistant. I can help you with literature review, research questions, and knowledge management. What would you like to explore today?',
            'agent.thinking': 'Thinking...',
            'agent.error': 'Sorry, something went wrong. Please try again.',
            'agent.clearChat': 'Clear Chat',
            'agent.capabilities.title': 'What I can help with',
            'agent.cap1': '📄 Literature Review',
            'agent.cap2': '🔬 Research Q&A',
            'agent.cap3': '💡 Idea Brainstorming',
            'agent.cap4': '📊 Data Analysis',
            'breadcrumb.home': 'Home',
            'breadcrumb.agent': 'Personal Agent',
            'breadcrumb.research': 'Research',
            'breadcrumb.interests': 'Gallery',
        },
        zh: {
            'site.title': '陈实',
            'nav.home': '首页',
            'nav.agent': '个人助理',
            'nav.research': '科研项目',
            'nav.interests': '生活画廊',
            'nav.admin': '管理后台',
            'footer.copyright': '© 2024 陈实. 保留所有权利。',
            'home.subtitle': '个人助理 · 科研项目 · 生活画廊',
            'home.cv': '简历',
            'home.viewProjects': '查看项目',
            'home.viewGallery': '查看画廊',
            'home.agent.title': '个人助理',
            'home.agent.desc': 'AI 驱动的科研助理，支持智能问答与知识管理',
            'home.agent.link': '开始对话 →',
            'home.research.title': '科研项目',
            'home.research.desc': '探索我的科研工作与技术成果',
            'home.research.link': '了解更多 →',
            'home.interests.title': '生活画廊',
            'home.interests.desc': '记录生活点滴与个人兴趣爱好',
            'home.interests.link': '了解更多 →',
            'agent.title': '个人助理',
            'agent.subtitle': '你的 AI 科研助手',
            'agent.inputPlaceholder': '问我任何关于科研、论文或项目的问题...',
            'agent.send': '发送',
            'agent.welcome': '你好！我是你的个人科研助理。我可以帮助你进行文献综述、解答科研问题和知识管理。今天想探索什么？',
            'agent.thinking': '思考中...',
            'agent.error': '抱歉，出现了一些问题，请重试。',
            'agent.clearChat': '清空对话',
            'agent.capabilities.title': '我能帮你做什么',
            'agent.cap1': '📄 文献综述',
            'agent.cap2': '🔬 科研问答',
            'agent.cap3': '💡 头脑风暴',
            'agent.cap4': '📊 数据分析',
            'breadcrumb.home': '首页',
            'breadcrumb.agent': '个人助理',
            'breadcrumb.research': '科研项目',
            'breadcrumb.interests': '生活画廊',
        }
    },

    t(key) {
        return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
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
