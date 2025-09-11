# Personal Product Manager (个人产品管理器)

Personal Product Manager 是一个基于AI的个人项目管理工具，可帮助您从想法到实现完整的产品开发流程。只需输入您的项目想法，系统将自动生成产品需求文档(PRD)、功能列表、技术任务，并提供看板管理界面来跟踪项目进度。

## 功能特性

### 1. AI驱动的项目生成
- **智能PRD生成**: 基于您的想法自动生成详细的产品需求文档
- **功能提取**: 从PRD中自动提取核心功能列表
- **任务分解**: 将功能自动分解为可执行的技术任务
- **多语言支持**: 支持中英文PRD生成

### 2. 多模型AI支持
- **本地模型**: 支持Ollama本地模型（默认使用llama3.1:8b）
- **在线模型**: 支持多种主流AI服务商
  - OpenAI (GPT-4系列)
  - Anthropic (Claude系列)
  - Google Gemini
  - Grok (xAI)
  - 智谱清言 (GLM系列)
  - DeepSeek
  - Moonshot (Kimi系列)
  - 阿里云 (Qwen系列)
  - 硅基流动 (多种开源模型)

### 3. 项目管理
- **看板视图**: 直观的拖拽式任务看板
- **任务管理**: 完整的TODO/进行中/已完成工作流
- **本地存储**: 使用localStorage持久化存储项目数据
- **项目审查**: 可编辑生成的PRD和任务

### 4. 技术栈
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由管理**: React Router v6
- **状态管理**: React Query + SWR
- **UI组件库**: 
  - Tailwind CSS
  - shadcn/ui
  - Radix UI
- **Markdown处理**: 
  - remark-gfm
  - remark-breaks
  - rehype-highlight
- **数据可视化**: Recharts
- **国际化**: i18next + react-i18next

## 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd personal_product_manager
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

### 配置AI模型

1. **本地模型** (默认):
   - 安装 [Ollama](https://ollama.com/)
   - 拉取模型: `ollama pull llama3.1:8b`
   - 启动Ollama服务

2. **在线模型**:
   - 在设置界面选择对应的服务商
   - 输入API密钥和自定义端点
   - 选择合适的模型

## 使用流程

1. **创建项目**: 输入您的项目想法
2. **生成PRD**: AI自动生成详细的产品需求文档
3. **确认功能**: 审查并调整自动生成的功能列表
4. **任务分解**: 系统将功能分解为具体的技术任务
5. **项目管理**: 使用看板界面管理任务进度
6. **持续迭代**: 可随时调整PRD和任务

## 项目结构

```
src/
├── components/          # React组件
├── pages/               # 页面组件
├── utils/               # 工具函数
│   ├── ai-client.ts     # AI客户端
│   ├── storage.ts       # 本地存储
│   ├── modelConfig.ts   # 模型配置
│   └── prompts/         # 提示词模板
├── types/               # TypeScript类型定义
└── i18n/                # 国际化配置
```

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件