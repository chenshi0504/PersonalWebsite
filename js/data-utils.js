/**
 * 数据工具函数
 * 提供数据处理、转换和验证的辅助函数
 */

/**
 * 数据工具类
 */
class DataUtils {
    /**
     * 过滤数组数据
     * @param {Array} data - 数据数组
     * @param {Object} filters - 过滤条件
     * @returns {Array} 过滤后的数据
     */
    static filterData(data, filters) {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        return data.filter(item => {
            for (const [key, value] of Object.entries(filters)) {
                if (value === null || value === undefined || value === '') {
                    continue;
                }

                if (Array.isArray(value)) {
                    if (value.length === 0) continue;
                    if (!item[key] || !value.some(v => item[key].includes(v))) {
                        return false;
                    }
                } else {
                    if (item[key] !== value) {
                        return false;
                    }
                }
            }
            return true;
        });
    }

    /**
     * 排序数据
     * @param {Array} data - 数据数组
     * @param {string} field - 排序字段
     * @param {string} order - 排序顺序 ('asc' | 'desc')
     * @returns {Array} 排序后的数据
     */
    static sortData(data, field, order = 'asc') {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        return [...data].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal === bVal) return 0;

            const comparison = aVal > bVal ? 1 : -1;
            return order === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * 分页数据
     * @param {Array} data - 数据数组
     * @param {number} page - 页码（从1开始）
     * @param {number} pageSize - 每页数量
     * @returns {Object} 分页结果
     */
    static paginateData(data, page = 1, pageSize = 10) {
        if (!data || !Array.isArray(data)) {
            return {
                data: [],
                page: 1,
                pageSize,
                total: 0,
                totalPages: 0
            };
        }

        const total = data.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return {
            data: data.slice(start, end),
            page,
            pageSize,
            total,
            totalPages
        };
    }

    /**
     * 搜索数据
     * @param {Array} data - 数据数组
     * @param {string} query - 搜索关键词
     * @param {Array} fields - 搜索字段
     * @returns {Array} 搜索结果
     */
    static searchData(data, query, fields = []) {
        if (!data || !Array.isArray(data) || !query) {
            return data || [];
        }

        const lowerQuery = query.toLowerCase();

        return data.filter(item => {
            if (fields.length === 0) {
                // 搜索所有字段
                return Object.values(item).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(lowerQuery);
                    }
                    if (Array.isArray(value)) {
                        return value.some(v => 
                            typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
                        );
                    }
                    return false;
                });
            } else {
                // 搜索指定字段
                return fields.some(field => {
                    const value = item[field];
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(lowerQuery);
                    }
                    if (Array.isArray(value)) {
                        return value.some(v => 
                            typeof v === 'string' && v.toLowerCase().includes(lowerQuery)
                        );
                    }
                    return false;
                });
            }
        });
    }

    /**
     * 分组数据
     * @param {Array} data - 数据数组
     * @param {string} field - 分组字段
     * @returns {Object} 分组结果
     */
    static groupData(data, field) {
        if (!data || !Array.isArray(data)) {
            return {};
        }

        return data.reduce((groups, item) => {
            const key = item[field];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }

    /**
     * 统计数据
     * @param {Array} data - 数据数组
     * @param {string} field - 统计字段
     * @returns {Object} 统计结果
     */
    static aggregateData(data, field) {
        if (!data || !Array.isArray(data)) {
            return {
                count: 0,
                sum: 0,
                avg: 0,
                min: 0,
                max: 0
            };
        }

        const values = data.map(item => item[field]).filter(v => typeof v === 'number');
        
        if (values.length === 0) {
            return {
                count: 0,
                sum: 0,
                avg: 0,
                min: 0,
                max: 0
            };
        }

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            count: values.length,
            sum,
            avg,
            min,
            max
        };
    }

    /**
     * 去重数据
     * @param {Array} data - 数据数组
     * @param {string} field - 去重字段
     * @returns {Array} 去重后的数据
     */
    static uniqueData(data, field) {
        if (!data || !Array.isArray(data)) {
            return [];
        }

        const seen = new Set();
        return data.filter(item => {
            const value = item[field];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }

    /**
     * 合并数据
     * @param {Array} data1 - 数据数组1
     * @param {Array} data2 - 数据数组2
     * @param {string} key - 合并键
     * @returns {Array} 合并后的数据
     */
    static mergeData(data1, data2, key) {
        if (!data1 || !Array.isArray(data1)) {
            return data2 || [];
        }
        if (!data2 || !Array.isArray(data2)) {
            return data1;
        }

        const map = new Map(data1.map(item => [item[key], item]));
        
        data2.forEach(item => {
            const existing = map.get(item[key]);
            if (existing) {
                Object.assign(existing, item);
            } else {
                map.set(item[key], item);
            }
        });

        return Array.from(map.values());
    }

    /**
     * 转换数据格式
     * @param {Array} data - 数据数组
     * @param {Function} transformer - 转换函数
     * @returns {Array} 转换后的数据
     */
    static transformData(data, transformer) {
        if (!data || !Array.isArray(data) || typeof transformer !== 'function') {
            return data || [];
        }

        return data.map(transformer);
    }

    /**
     * 验证数据
     * @param {Object} data - 数据对象
     * @param {Object} schema - 验证模式
     * @returns {Object} 验证结果
     */
    static validateData(data, schema) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            // 必填验证
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} 是必填字段`);
                continue;
            }

            // 如果值为空且不是必填，跳过其他验证
            if (value === undefined || value === null || value === '') {
                continue;
            }

            // 类型验证
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors.push(`${field} 类型错误，期望 ${rules.type}，实际 ${actualType}`);
                }
            }

            // 长度验证
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} 长度不能少于 ${rules.minLength}`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} 长度不能超过 ${rules.maxLength}`);
            }

            // 数值范围验证
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} 不能小于 ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} 不能大于 ${rules.max}`);
            }

            // 正则验证
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field} 格式不正确`);
            }

            // 自定义验证
            if (rules.validator && typeof rules.validator === 'function') {
                const result = rules.validator(value, data);
                if (result !== true) {
                    errors.push(result || `${field} 验证失败`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// 导出数据工具类
window.DataUtils = DataUtils;
