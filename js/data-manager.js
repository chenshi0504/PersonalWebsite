/**
 * 数据管理器
 * 负责管理所有数据的加载、存储、验证和API接口
 */
class DataManager {
    constructor() {
        this.data = {
            projects: [],
            articles: [],
            interests: [],
            config: {}
        };
        
        this.cache = new Map();
        this.isInitialized = false;
        this.dataVersion = '1.0.0';
        
        // 数据文件路径
        this.dataPaths = {
            projects: 'data/projects.json',
            articles: 'data/articles.json',
            interests: 'data/interests.json',
            config: 'data/config.json'
        };
        
        // 数据验证规则
        this.validationRules = this.initValidationRules();
    }

    /**
     * 初始化数据管理器
     */
    async init() {
        if (this.isInitialized) {
            return;
        }

        console.log('初始化数据管理器...');
        
        try {
            // 加载所有数据
            await this.loadAllData();
            
            // 验证数据完整性
            this.validateAllData();
            
            this.isInitialized = true;
            console.log('数据管理器初始化完成');
            
        } catch (error) {
            console.error('数据管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 初始化验证规则
     */
    initValidationRules() {
        return {
            project: {
                id: { required: true, type: 'string' },
                title: { required: true, type: 'string', minLength: 1 },
                description: { required: true, type: 'string' },
                technologies: { required: true, type: 'array' },
                status: { required: true, type: 'string', enum: ['planning', 'in-progress', 'completed', 'paused'] },
                startDate: { required: true, type: 'string', format: 'date' },
                endDate: { required: false, type: 'string', format: 'date' },
                category: { required: true, type: 'string' },
                tags: { required: true, type: 'array' },
                featured: { required: false, type: 'boolean', default: false }
            },
            article: {
                id: { required: true, type: 'string' },
                title: { required: true, type: 'string', minLength: 1 },
                summary: { required: true, type: 'string' },
                content: { required: true, type: 'string' },
                publishDate: { required: true, type: 'string', format: 'date' },
                updateDate: { required: false, type: 'string', format: 'date' },
                category: { required: true, type: 'string' },
                tags: { required: true, type: 'array' },
                readTime: { required: false, type: 'number', min: 1 },
                featured: { required: false, type: 'boolean', default: false }
            },
            interest: {
                id: { required: true, type: 'string' },
                category: { required: true, type: 'string' },
                title: { required: true, type: 'string', minLength: 1 },
                description: { required: true, type: 'string' },
                date: { required: true, type: 'string', format: 'date' },
                type: { required: true, type: 'string', enum: ['gallery', 'travel', 'note', 'hobby'] },
                images: { required: false, type: 'array', default: [] },
                location: { required: false, type: 'string', default: '' }
            }
        };
    }

    /**
     * 加载所有数据
     */
    async loadAllData() {
        const loadPromises = Object.entries(this.dataPaths).map(async ([key, path]) => {
            try {
                const data = await this.loadDataFromFile(path);
                this.data[key] = data || [];
                console.log(`已加载 ${key} 数据: ${Array.isArray(data) ? data.length : 1} 项`);
            } catch (error) {
                console.warn(`加载 ${key} 数据失败:`, error);
                this.data[key] = [];
            }
        });

        await Promise.all(loadPromises);
    }

    /**
     * 从文件加载数据
     * @param {string} filePath - 文件路径
     * @returns {Promise<any>} 数据
     */
    async loadDataFromFile(filePath) {
        // 首先尝试从localStorage加载
        const localKey = `file_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const localData = localStorage.getItem(localKey);
        
        if (localData) {
            try {
                const data = JSON.parse(localData);
                console.log(`从localStorage加载 ${filePath}`);
                
                // 缓存数据
                this.cache.set(filePath, {
                    data,
                    timestamp: Date.now()
                });
                
                return data;
            } catch (error) {
                console.warn(`localStorage数据解析失败，将从文件加载: ${filePath}`);
            }
        }
        
        // 检查缓存
        if (this.cache.has(filePath)) {
            const cached = this.cache.get(filePath);
            if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
                return cached.data;
            }
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 缓存数据
            this.cache.set(filePath, {
                data,
                timestamp: Date.now()
            });
            
            // 同时保存到localStorage
            localStorage.setItem(localKey, JSON.stringify(data));
            
            return data;
            
        } catch (error) {
            console.error(`加载文件失败 (${filePath}):`, error);
            throw error;
        }
    }

    /**
     * 保存数据到文件
     * @param {string} filePath - 文件路径
     * @param {any} data - 数据
     * @returns {Promise<boolean>} 是否成功
     */
    async saveDataToFile(filePath, data) {
        try {
            // 在实际应用中，这里需要调用后端API
            // 目前只是模拟保存到localStorage
            const key = `file_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            // 更新缓存
            this.cache.set(filePath, {
                data,
                timestamp: Date.now()
            });
            
            console.log(`数据已保存到 ${filePath}`);
            return true;
            
        } catch (error) {
            console.error(`保存文件失败 (${filePath}):`, error);
            return false;
        }
    }

    /**
     * 验证所有数据
     */
    validateAllData() {
        try {
            this.data.projects.forEach(project => this.validateData(project, 'project'));
            this.data.articles.forEach(article => this.validateData(article, 'article'));
            this.data.interests.forEach(interest => this.validateData(interest, 'interest'));
            
            console.log('数据验证通过');
        } catch (error) {
            console.warn('数据验证失败:', error);
        }
    }

    /**
     * 验证单个数据项
     * @param {Object} data - 数据对象
     * @param {string} type - 数据类型
     * @returns {boolean} 是否有效
     */
    validateData(data, type) {
        const rules = this.validationRules[type];
        if (!rules) {
            throw new Error(`未知的数据类型: ${type}`);
        }

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];
            
            // 检查必填字段
            if (rule.required && (value === undefined || value === null || value === '')) {
                throw new Error(`${type}.${field} 是必填字段`);
            }
            
            // 如果字段为空且不是必填，跳过验证
            if (value === undefined || value === null) {
                continue;
            }
            
            // 类型验证
            if (rule.type && !this.validateType(value, rule.type)) {
                throw new Error(`${type}.${field} 类型错误，期望 ${rule.type}`);
            }
            
            // 枚举验证
            if (rule.enum && !rule.enum.includes(value)) {
                throw new Error(`${type}.${field} 值无效，必须是 ${rule.enum.join(', ')} 之一`);
            }
            
            // 长度验证
            if (rule.minLength && value.length < rule.minLength) {
                throw new Error(`${type}.${field} 长度不能少于 ${rule.minLength}`);
            }
            
            // 数值验证
            if (rule.min && value < rule.min) {
                throw new Error(`${type}.${field} 不能小于 ${rule.min}`);
            }
            
            // 格式验证
            if (rule.format && !this.validateFormat(value, rule.format)) {
                throw new Error(`${type}.${field} 格式错误`);
            }
        }
        
        return true;
    }

    /**
     * 验证数据类型
     * @param {any} value - 值
     * @param {string} type - 期望类型
     * @returns {boolean} 是否匹配
     */
    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return false;
        }
    }

    /**
     * 验证数据格式
     * @param {any} value - 值
     * @param {string} format - 格式类型
     * @returns {boolean} 是否匹配
     */
    validateFormat(value, format) {
        switch (format) {
            case 'date':
                return !isNaN(Date.parse(value));
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
    }

    // ==================== 项目数据API ====================

    /**
     * 加载项目数据
     */
    async loadProjects() {
        try {
            const projects = await this.loadDataFromFile(this.dataPaths.projects);
            this.data.projects = projects || [];
            return this.data.projects;
        } catch (error) {
            console.error('加载项目数据失败:', error);
            return [];
        }
    }

    /**
     * 获取所有项目
     * @param {Object} options - 查询选项
     * @returns {Array} 项目列表
     */
    getProjects(options = {}) {
        let projects = [...this.data.projects];
        
        // 搜索筛选
        if (options.search) {
            const searchTerm = options.search.toLowerCase();
            projects = projects.filter(p => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.technologies.some(tech => tech.toLowerCase().includes(searchTerm)) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // 分类筛选
        if (options.category) {
            projects = projects.filter(p => p.category === options.category);
        }
        
        // 标签筛选
        if (options.tags && options.tags.length > 0) {
            projects = projects.filter(p => 
                options.tags.some(tag => p.tags.includes(tag))
            );
        }
        
        // 状态筛选
        if (options.status) {
            projects = projects.filter(p => p.status === options.status);
        }
        
        // 特色项目筛选
        if (options.featured !== undefined) {
            projects = projects.filter(p => p.featured === options.featured);
        }
        
        // 排序
        if (options.sortBy) {
            projects.sort((a, b) => {
                const aVal = a[options.sortBy];
                const bVal = b[options.sortBy];
                
                if (options.sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }
        
        // 分页
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            projects = projects.slice(start, end);
        }
        
        return projects;
    }

    /**
     * 根据ID获取项目
     * @param {string} id - 项目ID
     * @returns {Object|null} 项目对象
     */
    getProjectById(id) {
        return this.data.projects.find(p => p.id === id) || null;
    }

    /**
     * 添加项目
     * @param {Object} project - 项目数据
     * @returns {Promise<boolean>} 是否成功
     */
    async addProject(project) {
        try {
            // 生成ID
            if (!project.id) {
                project.id = this.generateId('project');
            }
            
            // 验证数据
            this.validateData(project, 'project');
            
            // 添加到数据
            this.data.projects.push(project);
            
            // 保存到文件
            await this.saveDataToFile(this.dataPaths.projects, this.data.projects);
            
            console.log(`项目已添加: ${project.title}`);
            return true;
            
        } catch (error) {
            console.error('添加项目失败:', error);
            return false;
        }
    }

    /**
     * 更新项目
     * @param {string} id - 项目ID
     * @param {Object} updates - 更新数据
     * @returns {Promise<boolean>} 是否成功
     */
    async updateProject(id, updates) {
        try {
            const index = this.data.projects.findIndex(p => p.id === id);
            if (index === -1) {
                throw new Error(`项目不存在: ${id}`);
            }
            
            // 合并更新数据
            const updatedProject = { ...this.data.projects[index], ...updates };
            
            // 验证数据
            this.validateData(updatedProject, 'project');
            
            // 更新数据
            this.data.projects[index] = updatedProject;
            
            // 保存到文件
            await this.saveDataToFile(this.dataPaths.projects, this.data.projects);
            
            console.log(`项目已更新: ${updatedProject.title}`);
            return true;
            
        } catch (error) {
            console.error('更新项目失败:', error);
            return false;
        }
    }

    /**
     * 删除项目
     * @param {string} id - 项目ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteProject(id) {
        try {
            const index = this.data.projects.findIndex(p => p.id === id);
            if (index === -1) {
                throw new Error(`项目不存在: ${id}`);
            }
            
            // 删除项目
            const deletedProject = this.data.projects.splice(index, 1)[0];
            
            // 保存到文件
            await this.saveDataToFile(this.dataPaths.projects, this.data.projects);
            
            console.log(`项目已删除: ${deletedProject.title}`);
            return true;
            
        } catch (error) {
            console.error('删除项目失败:', error);
            return false;
        }
    }

    // ==================== 文章数据API ====================

    /**
     * 加载文章数据
     */
    async loadArticles() {
        try {
            const articles = await this.loadDataFromFile(this.dataPaths.articles);
            this.data.articles = articles || [];
            return this.data.articles;
        } catch (error) {
            console.error('加载文章数据失败:', error);
            return [];
        }
    }

    /**
     * 获取所有文章
     * @param {Object} options - 查询选项
     * @returns {Array} 文章列表
     */
    getArticles(options = {}) {
        let articles = [...this.data.articles];
        
        // 分类筛选
        if (options.category) {
            articles = articles.filter(a => a.category === options.category);
        }
        
        // 标签筛选
        if (options.tags && options.tags.length > 0) {
            articles = articles.filter(a => 
                options.tags.some(tag => a.tags.includes(tag))
            );
        }
        
        // 特色文章筛选
        if (options.featured !== undefined) {
            articles = articles.filter(a => a.featured === options.featured);
        }
        
        // 搜索
        if (options.search) {
            const searchTerm = options.search.toLowerCase();
            articles = articles.filter(a => 
                a.title.toLowerCase().includes(searchTerm) ||
                a.summary.toLowerCase().includes(searchTerm) ||
                a.content.toLowerCase().includes(searchTerm)
            );
        }
        
        // 排序（默认按发布日期降序）
        articles.sort((a, b) => {
            const sortBy = options.sortBy || 'publishDate';
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            if (options.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return bVal > aVal ? 1 : -1;
        });
        
        // 分页
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            articles = articles.slice(start, end);
        }
        
        return articles;
    }

    /**
     * 根据ID获取文章
     * @param {string} id - 文章ID
     * @returns {Object|null} 文章对象
     */
    getArticleById(id) {
        return this.data.articles.find(a => a.id === id) || null;
    }

    // ==================== 兴趣数据API ====================

    /**
     * 加载兴趣数据
     */
    async loadInterests() {
        try {
            const interests = await this.loadDataFromFile(this.dataPaths.interests);
            this.data.interests = interests || [];
            return this.data.interests;
        } catch (error) {
            console.error('加载兴趣数据失败:', error);
            return [];
        }
    }

    /**
     * 获取所有兴趣
     * @param {Object} options - 查询选项
     * @returns {Array} 兴趣列表
     */
    getInterests(options = {}) {
        let interests = [...this.data.interests];
        
        // 分类筛选
        if (options.category) {
            interests = interests.filter(i => i.category === options.category);
        }
        
        // 类型筛选
        if (options.type) {
            interests = interests.filter(i => i.type === options.type);
        }
        
        // 排序（默认按日期降序）
        interests.sort((a, b) => {
            const sortBy = options.sortBy || 'date';
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            if (options.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return bVal > aVal ? 1 : -1;
        });
        
        return interests;
    }

    /**
     * 根据ID获取兴趣
     * @param {string} id - 兴趣ID
     * @returns {Object|null} 兴趣对象
     */
    getInterestById(id) {
        return this.data.interests.find(i => i.id === id) || null;
    }

    // ==================== 工具方法 ====================

    /**
     * 生成唯一ID
     * @param {string} prefix - 前缀
     * @returns {string} 唯一ID
     */
    generateId(prefix = 'item') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取所有分类
     * @param {string} dataType - 数据类型
     * @returns {Array} 分类列表
     */
    getCategories(dataType) {
        const data = this.data[dataType] || [];
        const categories = [...new Set(data.map(item => item.category))];
        return categories.sort();
    }

    /**
     * 获取所有标签
     * @param {string} dataType - 数据类型
     * @returns {Array} 标签列表
     */
    getTags(dataType) {
        const data = this.data[dataType] || [];
        const tags = new Set();
        
        data.forEach(item => {
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        
        return [...tags].sort();
    }

    /**
     * 获取数据统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            projects: {
                total: this.data.projects.length,
                completed: this.data.projects.filter(p => p.status === 'completed').length,
                inProgress: this.data.projects.filter(p => p.status === 'in-progress').length,
                featured: this.data.projects.filter(p => p.featured).length,
                categories: this.getCategories('projects').length
            },
            articles: {
                total: this.data.articles.length,
                featured: this.data.articles.filter(a => a.featured).length,
                categories: this.getCategories('articles').length,
                tags: this.getTags('articles').length
            },
            interests: {
                total: this.data.interests.length,
                categories: this.getCategories('interests').length,
                types: [...new Set(this.data.interests.map(i => i.type))].length,
                photos: this.data.interests.reduce((count, interest) => {
                    return count + (interest.images ? interest.images.length : 0) + 
                           (interest.gallery ? interest.gallery.length : 0);
                }, 0)
            }
        };
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('数据缓存已清除');
    }

    /**
     * 重新加载所有数据
     */
    async reload() {
        this.clearCache();
        await this.loadAllData();
        this.validateAllData();
        console.log('数据已重新加载');
    }

    /**
     * 销毁数据管理器
     */
    destroy() {
        this.clearCache();
        this.data = { projects: [], articles: [], interests: [], config: {} };
        this.isInitialized = false;
        console.log('数据管理器已销毁');
    }

    /**
     * 添加文章
     * @param {Object} article - 文章数据
     * @returns {Promise<boolean>} 是否成功
     */
    async addArticle(article) {
        try {
            if (!article.id) {
                article.id = this.generateId('article');
            }
            
            this.validateData(article, 'article');
            this.data.articles.push(article);
            await this.saveDataToFile(this.dataPaths.articles, this.data.articles);
            
            console.log(`文章已添加: ${article.title}`);
            return true;
        } catch (error) {
            console.error('添加文章失败:', error);
            return false;
        }
    }

    /**
     * 更新文章
     * @param {string} id - 文章ID
     * @param {Object} updates - 更新数据
     * @returns {Promise<boolean>} 是否成功
     */
    async updateArticle(id, updates) {
        try {
            const index = this.data.articles.findIndex(a => a.id === id);
            if (index === -1) {
                throw new Error(`文章不存在: ${id}`);
            }
            
            const updatedArticle = { ...this.data.articles[index], ...updates };
            this.validateData(updatedArticle, 'article');
            this.data.articles[index] = updatedArticle;
            await this.saveDataToFile(this.dataPaths.articles, this.data.articles);
            
            console.log(`文章已更新: ${updatedArticle.title}`);
            return true;
        } catch (error) {
            console.error('更新文章失败:', error);
            return false;
        }
    }

    /**
     * 删除文章
     * @param {string} id - 文章ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteArticle(id) {
        try {
            const index = this.data.articles.findIndex(a => a.id === id);
            if (index === -1) {
                throw new Error(`文章不存在: ${id}`);
            }
            
            const deletedArticle = this.data.articles.splice(index, 1)[0];
            await this.saveDataToFile(this.dataPaths.articles, this.data.articles);
            
            console.log(`文章已删除: ${deletedArticle.title}`);
            return true;
        } catch (error) {
            console.error('删除文章失败:', error);
            return false;
        }
    }

    /**
     * 添加兴趣
     * @param {Object} interest - 兴趣数据
     * @returns {Promise<boolean>} 是否成功
     */
    async addInterest(interest) {
        try {
            if (!interest.id) {
                interest.id = this.generateId('interest');
            }
            
            this.validateData(interest, 'interest');
            this.data.interests.push(interest);
            await this.saveDataToFile(this.dataPaths.interests, this.data.interests);
            
            console.log(`兴趣已添加: ${interest.title}`);
            return true;
        } catch (error) {
            console.error('添加兴趣失败:', error);
            return false;
        }
    }

    /**
     * 更新兴趣
     * @param {string} id - 兴趣ID
     * @param {Object} updates - 更新数据
     * @returns {Promise<boolean>} 是否成功
     */
    async updateInterest(id, updates) {
        try {
            const index = this.data.interests.findIndex(i => i.id === id);
            if (index === -1) {
                throw new Error(`兴趣不存在: ${id}`);
            }
            
            const updatedInterest = { ...this.data.interests[index], ...updates };
            this.validateData(updatedInterest, 'interest');
            this.data.interests[index] = updatedInterest;
            await this.saveDataToFile(this.dataPaths.interests, this.data.interests);
            
            console.log(`兴趣已更新: ${updatedInterest.title}`);
            return true;
        } catch (error) {
            console.error('更新兴趣失败:', error);
            return false;
        }
    }

    /**
     * 删除兴趣
     * @param {string} id - 兴趣ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteInterest(id) {
        try {
            const index = this.data.interests.findIndex(i => i.id === id);
            if (index === -1) {
                throw new Error(`兴趣不存在: ${id}`);
            }
            
            const deletedInterest = this.data.interests.splice(index, 1)[0];
            await this.saveDataToFile(this.dataPaths.interests, this.data.interests);
            
            console.log(`兴趣已删除: ${deletedInterest.title}`);
            return true;
        } catch (error) {
            console.error('删除兴趣失败:', error);
            return false;
        }
    }
}

// 导出数据管理器
window.DataManager = DataManager;
