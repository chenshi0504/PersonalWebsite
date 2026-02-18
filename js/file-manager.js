/**
 * 文件管理器
 * 负责文件上传、处理、存储和访问
 */
class FileManager {
    constructor() {
        this.uploadPath = 'images/';
        this.allowedTypes = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            document: ['pdf', 'doc', 'docx', 'txt', 'md'],
            archive: ['zip', 'rar', '7z'],
            video: ['mp4', 'webm', 'ogg'],
            audio: ['mp3', 'wav', 'ogg']
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxImageSize = 5 * 1024 * 1024;  // 5MB for images
        this.compressionQuality = 0.8;
        this.thumbnailSize = { width: 300, height: 300 };
        
        this.uploadQueue = [];
        this.isUploading = false;
        this.uploadCallbacks = new Map();
    }

    /**
     * 初始化文件管理器
     */
    init() {
        console.log('初始化文件管理器...');
        
        // 创建必要的目录结构
        this.ensureDirectories();
        
        // 绑定拖拽事件
        this.bindDragDropEvents();
        
        console.log('文件管理器初始化完成');
    }

    /**
     * 确保目录结构存在
     */
    ensureDirectories() {
        // 在实际应用中，这里会调用后端API创建目录
        // 目前只是模拟
        const directories = [
            'images/',
            'images/thumbnails/',
            'images/projects/',
            'images/articles/',
            'images/interests/',
            'documents/',
            'temp/'
        ];
        
        console.log('确保目录结构:', directories);
    }

    /**
     * 绑定拖拽上传事件
     */
    bindDragDropEvents() {
        // 防止默认的拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 拖拽进入
        document.addEventListener('dragenter', (e) => {
            if (this.hasFiles(e)) {
                document.body.classList.add('drag-over');
            }
        });

        // 拖拽离开
        document.addEventListener('dragleave', (e) => {
            if (e.clientX === 0 && e.clientY === 0) {
                document.body.classList.remove('drag-over');
            }
        });

        // 文件放置
        document.addEventListener('drop', (e) => {
            document.body.classList.remove('drag-over');
            
            if (this.hasFiles(e)) {
                const files = Array.from(e.dataTransfer.files);
                this.handleFilesDrop(files, e.target);
            }
        });
    }

    /**
     * 检查是否包含文件
     * @param {DragEvent} e - 拖拽事件
     * @returns {boolean} 是否包含文件
     */
    hasFiles(e) {
        return e.dataTransfer && 
               e.dataTransfer.types && 
               e.dataTransfer.types.includes('Files');
    }

    /**
     * 处理文件拖拽放置
     * @param {File[]} files - 文件列表
     * @param {Element} target - 目标元素
     */
    handleFilesDrop(files, target) {
        // 查找最近的上传区域
        const uploadArea = target.closest('.upload-area, .file-drop-zone');
        
        if (uploadArea) {
            // 在指定区域上传
            this.uploadFiles(files, { target: uploadArea });
        } else {
            // 全局上传
            this.showUploadDialog(files);
        }
    }

    /**
     * 显示上传对话框
     * @param {File[]} files - 文件列表
     */
    showUploadDialog(files) {
        // 创建上传对话框
        const dialog = this.createUploadDialog(files);
        document.body.appendChild(dialog);
        
        // 显示对话框
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
    }

    /**
     * 创建上传对话框
     * @param {File[]} files - 文件列表
     * @returns {HTMLElement} 对话框元素
     */
    createUploadDialog(files) {
        const dialog = document.createElement('div');
        dialog.className = 'upload-dialog modal-backdrop';
        
        dialog.innerHTML = `
            <div class="modal upload-modal">
                <div class="modal-header">
                    <h3 class="modal-title">上传文件</h3>
                    <button class="modal-close btn btn-ghost" aria-label="关闭">×</button>
                </div>
                <div class="modal-content">
                    <div class="upload-files-list">
                        ${files.map(file => this.createFilePreview(file)).join('')}
                    </div>
                    <div class="upload-options">
                        <label class="form-group">
                            <span>上传到:</span>
                            <select class="upload-category input">
                                <option value="general">通用</option>
                                <option value="projects">项目</option>
                                <option value="articles">文章</option>
                                <option value="interests">兴趣</option>
                            </select>
                        </label>
                        <label class="form-group">
                            <input type="checkbox" class="compress-images" checked>
                            <span>压缩图片</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-upload">取消</button>
                    <button class="btn btn-primary start-upload">开始上传</button>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindUploadDialogEvents(dialog, files);
        
        return dialog;
    }

    /**
     * 创建文件预览
     * @param {File} file - 文件对象
     * @returns {string} 预览HTML
     */
    createFilePreview(file) {
        const fileType = this.getFileType(file);
        const fileSize = Utils.formatFileSize(file.size);
        const isValid = this.validateFile(file);
        
        return `
            <div class="file-preview ${isValid ? '' : 'invalid'}" data-file-name="${file.name}">
                <div class="file-icon">
                    ${this.getFileIcon(fileType)}
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    ${!isValid ? '<div class="file-error">文件无效</div>' : ''}
                </div>
                <div class="file-actions">
                    <button class="btn btn-ghost btn-small remove-file" data-file-name="${file.name}">
                        移除
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 绑定上传对话框事件
     * @param {HTMLElement} dialog - 对话框元素
     * @param {File[]} files - 文件列表
     */
    bindUploadDialogEvents(dialog, files) {
        const closeBtn = dialog.querySelector('.modal-close');
        const cancelBtn = dialog.querySelector('.cancel-upload');
        const uploadBtn = dialog.querySelector('.start-upload');
        
        // 关闭对话框
        const closeDialog = () => {
            dialog.classList.remove('show');
            setTimeout(() => {
                dialog.remove();
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        
        // 点击背景关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
        
        // 移除文件
        dialog.addEventListener('click', (e) => {
            if (e.target.matches('.remove-file')) {
                const fileName = e.target.dataset.fileName;
                const fileIndex = files.findIndex(f => f.name === fileName);
                if (fileIndex > -1) {
                    files.splice(fileIndex, 1);
                    e.target.closest('.file-preview').remove();
                }
                
                // 如果没有文件了，禁用上传按钮
                if (files.length === 0) {
                    uploadBtn.disabled = true;
                }
            }
        });
        
        // 开始上传
        uploadBtn.addEventListener('click', async () => {
            const category = dialog.querySelector('.upload-category').value;
            const compress = dialog.querySelector('.compress-images').checked;
            
            closeDialog();
            
            await this.uploadFiles(files, {
                category,
                compress
            });
        });
    }

    /**
     * 上传文件
     * @param {File[]} files - 文件列表
     * @param {Object} options - 上传选项
     * @returns {Promise<Array>} 上传结果
     */
    async uploadFiles(files, options = {}) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            throw new Error('没有有效的文件可上传');
        }

        console.log(`开始上传 ${validFiles.length} 个文件`);
        
        const results = [];
        const totalFiles = validFiles.length;
        let completedFiles = 0;

        // 显示上传进度
        const progressDialog = this.showUploadProgress(totalFiles);

        try {
            for (const file of validFiles) {
                try {
                    const result = await this.uploadSingleFile(file, options);
                    results.push(result);
                    completedFiles++;
                    
                    // 更新进度
                    this.updateUploadProgress(progressDialog, completedFiles, totalFiles);
                    
                } catch (error) {
                    console.error(`上传文件失败 (${file.name}):`, error);
                    results.push({
                        file: file.name,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            // 隐藏进度对话框
            setTimeout(() => {
                this.hideUploadProgress(progressDialog);
            }, 1000);
            
            console.log('文件上传完成:', results);
            return results;
            
        } catch (error) {
            this.hideUploadProgress(progressDialog);
            throw error;
        }
    }

    /**
     * 上传单个文件
     * @param {File} file - 文件对象
     * @param {Object} options - 上传选项
     * @returns {Promise<Object>} 上传结果
     */
    async uploadSingleFile(file, options = {}) {
        const fileType = this.getFileType(file);
        let processedFile = file;
        
        // 图片处理
        if (fileType === 'image' && options.compress !== false) {
            processedFile = await this.compressImage(file);
        }
        
        // 生成文件名
        const fileName = this.generateFileName(file, options.category);
        const filePath = this.getFilePath(fileName, options.category);
        
        // 模拟上传到服务器
        const uploadResult = await this.simulateUpload(processedFile, filePath);
        
        // 生成缩略图（如果是图片）
        let thumbnailPath = null;
        if (fileType === 'image') {
            thumbnailPath = await this.generateThumbnail(processedFile, fileName);
        }
        
        return {
            file: file.name,
            success: true,
            originalName: file.name,
            fileName: fileName,
            filePath: filePath,
            thumbnailPath: thumbnailPath,
            fileType: fileType,
            fileSize: processedFile.size,
            uploadTime: new Date().toISOString()
        };
    }

    /**
     * 压缩图片
     * @param {File} file - 图片文件
     * @returns {Promise<File>} 压缩后的文件
     */
    async compressImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // 计算压缩后的尺寸
                const maxWidth = 1920;
                const maxHeight = 1080;
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制压缩后的图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    
                    console.log(`图片压缩: ${Utils.formatFileSize(file.size)} -> ${Utils.formatFileSize(compressedFile.size)}`);
                    resolve(compressedFile);
                }, file.type, this.compressionQuality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 生成缩略图
     * @param {File} file - 图片文件
     * @param {string} fileName - 文件名
     * @returns {Promise<string>} 缩略图路径
     */
    async generateThumbnail(file, fileName) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                const { width: thumbWidth, height: thumbHeight } = this.thumbnailSize;
                
                // 计算缩略图尺寸（保持比例）
                const ratio = Math.min(thumbWidth / img.width, thumbHeight / img.height);
                const width = img.width * ratio;
                const height = img.height * ratio;
                
                canvas.width = thumbWidth;
                canvas.height = thumbHeight;
                
                // 居中绘制
                const x = (thumbWidth - width) / 2;
                const y = (thumbHeight - height) / 2;
                
                // 填充背景
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, thumbWidth, thumbHeight);
                
                // 绘制缩略图
                ctx.drawImage(img, x, y, width, height);
                
                // 转换为Blob并保存
                canvas.toBlob((blob) => {
                    const thumbnailName = `thumb_${fileName}`;
                    const thumbnailPath = `images/thumbnails/${thumbnailName}`;
                    
                    // 模拟保存缩略图
                    this.simulateUpload(blob, thumbnailPath);
                    
                    resolve(thumbnailPath);
                }, 'image/jpeg', 0.8);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 模拟文件上传
     * @param {File|Blob} file - 文件对象
     * @param {string} filePath - 文件路径
     * @returns {Promise<boolean>} 上传结果
     */
    async simulateUpload(file, filePath) {
        // 模拟上传延迟
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // 在实际应用中，这里会调用后端API上传文件
        // 目前使用localStorage模拟文件存储
        try {
            const reader = new FileReader();
            
            return new Promise((resolve, reject) => {
                reader.onload = () => {
                    try {
                        localStorage.setItem(`file_${filePath}`, reader.result);
                        console.log(`文件已保存: ${filePath}`);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(file);
            });
            
        } catch (error) {
            console.error('文件上传失败:', error);
            throw error;
        }
    }

    /**
     * 验证文件
     * @param {File} file - 文件对象
     * @returns {boolean} 是否有效
     */
    validateFile(file) {
        // 检查文件大小
        const maxSize = this.getFileType(file) === 'image' ? this.maxImageSize : this.maxFileSize;
        if (file.size > maxSize) {
            console.warn(`文件过大: ${file.name} (${Utils.formatFileSize(file.size)})`);
            return false;
        }
        
        // 检查文件类型
        const fileType = this.getFileType(file);
        if (!fileType) {
            console.warn(`不支持的文件类型: ${file.name}`);
            return false;
        }
        
        return true;
    }

    /**
     * 获取文件类型
     * @param {File} file - 文件对象
     * @returns {string|null} 文件类型
     */
    getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        for (const [type, extensions] of Object.entries(this.allowedTypes)) {
            if (extensions.includes(extension)) {
                return type;
            }
        }
        
        return null;
    }

    /**
     * 获取文件图标
     * @param {string} fileType - 文件类型
     * @returns {string} 图标HTML
     */
    getFileIcon(fileType) {
        const icons = {
            image: '🖼️',
            document: '📄',
            archive: '📦',
            video: '🎥',
            audio: '🎵'
        };
        
        return icons[fileType] || '📄';
    }

    /**
     * 生成文件名
     * @param {File} file - 文件对象
     * @param {string} category - 分类
     * @returns {string} 文件名
     */
    generateFileName(file, category = 'general') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6);
        const extension = file.name.split('.').pop();
        
        return `${category}_${timestamp}_${random}.${extension}`;
    }

    /**
     * 获取文件路径
     * @param {string} fileName - 文件名
     * @param {string} category - 分类
     * @returns {string} 文件路径
     */
    getFilePath(fileName, category = 'general') {
        const fileType = this.getFileType({ name: fileName });
        
        if (fileType === 'image') {
            return `images/${category}/${fileName}`;
        }
        
        return `documents/${fileName}`;
    }

    /**
     * 显示上传进度
     * @param {number} totalFiles - 总文件数
     * @returns {HTMLElement} 进度对话框
     */
    showUploadProgress(totalFiles) {
        const dialog = document.createElement('div');
        dialog.className = 'upload-progress-dialog';
        
        dialog.innerHTML = `
            <div class="upload-progress-content">
                <h4>正在上传文件...</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">0 / ${totalFiles}</div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
        
        return dialog;
    }

    /**
     * 更新上传进度
     * @param {HTMLElement} dialog - 进度对话框
     * @param {number} completed - 已完成数量
     * @param {number} total - 总数量
     */
    updateUploadProgress(dialog, completed, total) {
        const progressFill = dialog.querySelector('.progress-fill');
        const progressText = dialog.querySelector('.progress-text');
        
        const percentage = (completed / total) * 100;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed} / ${total}`;
    }

    /**
     * 隐藏上传进度
     * @param {HTMLElement} dialog - 进度对话框
     */
    hideUploadProgress(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }

    /**
     * 获取文件URL
     * @param {string} filePath - 文件路径
     * @returns {string} 文件URL
     */
    getFileUrl(filePath) {
        // 在实际应用中，这里会返回真实的文件URL
        // 目前从localStorage获取
        const fileData = localStorage.getItem(`file_${filePath}`);
        return fileData || '';
    }

    /**
     * 删除文件
     * @param {string} filePath - 文件路径
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteFile(filePath) {
        try {
            // 在实际应用中，这里会调用后端API删除文件
            localStorage.removeItem(`file_${filePath}`);
            
            // 删除缩略图
            const thumbnailPath = filePath.replace('images/', 'images/thumbnails/thumb_');
            localStorage.removeItem(`file_${thumbnailPath}`);
            
            console.log(`文件已删除: ${filePath}`);
            return true;
            
        } catch (error) {
            console.error('删除文件失败:', error);
            return false;
        }
    }

    /**
     * 创建上传区域
     * @param {HTMLElement} container - 容器元素
     * @param {Object} options - 选项
     * @returns {HTMLElement} 上传区域元素
     */
    createUploadArea(container, options = {}) {
        const uploadArea = document.createElement('div');
        uploadArea.className = 'upload-area';
        
        uploadArea.innerHTML = `
            <div class="upload-area-content">
                <div class="upload-icon">📁</div>
                <div class="upload-text">
                    <p>拖拽文件到此处或<button class="btn btn-ghost">点击选择</button></p>
                    <p class="upload-hint">支持 ${Object.values(this.allowedTypes).flat().join(', ')} 格式</p>
                </div>
                <input type="file" class="upload-input" multiple accept="${this.getAcceptString()}" hidden>
            </div>
        `;
        
        // 绑定事件
        const input = uploadArea.querySelector('.upload-input');
        const selectBtn = uploadArea.querySelector('.btn');
        
        selectBtn.addEventListener('click', () => {
            input.click();
        });
        
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.uploadFiles(files, options);
            }
        });
        
        container.appendChild(uploadArea);
        return uploadArea;
    }

    /**
     * 获取accept字符串
     * @returns {string} accept字符串
     */
    getAcceptString() {
        const extensions = Object.values(this.allowedTypes).flat();
        return extensions.map(ext => `.${ext}`).join(',');
    }

    /**
     * 转换图片格式
     * @param {File} file - 原始图片文件
     * @param {string} targetFormat - 目标格式 ('jpeg' | 'png' | 'webp')
     * @param {number} quality - 质量 (0-1)
     * @returns {Promise<File>} 转换后的文件
     */
    async convertImageFormat(file, targetFormat = 'jpeg', quality = 0.9) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 如果转换为JPEG，先填充白色背景（处理透明度）
                if (targetFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                // 绘制图片
                ctx.drawImage(img, 0, 0);
                
                // 转换格式
                const mimeType = `image/${targetFormat}`;
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('图片格式转换失败'));
                        return;
                    }
                    
                    const fileName = file.name.replace(/\.[^.]+$/, `.${targetFormat}`);
                    const convertedFile = new File([blob], fileName, {
                        type: mimeType,
                        lastModified: Date.now()
                    });
                    
                    console.log(`图片格式转换: ${file.type} -> ${mimeType}`);
                    resolve(convertedFile);
                }, mimeType, quality);
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 调整图片尺寸
     * @param {File} file - 图片文件
     * @param {number} maxWidth - 最大宽度
     * @param {number} maxHeight - 最大高度
     * @param {boolean} maintainAspectRatio - 是否保持宽高比
     * @returns {Promise<File>} 调整后的文件
     */
    async resizeImage(file, maxWidth, maxHeight, maintainAspectRatio = true) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                let { width, height } = img;
                
                if (maintainAspectRatio) {
                    // 保持宽高比
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                } else {
                    // 不保持宽高比，直接使用目标尺寸
                    width = maxWidth;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制调整后的图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('图片尺寸调整失败'));
                        return;
                    }
                    
                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    });
                    
                    console.log(`图片尺寸调整: ${img.width}x${img.height} -> ${width}x${height}`);
                    resolve(resizedFile);
                }, file.type, this.compressionQuality);
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 批量处理图片
     * @param {File[]} files - 图片文件列表
     * @param {Object} options - 处理选项
     * @returns {Promise<File[]>} 处理后的文件列表
     */
    async batchProcessImages(files, options = {}) {
        const {
            resize = false,
            maxWidth = 1920,
            maxHeight = 1080,
            convert = false,
            targetFormat = 'jpeg',
            compress = true,
            quality = 0.8
        } = options;
        
        const processedFiles = [];
        
        for (const file of files) {
            try {
                let processedFile = file;
                
                // 调整尺寸
                if (resize) {
                    processedFile = await this.resizeImage(processedFile, maxWidth, maxHeight);
                }
                
                // 转换格式
                if (convert) {
                    processedFile = await this.convertImageFormat(processedFile, targetFormat, quality);
                }
                
                // 压缩
                if (compress && !convert) {
                    processedFile = await this.compressImage(processedFile);
                }
                
                processedFiles.push(processedFile);
                
            } catch (error) {
                console.error(`处理图片失败 (${file.name}):`, error);
                processedFiles.push(file); // 使用原始文件
            }
        }
        
        return processedFiles;
    }

    /**
     * 获取图片信息
     * @param {File} file - 图片文件
     * @returns {Promise<Object>} 图片信息
     */
    async getImageInfo(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const info = {
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height,
                    size: file.size,
                    type: file.type,
                    name: file.name
                };
                
                URL.revokeObjectURL(img.src);
                resolve(info);
            };
            
            img.onerror = () => {
                reject(new Error('无法读取图片信息'));
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * 创建文件选择器
     * @param {Object} options - 选项
     * @returns {Promise<File[]>} 选择的文件列表
     */
    async selectFiles(options = {}) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = options.multiple !== false;
            
            if (options.accept) {
                input.accept = options.accept;
            } else {
                input.accept = this.getAcceptString();
            }
            
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                resolve(files);
            });
            
            input.click();
        });
    }

    /**
     * 销毁文件管理器
     */
    destroy() {
        // 清理事件监听器
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.removeEventListener(eventName, this.handleDragEvent);
        });
        
        // 清空上传队列
        this.uploadQueue = [];
        this.uploadCallbacks.clear();
        
        console.log('文件管理器已销毁');
    }
}

// 导出文件管理器
window.FileManager = FileManager;
