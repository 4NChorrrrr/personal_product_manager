export interface ModelProvider {
  id: string;
  name: string;
  models: Model[];
  defaultEndpoint: string;
}

export interface Model {
  id: string;
  name: string;
  endpoint?: string;
}

export const modelProviders: ModelProvider[] = [
  // 1. OpenAI（GPT-4.1 / GPT-4o / o3 / o1 系列）
  {
    id: 'openai',
    name: 'OpenAI',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o3', name: 'o3' },
      { id: 'o1', name: 'o1' },
      { id: 'o1-mini', name: 'o1-mini' },
    ]
  },

  // 2. Anthropic（Claude 4 系列）
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultEndpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-opus-4-1', name: 'Claude Opus 4.1' },
      { id: 'claude-opus-4', name: 'Claude Opus 4' },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku' },
    ]
  },

  // 3. Google Gemini（1.5 Pro / 1.5 Flash / 2.0 系列）
  {
    id: 'gemini',
    name: 'Gemini',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: [
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    ]
  },

  // 4. Grok（xAI）
  {
    id: 'grok',
    name: 'Grok',
    defaultEndpoint: 'https://api.x.ai',
    models: [
      { id: 'grok-beta', name: 'Grok Beta' },
      { id: 'grok-2', name: 'Grok-2' },
    ]
  },

  // 5. 智谱清言（GLM-4.5 系列）
  {
    id: 'zhipu',
    name: '智谱清言',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-4.5', name: 'GLM-4.5' },
      { id: 'glm-4.5-air', name: 'GLM-4.5 Air' },
      { id: 'glm-4-plus', name: 'GLM-4 Plus' },
      { id: 'glm-4-flash', name: 'GLM-4 Flash' },
    ]
  },

  // 6. DeepSeek（R1 推理 / V3 通用）
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    models: [
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1' },
      { id: 'deepseek-chat', name: 'DeepSeek-V3' },
    ]
  },

  // 7. Moonshot（Kimi K2 系列）
  {
    id: 'moonshot',
    name: 'Moonshot',
    defaultEndpoint: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { id: 'kimi-k2-0905-preview', name: 'Kimi K2 0905' },
      { id: 'kimi-k2-0711-preview', name: 'Kimi K2 0711' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K' },
    ]
  },

  // 8. 阿里云（Qwen-Max / Qwen-Plus / Qwen3 系列）
  {
    id: 'alibaba',
    name: 'Aliyun',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    models: [
      { id: 'qwen-max', name: 'Qwen Max' },
      { id: 'qwen-max-longcontext', name: 'Qwen Max LongContext' },
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
      { id: 'qwen3-235b', name: 'Qwen3 235B' },
    ]
  },

  // 9. 硅基流动（SiliconFlow：Qwen3 / Kimi K2 / DeepSeek 等开源模型）
  {
    id: 'siliconflow',
    name: '硅基流动',
    defaultEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { id: 'Qwen/Qwen3-235B-A22B-Instruct', name: 'Qwen3 235B' },
      { id: 'moonshotai/Kimi-K2-Instruct', name: 'Kimi K2 Instruct' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B' },
    ]
  }
];

export function getModelProvider(id: string): ModelProvider | undefined {
  return modelProviders.find(provider => provider.id === id);
}

export function getModel(providerId: string, modelId: string): Model | undefined {
  const provider = getModelProvider(providerId);
  return provider?.models.find(model => model.id === modelId);
}

export function getDefaultEndpoint(providerId: string): string {
  const provider = getModelProvider(providerId);
  return provider?.defaultEndpoint || '';
}