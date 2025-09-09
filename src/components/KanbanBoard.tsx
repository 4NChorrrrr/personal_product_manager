import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, CheckCircle, Circle, Clock, Edit, X, Trash2, Move, Calendar } from 'lucide-react';
import { Project, Task } from '../types/project';
import { getProject, saveProject } from '../utils/storage';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { format } from 'date-fns';

type TaskStatus = 'todo' | 'doing' | 'done';

interface KanbanBoardProps {
  projectId: string;
  onBack: () => void;
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
  const [isEditingEndDate, setIsEditingEndDate] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedStatus, setEditedStatus] = useState<TaskStatus>(task.status);
  const [editedTag, setEditedTag] = useState(task.tag || '');
  const [editedEndDate, setEditedEndDate] = useState<string | undefined>(task.estimatedEndDate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = () => {
    const updatedTask = { 
      ...task, 
      title: editedTitle, 
      description: editedDescription, 
      status: editedStatus, 
      tag: editedTag,
      estimatedEndDate: editedEndDate
    };
    onUpdate(updatedTask);
    setIsEditing(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsEditingEndDate(false);
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
    setDescriptionChanged(false);
  };

  const handleCancelDescription = () => {
    if (descriptionChanged) {
      setShowCancelConfirm(true);
    } else {
      setIsEditingDescription(false);
    }
  };

  const confirmCancelDescription = () => {
    setEditedDescription(task.description || '');
    setIsEditingDescription(false);
    setDescriptionChanged(false);
    setShowCancelConfirm(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setEditedDescription(newDescription);
    setDescriptionChanged(newDescription !== (task.description || ''));
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
      case 'Could have': return 'bg-blue-100 text-blue-800';
      case "Won't have": return 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary-light text-primary border-primary/20">
              {getFeatureTitle(task.fid)}
            </Badge>
            {getFeaturePriority(task.fid) && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getFeaturePriorityColor(getFeaturePriority(task.fid))}`}
              >
                {getFeaturePriority(task.fid)}
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
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'todo')} className={task.status === 'todo' ? 'bg-gray-100' : ''}>
                      <Circle className={`h-4 w-4 mr-2 ${task.status === 'todo' ? 'text-gray-700' : 'text-gray-400'}`} />
                      {t('kanban.todo')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'doing')} className={task.status === 'doing' ? 'bg-blue-100' : ''}>
                      <Clock className={`h-4 w-4 mr-2 ${task.status === 'doing' ? 'text-blue-700' : 'text-yellow-500'}`} />
                      {t('kanban.doing')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMoveTask(task.id, 'done')} className={task.status === 'done' ? 'bg-green-100' : ''}>
                      <CheckCircle className={`h-4 w-4 mr-2 ${task.status === 'done' ? 'text-green-700' : 'text-green-500'}`} />
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
              <>
                <textarea
                  value={editedDescription}
                  onChange={handleDescriptionChange}
                  className="w-full p-1 border rounded min-h-[150px] text-lg font-medium text-muted-foreground"
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <Button variant="outline" onClick={handleCancelDescription}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSaveDescription}>
                    {t('common.save')}
                  </Button>
                </div>
              </>
            ) : (
              <p 
                className="text-muted-foreground whitespace-pre-line cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => setIsEditingDescription(true)}
              >
                {task.description || t('taskDetail.noDescription')}
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="text-lg font-medium">{t('taskDetail.endDate')}</h4>
            </div>
            {isEditingEndDate || isEditing ? (
              <DateTimePicker
                value={editedEndDate}
                onChange={(date) => setEditedEndDate(date)}
                className="w-full"
              />
            ) : (
              <div 
                className="text-muted-foreground cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => setIsEditingEndDate(true)}
              >
                {task.estimatedEndDate 
                  ? format(new Date(task.estimatedEndDate), 'yyyy-MM-dd HH:mm')
                  : '1970/01/01 08:00'}
              </div>
            )}
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">{t('taskDetail.confirmCancel')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('taskDetail.cancelWarning')}
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  {t('common.back')}
                </Button>
                <Button onClick={confirmCancelDescription}>
                  {t('common.confirm')}
                </Button>
              </div>
            </div>
          </div>
        )}

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

const columnConfig = {
  todo: {
    titleKey: 'kanban.todo',
    bgColor: 'bg-kanban-todo',
    icon: Circle,
    iconColor: 'text-gray-400'
  },
  doing: {
    titleKey: 'kanban.doing',
    bgColor: 'bg-kanban-doing',
    icon: Clock,
    iconColor: 'text-yellow-500'
  },
  done: {
    titleKey: 'kanban.done',
    bgColor: 'bg-kanban-done',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  }
};

export function KanbanBoard({ projectId, onBack }: KanbanBoardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ project: Project; task: Task } | null>(null);

  useEffect(() => {
    const loadProject = () => {
      const loadedProject = getProject(projectId);
      if (loadedProject) {
        setProject(loadedProject);
        setTasks(loadedProject.tasks);
      }
    };
    
    loadProject();
  }, [projectId]);

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((doneTasks / tasks.length) * 100);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getFeatureTitle = (fid: number) => {
    const feature = project?.features.find(f => f.id === fid);
    return feature?.title || t('kanban.feature');
  };

  const getTaskPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Must have': return 'bg-red-100 text-red-800';
      case 'Should have': return 'bg-orange-100 text-orange-800';
      case 'Could have': return 'bg-blue-100 text-blue-800';
      case "Won't have": return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePriorityChange = (taskId: string, currentPriority?: string) => {
    if (!project) return;
    
    // 定义优先级循环顺序
    const priorities = ['Must have', 'Should have', 'Could have', "Won't have"];
    
    // 找到当前优先级的索引，如果没有优先级则从第一个开始
    const currentIndex = currentPriority ? priorities.indexOf(currentPriority) : -1;
    const nextIndex = (currentIndex + 1) % priorities.length;
    const newPriority = priorities[nextIndex];
    
    // 更新任务优先级
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, priority: newPriority } : t
    );
    
    setTasks(updatedTasks);
    
    // 保存到localStorage
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    saveProject(updatedProject);
    setProject(updatedProject);
    
    // 如果当前选中的任务是被修改的任务，更新选中任务的优先级
    if (selectedTask && selectedTask.task.id === taskId) {
      setSelectedTask({
        project: updatedProject,
        task: { ...selectedTask.task, priority: newPriority }
      });
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination || !project) {
      return;
    }

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      return; // Same column, no change needed
    }

    // Update task status
    const newStatus = destination.droppableId as Task['status'];
    const updatedTasks = tasks.map(task =>
      task.id === draggableId
        ? { ...task, status: newStatus }
        : task
    );

    setTasks(updatedTasks);

    // Save to localStorage
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    saveProject(updatedProject);
    setProject(updatedProject);
  };

  const handleTaskClick = (task: Task) => {
    if (project) {
      setSelectedTask({ project, task });
    }
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    if (!project || !selectedTask) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    saveProject(updatedProject);
    setProject(updatedProject);
    
    setSelectedTask({
      project: updatedProject,
      task: updatedTask
    });
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    if (!project) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    saveProject(updatedProject);
    setProject(updatedProject);
    
    // 如果当前选中的任务是被移动的任务，更新选中任务的状态
    if (selectedTask && selectedTask.task.id === taskId) {
      setSelectedTask({
        project: updatedProject,
        task: { ...selectedTask.task, status: newStatus }
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!project) return;
    
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    saveProject(updatedProject);
    setProject(updatedProject);
    
    setSelectedTask(null);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{t('kanban.loading')}</p>
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
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('kanban.back')}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(project.startAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('kanban.progress')}</span>
              <span className="text-sm text-muted-foreground">
                {tasks.filter(t => t.status === 'done').length} of {tasks.length} {t('kanban.tasksCompleted')}
              </span>
            </div>
            <Progress value={getProgress()} className="h-3" />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(columnConfig).map(([status, config]) => {
              const Icon = config.icon;
              const columnTasks = getTasksByStatus(status as Task['status']);

              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      <h2 className="font-semibold text-lg">{t(config.titleKey)}</h2>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Droppable Column */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-4 rounded-lg min-h-[500px] transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-primary/5 border-2 border-primary border-dashed' 
                            : config.bgColor
                        }`}
                      >
                        <div className="space-y-3">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`shadow-card hover:shadow-card-hover transition-smooth cursor-grab active:cursor-grabbing ${
                                    snapshot.isDragging ? 'rotate-2 shadow-card-hover' : ''
                                  }`}
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex flex-col space-y-2">
                                      <div className="flex items-start">
                                        {/* 优先级标签 - 可点击切换 */}
                                        <div 
                                          className={`flex-shrink-0 w-3 h-3 rounded-full mr-2 cursor-pointer ${task.priority ? getTaskPriorityColor(task.priority).replace('bg-', 'bg-').replace('text-', '') : 'bg-gray-300'}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handlePriorityChange(task.id, task.priority);
                                          }}
                                          title={task.priority || '设置优先级'}
                                        />
                                        <CardTitle className="text-sm font-medium leading-snug">
                                          {task.title}
                                        </CardTitle>
                                      </div>
                                      <div className="flex flex-wrap gap-2 items-center">
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs bg-primary-light text-primary border-primary/20"
                                        >
                                          {getFeatureTitle(task.fid)}
                                        </Badge>
                                        {task.tag && (
                                          <Badge 
                                            variant="outline" 
                                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                          >
                                            {task.tag}
                                          </Badge>
                                        )}
                                        {task.priority && (
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getTaskPriorityColor(task.priority)}`}
                                          >
                                            {task.priority}
                                          </Badge>
                                        )}
                                        <span className="text-xs text-blue-700 ml-auto">
                                          {task.estimatedEndDate ? new Date(task.estimatedEndDate).toLocaleDateString() : new Date('1970-01-01').toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  {task.description && (
                                    <CardContent className="pt-0">
                                      <p className="text-sm text-muted-foreground">
                                        {task.description}
                                      </p>
                                    </CardContent>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          
                          {columnTasks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p className="text-sm">{t('kanban.noTasks')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

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
    </div>
  );
}