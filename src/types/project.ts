export interface Task {
  id: string;
  fid: number;
  title: string;
  status: 'todo' | 'doing' | 'done';
  description?: string;
  priority?: string; // 遵循MoSCoW方法：Must have, Should have, Could have, Won't have
  tag?: string; // 父功能标题
  estimatedEndDate?: string; // 格式：YYYY-MM-DD
}

export interface Feature {
  id: number;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  startAt: string;
  prd: string;
  features: Feature[];
  tasks: Task[];
}

export interface Config {
  ollamaUrl: string;
  modelName: string;
  openaiEndpoint?: string;
  openaiApiKey?: string;
  // 新增模型供应商和模型选择
  selectedProvider?: string;
  selectedModel?: string;
  customEndpoint?: string;
  apiKey?: string;
  // 模型类型选择：'ollama' 或 'online'
  modelType: 'ollama' | 'online';
}

export interface GenerationStep {
  step: number;
  title: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}