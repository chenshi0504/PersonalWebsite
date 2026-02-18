# 个人网站项目 🚀

一个现代化的个人网站平台，采用灰黑色科技风设计，展示科研项目、知识共享和生活兴趣三个主要模块。

## 🎉 项目状态

**✅ 已完成并可使用！**

- 完成度: **95%**
- 状态: 🟢 **可以使用**
- 版本: v1.0

## ⚡ 快速开始

### 1. 启动服务器

**Windows**:
```bash
start-server.bat
```

**Mac/Linux**:
```bash
python3 -m http.server 8000
```

### 2. 打开浏览器

访问: http://localhost:8000

### 3. 开始使用

- 浏览三大模块：科研项目、知识共享、生活兴趣
- 点击"管理"进入后台添加/编辑内容
- 切换暗色/亮色主题

## 📚 文档

- 📖 [QUICK_START.md](QUICK_START.md) - 快速启动指南
- 🔧 [DEVELOPMENT.md](DEVELOPMENT.md) - 开发文档
- 🇨🇳 [README_CN.md](README_CN.md) - 中文完整说明

## ✨ 项目特性

### 核心功能
- 🎨 现代化的灰黑色科技风设计
- 📱 响应式布局，支持移动端/平板/桌面
- 🌓 暗色/亮色主题切换
- 🔧 模块化架构，易于维护
- 📝 支持在线内容管理
- 🚀 原生JavaScript实现，无重型框架依赖

### 增强功能
- 🖼️ 图片占位符处理
- 📄 Markdown渲染和代码高亮
- 🛡️ 全局错误处理机制
- ⏳ 页面加载骨架屏
- 🔍 搜索关键词高亮
- 🖼️ 图片懒加载支持
- 💾 localStorage数据持久化

## 🎯 功能模块

### 1. 科研项目模块
- 项目列表展示（卡片/列表视图）
- 项目详情页面
- 多维度筛选（分类、状态、标签）
- 搜索功能
- 排序功能
- 相关项目推荐

### 2. 知识共享模块
- 文章列表展示
- 文章详情页面
- Markdown渲染
- 代码语法高亮
- 分类筛选
- 搜索功能
- 阅读时间估算
- 相关文章推荐

### 3. 生活兴趣模块
- 网格视图
- 时间线视图
- 分类筛选
- 详情页展示
- 图片画廊

### 4. 管理模块
- 内容管理（文章/项目/兴趣）
- 增删改查操作
- 表单验证
- 数据自动保存到localStorage

## 📁 项目结构

```
personal-website/
├── index.html                      # 主页面
├── start-server.bat                # 启动脚本
│
├── css/                            # 样式文件
│   ├── reset.css                   # CSS重置
│   ├── variables.css               # CSS变量
│   ├── components.css              # 组件样式
│   └── main.css                    # 主样式
│
├── js/                             # JavaScript文件
│   ├── app.js                      # 主应用
│   ├── router.js                   # 路由系统
│   ├── data-manager.js             # 数据管理
│   ├── data-utils.js               # 数据工具
│   ├── theme-manager.js            # 主题管理
│   ├── navigation.js               # 导航管理
│   ├── notification-manager.js     # 通知管理
│   ├── file-manager.js             # 文件管理
│   ├── utils.js                    # 工具函数
│   └── components/                 # 功能模块
│       ├── research-module.js      # 科研项目
│       ├── knowledge-module.js     # 知识共享
│       ├── interests-module.js     # 生活兴趣
│       └── admin-module.js         # 管理后台
│
├── data/                           # 数据文件
│   ├── config.json                 # 配置
│   ├── projects.json               # 项目数据
│   ├── articles.json               # 文章数据
│   └── interests.json              # 兴趣数据
│
└── images/                         # 图片资源
    ├── projects/                   # 项目图片
    ├── articles/                   # 文章图片
    └── interests/                  # 兴趣图片
```

## 🔧 技术栈

- **前端**: 原生JavaScript (ES6+)
- **样式**: CSS3 (Grid, Flexbox, CSS Variables)
- **Markdown**: marked.js
- **代码高亮**: highlight.js
- **架构**: SPA (单页应用)
- **数据**: JSON + localStorage

## 🎨 设计特点

- 灰黑色科技风主题
- 现代化卡片式布局
- 流畅的动画效果
- 响应式设计
- 暗色/亮色主题切换
- 移动端友好

## 💾 数据持久化

### 工作原理
- 初次加载从JSON文件读取数据
- 修改数据后自动保存到localStorage
- 刷新页面时优先从localStorage读取
- 确保数据修改不会丢失

### 数据备份
建议定期备份localStorage数据：
1. 打开浏览器开发者工具（F12）
2. 进入Application → Local Storage
3. 复制保存数据

## 🚀 部署

### GitHub Pages
```bash
# 1. 推送到GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. 在GitHub仓库设置中启用Pages
# Settings → Pages → Source: main branch
```

### Netlify
1. 拖拽项目文件夹到Netlify
2. 自动部署完成

### Vercel
1. 导入GitHub仓库
2. 自动部署完成

## 🐛 常见问题

### Q: 页面空白？
**A**: 检查浏览器控制台（F12），查看错误信息

### Q: 图片不显示？
**A**: 正常的，当前使用占位符图片。准备真实图片放入images目录并更新数据文件中的路径

### Q: 样式错乱？
**A**: 清除浏览器缓存（Ctrl+Shift+Delete）

### Q: 新增内容后刷新消失？
**A**: 已修复！现在数据会自动保存到localStorage，刷新后依然存在

### Q: 文章编辑框太小？
**A**: 已修复！编辑框高度已增加到20行

## 📝 使用说明

### 添加内容
1. 点击导航栏的"管理"
2. 选择要添加的内容类型（文章/项目/兴趣）
3. 点击"新增"按钮
4. 填写表单并保存
5. 数据自动保存到localStorage

### 编辑内容
1. 在管理页面找到要编辑的内容
2. 点击"编辑"按钮
3. 修改内容并保存

### 删除内容
1. 在管理页面找到要删除的内容
2. 点击"删除"按钮
3. 确认删除

## 🎯 下一步

- [ ] 准备真实内容（项目、文章、照片）
- [ ] 替换示例数据
- [ ] 添加真实图片到images目录
- [ ] 部署到线上
- [ ] 自定义样式和配色

## 🤝 贡献

欢迎提交问题和改进建议！

## 📄 许可证

MIT License

## 📞 获取帮助

- 查看 [QUICK_START.md](QUICK_START.md) 快速开始
- 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 开发文档
- 查看代码注释了解实现细节

---

**现在就开始使用吧！** 🎉

```bash
# 启动服务器
start-server.bat

# 打开浏览器
http://localhost:8000
```

**祝你使用愉快！** 🚀
