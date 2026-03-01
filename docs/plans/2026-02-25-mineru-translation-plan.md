# 划词翻译功能实现计划

## 背景
用户希望实现划词翻译功能，当用户点击翻译时：
1. 调用 MinerU 模型将 PDF 转换成 Markdown
2. 提供 Markdown 视图（与 PDF 视图并存）
3. 用户可以选择文本进行翻译

## 需求
- 使用 vllm 进行 MinerU 模型推理
- 模型位置：`./opendatalab/MinerU2.5-2509-1.2B`
- 保留 PDF 视图，提供额外的 Markdown 视图 Tab

## 实现方案

### 1. 后端 - MinerU 服务
**新文件**: `backend/src/services/mineru_service.py`

- 安装依赖：`mineru-vl-utils[vllm]`, `vllm`
- 创建 `MineruService` 类：
  - 加载 vllm 模型
  - 提供 `convert_pdf_to_markdown(pdf_path)` 方法
  - 转换逻辑：将 PDF 每页转成图片，用 MinerU 提取内容，合并为 Markdown
  - 缓存转换结果到文件

### 2. 后端 - 新增 API
**修改**: `backend/src/routers/papers.py`

- 新增 `GET /papers/{paper_id}/markdown` 端点
  - 如果已转换，返回缓存的 Markdown
  - 如果未转换，调用 MinerU 转换
- 新增 `POST /papers/{paper_id}/convert` 端点
  - 手动触发转换

### 3. 前端 - Markdown 视图组件
**新文件**: `frontend/src/components/MarkdownView.tsx`

- 使用 `react-markdown` 渲染 Markdown
- 支持文本选择
- 添加"翻译选中文本"按钮

### 4. 前端 - 修改 PaperView
**修改**: `frontend/src/pages/PaperView.tsx`

- 新增 Tab 选项：`'pdf' | 'markdown' | 'ai' | 'translate'`
- 当选择 Markdown 视图时，显示 MarkdownView 组件
- 调用 API 获取 Markdown 内容

### 5. 前端 - API
**修改**: `frontend/src/api/paperApi.ts`

- 新增 `getMarkdown(id)` 方法

## 关键文件
- `backend/src/services/mineru_service.py` (新)
- `backend/src/routers/papers.py` (修改)
- `frontend/src/components/MarkdownView.tsx` (新)
- `frontend/src/pages/PaperView.tsx` (修改)
- `frontend/src/api/paperApi.ts` (修改)

## 验证
1. 后端启动时加载 vllm 模型
2. 访问论文页面，点击翻译按钮
3. 等待 PDF 转换成 Markdown
4. 在 Markdown 视图中选择文本
5. 点击翻译按钮，验证翻译结果
