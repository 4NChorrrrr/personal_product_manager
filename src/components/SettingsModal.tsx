import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Config } from '../types/project';
import { getConfig, saveConfig } from '../utils/storage';
import { modelProviders, getModelProvider, getDefaultEndpoint } from '../utils/modelConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<Config>({
    ollamaUrl: 'http://host.docker.internal:11434',
    modelName: 'llama3.1:8b',
    modelType: 'ollama'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValidation, setApiKeyValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(getConfig());
    }
  }, [open]);

  const handleSave = () => {
    saveConfig(config);
    onOpenChange(false);
  };

  const resetToDefaults = () => {
    setConfig({
      ollamaUrl: 'http://host.docker.internal:11434',
      modelName: 'llama3.1:8b',
      openaiEndpoint: '',
      openaiApiKey: '',
      selectedProvider: '',
      selectedModel: '',
      customEndpoint: '',
      apiKey: '',
      modelType: 'ollama'
    });
  };

  // 处理模型类型变化
  const handleModelTypeChange = (value: 'ollama' | 'online') => {
    setConfig(prev => ({
      ...prev,
      modelType: value
    }));
  };

  // 处理供应商选择变化
  const handleProviderChange = (providerId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedProvider: providerId,
      selectedModel: '', // 重置模型选择
      customEndpoint: providerId ? getDefaultEndpoint(providerId) : '' // 自动填入默认端点
    }));
  };

  // 处理模型选择变化
  const handleModelChange = (modelId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedModel: modelId
    }));
  };

  // 处理API密钥变化
  const handleApiKeyChange = async (apiKey: string) => {
    setConfig(prev => ({
      ...prev,
      apiKey
    }));
    
    // 验证API密钥
    if (apiKey.trim() === '') {
      setApiKeyValidation({ isValid: null, message: '' });
      return;
    }
    
    // 首先进行格式验证
    let formatValid = false;
    if (config.selectedProvider === 'openai') {
      // OpenAI API密钥通常以'sk-'开头
      formatValid = apiKey.startsWith('sk-') && apiKey.length > 20;
    } else if (config.selectedProvider === 'anthropic') {
      // Anthropic API密钥通常以'sk-ant-'开头
      formatValid = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    } else {
      // 其他供应商的通用验证
      formatValid = apiKey.length > 10;
    }
    
    if (!formatValid) {
      setApiKeyValidation({ isValid: false, message: t('settings.apiKeyFormatInvalid') });
      return;
    }
    
    // 显示验证中消息
    setApiKeyValidation({
      isValid: true,
      message: t('settings.apiKeyValidating')
    });
    
    // 如果格式正确，进行实际API验证
    try {
      const provider = getModelProvider(config.selectedProvider!);
      if (!provider) {
        setApiKeyValidation({ isValid: false, message: t('settings.unknownProvider') });
        return;
      }
      
      // 构建验证请求
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      let requestBody: any = {
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 5,
      };
      
      // 根据供应商设置认证和请求体
      if (provider.id === 'openai') {
        headers['Authorization'] = `Bearer ${apiKey}`;
        requestBody.model = config.selectedModel || 'gpt-3.5-turbo';
      } else if (provider.id === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        requestBody.model = config.selectedModel || 'claude-3-sonnet-20240229';
        requestBody.max_tokens = 10;
      } else {
        // 其他供应商使用通用格式
        headers['Authorization'] = `Bearer ${apiKey}`;
        requestBody.model = config.selectedModel || 'default';
      }
      
      const endpoint = config.customEndpoint || getDefaultEndpoint(config.selectedProvider!);
      
      // 发送验证请求
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        setApiKeyValidation({ isValid: true, message: t('settings.apiKeyValidSuccess') });
      } else {
        // 如果返回401，说明API密钥无效
        if (response.status === 401) {
          setApiKeyValidation({ isValid: false, message: t('settings.apiKeyInvalid') });
        } else {
          // 其他错误可能是网络问题或服务器问题
          setApiKeyValidation({ isValid: false, message: t('settings.apiKeyValidError') });
        }
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setApiKeyValidation({ isValid: false, message: t('settings.apiKeyValidError') });
    }
  };

  // 开始长按显示API密钥
  const startLongPress = () => {
    setShowApiKey(true);
    longPressTimer.current = setTimeout(() => {
      // 长按结束后的额外处理（如果需要）
    }, 500);
  };

  // 结束长按隐藏API密钥
  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowApiKey(false);
  };

  // 获取当前选中的供应商
  const selectedProvider = config.selectedProvider 
    ? getModelProvider(config.selectedProvider)
    : null;

  // 获取当前选中的供应商的模型列表
  const availableModels = selectedProvider ? selectedProvider.models : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{t('settings.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Type Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">{t('settings.modelType')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t('settings.modelTypeDescription')}
              </p>
              <RadioGroup 
                value={config.modelType} 
                onValueChange={handleModelTypeChange}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ollama" id="ollama" />
                  <Label htmlFor="ollama">{t('settings.ollamaModel')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">{t('settings.onlineModel')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Ollama Settings - Only show when Ollama is selected */}
          {config.modelType === 'ollama' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">{t('settings.ollamaConfig')}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ollama-url">{t('settings.ollamaUrl')}</Label>
                    <Input
                      id="ollama-url"
                      value={config.ollamaUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                      placeholder="http://host.docker.internal:11434"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-name">{t('settings.modelName')}</Label>
                    <Input
                      id="model-name"
                      value={config.modelName}
                      onChange={(e) => setConfig(prev => ({ ...prev, modelName: e.target.value }))}
                      placeholder="llama3.1:8b"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Model Provider Settings - Only show when Online is selected */}
          {config.modelType === 'online' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{t('settings.aiProvider')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('settings.aiProviderDescription')}
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="provider-select">{t('settings.provider')}</Label>
                    <Select value={config.selectedProvider || ''} onValueChange={handleProviderChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={t('settings.selectProvider')} />
                      </SelectTrigger>
                      <SelectContent>
                        {modelProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedProvider && (
                    <div>
                      <Label htmlFor="model-select">{t('settings.model')}</Label>
                      <Select value={config.selectedModel || ''} onValueChange={handleModelChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={t('settings.selectModel')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {selectedProvider && (
                    <div>
                      <Label htmlFor="api-endpoint">{t('settings.apiEndpoint')}</Label>
                      <Input
                        id="api-endpoint"
                        value={config.customEndpoint || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, customEndpoint: e.target.value }))}
                        placeholder={t('settings.apiEndpointPlaceholder')}
                        className="mt-1"
                      />
                    </div>
                  )}
                  
                  {selectedProvider && (
                    <div>
                      <Label htmlFor="api-key">{t('settings.apiKey')}</Label>
                      <div className="relative mt-1">
                        <Input
                          id="api-key"
                          type={showApiKey ? "text" : "password"}
                          value={config.apiKey || ''}
                          onChange={(e) => handleApiKeyChange(e.target.value)}
                          placeholder={t('settings.apiKeyPlaceholder')}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onMouseDown={startLongPress}
                          onMouseUp={endLongPress}
                          onMouseLeave={endLongPress}
                          onTouchStart={startLongPress}
                          onTouchEnd={endLongPress}
                        >
                          {showApiKey ? (
                            <Eye className="h-4 w-4 text-gray-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      {apiKeyValidation.isValid !== null && (
                        <div className={`flex items-center mt-1 text-sm ${apiKeyValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {apiKeyValidation.isValid ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {apiKeyValidation.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={resetToDefaults}>
              {t('settings.reset')}
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('settings.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary-hover">
                <Save className="mr-2 h-4 w-4" />
                {t('settings.save')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}