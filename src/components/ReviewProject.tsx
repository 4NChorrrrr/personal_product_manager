import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Edit3, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { GenerationStep, Task, Feature } from '../types/project';
import { saveProject } from '../utils/storage';

interface ReviewProjectProps {
  project: any;
  onProjectConfirmed: (project: any) => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

const generationSteps: GenerationStep[] = [
  { step: 1, title: '重新生成产品需求', status: 'pending' },
  { step: 2, title: '提取MVP功能', status: 'pending' },
  { step: 3, title: '创建任务分解', status: 'pending' },
  { step: 4, title: '构建项目', status: 'pending' }
];

export function ReviewProject({ project, onProjectConfirmed, onBack, onOpenSettings }: ReviewProjectProps) {
  const [editingPrd, setEditingPrd] = useState(false);
  const [prdContent, setPrdContent] = useState(project.prd);
  const [features, setFeatures] = useState<Feature[]>(project.features);
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [projectName, setProjectName] = useState(project.name);
  const [editingName, setEditingName] = useState(false);
  
  // Re-generation state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const [steps, setSteps] = useState<GenerationStep[]>(generationSteps);
  const [error, setError] = useState<string>('');

  const updateStepStatus = (stepNumber: number, status: GenerationStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, status } : step
    ));
  };

  const getProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const handleSavePrd = () => {
    setEditingPrd(false);
  };

  const handleCancelPrd = () => {
    setPrdContent(project.prd);
    setEditingPrd(false);
  };

  const handleSaveName = () => {
    setEditingName(false);
  };

  const handleCancelName = () => {
    setProjectName(project.name);
    setEditingName(false);
  };

  const handleAddTask = (featureId: number) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      fid: featureId,
      title: '新任务',
      status: 'todo',
      description: ''
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleUpdateFeature = (featureId: number, updates: Partial<Feature>) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId ? { ...feature, ...updates } : feature
    ));
  };

  const handleRegenerate = async () => {
    if (!newIdea.trim() || newIdea.length > 200) return;

    setIsRegenerating(true);
    setError('');
    setSteps(generationSteps.map(step => ({ ...step, status: 'pending' })));

    try {
      const { AIClient } = await import('../utils/ai-client');
      const { getConfig } = await import('../utils/storage');

      const config = getConfig();
      const aiClient = new AIClient(config);

      // Step 1: Generate PRD
      updateStepStatus(1, 'generating');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await aiClient.generateProject(newIdea);
      updateStepStatus(1, 'completed');

      // Step 2: Extract features
      updateStepStatus(2, 'generating');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus(2, 'completed');

      // Step 3: Generate tasks
      updateStepStatus(3, 'generating');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStepStatus(3, 'completed');

      // Step 4: Update project
      updateStepStatus(4, 'generating');
      
      const newProjectName = newIdea.split(' ').slice(0, 5).join(' ');
      
      setPrdContent(result.prd);
      setFeatures(result.features);
      setTasks(result.tasks);
      setProjectName(newProjectName);
      
      updateStepStatus(4, 'completed');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setNewIdea('');
    } catch (err) {
      console.error('Regeneration error:', err);
      setError(err instanceof Error ? err.message : '重新生成失败');
      setSteps(prev => prev.map(step => 
        step.status === 'generating' ? { ...step, status: 'error' } : step
      ));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleConfirm = () => {
    const updatedProject = {
      ...project,
      name: projectName,
      prd: prdContent,
      features,
      tasks
    };
    
    saveProject(updatedProject);
    onProjectConfirmed(updatedProject);
    // 导航到项目看板页面
    window.location.href = `/project/${updatedProject.id}`;
  };

  const getTasksForFeature = (featureId: number) => {
    return tasks.filter(task => task.fid === featureId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-primary/10 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">项目审查</h1>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onOpenSettings}
            className="rounded-full hover:bg-primary/10 transition-colors duration-200"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Re-generation Section */}
        <Card className="border-2 border-primary/20 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold">重新生成项目</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {!isRegenerating ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="输入新的项目想法重新生成..."
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  className="flex-1"
                  maxLength={200}
                />
                <Button
                  onClick={handleRegenerate}
                  disabled={!newIdea.trim() || newIdea.length > 200}
                  className="px-6 bg-primary hover:bg-primary/90 transition-colors duration-200"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  重新生成
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <p className="text-muted-foreground">正在重新生成项目...</p>
                </div>
                <Progress value={getProgress()} className="h-3" />
                <div className="space-y-3 pt-2">
                  {steps.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm transition-all duration-200"
                    >
                      {step.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {step.status === 'generating' && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {step.status === 'completed' && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      {step.status === 'error' && (
                        <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <span className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-primary' :
                        step.status === 'generating' ? 'text-foreground' :
                        step.status === 'error' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Name */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">项目名称</CardTitle>
              {!editingName ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingName(true)}
                  className="rounded-full hover:bg-primary/10 transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveName}
                    className="rounded-full hover:bg-green-500/10 text-green-500"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelName}
                    className="rounded-full hover:bg-red-500/10 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {editingName ? (
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-lg font-medium border-primary/20 focus:border-primary/40 transition-colors duration-200"
                autoFocus
              />
            ) : (
              <h2 className="text-xl font-semibold tracking-tight">{projectName}</h2>
            )}
          </CardContent>
        </Card>

        {/* PRD Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">产品需求文档 (PRD)</CardTitle>
              {!editingPrd ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingPrd(true)}
                  className="rounded-full hover:bg-primary/10 transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSavePrd}
                    className="rounded-full hover:bg-green-500/10 text-green-500"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelPrd}
                    className="rounded-full hover:bg-red-500/10 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {editingPrd ? (
              <Textarea
                value={prdContent}
                onChange={(e) => setPrdContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm border-primary/20 focus:border-primary/40 transition-colors duration-200"
                placeholder="产品需求文档内容..."
              />
            ) : (
              <div className="prose max-w-none">
                <div className="text-sm bg-muted/50 p-4 rounded-lg border border-border/50 shadow-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{prdContent}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features and Tasks */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">功能与任务</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {features.map((feature) => (
              <div key={feature.id} className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border/50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">功能 {feature.id}</Badge>
                      <Input
                        value={feature.title}
                        onChange={(e) => handleUpdateFeature(feature.id, { title: e.target.value })}
                        className="font-semibold text-lg border-0 bg-transparent p-0 h-auto focus:ring-0"
                      />
                    </div>
                    <Textarea
                      value={feature.description}
                      onChange={(e) => handleUpdateFeature(feature.id, { description: e.target.value })}
                      className="text-muted-foreground border-0 bg-transparent p-0 resize-none focus:ring-0"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddTask(feature.id)}
                    className="rounded-full hover:bg-primary/10 transition-colors duration-200 mt-1"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Tasks for this feature */}
                <div className="ml-8 space-y-3">
                  {getTasksForFeature(feature.id).map((task) => (
                    <div
                      key={task.id}
                      className="space-y-3 p-4 border rounded-lg bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="flex items-center">
                          <Badge 
                            variant={
                              task.status === 'done' ? 'default' :
                              task.status === 'doing' ? 'secondary' : 'outline'
                            }
                            className={`mr-2 ${
                              task.status === 'done' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                              task.status === 'doing' ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' : 
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {task.status === 'done' ? '完成' : 
                             task.status === 'doing' ? '进行中' : '待办'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs bg-background">
                          {task.tag || feature.title || '未设置标签'}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-background">
                          {task.priority || '未设置优先级'}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-background">
                          {task.estimatedEndDate || '未设置日期'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="ml-auto rounded-full hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <Input
                          value={task.title}
                          onChange={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                          className="flex-1 border-0 bg-transparent p-0 h-auto focus:ring-0"
                          placeholder="任务标题"
                        />
                      </div>
                    </div>
                  ))}
                  {getTasksForFeature(feature.id).length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">暂无任务</p>
                    </div>
                  )}
                </div>
                
                {feature.id < features.length && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <div className="flex justify-end space-x-4 pb-8 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="px-6 rounded-lg border-border/50 hover:bg-background transition-colors duration-200"
          >
            返回修改
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={handleConfirm}
            className="px-8 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/20"
          >
            确认并进入看板
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}