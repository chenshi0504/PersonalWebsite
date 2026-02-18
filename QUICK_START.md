# 快速启动指南

## 🚀 3步快速启动

### 步骤1: 启动服务器（1分钟）

**Windows用户**:
```bash
# 双击运行
start-server.bat
```

**Mac/Linux用户**:
```bash
# 使用Python 3
python3 -m http.server 8000

# 或使用Python 2
python -m SimpleHTTPServer 8000
```

**Node.js用户**:
```bash
npx http-server -p 8000
```

### 步骤2: 打开浏览器（1分钟）

访问: **http://localhost:8000**

### 步骤3: 开始使用（5分钟）

1. **浏览内容**
   - 点击"科研项目"查看项目列表
   - 点击"知识共享"查看文章
   - 点击"生活兴趣"查看兴趣内容

2. **添加内容**
   - 点击"管理"进入后台
   - 选择要添加的内容类型
   - 点击"新增"按钮
   - 填写表单并保存

3. **测试功能**
   - 尝试搜索功能
   - 切换暗色/亮色主题
   - 在移动端查看响应式效果

---

## ✅ 已实现的功能

### 核心功能
- ✅ 单页应用路由系统
- ✅ 响应式设计（支持手机/平板/桌面）
- ✅ 暗色/亮色主题切换
- ✅ 三大功能模块（科研/知识/兴趣）
- ✅ 管理后台（增删改查）

### 增强功能
- ✅ 图片占位符处理
- ✅ Markdown渲染和代码高亮
- ✅ 全局错误处理
- ✅ 页面加载骨架屏
- ✅ 搜索关键词高亮
- ✅ 图片懒加载支持
- ✅ localStorage数据持久化

---

## 💾 数据持久化说明

### 工作原理
1. **初次加载**: 从JSON文件读取数据
2. **修改数据**: 自动保存到localStorage
3. **刷新页面**: 优先从localStorage读取
4. **数据不丢失**: 修改后的数据会保留

### 数据位置
- 浏览器localStorage中
- 键名格式: `file_data_articles_json`、`file_data_projects_json`等

### 数据备份（可选）
如需备份数据：
1. 按F12打开开发者工具
2. 进入Application → Local Storage
3. 找到对应的键
4. 复制值并保存

---

## 🎯 常见操作

### 添加文章
1. 点击"管理" → "文章"标签
2. 点击"新增文章"
3. 填写：
   - 标题
   - 摘要
   - 内容（支持Markdown）
   - 分类
   - 标签（逗号分隔）
4. 点击"保存"

### 添加项目
1. 点击"管理" → "项目"标签
2. 点击"新增项目"
3. 填写项目信息
4. 点击"保存"

### 添加兴趣
1. 点击"管理" → "兴趣"标签
2. 点击"新增兴趣"
3. 填写兴趣信息
4. 点击"保存"

---

## 🐛 常见问题

### Q: 页面空白？
**解决**:
1. 按F12打开控制台查看错误
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 确认服务器正在运行

### Q: 样式错乱？
**解决**:
1. 清除浏览器缓存
2. 硬刷新（Ctrl+F5）
3. 检查CSS文件是否加载

### Q: 新增内容后刷新消失？
**解决**: 已修复！现在数据会自动保存到localStorage

### Q: 文章编辑框太小？
**解决**: 已修复！编辑框高度已增加到20行

### Q: 图片不显示？
**说明**: 当前使用占位符图片，这是正常的
**解决**: 准备真实图片放入images目录，并更新数据文件中的路径

---

## 📝 Markdown使用说明

文章内容支持完整的Markdown语法：

### 标题
```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文本样式
```markdown
**粗体文字**
*斜体文字*
`代码`
```

### 代码块
````markdown
```javascript
function hello() {
    console.log('Hello World!');
}
```
````

### 列表
```markdown
- 无序列表项1
- 无序列表项2

1. 有序列表项1
2. 有序列表项2
```

### 链接和图片
```markdown
[链接文字](https://example.com)
![图片描述](image.jpg)
```

---

## 🎨 自定义样式

### 修改主题颜色
编辑 `css/variables.css` 文件：

```css
:root {
    --color-primary: #00ff88;  /* 主色调 */
    --color-background: #0a0a0a;  /* 背景色 */
    /* 更多变量... */
}
```

### 修改布局
编辑 `css/components.css` 或 `css/main.css`

---

## 🚀 部署到线上

### GitHub Pages（推荐）
```bash
# 1. 创建GitHub仓库
# 2. 推送代码
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main

# 3. 在GitHub仓库设置中启用Pages
# Settings → Pages → Source: main branch
```

### Netlify
1. 访问 https://netlify.com
2. 拖拽项目文件夹
3. 自动部署完成

### Vercel
1. 访问 https://vercel.com
2. 导入GitHub仓库
3. 自动部署完成

---

## 📚 更多文档

- [README.md](README.md) - 项目说明
- [DEVELOPMENT.md](DEVELOPMENT.md) - 开发文档
- [README_CN.md](README_CN.md) - 中文完整说明

---

## 🎉 开始使用

**现在就启动服务器，开始使用吧！**

```bash
# 启动服务器
start-server.bat

# 打开浏览器访问
http://localhost:8000
```

**祝你使用愉快！** 🚀
