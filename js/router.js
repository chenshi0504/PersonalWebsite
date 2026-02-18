/**
 * 客户端路由管理器
 * 使用History API实现单页应用路由
 */
class Router {
    constructor(routes = {}) {
        this.routes = routes;
        this.currentPath = '';
        this.currentParams = {};
        this.currentQuery = {};
        this.guards = [];
        this.middlewares = [];
        this.onRouteChange = null;
        this.onRouteError = null;
        this.isStarted = false;
        
        // 绑定事件处理器
        this.handlePopState = this.handlePopState.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * 启动路由器
     */
    start() {
        if (this.isStarted) {
            console.warn('路由器已经启动');
            return;
        }

        console.log('启动路由器...');
        
        // 监听浏览器前进后退
        window.addEventListener('popstate', this.handlePopState);
        
        // 监听链接点击
        document.addEventListener('click', this.handleLinkClick);
        
        // 处理初始路由
        this.handleInitialRoute();
        
        this.isStarted = true;
        console.log('路由器启动完成');
    }

    /**
     * 停止路由器
     */
    stop() {
        if (!this.isStarted) {
            return;
        }

        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
        
        this.isStarted = false;
        console.log('路由器已停止');
    }

    /**
     * 添加路由
     * @param {string} path - 路径
     * @param {Function} handler - 处理函数
     */
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    /**
     * 移除路由
     * @param {string} path - 路径
     */
    removeRoute(path) {
        delete this.routes[path];
    }

    /**
     * 导航到指定路径
     * @param {string} path - 目标路径
     * @param {boolean} replace - 是否替换当前历史记录
     * @param {Object} state - 状态对象
     */
    navigate(path, replace = false, state = {}) {
        if (!path) {
            console.warn('导航路径不能为空');
            return;
        }

        // 标准化路径
        path = this.normalizePath(path);
        
        // 如果路径相同，不进行导航
        if (path === this.currentPath) {
            return;
        }

        console.log(`导航到: ${path}`);

        try {
            // 更新浏览器历史
            if (replace) {
                window.history.replaceState(state, '', `#${path}`);
            } else {
                window.history.pushState(state, '', `#${path}`);
            }

            // 处理路由
            this.handleRoute(path, state);
            
        } catch (error) {
            console.error('导航失败:', error);
            this.handleRouteError(error, path);
        }
    }

    /**
     * 替换当前路由
     * @param {string} path - 目标路径
     * @param {Object} state - 状态对象
     */
    replace(path, state = {}) {
        this.navigate(path, true, state);
    }

    /**
     * 后退
     */
    back() {
        window.history.back();
    }

    /**
     * 前进
     */
    forward() {
        window.history.forward();
    }

    /**
     * 跳转指定步数
     * @param {number} steps - 步数（正数前进，负数后退）
     */
    go(steps) {
        window.history.go(steps);
    }

    /**
     * 处理初始路由
     */
    handleInitialRoute() {
        const hash = window.location.hash;
        const path = hash ? hash.substring(1) : '/';
        this.handleRoute(path);
    }

    /**
     * 处理popstate事件
     * @param {PopStateEvent} event - 事件对象
     */
    handlePopState(event) {
        const hash = window.location.hash;
        const path = hash ? hash.substring(1) : '/';
        this.handleRoute(path, event.state);
    }

    /**
     * 处理链接点击事件
     * @param {MouseEvent} event - 事件对象
     */
    handleLinkClick(event) {
        // 只处理左键点击
        if (event.button !== 0) {
            return;
        }

        // 检查是否按下修饰键
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        const link = event.target.closest('a');
        if (!link) {
            return;
        }

        const href = link.getAttribute('href');
        
        // 只处理hash链接
        if (!href || !href.startsWith('#/')) {
            return;
        }

        event.preventDefault();
        
        const path = href.substring(1);
        this.navigate(path);
    }

    /**
     * 处理路由
     * @param {string} path - 路径
     * @param {Object} state - 状态对象
     */
    async handleRoute(path, state = {}) {
        try {
            // 标准化路径
            path = this.normalizePath(path);
            
            // 解析路径参数和查询参数
            const { cleanPath, params, query } = this.parsePath(path);
            
            // 查找匹配的路由
            const { handler, matchedPath } = this.findRoute(cleanPath);
            
            if (!handler) {
                throw new Error(`未找到路由: ${path}`);
            }
            
            console.log(`路由匹配: ${cleanPath} -> ${matchedPath}`);

            // 执行路由守卫
            const guardResult = await this.executeGuards(path, cleanPath, params, query);
            if (guardResult !== true) {
                if (typeof guardResult === 'string') {
                    // 重定向
                    this.navigate(guardResult, true);
                }
                return;
            }

            // 执行中间件
            await this.executeMiddlewares(path, cleanPath, params, query);

            // 更新当前路由信息
            this.currentPath = path;
            this.currentParams = params;
            this.currentQuery = query;

            // 执行路由处理器
            await handler({
                path: cleanPath,
                fullPath: path,
                params,
                query,
                state,
                router: this
            });

            // 触发路由变化回调
            if (this.onRouteChange) {
                this.onRouteChange(path, cleanPath, params, query);
            }

            // 触发路由变化事件
            this.dispatchRouteChangeEvent(path, cleanPath, params, query);

        } catch (error) {
            console.error('路由处理失败:', error);
            this.handleRouteError(error, path);
        }
    }

    /**
     * 查找匹配的路由
     * @param {string} path - 路径
     * @returns {Object} 匹配结果
     */
    findRoute(path) {
        // 第一步：精确匹配
        if (this.routes[path]) {
            return { handler: this.routes[path], matchedPath: path };
        }

        // 第二步：参数匹配（按路由定义顺序）
        const routeKeys = Object.keys(this.routes);
        for (const routePath of routeKeys) {
            if (this.isParameterizedRoute(routePath)) {
                if (this.matchParameterizedRoute(routePath, path)) {
                    return { handler: this.routes[routePath], matchedPath: routePath };
                }
            }
        }

        return { handler: null, matchedPath: null };
    }

    /**
     * 检查是否为参数化路由
     * @param {string} routePath - 路由路径
     * @returns {boolean} 是否为参数化路由
     */
    isParameterizedRoute(routePath) {
        return routePath.includes(':');
    }

    /**
     * 匹配参数化路由
     * @param {string} routePath - 路由路径
     * @param {string} actualPath - 实际路径
     * @returns {boolean} 是否匹配
     */
    matchParameterizedRoute(routePath, actualPath) {
        const routeParts = routePath.split('/').filter(p => p);
        const actualParts = actualPath.split('/').filter(p => p);

        // 路由部分数必须相同
        if (routeParts.length !== actualParts.length) {
            return false;
        }

        // 检查每一部分是否匹配
        return routeParts.every((part, index) => {
            // 如果是参数（以:开头），则匹配任何非空值
            if (part.startsWith(':')) {
                return actualParts[index] && actualParts[index].length > 0;
            }
            // 否则必须完全相同
            return part === actualParts[index];
        });
    }

    /**
     * 解析路径参数和查询参数
     * @param {string} path - 完整路径
     * @returns {Object} 解析结果
     */
    parsePath(path) {
        const [pathPart, queryPart] = path.split('?');
        const cleanPath = pathPart || '/';
        
        // 解析查询参数
        const query = {};
        if (queryPart) {
            const searchParams = new URLSearchParams(queryPart);
            for (const [key, value] of searchParams) {
                query[key] = value;
            }
        }

        // 解析路径参数
        const params = {};
        const { matchedPath } = this.findRoute(cleanPath);
        
        if (matchedPath && this.isParameterizedRoute(matchedPath)) {
            const routeParts = matchedPath.split('/').filter(p => p);
            const actualParts = cleanPath.split('/').filter(p => p);
            
            routeParts.forEach((part, index) => {
                if (part.startsWith(':')) {
                    const paramName = part.substring(1);
                    params[paramName] = actualParts[index];
                }
            });
        }

        return { cleanPath, params, query };
    }

    /**
     * 标准化路径
     * @param {string} path - 原始路径
     * @returns {string} 标准化后的路径
     */
    normalizePath(path) {
        if (!path || path === '') {
            return '/';
        }
        
        // 确保以/开头
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // 移除末尾的/（除非是根路径）
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        return path;
    }

    /**
     * 添加路由守卫
     * @param {Function} guard - 守卫函数
     */
    addGuard(guard) {
        this.guards.push(guard);
    }

    /**
     * 移除路由守卫
     * @param {Function} guard - 守卫函数
     */
    removeGuard(guard) {
        const index = this.guards.indexOf(guard);
        if (index > -1) {
            this.guards.splice(index, 1);
        }
    }

    /**
     * 执行路由守卫
     * @param {string} fullPath - 完整路径
     * @param {string} path - 清理后的路径
     * @param {Object} params - 路径参数
     * @param {Object} query - 查询参数
     * @returns {boolean|string} 守卫结果
     */
    async executeGuards(fullPath, path, params, query) {
        for (const guard of this.guards) {
            try {
                const result = await guard({
                    fullPath,
                    path,
                    params,
                    query,
                    router: this
                });
                
                if (result !== true) {
                    return result;
                }
            } catch (error) {
                console.error('路由守卫执行失败:', error);
                return false;
            }
        }
        
        return true;
    }

    /**
     * 添加中间件
     * @param {Function} middleware - 中间件函数
     */
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    /**
     * 移除中间件
     * @param {Function} middleware - 中间件函数
     */
    removeMiddleware(middleware) {
        const index = this.middlewares.indexOf(middleware);
        if (index > -1) {
            this.middlewares.splice(index, 1);
        }
    }

    /**
     * 执行中间件
     * @param {string} fullPath - 完整路径
     * @param {string} path - 清理后的路径
     * @param {Object} params - 路径参数
     * @param {Object} query - 查询参数
     */
    async executeMiddlewares(fullPath, path, params, query) {
        for (const middleware of this.middlewares) {
            try {
                await middleware({
                    fullPath,
                    path,
                    params,
                    query,
                    router: this
                });
            } catch (error) {
                console.error('中间件执行失败:', error);
            }
        }
    }

    /**
     * 处理路由错误
     * @param {Error} error - 错误对象
     * @param {string} path - 路径
     */
    handleRouteError(error, path) {
        if (this.onRouteError) {
            this.onRouteError(error, path);
        } else {
            // 默认错误处理：导航到404页面或首页
            console.error(`路由错误 (${path}):`, error);
            if (path !== '/') {
                this.navigate('/', true);
            }
        }
    }

    /**
     * 触发路由变化事件
     * @param {string} fullPath - 完整路径
     * @param {string} path - 清理后的路径
     * @param {Object} params - 路径参数
     * @param {Object} query - 查询参数
     */
    dispatchRouteChangeEvent(fullPath, path, params, query) {
        const event = new CustomEvent('routechange', {
            detail: {
                fullPath,
                path,
                params,
                query,
                router: this
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * 获取当前路由信息
     * @returns {Object} 当前路由信息
     */
    getCurrentRoute() {
        return {
            path: this.currentPath,
            params: this.currentParams,
            query: this.currentQuery
        };
    }

    /**
     * 构建URL
     * @param {string} path - 路径
     * @param {Object} params - 路径参数
     * @param {Object} query - 查询参数
     * @returns {string} 完整URL
     */
    buildUrl(path, params = {}, query = {}) {
        let url = path;
        
        // 替换路径参数
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`:${key}`, encodeURIComponent(value));
        });
        
        // 添加查询参数
        const queryString = new URLSearchParams(query).toString();
        if (queryString) {
            url += '?' + queryString;
        }
        
        return url;
    }
}

// 导出路由器
window.Router = Router;