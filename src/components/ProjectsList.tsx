import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Calendar, MoreVertical, Trash2, Edit, X, CheckCircle, Circle, Clock } from 'lucide-react';
import { Project, Task } from '../types/project';
import { getProjects, deleteProject, getProject, saveProject } from '../utils/storage';

type TaskStatus = 'todo' | 'doing' | 'testing' | 'fixing' | 'done';

interface ProjectsListProps {
  onNewProject: () => void;
}

interface TaskDetailModalProps {
  project: Project;
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

function TaskDetailModal({ project, task, onClose, onUpdate, onDelete, onMoveTask }: TaskDetailModalProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>(task.status);
  const [editedPriority, setEditedPriority] = useState(task.priority || '');
  const [editedEstimatedEndDate, setEditedEstimatedEndDate] = useState(task.estimatedEndDate || '');
  const [editedTag, setEditedTag] = useState(task.tag || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const updatedTask = { ...task, title: editedTitle, description: editedDescription, status: editedStatus, priority: editedPriority, estimatedEndDate: editedEstimatedEndDate, tag: editedTag, duration: task.duration };
    onUpdate(updatedTask);
    setIsEditing(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };

  const handleSaveTitle = () => {
    const updatedTask = { ...task, title: editedTitle };
    onUpdate(updatedTask);
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    const updatedTask = { ...task, description: editedDescription };
    onUpdate(updatedTask);
    setIsEditingDescription(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getFeatureTitle = (fid: number) => {
    const feature = project.features.find(f => f.id === fid);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-xl font-bold">{t('taskDetail.title')}</h2>
            <Badge variant="outline" className="bg-primary-light text-primary border-primary/20">
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
                <option value={t('reviewProject.priorityMust')}>{t('reviewProject.priorityMust')}</option>
                          <option value={t('reviewProject.priorityShould')}>{t('reviewProject.priorityShould')}</option>
                          <option value={t('reviewProject.priorityCould')}>{t('reviewProject.priorityCould')}</option>
                          <option value={t('reviewProject.priorityWont')}>{t('reviewProject.priorityWont')}</option>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'todo')}>
                      <Circle className="h-4 w-4 mr-2 text-gray-400" />
                      {t('kanban.todo')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'doing')}>
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                      {t('kanban.doing')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'done')}>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      {t('kanban.done')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6">
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
                className="text-2xl font-bold w-full p-1 border rounded mb-2"
                autoFocus
              />
            ) : (
              <h3 
                className="text-2xl font-bold cursor-pointer hover:bg-gray-100 p-1 rounded mb-2" 
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h3>
            )}
            
            <div className="flex space-x-2 mb-4">
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
            </div>
          </div>

          <div>
            <h4 
              className="text-lg font-medium mb-2 cursor-pointer hover:bg-gray-100 p-1 rounded inline-block"
              onClick={() => setIsEditingDescription(true)}
            >
              {t('taskDetail.description')}
            </h4>
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
          </div>
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
    </div>
  );
}

export function ProjectsList({ onNewProject }: ProjectsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ project: Project; task: Task } | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjects(getProjects());
      setProjectToDelete(null);
    }
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
  };

  const handleTaskClick = (project: Project, task: Task) => {
    setSelectedTask({ project, task });
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    if (!selectedTask) return;
    
    const projectIndex = projects.findIndex(p => p.id === selectedTask.project.id);
    if (projectIndex === -1) return;
    
    const updatedProjects = [...projects];
    const taskIndex = updatedProjects[projectIndex].tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex === -1) return;
    
    updatedProjects[projectIndex].tasks[taskIndex] = updatedTask;
    setProjects(updatedProjects);
    saveProject(updatedProjects[projectIndex]);
    
    setSelectedTask({
      project: updatedProjects[projectIndex],
      task: updatedTask
    });
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    if (!selectedTask) return;
    
    const projectIndex = projects.findIndex(p => p.id === selectedTask.project.id);
    if (projectIndex === -1) return;
    
    const updatedProjects = [...projects];
    const taskIndex = updatedProjects[projectIndex].tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    updatedProjects[projectIndex].tasks[taskIndex] = { 
      ...updatedProjects[projectIndex].tasks[taskIndex], 
      status: newStatus 
    };
    
    setProjects(updatedProjects);
    saveProject(updatedProjects[projectIndex]);
    
    // 更新选中任务的状态
    setSelectedTask({
      project: updatedProjects[projectIndex],
      task: { ...selectedTask.task, status: newStatus }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedTask) return;
    
    const projectIndex = projects.findIndex(p => p.id === selectedTask.project.id);
    if (projectIndex === -1) return;
    
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].tasks = updatedProjects[projectIndex].tasks.filter(t => t.id !== taskId);
    setProjects(updatedProjects);
    saveProject(updatedProjects[projectIndex]);
    
    setSelectedTask(null);
  };

  const getProgressPercentage = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const doneTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((doneTasks / project.tasks.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('projects.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('projects.subtitle')}
            </p>
          </div>
          <Button variant="hero" onClick={onNewProject}>
            <Plus className="mr-2 h-4 w-4" />
            {t('projects.newProject')}
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t('projects.noProjects')}</h3>
                  <p className="text-muted-foreground">
                    {t('projects.createFirstProject')}
                  </p>
                </div>
                <Button variant="hero" onClick={onNewProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('projects.createFirstProject')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer shadow-card hover:shadow-card-hover transition-smooth group"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold leading-tight pr-2">
                      {project.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(project.startAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Task Status */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t('projects.taskStatus')}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const todoTasks = project.tasks.filter(t => t.status === 'todo');
                          if (todoTasks.length > 0) {
                            handleTaskClick(project, todoTasks[0]);
                          }
                        }}
                      >
                        {t('projects.todo')}: {project.tasks.filter(t => t.status === 'todo').length}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const doingTasks = project.tasks.filter(t => t.status === 'doing');
                          if (doingTasks.length > 0) {
                            handleTaskClick(project, doingTasks[0]);
                          }
                        }}
                      >
                        {t('projects.doing')}: {project.tasks.filter(t => t.status === 'doing').length}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const doneTasks = project.tasks.filter(t => t.status === 'done');
                          if (doneTasks.length > 0) {
                            handleTaskClick(project, doneTasks[0]);
                          }
                        }}
                      >
                        {t('projects.done')}: {project.tasks.filter(t => t.status === 'done').length}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('projects.progress')}</span>
                      <span className="text-sm text-muted-foreground">
                        {getProgressPercentage(project)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(project)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.tasks.filter(t => t.status === 'done').length} of {project.tasks.length} {t('projects.tasks')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
          project={selectedTask.project}
          task={selectedTask.task}
          onClose={handleCloseTaskDetail}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onMoveTask={handleMoveTask}
        />
        )}

        {/* Delete Project Confirmation Dialog */}
        {projectToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">{t('projects.deleteConfirm')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('projects.deleteWarning')}
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={cancelDeleteProject}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={confirmDeleteProject}>
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}