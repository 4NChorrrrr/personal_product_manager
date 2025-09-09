import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Task, Project, Feature } from '@/types/project';
import { getProject, saveProject } from '@/utils/storage';

type TaskStatus = 'todo' | 'doing' | 'done';

export function TaskDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>('todo');
  const [editedPriority, setEditedPriority] = useState('');
  const [editedEstimatedEndDate, setEditedEstimatedEndDate] = useState('');
  const [editedTag, setEditedTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (projectId && taskId) {
      const loadedProject = getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
        const foundTask = loadedProject.tasks.find(t => t.id === taskId);
        if (foundTask) {
          setTask(foundTask);
          setEditedTitle(foundTask.title);
          setEditedDescription(foundTask.description || '');
          setEditedStatus(foundTask.status);
          setEditedPriority(foundTask.priority || '');
          setEditedEstimatedEndDate(foundTask.estimatedEndDate || '');
          setEditedTag(foundTask.tag || '');
        }
      }
    }
  }, [projectId, taskId]);

  const handleSave = () => {
    if (!project || !task) return;
    
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId 
        ? { ...t, title: editedTitle, description: editedDescription, status: editedStatus, priority: editedPriority, estimatedEndDate: editedEstimatedEndDate, tag: editedTag }
        : t
    );
    
    const updatedProject = { ...project, tasks: updatedTasks };
    saveProject(updatedProject);
    setProject(updatedProject);
    setTask({ ...task, title: editedTitle, description: editedDescription, status: editedStatus, priority: editedPriority, estimatedEndDate: editedEstimatedEndDate, tag: editedTag });
    setIsEditing(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };

  const handleSaveTitle = () => {
    if (!project || !task) return;
    
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId 
        ? { ...t, title: editedTitle }
        : t
    );
    
    const updatedProject = { ...project, tasks: updatedTasks };
    saveProject(updatedProject);
    setProject(updatedProject);
    setTask({ ...task, title: editedTitle });
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (!project || !task) return;
    
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId 
        ? { ...t, description: editedDescription }
        : t
    );
    
    const updatedProject = { ...project, tasks: updatedTasks };
    saveProject(updatedProject);
    setProject(updatedProject);
    setTask({ ...task, description: editedDescription });
    setIsEditingDescription(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!project || !task) return;
    
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    const updatedProject = { ...project, tasks: updatedTasks };
    saveProject(updatedProject);
    navigate(`/project/${projectId}`);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getFeatureTitle = (fid: number) => {
    const feature = project?.features.find(f => f.id === fid);
    return feature?.title || t('kanban.feature');
  };

  const getFeaturePriority = (fid: number) => {
    // Feature接口已移除priority属性，返回空字符串
    return '';
  };

  const getFeaturePriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must have': return 'bg-red-100 text-red-800';
      case 'Should have': return 'bg-orange-100 text-orange-800';
      case 'Could have': return 'bg-yellow-100 text-yellow-800';
      case 'Won\'t have': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Must have': return 'bg-red-100 text-red-800';
      case 'Should have': return 'bg-orange-100 text-orange-800';
      case 'Could have': return 'bg-yellow-100 text-yellow-800';
      case 'Won\'t have': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'doing': return 'bg-blue-100 text-blue-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return t('kanban.todo');
      case 'doing': return t('kanban.doing');
      case 'done': return t('kanban.done');
      default: return status;
    }
  };

  if (!project || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{t('taskDetail.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(`/project/${projectId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('taskDetail.back')}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Started {new Date(project.startAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>{t('common.save')}</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                  <Button variant="outline" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col space-y-2">
              <div className="flex-1">
                {isEditingTitle || isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={isEditingTitle ? handleSaveTitle : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isEditingTitle) {
                        handleSaveTitle();
                      }
                    }}
                    className="text-2xl font-bold w-full p-1 border rounded"
                    autoFocus
                  />
                ) : (
                  <CardTitle 
                    className="text-2xl font-bold cursor-pointer hover:bg-gray-100 p-1 rounded" 
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
                  </CardTitle>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-primary-light text-primary border-primary/20"
                >
                  {getFeatureTitle(task.fid)}
                </Badge>
                <Badge className={getFeaturePriorityColor(getFeaturePriority(task.fid))}>
                  {getFeaturePriority(task.fid)}
                </Badge>
                {isEditing ? (
                  <select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="">选择优先级</option>
                    <option value="Must have">Must have</option>
                    <option value="Should have">Should have</option>
                    <option value="Could have">Could have</option>
                    <option value="Won't have">Won't have</option>
                  </select>
                ) : (
                  <Badge className={getTaskPriorityColor(task.priority || '')}>
                    {task.priority || '未设置优先级'}
                  </Badge>
                )}
                {isEditing ? (
                  <input
                    type="date"
                    value={editedEstimatedEndDate}
                    onChange={(e) => setEditedEstimatedEndDate(e.target.value)}
                    className="border rounded p-1"
                  />
                ) : (
                  <Badge variant="outline">
                    {task.estimatedEndDate ? `截止: ${task.estimatedEndDate}` : '未设置截止日期'}
                  </Badge>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTag}
                    onChange={(e) => setEditedTag(e.target.value)}
                    placeholder="输入标签"
                    className="border rounded p-1"
                  />
                ) : (
                  <Badge variant="outline">
                    {task.tag || '未设置标签'}
                  </Badge>
                )}
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value as TaskStatus)}
                    className="border rounded p-1"
                  >
                    <option value="todo">{t('kanban.todo')}</option>
                    <option value="doing">{t('kanban.doing')}</option>
                    <option value="done">{t('kanban.done')}</option>
                  </select>
                ) : (
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 
              className="text-lg font-medium mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded inline-block"
              onClick={() => setIsEditingDescription(true)}
            >
              {t('taskDetail.description')}
            </h3>
            {isEditingDescription || isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={isEditingDescription ? handleSaveDescription : undefined}
                className="w-full p-1 border rounded min-h-[150px] text-lg font-medium text-muted-foreground"
                autoFocus
              />
            ) : (
              <p 
                className="text-muted-foreground whitespace-pre-line cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => setIsEditingDescription(true)}
              >
                {task.description || t('taskDetail.noDescription')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{t('taskDetail.confirmDelete')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('taskDetail.deleteWarning')}
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDelete}>
                {t('common.cancel')}
              </Button>
              <Button onClick={confirmDelete}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}