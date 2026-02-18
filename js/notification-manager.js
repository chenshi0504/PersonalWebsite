/**
 * 通知管理器
 * 负责显示各种类型的通知消息
 */
class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
        this.isInitialized = false;
    }

    /**
     * 初始化通知管理器
     */
    init() {
        if (this.isInitialized) {
            return;
        }

        console.log('初始化通知管理器...');
        
        // 创建通知容器
        this.createContainer();
        
        this.isInitialized = true;
        console.log('通知管理器初始化完成');
    }

    /**
     * 创建通知容器
     */
    createContainer() {
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型 ('success' | 'error' | 'warning' | 'info')
     * @param {number} duration - 显示时长（毫秒）
     * @param {Object} options - 其他选项
     * @returns {string} 通知ID
     */
    show(message, type = 'info', duration = this.defaultDuration, options = {}) {
        if (!this.isInitialized) {
            this.init();
        }

        const id = this.generateId();
        const notification = this.createNotification(id, message, type, options);
        
        // 添加到容器
        this.container.appendChild(notification);
        
        // 触发显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 存储通知信息
        this.notifications.set(id, {
            element: notification,
            type,
            message,
            timestamp: Date.now()
        });
        
        // 限制通知数量
        this.limitNotifications();
        
        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }
        
        console.log(`显示${type}通知: ${message}`);
        return id;
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     * @param {Object} options - 其他选项
     * @returns {string} 通知ID
     */
    showSuccess(message, duration = this.defaultDuration, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     * @param {Object} options - 其他选项
     * @returns {string} 通知ID
     */
    showError(message, duration = 0, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     * @param {Object} options - 其他选项
     * @returns {string} 通知ID
     */
    showWarning(message, duration = this.defaultDuration, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     * @param {Object} options - 其他选项
     * @returns {string} 通知ID
     */
    showInfo(message, duration = this.defaultDuration, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    /**
     * 创建通知元素
     * @param {string} id - 通知ID
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型
     * @param {Object} options - 其他选项
     * @returns {HTMLElement} 通知元素
     */
    createNotification(id, message, type, options = {}) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.dataset.id = id;
        
        const icon = this.getTypeIcon(type);
        const title = options.title || this.getTypeTitle(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-title">${title}</div>
                    <button class="notification-close" aria-label="关闭通知">×</button>
                </div>
                <div class="notification-message">${message}</div>
                ${options.actions ? this.createNotificationActions(options.actions) : ''}
            </div>
            <div class="notification-progress"></div>
        `;
        
        // 绑定关闭事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hide(id);
        });
        
        // 绑定动作事件
        if (options.actions) {
            this.bindNotificationActions(notification, options.actions);
        }
        
        return notification;
    }

    /**
     * 创建通知动作按钮
     * @param {Array} actions - 动作列表
     * @returns {string} HTML字符串
     */
    createNotificationActions(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => `
                    <button class="btn btn-small notification-action" data-action="${action.key}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * 绑定通知动作事件
     * @param {HTMLElement} notification - 通知元素
     * @param {Array} actions - 动作列表
     */
    bindNotificationActions(notification, actions) {
        notification.addEventListener('click', (e) => {
            if (e.target.matches('.notification-action')) {
                const actionKey = e.target.dataset.action;
                const action = actions.find(a => a.key === actionKey);
                
                if (action && action.handler) {
                    action.handler();
                }
                
                // 关闭通知
                const id = notification.dataset.id;
                this.hide(id);
            }
        });
    }

    /**
     * 隐藏通知
     * @param {string} id - 通知ID
     */
    hide(id) {
        const notificationData = this.notifications.get(id);
        
        if (!notificationData) {
            return;
        }
        
        const { element } = notificationData;
        
        // 添加移除动画
        element.classList.add('removing');
        
        // 动画完成后移除元素
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 300);
    }

    /**
     * 隐藏所有通知
     */
    hideAll() {
        const ids = Array.from(this.notifications.keys());
        ids.forEach(id => this.hide(id));
    }

    /**
     * 隐藏指定类型的通知
     * @param {string} type - 通知类型
     */
    hideByType(type) {
        const ids = Array.from(this.notifications.entries())
            .filter(([, data]) => data.type === type)
            .map(([id]) => id);
        
        ids.forEach(id => this.hide(id));
    }

    /**
     * 限制通知数量
     */
    limitNotifications() {
        const notifications = Array.from(this.notifications.entries());
        
        if (notifications.length > this.maxNotifications) {
            // 移除最旧的通知
            const sortedNotifications = notifications.sort((a, b) => 
                a[1].timestamp - b[1].timestamp
            );
            
            const toRemove = sortedNotifications.slice(0, notifications.length - this.maxNotifications);
            toRemove.forEach(([id]) => this.hide(id));
        }
    }

    /**
     * 获取类型图标
     * @param {string} type - 通知类型
     * @returns {string} 图标
     */
    getTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * 获取类型标题
     * @param {string} type - 通知类型
     * @returns {string} 标题
     */
    getTypeTitle(type) {
        const titles = {
            success: '成功',
            error: '错误',
            warning: '警告',
            info: '信息'
        };
        return titles[type] || titles.info;
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取通知数量
     * @param {string} type - 通知类型（可选）
     * @returns {number} 通知数量
     */
    getCount(type = null) {
        if (type) {
            return Array.from(this.notifications.values())
                .filter(data => data.type === type).length;
        }
        return this.notifications.size;
    }

    /**
     * 检查是否有通知
     * @param {string} type - 通知类型（可选）
     * @returns {boolean} 是否有通知
     */
    hasNotifications(type = null) {
        return this.getCount(type) > 0;
    }

    /**
     * 设置默认显示时长
     * @param {number} duration - 时长（毫秒）
     */
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    /**
     * 设置最大通知数量
     * @param {number} max - 最大数量
     */
    setMaxNotifications(max) {
        this.maxNotifications = max;
        this.limitNotifications();
    }

    /**
     * 显示加载通知
     * @param {string} message - 消息内容
     * @returns {string} 通知ID
     */
    showLoading(message = '加载中...') {
        return this.show(message, 'info', 0, {
            title: '请稍候',
            icon: '⏳'
        });
    }

    /**
     * 显示确认通知
     * @param {string} message - 消息内容
     * @param {Function} onConfirm - 确认回调
     * @param {Function} onCancel - 取消回调
     * @returns {string} 通知ID
     */
    showConfirm(message, onConfirm, onCancel) {
        return this.show(message, 'warning', 0, {
            title: '确认操作',
            actions: [
                {
                    key: 'confirm',
                    label: '确认',
                    handler: onConfirm
                },
                {
                    key: 'cancel',
                    label: '取消',
                    handler: onCancel
                }
            ]
        });
    }

    /**
     * 销毁通知管理器
     */
    destroy() {
        this.hideAll();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        this.notifications.clear();
        this.container = null;
        this.isInitialized = false;
        
        console.log('通知管理器已销毁');
    }
}

// 导出通知管理器
window.NotificationManager = NotificationManager;