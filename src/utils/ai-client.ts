import { Config } from '../types/project';
import { getModelProvider } from './modelConfig';
import { PrdPrompt, FeaturesPrompt } from './prompts';

export class AIClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async generateCompletion(prompt: string): Promise<string> {
    if (this.config.modelType === 'online' && this.config.selectedProvider && this.config.apiKey && this.config.customEndpoint) {
      return this.generateOnlineCompletion(prompt);
    } else {
      return this.generateOllamaCompletion(prompt);
    }
  }

  private async generateOllamaCompletion(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw new Error(`Failed to generate with Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateOnlineCompletion(prompt: string): Promise<string> {
    try {
      const provider = getModelProvider(this.config.selectedProvider!);
      if (!provider) {
        throw new Error(`Unknown provider: ${this.config.selectedProvider}`);
      }

      // 获取当前选中的模型
      const model = provider.models.find(m => m.id === this.config.selectedModel);
      if (!model) {
        throw new Error(`Unknown model: ${this.config.selectedModel}`);
      }

      // 根据不同的供应商构建请求
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      let requestBody: any = {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      // 根据供应商设置认证和请求体
      if (provider.id === 'openai') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        requestBody.model = model.id;
      } else if (provider.id === 'anthropic') {
        headers['x-api-key'] = this.config.apiKey!;
        headers['anthropic-version'] = '2023-06-01';
        requestBody.model = model.id;
        requestBody.max_tokens = 1000;
      } else {
        // 其他供应商使用通用格式
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        requestBody.model = model.id;
      }

      const response = await fetch(this.config.customEndpoint!, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', errorText);
        throw new Error(`${provider.name} API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // 根据不同的供应商解析响应
      if (provider.id === 'anthropic') {
        return data.content?.[0]?.text || '';
      } else {
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Online API Error:', error);
      throw new Error(`Failed to generate with online model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateProject(idea: string, language: 'zh' | 'en' = 'en'): Promise<{
    prd: string;
    features: any[];
    tasks: any[];
  }> {
    // 根据语言设置提示词
    const isChinese = language === 'zh';
    
    // Step 1: Generate PRD
    const prdPromptText = isChinese ? PrdPrompt.zh(idea) : PrdPrompt.en(idea);
    const prd = await this.generateCompletion(prdPromptText);

    // Step 2: Extract features
    const featuresPromptText = isChinese ? FeaturesPrompt.zh(prd) : FeaturesPrompt.en(prd);
    
    const featuresResponse = await this.generateCompletion(featuresPromptText);
    let features;
    try {
      // Clean the response to extract JSON
      const jsonMatch = featuresResponse.match(/\[[\s\S]*\]/);
      const cleanJson = jsonMatch ? jsonMatch[0] : featuresResponse;
      features = JSON.parse(cleanJson);
    } catch (error) {
      console.error('Error parsing features JSON:', error);
      features = isChinese 
        ? [
            { id: 1, title: '核心功能1', description: '主要功能' },
            { id: 2, title: '用户界面', description: '干净直观的用户界面' },
            { id: 3, title: '数据管理', description: '存储和管理数据' }
          ]
        : [
            { id: 1, title: 'Core Feature 1', description: 'Main functionality' },
            { id: 2, title: 'User Interface', description: 'Clean and intuitive UI' },
            { id: 3, title: 'Data Management', description: 'Store and manage data' }
          ];
    }

    // Step 3: Generate tasks
    const tasksPrompt = isChinese
      ? `为这些功能，为每个功能创建3-4个技术TODO项作为JSON。格式：{"tasks": [{"fid": 功能ID, "title": "任务标题", "status": "todo"}]}。只返回JSON对象，不要其他文本。

功能:
${JSON.stringify(features)}`
      : `For these features, create 3–4 technical TODO items for each feature as JSON. Format: {"tasks": [{"fid": featureId, "title": "task title", "status": "todo"}]}. Return ONLY the JSON object, no other text.

Features:
${JSON.stringify(features)}`;
    
    const tasksResponse = await this.generateCompletion(tasksPrompt);
    let tasks;
    try {
      // Clean the response to extract JSON
      const jsonMatch = tasksResponse.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : tasksResponse;
      const parsedTasks = JSON.parse(cleanJson);
      tasks = parsedTasks.tasks || [];
      
      // Add unique IDs to tasks
      tasks = tasks.map((task: any, index: number) => ({
        ...task,
        id: `task-${task.fid}-${index + 1}`
      }));
    } catch (error) {
      console.error('Error parsing tasks JSON:', error);
      tasks = features.flatMap((feature: any, featureIndex: number) => {
        const title = feature.title;
        return isChinese
          ? [
              { id: `task-${feature.id}-1`, fid: feature.id, title: `实现${title}核心逻辑`, status: 'todo' },
              { id: `task-${feature.id}-2`, fid: feature.id, title: `创建${title}UI组件`, status: 'todo' },
              { id: `task-${feature.id}-3`, fid: feature.id, title: `添加${title}错误处理`, status: 'todo' },
            ]
          : [
              { id: `task-${feature.id}-1`, fid: feature.id, title: `Implement ${title} core logic`, status: 'todo' },
              { id: `task-${feature.id}-2`, fid: feature.id, title: `Create ${title} UI components`, status: 'todo' },
              { id: `task-${feature.id}-3`, fid: feature.id, title: `Add ${title} error handling`, status: 'todo' },
            ];
      });
    }

    return { prd, features, tasks };
  }
}