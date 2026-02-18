# 开发文档

## 项目概述

这是一个现代化的个人网站平台，采用原生JavaScript开发，无需重型框架依赖。平台包含科研项目、知识共享和生活兴趣三大核心模块。

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: CSS Variables, Flexbox, Grid
- **架构**: 模块化设计，组件化开发
- **数据**: JSON文件存储（可扩展为后端API）

## 项目结构

```
personal-website/
├── index.html              # 主页面
├── css/                    # 样式文件
│   ├── reset.css          # CSS重置
│   ├── variables.css      # CSS变量定义
│   ├── components.css     # 组件样式
│   └── main.css          # 主样式
├── js/                    # JavaScript文件
│   ├── app.js            # 主应用入口
│   ├── utils.js          # 工具函数
│   ├── data-utils.js     # 数据处理工具
│   ├── router.js         # 路由管理
│   ├── theme-manager.js  # 主题管理
│   ├── navigation.js     # 导航管理
│   ├── notification-manager.js # 通知管理
│   ├── file-manager.js   # 文件管理
│   ├── data-manager.js   # 数据管理
│   └── components/       # 功能模块
│       ├── research-module.js    # 科研项目模块
│       ├── knowledge-module.js   # 知识共享模块
│       ├── interests-module.js   # 生活兴趣模块
│       └── admin-module.js       # 管理模块
├── data/                 # 数据文件
│   ├── config.json       # 网站配置
│   ├── projects.json     # 项目数据
│   ├── articles.json     # 文章数据
│   └── interests.json    # 兴趣数据
├── images/               # 图片资源
│   ├── projects/         # 项目图片
│   ├── articles/         # 文章图片
│   └── interests/        # 兴趣图片
└── README.md            # 项目说明
```

## 核心功能

### 1. 路由系统 (router.js)

- 基于Hash的客户端路由
- 支持动态路由参数
- 路由守卫和中间件
- 浏览器历史管理

### 2. 数据管理 (data-manager.js)

- 统一的数据访问接口
- 数据验证和缓存
- CRUD操作支持
- 数据筛选和排序

### 3. 主题管理 (theme-manager.js)

- 暗色/亮色主题切换
- CSS变量动态更新
- 主题持久化存储
- 系统主题跟随

### 4. 通知系统 (notification-manager.js)

- 多种通知类型（成功、错误、警告、信息）
- 自动消失和手动关闭
- 通知队列管理
- 自定义动作按钮

### 5. 文件管理 (file-manager.js)

- 拖拽上传支持
- 图片压缩和缩略图生成
- 文件类型验证
- 批量处理功能

## 模块说明

### 科研项目模块 (research-module.js)

**功能**:
- 项目列表展示（网格/列表视图）
- 项目详情页面
- 多维度筛选（分类、状态、标签）
- 搜索和排序
- 相关项目推荐

**数据结构**:
```javascript
{
  id: "project-001",
  title: "项目标题",
  description: "项目描述",
  technologies: ["技术1", "技术2"],
  status: "completed", // planning | in-progress | completed | paused
  startDate: "2024-01-01",
  endDate: "2024-06-01",
  category: "分类",
  tags: ["标签1", "标签2"],
  featured: true,
  images: ["image1.jpg"],
  links: {
    demo: "https://demo.url",
    github: "https://github.url"
  }
}
```

### 知识共享模块 (knowledge-module.js)

**功能**:
- 文章列表展示
- Markdown内容渲染
- 文章搜索
- 分类和标签筛选
- 阅读时间估算

**数据结构**:
```javascript
{
  id: "article-001",
  title: "文章标题",
  summary: "文章摘要",
  content: "Markdown内容",
  publishDate: "2024-01-01",
  updateDate: "2024-01-02",
  category: "分类",
  tags: ["标签1", "标签2"],
  readTime: 10,
  featured: true
}
```

### 生活兴趣模块 (interests-module.js)

**功能**:
- 网格和时间线视图
- 分类筛选
- 图片画廊
- 详情页面展示

**数据结构**:
```javascript
{
  id: "interest-001",
  category: "摄影",
  title: "标题",
  description: "描述",
  content: "详细内容",
  date: "2024-01-01",
  type: "gallery", // gallery | travel | note | hobby
  image: "main-image.jpg",
  images: ["image1.jpg", "image2.jpg"],
  location: "地点",
  tags: ["标签1", "标签2"],
  gallery: [
    { url: "image.jpg", caption: "说明" }
  ]
}
```

### 管理模块 (admin-module.js)

**功能**:
- 内容管理界面
- 新增/编辑/删除操作
- 表单验证
- 数据持久化

## 开发指南

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd personal-website
```

2. 启动本地服务器
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx http-server -p 8000

# 或使用提供的批处理文件（Windows）
start-server.bat
```

3. 访问网站
```
http://localhost:8000
```

### 添加新功能

1. **添加新模块**:
   - 在 `js/components/` 创建新模块文件
   - 继承基础模块结构
   - 在 `index.html` 中引入
   - 在 `app.js` 中注册路由

2. **添加新样式**:
   - 在 `css/components.css` 中添加组件样式
   - 使用CSS变量保持一致性
   - 考虑响应式设计

3. **添加新数据类型**:
   - 在 `data/` 目录创建JSON文件
   - 在 `data-manager.js` 中添加相应方法
   - 定义数据验证规则

### 样式规范

- 使用CSS变量定义颜色和尺寸
- 遵循BEM命名规范
- 移动优先的响应式设计
- 使用Flexbox和Grid布局

### 代码规范

- 使用ES6+语法
- 函数和变量使用驼峰命名
- 类名使用帕斯卡命名
- 添加JSDoc注释
- 保持代码简洁和可读性

## 部署

### 静态网站部署

项目可以部署到任何静态网站托管服务:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### 配置步骤

1. 构建项目（如需要）
2. 上传所有文件到托管服务
3. 配置域名（可选）
4. 启用HTTPS

## 性能优化

- 图片懒加载
- 代码分割
- 资源压缩
- 浏览器缓存
- CDN加速

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 常见问题

### 1. 数据不显示

检查浏览器控制台是否有错误，确保JSON文件格式正确。

### 2. 样式异常

清除浏览器缓存，检查CSS文件是否正确加载。

### 3. 路由不工作

确保使用本地服务器访问，不要直接打开HTML文件。

## 未来计划

- [ ] 添加搜索功能增强
- [ ] 集成评论系统
- [ ] 添加数据导出功能
- [ ] 支持多语言
- [ ] PWA支持
- [ ] 后端API集成
- [ ] 用户认证系统

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License
