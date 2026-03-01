# Paper-Reader
使用简体中文回答问题
智能论文阅读器 - 支持 PDF 导入、AI 问答、翻译和 Markdown 转换。

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

## 技术栈

- **前端**: React 18, TypeScript, Vite, react-pdf, react-router-dom
- **后端**: FastAPI, SQLAlchemy, SQLite, PyMuPDF
- **AI**: OpenAI API / Ollama 本地模型

## 启动方式

### 后端

```bash
cd backend
./venv/Scripts/uvicorn src.main:app --reload
# 访问 http://localhost:8000
```

### 前端

```bash
cd frontend
npm run dev
# 访问 http://localhost:5173
```

## 主要功能

| 功能 | API 端点 | 说明 |
|-----|---------|------|
| 导入论文 | POST `/papers/import` | 支持文件、URL、arXiv ID |
| 论文列表 | GET `/papers/` | 获取所有论文 |
| PDF 查看 | GET `/papers/{id}/pdf` | 流式返回 PDF |
| 目录提取 | GET `/papers/{id}/toc` | 提取 PDF 目录 |
| AI 问答 | POST `/papers/{id}/ai/query` | 基于论文内容问答 |
| 全文翻译 | POST `/papers/{id}/translate?full=true` | 翻译整篇论文 |
| 选词翻译 | POST `/papers/{id}/translate` | 翻译选中文本 |
| PDF 转 Markdown | GET `/papers/{id}/markdown` | MinerU 转换（懒加载） |

## MinerU 模型

- 位置: `opendatalab/MinerU2.5-2509-1.2B`
- 启动: **懒加载** - 首次调用 `/papers/{id}/markdown` 时才加载模型
- 缓存: 转换结果保存在 `backend/src/data/markdown/{paper_id}.md`

## 重要文件

- [papers.py](backend/src/routers/papers.py) - 核心 API 路由
- [ai_service.py](backend/src/services/ai_service.py) - AI 服务封装
- [PaperView.tsx](frontend/src/pages/PaperView.tsx) - 论文阅读页面
- [TranslationPanel.tsx](frontend/src/components/TranslationPanel.tsx) - 翻译面板
