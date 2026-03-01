# Paper Reader - 智能论文阅读器

一个现代化的学术论文阅读工具，支持 PDF 导入、AI 问答、翻译和 Markdown 转换。

## 功能概览

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| 论文导入 |  | 支持本地文件、URL、arXiv ID |
| PDF 阅读 |  | 目录导航、页面缩放 |
| AI 问答 |  | 基于论文内容的智能问答 |
| 翻译功能 |  | 全文翻译、选词翻译 |
| Markdown |  | PDF 转 Markdown（MinerU 集成） |
| 批注系统 |  | 高亮、笔记（基础框架） |

## 技术栈

### 后端
- **FastAPI** - Web 框架
- **SQLAlchemy** - ORM
- **PyMuPDF** - PDF 处理
- **MinerU** - PDF 转 Markdown
- **OpenAI/Anthropic/Ollama** - AI 服务

### 前端
- **React 18** + **TypeScript**
- **Vite** - 构建工具
- **react-pdf** - PDF 渲染
- **react-markdown** - Markdown 渲染

## 快速开始

### 环境要求
- Python 3.10+
- Node.js 18+

### 后端启动

```bash
cd backend
py -3.10 -m venv venv
./venv/Scripts/pip install -e .
./venv/Scripts/uvicorn src.main:app --reload
```

后端服务运行在 http://localhost:8000

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5173

### MinerU 模型配置

项目使用 MinerU 进行 PDF 转 Markdown，模型文件存放在 `opendatalab/MinerU2.5-2509-1.2B`。

模型下载和配置参考：
- [MinerU 模型源文档](https://github.com/opendatalab/MinerU/blob/master/docs/zh/usage/model_source.md)
- [MinerU API 部署文档](https://github.com/opendatalab/MinerU/blob/master/docs/zh/usage/quick_usage.md)

## 项目结构

```
Paper-Reader/
├── backend/               # FastAPI 后端
│   └── src/
│       ├── main.py       # FastAPI 应用入口
│       ├── config.py     # 配置
│       ├── models.py     # SQLAlchemy 模型
│       ├── routers/      # API 路由
│       │   ├── papers.py   # 论文相关 API
│       │   └── annotations.py
│       └── services/     # 业务逻辑
│           ├── ai_service.py      # AI 对话/翻译
│           ├── file_manager.py   # 文件管理
│           ├── pdf_processor.py   # PDF 处理
│           └── mineru_service.py  # PDF 转 Markdown
├── frontend/             # React + TypeScript 前端
│   └── src/
│       ├── App.tsx      # 路由配置
│       ├── pages/       # 页面组件
│       │   ├── Library.tsx    # 论文库
│       │   └── PaperView.tsx # 论文阅读
│       ├── components/  # 通用组件
│       │   ├── TranslationPanel.tsx
│       │   ├── MarkdownView.tsx
│       │   └── ...
│       └── api/         # API 调用
└── opendatalab/         # MinerU 模型文件
```

## API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/papers/import` | 导入论文（文件/URL/arXiv ID） |
| GET | `/papers/` | 获取所有论文列表 |
| GET | `/papers/{id}` | 获取论文元数据 |
| GET | `/papers/{id}/pdf` | 获取 PDF 文件流 |
| GET | `/papers/{id}/toc` | 获取目录结构 |
| POST | `/papers/{id}/ai/query` | AI 问答 |
| POST | `/papers/{id}/translate` | 翻译（全文或选中文本） |
| GET | `/papers/{id}/markdown` | 获取 Markdown 内容 |
| POST | `/papers/{id}/convert` | 触发 Markdown 转换 |
| GET | `/papers/{id}/markdown/images/{name}` | 获取 Markdown 图片 |

## 开发计划 (TODO)

### 已实现功能

- [✅] **论文库管理**
  - [✅] 论文卡片列表展示
  - [✅] 导入对话框（文件/URL/arXiv ID）
  - [✅] SQLite 数据持久化

- [✅] **PDF 阅读器**
  - [✅] PDF 渲染与查看
  - [✅] 目录提取与导航
  - [✅] 页面跳转
  - [✅] 缩放控制（200% 默认）

- [✅] **翻译功能**
  - [✅] 全文翻译
  - [✅] 划词翻译
  - [  ] 学术术语保持

- [✅] **Markdown 转换**
  - [✅] MinerU 集成（懒加载）
  - [✅] PDF/Markdown 视图切换
  - [✅] Markdown 渲染（支持公式、表格）
  - [✅] 图片提取与显示
  - [✅] 转换确认提示界面

- [✅] **UI/UX**
  - [✅] 响应式布局
  - [✅] 侧边栏导航
  - [✅] 加载状态
  - [✅] 空状态处理

### 待实现功能

- [ ] **论文导入**
  - [ ] DOI 导入支持
  - [ ] 批量导入
  - [ ] 自动元数据补全（CrossRef/Semantic Scholar API）
  - [ ] 重复检测

- [ ] **PDF 阅读增强**
  - [ ] 文本选择复制
  - [ ] 搜索功能
  - [ ] 全屏模式
  - [ ] 夜间模式
  - [ ] 连续滚动模式
  - [ ] 页面缩略图预览

- [ ] **AI 助手**
  - [ ] 多提供商支持（OpenAI/Anthropic/Ollama）
  - [ ] 基于论文内容的问答
  - [ ] 上下文限制管理
  
- [ ] **AI 功能增强**
  - [ ] 流式响应
  - [ ] 对话历史保存
  - [ ] 预设提示词（总结、方法分析、相关工作等）
  - [ ] 引用定位（点击跳转到原文）
  - [ ] 多轮对话上下文

- [ ] **翻译优化**
  - [ ] 术语表自定义
  - [ ] 翻译缓存
  - [ ] 双语对照模式
  - [ ] 更多语言支持

- [ ] **Markdown 改进**
  - [ ] 编辑功能
  - [ ] 导出为 Word/EPUB
  - [ ] 批量转换

- [ ] **批注系统**
  - [ ] PDF 高亮
  - [ ] 添加笔记
  - [ ] 批注列表
  - [ ] 导出批注

- [ ] **论文管理**
  - [ ] 文件夹/标签分类
  - [ ] 搜索与筛选
  - [ ] 排序选项
  - [ ] 阅读进度保存
  - [ ] 最近阅读

- [ ] **协作与同步**
  - [ ] 用户账户系统
  - [ ] 云端同步
  - [ ] 分享功能

- [ ] **性能优化**
  - [ ] PDF 预加载
  - [ ] 虚拟滚动
  - [ ] 大文件分片处理
