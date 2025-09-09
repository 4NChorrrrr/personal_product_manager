import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Settings, Sparkles, ArrowRight, Loader2, FolderOpen, Square } from 'lucide-react';
import { GenerationStep } from '../types/project';

interface NewProjectProps {
  onProjectGenerated: (projectId: string) => void;
  onOpenSettings: () => void;
  onTryDemo: () => void;
  showDemoButton: boolean;
}

const generationSteps: GenerationStep[] = [
  { step: 1, title: 'newProject.steps.prd', status: 'pending' },
  { step: 2, title: 'newProject.steps.features', status: 'pending' },
  { step: 3, title: 'newProject.steps.tasks', status: 'pending' },
  { step: 4, title: 'newProject.steps.board', status: 'pending' }
];

export function NewProject({ onProjectGenerated, onOpenSettings, onTryDemo, showDemoButton }: NewProjectProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStep[]>(generationSteps);
  const [error, setError] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateStepStatus = (stepNumber: number, status: GenerationStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, status } : step
    ));
  };

  const getProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  // 检测输入语言是否为中文
  const detectLanguage = (text: string): 'zh' | 'en' => {
    // 简单的中文字符检测
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(text) ? 'zh' : 'en';
  };

  const handleGenerate = async () => {
    if (!idea.trim() || idea.length > 200) return;

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsGenerating(true);
    setError('');
    setSteps(generationSteps.map(step => ({ ...step, status: 'pending' })));

    try {
      const { AIClient } = await import('../utils/ai-client');
      const { getConfig, saveProject } = await import('../utils/storage');
      const { v4: uuidv4 } = await import('uuid');

      const config = getConfig();
      const aiClient = new AIClient(config);
      
      // 检测输入语言
      const language = detectLanguage(idea);

      // 检查是否已取消
      if (signal.aborted) throw new Error('Generation cancelled');

      // Step 1: Generate PRD
      updateStepStatus(1, 'generating');
      await new Promise(resolve => setTimeout(resolve, 500)); // UI feedback delay
      
      const result = await aiClient.generateProject(idea, language);
      updateStepStatus(1, 'completed');

      // 检查是否已取消
      if (signal.aborted) throw new Error('Generation cancelled');

      // Step 2: Extract features
      updateStepStatus(2, 'generating');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus(2, 'completed');

      // 检查是否已取消
      if (signal.aborted) throw new Error('Generation cancelled');

      // Step 3: Generate tasks
      updateStepStatus(3, 'generating');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus(3, 'completed');

      // 检查是否已取消
      if (signal.aborted) throw new Error('Generation cancelled');

      // Step 4: Build project
      updateStepStatus(4, 'generating');
      
      const projectName = idea.split(' ').slice(0, 5).join(' ');
      const project = {
        id: uuidv4(),
        name: projectName,
        startAt: new Date().toISOString(),
        prd: result.prd,
        features: result.features,
        tasks: result.tasks
      };

      saveProject(project);
      updateStepStatus(4, 'completed');
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 导航到项目审查页面
      navigate(`/review/${project.id}`);
    } catch (err) {
      // 如果是手动取消的错误，不显示错误消息
      if (err instanceof Error && err.message === 'Generation cancelled') {
        console.log('Project generation was cancelled');
        return;
      }
      
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : t('newProject.errors.generationFailed'));
      setSteps(prev => prev.map(step => 
        step.status === 'generating' ? { ...step, status: 'error' } : step
      ));
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('newProject.title')}
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          {t('newProject.subtitle')}
        </p>
        </div>

        {/* Settings Button */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="hover:bg-primary-light"
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            {t('newProject.allProjects')}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onOpenSettings}
            className="hover:bg-primary-light"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Card */}
        <Card className="shadow-card-hover border-0 bg-gradient-card">
          <CardContent className="p-8 space-y-6">
            {!isGenerating ? (
              <>
                {/* Input Section */}
                <div className="space-y-4">
                  <label htmlFor="idea-input" className="text-lg font-medium block">
                    {t('newProject.inputLabel')}
                  </label>
                  <div className="space-y-2">
                    <Input
                      id="idea-input"
                      placeholder={t('newProject.placeholder')}
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      className="text-lg p-4 h-14 border-2 focus:border-primary transition-smooth"
                      maxLength={200}
                      disabled={isGenerating}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t('newProject.inputHint')}</span>
                      <span>{idea.length}/200</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!idea.trim() || idea.length > 200 || isGenerating}
                    className="flex-1 h-14 text-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t('newProject.generate')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  {showDemoButton && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onTryDemo}
                      className="h-14 px-8"
                    >
                      {t('newProject.tryDemo')}
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Generation Progress */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">{t('newProject.generating')}</h2>
                    <p className="text-muted-foreground">{t('newProject.generatingHint')}</p>
                  </div>

                  <Progress value={getProgress()} className="h-2" />

                  {/* Generation Steps */}
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step.step}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-background/0"
                      >
                        {step.status === 'pending' && (
                          <div className="w-6 h-6 rounded-full border-2 border-muted" />
                        )}
                        {step.status === 'generating' && (
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        )}
                        {step.status === 'completed' && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                        {step.status === 'error' && (
                          <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                        <span className={`font-medium ${
                          step.status === 'completed' ? 'text-primary' :
                          step.status === 'generating' ? 'text-foreground' :
                          step.status === 'error' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {t(step.title)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Stop Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="destructive"
                      onClick={handleStopGeneration}
                      className="flex items-center space-x-2"
                    >
                      <span>{t('newProject.stopGeneration')}</span>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}