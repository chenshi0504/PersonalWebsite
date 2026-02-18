/**
 * 主题管理器
 * 负责管理网站的主题切换和样式应用
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = {
            dark: {
                name: '暗色主题',
                colors: {
                    // 主色调
                    primary: '#1a1a1a',
                    secondary: '#2d2d2d',
                    tertiary: '#404040',
                    
                    // 强调色
                    accent: '#00ff88',
                    accentHover: '#00cc6a',
                    accentLight: 'rgba(0, 255, 136, 0.1)',
                    
                    // 文字颜色
                    textPrimary: '#ffffff',
                    textSecondary: '#cccccc',
                    textMuted: '#888888',
                    
                    // 背景色
                    bgPrimary: '#0d0d0d',
                    bgSecondary: '#1a1a1a',
                    bgCard: '#2d2d2d',
                    bgHover: '#404040',
                    
                    // 边框颜色
                    border: '#404040',
                    borderLight: '#555555',
                    
                    // 状态颜色
                    success: '#00ff88',
                    warning: '#ffaa00',
                    error: '#ff4444',
                    info: '#0088ff'
                }
            },
            light: {
                name: '亮色主题',
                colors: {
                    // 主色调
                    primary: '#ffffff',
                    secondary: '#f8f9fa',
                    tertiary: '#e9ecef',
                    
                    // 强调色
                    accent: '#00aa66',
                    accentHover: '#008855',
                    accentLight: 'rgba(0, 170, 102, 0.1)',
                    
                    // 文字颜色
                    textPrimary: '#212529',
                    textSecondary: '#495057',
                    textMuted: '#6c757d',
                    
                    // 背景色
                    bgPrimary: '#ffffff',
                    bgSecondary: '#f8f9fa',
                    bgCard: '#ffffff',
                    bgHover: '#f8f9fa',
                    
                    // 边框颜色
                    border: '#dee2e6',
                    borderLight: '#e9ecef',
                    
                    // 状态颜色
                    success: '#28a745',
                    warning: '#ffc107',
                    error: '#dc3545',
                    info: '#17a2b8'
                }
            }
        };
        
        this.storageKey = 'personal-website-theme';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 绑定系统主题变化监听
        this.mediaQuery.addListener(this.handleSystemThemeChange.bind(this));
    }

    /**
     * 初始化主题管理器
     */
    init() {
        console.log('初始化主题管理器...');
        
        // 从本地存储加载主题设置
        this.loadThemeFromStorage();
        
        // 应用当前主题
        this.applyTheme(this.currentTheme);
        
        // 创建主题切换控件
        this.createThemeToggle();
        
        console.log(`主题管理器初始化完成，当前主题: ${this.currentTheme}`);
    }

    /**
     * 从本地存储加载主题设置
     */
    loadThemeFromStorage() {
        try {
            const savedTheme = localStorage.getItem(this.storageKey);
            if (savedTheme && this.themes[savedTheme]) {
                this.currentTheme = savedTheme;
            } else {
                // 如果没有保存的主题，使用系统偏好
                this.currentTheme = this.getSystemPreferredTheme();
            }
        } catch (error) {
            console.warn('无法从本地存储加载主题设置:', error);
            this.currentTheme = 'dark';
        }
    }

    /**
     * 保存主题设置到本地存储
     */
    saveThemeToStorage() {
        try {
            localStorage.setItem(this.storageKey, this.currentTheme);
        } catch (error) {
            console.warn('无法保存主题设置到本地存储:', error);
        }
    }

    /**
     * 获取系统偏好的主题
     */
    getSystemPreferredTheme() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    /**
     * 处理系统主题变化
     */
    handleSystemThemeChange(e) {
        // 只有在用户没有手动设置主题时才跟随系统
        const savedTheme = localStorage.getItem(this.storageKey);
        if (!savedTheme) {
            const systemTheme = e.matches ? 'dark' : 'light';
            this.setTheme(systemTheme);
        }
    }

    /**
     * 应用主题
     * @param {string} themeName - 主题名称
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`主题 "${themeName}" 不存在`);
            return;
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // 应用CSS变量
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVarName = this.convertToCSSVariable(key);
            root.style.setProperty(cssVarName, value);
        });

        // 更新body类名
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim();
        document.body.classList.add(`theme-${themeName}`);

        // 更新meta标签（用于移动端状态栏）
        this.updateMetaThemeColor(theme.colors.bgPrimary);

        console.log(`已应用主题: ${theme.name}`);
    }

    /**
     * 转换为CSS变量名
     * @param {string} key - 键名
     * @returns {string} CSS变量名
     */
    convertToCSSVariable(key) {
        // 将驼峰命名转换为kebab-case
        const kebabCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `--color-${kebabCase}`;
    }

    /**
     * 更新meta主题颜色
     * @param {string} color - 颜色值
     */
    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = color;
    }

    /**
     * 设置主题
     * @param {string} themeName - 主题名称
     */
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`主题 "${themeName}" 不存在`);
            return;
        }

        if (this.currentTheme === themeName) {
            return;
        }

        const oldTheme = this.currentTheme;
        this.currentTheme = themeName;

        // 应用新主题
        this.applyTheme(themeName);

        // 保存到本地存储
        this.saveThemeToStorage();

        // 更新主题切换控件
        this.updateThemeToggle();

        // 触发主题变化事件
        this.dispatchThemeChangeEvent(oldTheme, themeName);

        console.log(`主题已切换: ${oldTheme} -> ${themeName}`);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];
        
        this.setTheme(nextTheme);
    }

    /**
     * 获取当前主题
     * @returns {string} 当前主题名称
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 获取主题信息
     * @param {string} themeName - 主题名称
     * @returns {Object|null} 主题信息
     */
    getTheme(themeName) {
        return this.themes[themeName] || null;
    }

    /**
     * 获取所有主题
     * @returns {Object} 所有主题
     */
    getAllThemes() {
        return this.themes;
    }

    /**
     * 创建主题切换控件
     */
    createThemeToggle() {
        // 检查是否已存在主题切换按钮
        if (document.querySelector('.theme-toggle')) {
            return;
        }

        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle btn btn-ghost';
        themeToggle.setAttribute('aria-label', '切换主题');
        themeToggle.setAttribute('title', '切换主题');
        
        // 创建图标
        const icon = document.createElement('span');
        icon.className = 'theme-toggle-icon';
        themeToggle.appendChild(icon);

        // 添加点击事件
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // 添加到导航栏
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const themeToggleItem = document.createElement('li');
            themeToggleItem.appendChild(themeToggle);
            navMenu.appendChild(themeToggleItem);
        }

        // 更新图标
        this.updateThemeToggle();
    }

    /**
     * 更新主题切换控件
     */
    updateThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const themeIcon = document.querySelector('.theme-toggle-icon');
        
        if (!themeToggle || !themeIcon) {
            return;
        }

        // 根据当前主题更新图标和标题
        if (this.currentTheme === 'dark') {
            themeIcon.textContent = '🌙';
            themeToggle.setAttribute('title', '切换到亮色主题');
        } else {
            themeIcon.textContent = '☀️';
            themeToggle.setAttribute('title', '切换到暗色主题');
        }
    }

    /**
     * 触发主题变化事件
     * @param {string} oldTheme - 旧主题
     * @param {string} newTheme - 新主题
     */
    dispatchThemeChangeEvent(oldTheme, newTheme) {
        const event = new CustomEvent('themechange', {
            detail: {
                oldTheme,
                newTheme,
                themeData: this.themes[newTheme]
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 添加主题变化监听器
     * @param {Function} callback - 回调函数
     */
    onThemeChange(callback) {
        document.addEventListener('themechange', callback);
    }

    /**
     * 移除主题变化监听器
     * @param {Function} callback - 回调函数
     */
    offThemeChange(callback) {
        document.removeEventListener('themechange', callback);
    }

    /**
     * 获取主题颜色值
     * @param {string} colorName - 颜色名称
     * @param {string} themeName - 主题名称（可选，默认当前主题）
     * @returns {string} 颜色值
     */
    getThemeColor(colorName, themeName = this.currentTheme) {
        const theme = this.themes[themeName];
        return theme ? theme.colors[colorName] : null;
    }

    /**
     * 检查是否为暗色主题
     * @param {string} themeName - 主题名称（可选，默认当前主题）
     * @returns {boolean} 是否为暗色主题
     */
    isDarkTheme(themeName = this.currentTheme) {
        return themeName === 'dark';
    }

    /**
     * 预加载主题资源
     * @param {string} themeName - 主题名称
     */
    preloadTheme(themeName) {
        if (!this.themes[themeName]) {
            return;
        }

        // 这里可以预加载主题相关的图片或其他资源
        console.log(`预加载主题资源: ${themeName}`);
    }

    /**
     * 销毁主题管理器
     */
    destroy() {
        // 移除事件监听器
        this.mediaQuery.removeListener(this.handleSystemThemeChange.bind(this));
        
        // 移除主题切换控件
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.remove();
        }
        
        console.log('主题管理器已销毁');
    }
}

// 导出主题管理器
window.ThemeManager = ThemeManager;