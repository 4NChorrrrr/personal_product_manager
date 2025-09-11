# Personal Product Manager

Personal Product Manager is an AI-powered personal project management tool that helps you complete the entire product development process from idea to implementation. Simply input your project idea, and the system will automatically generate a Product Requirements Document (PRD), feature list, technical tasks, and provide a Kanban management interface to track project progress.

## Features

### 1. AI-Driven Project Generation
- **Smart PRD Generation**: Automatically generate detailed Product Requirements Documents based on your ideas
- **Feature Extraction**: Automatically extract core feature lists from PRDs
- **Task Breakdown**: Automatically decompose features into executable technical tasks
- **Multi-language Support**: Support for generating PRDs in both Chinese and English

### 2. Multi-Model AI Support
- **Local Models**: Support for Ollama local models (default uses llama3.1:8b)
- **Online Models**: Support for multiple mainstream AI providers
  - OpenAI (GPT-4 series)
  - Anthropic (Claude series)
  - Google Gemini
  - Grok (xAI)
  - Zhipu AI (GLM series)
  - DeepSeek
  - Moonshot (Kimi series)
  - Alibaba Cloud (Qwen series)
  - SiliconFlow (various open-source models)

### 3. Project Management
- **Kanban View**: Intuitive drag-and-drop task board
- **Task Management**: Complete TODO/In Progress/Done workflow
- **Local Storage**: Persistent storage of project data using localStorage
- **Project Review**: Editable generated PRDs and tasks

### 4. Tech Stack
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Query + SWR
- **UI Components**: 
  - Tailwind CSS
  - shadcn/ui
  - Radix UI
- **Markdown Processing**: 
  - remark-gfm
  - remark-breaks
  - rehype-highlight
- **Data Visualization**: Recharts
- **Internationalization**: i18next + react-i18next

## Quick Start

### Requirements
- Node.js >= 16
- npm or yarn

### Installation

1. Clone the project
```bash
git clone <repository-url>
cd personal_product_manager
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

### AI Model Configuration

1. **Local Models** (default):
   - Install [Ollama](https://ollama.com/)
   - Pull model: `ollama pull llama3.1:8b`
   - Start Ollama service

2. **Online Models**:
   - Select the corresponding provider in the settings interface
   - Enter API key and custom endpoint
   - Select the appropriate model

## Usage Flow

1. **Create Project**: Input your project idea
2. **Generate PRD**: AI automatically generates a detailed Product Requirements Document
3. **Confirm Features**: Review and adjust the auto-generated feature list
4. **Task Breakdown**: The system decomposes features into specific technical tasks
5. **Project Management**: Use the Kanban interface to manage task progress
6. **Continuous Iteration**: Adjust PRDs and tasks at any time

## Project Structure

```
src/
├── components/          # React components
├── pages/               # Page components
├── utils/               # Utility functions
│   ├── ai-client.ts     # AI client
│   ├── storage.ts       # Local storage
│   ├── modelConfig.ts   # Model configuration
│   └── prompts/         # Prompt templates
├── types/               # TypeScript type definitions
└── i18n/                # Internationalization configuration
```

## Contributing

Issues and Pull Requests are welcome to improve this project.

## License

MIT License - see [LICENSE](LICENSE) file for details