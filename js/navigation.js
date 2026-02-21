/**
 * 导航组件管理器
 * 负责管理导航栏、面包屑导航和移动端菜单
 */
class NavigationManager {
    constructor() {
        this.currentPath = '/';
        this.breadcrumbConfig = {
            '/': { title: '首页', icon: '🏠' },
            '/agent': { title: 'Personal Agent', icon: '🤖' },
            '/research': { title: '科研项目', icon: '🔬' },
            '/interests': { title: '生活兴趣', icon: '🎨' },
            '/admin': { title: '管理后台', icon: '⚙️' }
        };
        
        this.mobileMenuOpen = false;
        this.isInitialized = false;
    }

    /**
     * 初始化导航管理器
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        console.log('初始化导航管理器...');
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 初始化移动端菜单
        this.initMobileMenu();
        
        // 监听路由变化
        this.listenToRouteChanges();
        
        this.isInitialized = true;
        console.log('导航管理器初始化完成');
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 移动端菜单切换
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // 点击菜单项时关闭移动端菜单
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                this.closeMobileMenu();
            }
        });

        // 点击外部区域关闭移动端菜单
        document.addEventListener('click', (e) => {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            
            if (this.mobileMenuOpen && 
                navMenu && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // ESC键关闭移动端菜单
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // 窗口大小变化时关闭移动端菜单
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * 初始化移动端菜单
     */
    initMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            // 添加移动端菜单的ARIA属性
            navMenu.setAttribute('aria-hidden', 'true');
            navMenu.setAttribute('role', 'menu');
        }

        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.setAttribute('aria-label', '切换导航菜单');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * 切换移动端菜单
     */
    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * 打开移动端菜单
     */
    openMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            navMenu.setAttribute('aria-hidden', 'false');
            navToggle.setAttribute('aria-expanded', 'true');
            
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
            
            this.mobileMenuOpen = true;
            
            // 聚焦到第一个菜单项
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) {
                firstLink.focus();
            }
        }
    }

    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navMenu.setAttribute('aria-hidden', 'true');
            navToggle.setAttribute('aria-expanded', 'false');
            
            // 恢复背景滚动
            document.body.style.overflow = '';
            
            this.mobileMenuOpen = false;
        }
    }

    /**
     * 监听路由变化
     */
    listenToRouteChanges() {
        document.addEventListener('routechange', (e) => {
            const { path } = e.detail;
            this.updateNavigation(path);
        });
    }

    /**
     * 更新导航状态
     * @param {string} path - 当前路径
     */
    updateNavigation(path) {
        this.currentPath = path;
        this.updateActiveNavLink(path);
        this.closeMobileMenu();
    }

    /**
     * 更新激活的导航链接
     * @param {string} path - 当前路径
     */
    updateActiveNavLink(path) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPath = href ? href.replace('#', '') : '';
            
            if (linkPath === path || (path !== '/' && linkPath !== '/' && path.startsWith(linkPath))) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    /**
     * 更新面包屑导航
     * @param {string} path - 当前路径
     */
    updateBreadcrumb(path) {
        const breadcrumbNav = document.getElementById('breadcrumb-nav');
        const breadcrumbList = document.querySelector('.breadcrumb-list');
        const mainContent = document.getElementById('main-content');
        
        if (!breadcrumbNav || !breadcrumbList || !mainContent) {
            return;
        }

        // 首页不显示面包屑
        if (path === '/') {
            breadcrumbNav.classList.add('hidden');
            mainContent.classList.remove('with-breadcrumb');
            return;
        }

        // 生成面包屑路径
        const breadcrumbs = this.generateBreadcrumbs(path);
        
        if (breadcrumbs.length <= 1) {
            breadcrumbNav.classList.add('hidden');
            mainContent.classList.remove('with-breadcrumb');
            return;
        }

        // 渲染面包屑
        breadcrumbList.innerHTML = '';
        
        breadcrumbs.forEach((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const listItem = document.createElement('li');
            listItem.className = 'breadcrumb-item';
            
            if (isLast) {
                // 当前页面
                const current = document.createElement('span');
                current.className = 'breadcrumb-current';
                current.textContent = crumb.title;
                current.setAttribute('aria-current', 'page');
                listItem.appendChild(current);
            } else {
                // 可点击的链接
                const link = document.createElement('a');
                link.className = 'breadcrumb-link';
                link.href = `#${crumb.path}`;
                link.textContent = crumb.title;
                link.setAttribute('aria-label', `导航到${crumb.title}`);
                listItem.appendChild(link);
                
                // 分隔符
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '›';
                separator.setAttribute('aria-hidden', 'true');
                listItem.appendChild(separator);
            }
            
            breadcrumbList.appendChild(listItem);
        });

        // 显示面包屑导航
        breadcrumbNav.classList.remove('hidden');
        mainContent.classList.add('with-breadcrumb');
    }

    /**
     * 生成面包屑路径
     * @param {string} path - 当前路径
     * @returns {Array} 面包屑数组
     */
    generateBreadcrumbs(path) {
        const breadcrumbs = [];
        const pathParts = path.split('/').filter(part => part);
        
        // 总是包含首页
        breadcrumbs.push({
            path: '/',
            title: this.breadcrumbConfig['/'].title,
            icon: this.breadcrumbConfig['/'].icon
        });

        // 构建路径层级
        let currentPath = '';
        pathParts.forEach(part => {
            currentPath += '/' + part;
            const config = this.breadcrumbConfig[currentPath];
            
            if (config) {
                breadcrumbs.push({
                    path: currentPath,
                    title: config.title,
                    icon: config.icon
                });
            } else {
                // 如果没有配置，使用路径作为标题
                breadcrumbs.push({
                    path: currentPath,
                    title: this.formatPathTitle(part),
                    icon: '📄'
                });
            }
        });

        return breadcrumbs;
    }

    /**
     * 格式化路径标题
     * @param {string} pathPart - 路径部分
     * @returns {string} 格式化后的标题
     */
    formatPathTitle(pathPart) {
        return pathPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * 添加面包屑配置
     * @param {string} path - 路径
     * @param {Object} config - 配置对象
     */
    addBreadcrumbConfig(path, config) {
        this.breadcrumbConfig[path] = config;
    }

    /**
     * 移除面包屑配置
     * @param {string} path - 路径
     */
    removeBreadcrumbConfig(path) {
        delete this.breadcrumbConfig[path];
    }

    /**
     * 获取当前路径
     * @returns {string} 当前路径
     */
    getCurrentPath() {
        return this.currentPath;
    }

    /**
     * 检查移动端菜单是否打开
     * @returns {boolean} 是否打开
     */
    isMobileMenuOpen() {
        return this.mobileMenuOpen;
    }

    /**
     * 设置导航栏滚动效果
     * @param {boolean} enable - 是否启用
     */
    setScrollEffect(enable = true) {
        if (!enable) {
            return;
        }

        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.main-nav');
        
        if (!navbar) {
            return;
        }

        const handleScroll = Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // 向下滚动，隐藏导航栏
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动，显示导航栏
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    /**
     * 销毁导航管理器
     */
    destroy() {
        // 移除事件监听器
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.removeEventListener('click', this.toggleMobileMenu);
        }

        // 恢复body样式
        document.body.style.overflow = '';
        
        this.isInitialized = false;
        console.log('导航管理器已销毁');
    }
}

// 导出导航管理器
window.NavigationManager = NavigationManager;