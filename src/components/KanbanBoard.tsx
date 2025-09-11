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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, CheckCircle, Circle, Clock, Edit, X, Trash2, Move, Calendar, Bug, TestTube, Wrench } from 'lucide-react';
import { Project, Task } from '../types/project';
import { getProject, saveProject } from '../utils/storage';
import { DateTimePicker as UIDateTimePicker } from '@/components/ui/datetime-picker';
import { TaskDateTimePicker } from '@/components/TaskDateTimePicker';

import { format } from 'date-fns';

type TaskStatus = 'todo' | 'doing' | 'testing' | 'fixing' | 'done';

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
  
  // 辅助函数：获取任务优先级颜色
  const getTaskPriorityColor = (priority?: string) => {
    switch (priority) {
      case t('reviewProject.priorityMust'): return 'bg-red-100 text-red-800';
      case t('reviewProject.priorityShould'): return 'bg-orange-100 text-orange-800';
      case t('reviewProject.priorityCould'): return 'bg-blue-100 text-blue-800';
      case t('reviewProject.priorityWont'): return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 辅助函数：获取任务优先级颜色条颜色
  const getTaskPriorityColorBarColor = (priority?: string) => {
    switch (priority) {
      case t('reviewProject.priorityMust'): return 'bg-red-500';
      case t('reviewProject.priorityShould'): return 'bg-orange-500';
      case t('reviewProject.priorityCould'): return 'bg-blue-500';
      case t('reviewProject.priorityWont'): return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };
  
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
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [showEndDateDropdown, setShowEndDateDropdown] = useState(false);
  const [featureDropdownOpen, setFeatureDropdownOpen] = useState(false);
  const [newFeatureInputOpen, setNewFeatureInputOpen] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');

  const handleSave = async () => {
    const updatedTask = { 
      ...task, 
      title: editedTitle, 
      description: editedDescription, 
      status: editedStatus, 
      tag: editedTag,
      estimatedEndDate: editedEndDate,
      duration: task.duration
    };
    await onUpdate(updatedTask);
    setIsEditing(false);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setIsEditingEndDate(false);
  };

  const handleSaveTitle = async () => {
    const updatedTask = { ...task, title: editedTitle };
    await onUpdate(updatedTask);
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    const updatedTask = { ...task, description: editedDescription };
    await onUpdate(updatedTask);
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

  const confirmDelete = async () => {
    await onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handlePriorityChange = async (newPriority?: string) => {
    const updatedTask = { ...task, priority: newPriority };
    await onUpdate(updatedTask);
    setPriorityDropdownOpen(false);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    const updatedTask = { ...task, status: newStatus, duration: task.duration };
    await onUpdate(updatedTask);
    setStatusDropdownOpen(false);
  };

  const handleSaveEndDate = async () => {
    const updatedTask = { ...task, estimatedEndDate: editedEndDate };
    await onUpdate(updatedTask);
  };

  const handleFeatureChange = async (newFeatureId: number) => {
    const updatedTask = { ...task, feature_id: newFeatureId };
    await onUpdate(updatedTask);
    setFeatureDropdownOpen(false);
  };

  const handleAddNewFeature = () => {
    setNewFeatureInputOpen(true);
    setFeatureDropdownOpen(false);
  };

  const handleCreateNewFeature = async () => {
    if (!newFeatureTitle.trim()) return;
    
    // 创建新功能
    const newFeature = {
      id: Math.max(0, ...project.features.map(f => f.id)) + 1,
      title: newFeatureTitle.trim()
    };
    
    // 更新项目
    const updatedProject = {
      ...project,
      features: [...project.features, newFeature]
    };
    
    // 更新任务的功能ID
    const updatedTask = { ...task, feature_id: newFeature.id };
    
    // 保存更改
    await onUpdate(updatedTask);
    
    // 重置状态
    setNewFeatureTitle('');
    setNewFeatureInputOpen(false);
  };

  const handleCancelNewFeature = () => {
    setNewFeatureTitle('');
    setNewFeatureInputOpen(false);
  };

  const getFeatureTitle = (feature_id: number) => {
    const feature = project.features.find(f => f.id === feature_id);
    return feature?.title || t('kanban.feature');
  };

  const getFeaturePriority = (feature_id: number) => {
    // Feature接口已移除priority属性，返回空字符串
    return '';
  };

  const getFeaturePriorityColor = (priority: string) => {
    switch (priority) {
      case t('reviewProject.priorityMust'): return 'bg-red-100 text-red-800';
      case t('reviewProject.priorityShould'): return 'bg-orange-100 text-orange-800';
      case t('reviewProject.priorityCould'): return 'bg-blue-100 text-blue-800';
      case t('reviewProject.priorityWont'): return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'doing': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-purple-100 text-purple-800';
      case 'fixing': return 'bg-red-100 text-red-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return t('kanban.todo');
      case 'doing': return t('kanban.doing');
      case 'testing': return t('kanban.testing');
      case 'fixing': return t('kanban.fixing');
      case 'done': return t('kanban.done');
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[60vh] overflow-y-auto">
        {/* 任务详情弹窗标题 */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Badge
                variant="outline"
                className="bg-primary-light text-primary border-primary/20 cursor-pointer h-[30px] flex items-center justify-center"
                onClick={() => setFeatureDropdownOpen(!featureDropdownOpen)}
              >
                {getFeatureTitle(task.fid)}
              </Badge>
              {featureDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    {project.features.map((feature) => (
                      <button
                        key={feature.id}
                        className={`block w-full text-left px-3 py-1 text-sm ${task.fid === feature.id ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleFeatureChange(feature.id)}
                      >
                        {feature.title}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="block w-full text-left px-3 py-1 text-sm text-green-600 hover:bg-gray-100"
                      onClick={handleAddNewFeature}
                    >
                      + {t('kanban.addNewFeature')}
                    </button>
                  </div>
                </div>
              )}
              {newFeatureInputOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                  <input
                    type="text"
                    value={newFeatureTitle}
                    onChange={(e) => setNewFeatureTitle(e.target.value)}
                    placeholder={t('kanban.enterFeatureName')}
                    className="w-full p-2 border rounded mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateNewFeature();
                      } else if (e.key === 'Escape') {
                        handleCancelNewFeature();
                      }
                    }}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelNewFeature}>
                      {t('common.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleCreateNewFeature}>
                      {t('common.add')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
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
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Circle className="h-4 w-4 mr-2 text-gray-500" />
                        {t('kanban.status')}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onMoveTask(task.id, 'todo')} className={task.status === 'todo' ? 'bg-gray-100' : ''}>
                          <Circle className={`h-4 w-4 mr-2 ${task.status === 'todo' ? 'text-gray-700' : 'text-gray-400'}`} />
                          {t('kanban.todo')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTask(task.id, 'doing')} className={task.status === 'doing' ? 'bg-blue-100' : ''}>
                          <Clock className={`h-4 w-4 mr-2 ${task.status === 'doing' ? 'text-blue-700' : 'text-yellow-500'}`} />
                          {t('kanban.doing')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTask(task.id, 'testing')} className={task.status === 'testing' ? 'bg-purple-100' : ''}>
                          <TestTube className={`h-4 w-4 mr-2 ${task.status === 'testing' ? 'text-purple-700' : 'text-blue-500'}`} />
                          {t('kanban.testing')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTask(task.id, 'fixing')} className={task.status === 'fixing' ? 'bg-red-100' : ''}>
                          <Bug className={`h-4 w-4 mr-2 ${task.status === 'fixing' ? 'text-red-700' : 'text-red-500'}`} />
                          {t('kanban.fixing')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMoveTask(task.id, 'done')} className={task.status === 'done' ? 'bg-green-100' : ''}>
                          <CheckCircle className={`h-4 w-4 mr-2 ${task.status === 'done' ? 'text-green-700' : 'text-green-500'}`} />
                          {t('kanban.done')}
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                        {t('kanban.priority')}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handlePriorityChange(t('reviewProject.priorityMust'))}>
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityMust')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(t('reviewProject.priorityShould'))}>
                          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityShould')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(t('reviewProject.priorityCould'))}>
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityCould')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(t('reviewProject.priorityWont'))}>
                          <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityWont')}
                        </DropdownMenuItem>
                        {task.priority && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePriorityChange(undefined)}>
                              {t('reviewProject.clearPriority')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
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

        {/* 任务详情内容 */}
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
                  <option value="testing">{t('kanban.testing')}</option>
                  <option value="fixing">{t('kanban.fixing')}</option>
                  <option value="done">{t('kanban.done')}</option>
                </select>
              ) : (
                <div className="relative">
                  <Badge 
                    className={`${getStatusColor(task.status)} cursor-pointer h-[30px] flex items-center justify-center`}
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  >
                    {getStatusText(task.status)}
                  </Badge>
                  {statusDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleStatusChange('todo')}
                        >
                          <Circle className="inline-block h-3 w-3 mr-2 text-gray-500" />
                          {t('kanban.todo')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleStatusChange('doing')}
                        >
                          <Clock className="inline-block h-3 w-3 mr-2 text-yellow-500" />
                          {t('kanban.doing')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleStatusChange('testing')}
                        >
                          <TestTube className="inline-block h-3 w-3 mr-2 text-blue-500" />
                          {t('kanban.testing')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleStatusChange('fixing')}
                        >
                          <Bug className="inline-block h-3 w-3 mr-2 text-red-500" />
                          {t('kanban.fixing')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleStatusChange('done')}
                        >
                          <CheckCircle className="inline-block h-3 w-3 mr-2 text-green-500" />
                          {t('kanban.done')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={editedTag}
                  onChange={(e) => setEditedTag(e.target.value)}
                  placeholder={t('reviewProject.enterTag')}
                  className="border rounded p-1"
                />
              ) : (
                <div className="relative">
                  <Badge 
                    variant="outline" 
                    className={`${task.priority ? getTaskPriorityColor(task.priority) : 'bg-gray-100 text-gray-800'} cursor-pointer h-[30px] flex items-center justify-center`}
                    onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                  >
                    {task.priority || t('reviewProject.noPrioritySet')}
                  </Badge>
                  {priorityDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handlePriorityChange(t('reviewProject.priorityMust'))}
                        >
                          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityMust')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handlePriorityChange(t('reviewProject.priorityShould'))}
                        >
                          <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityShould')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handlePriorityChange(t('reviewProject.priorityCould'))}
                        >
                          <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityCould')}
                        </button>
                        <button
                          className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handlePriorityChange(t('reviewProject.priorityWont'))}
                        >
                          <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                          {t('reviewProject.priorityWont')}
                        </button>
                        {task.priority && (
                          <button
                            className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                            onClick={() => handlePriorityChange(undefined)}
                          >
                            {t('reviewProject.clearPriority')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 任务结束时间标签 */}
              {isEditingEndDate || isEditing ? (
                <UIDateTimePicker
                  value={editedEndDate}
                  onChange={(date) => setEditedEndDate(date)}
                  className="ml-2"
                />
              ) : (
                <div className="relative ml-2">
                  <TaskDateTimePicker
                    value={task.estimatedEndDate}
                    onChange={(date) => {
                      setEditedEndDate(date);
                      handleSaveEndDate();
                    }}
                    onRemove={() => {
                      setEditedEndDate(null);
                      handleSaveEndDate();
                    }}
                    className={`inline-flex items-center justify-center h-[30px] px-2 rounded-full border text-xs ${task.estimatedEndDate ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                  />
                </div>
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
        </div>

        {/* 取消确认弹窗 */}
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

        {/* 删除确认弹窗 */}
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
  testing: {
    titleKey: 'kanban.testing',
    bgColor: 'bg-kanban-testing',
    icon: TestTube,
    iconColor: 'text-blue-500'
  },
  fixing: {
    titleKey: 'kanban.fixing',
    bgColor: 'bg-kanban-fixing',
    icon: Bug,
    iconColor: 'text-red-500'
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
  
  // 辅助函数：获取任务优先级颜色
  const getTaskPriorityColor = (priority?: string) => {
    switch (priority) {
      case t('reviewProject.priorityMust'): return 'bg-red-100 text-red-800';
      case t('reviewProject.priorityShould'): return 'bg-orange-100 text-orange-800';
      case t('reviewProject.priorityCould'): return 'bg-blue-100 text-blue-800';
      case t('reviewProject.priorityWont'): return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 辅助函数：获取任务优先级颜色条颜色
  const getTaskPriorityColorBarColor = (priority?: string) => {
    switch (priority) {
      case t('reviewProject.priorityMust'): return 'bg-red-500';
      case t('reviewProject.priorityShould'): return 'bg-orange-500';
      case t('reviewProject.priorityCould'): return 'bg-blue-500';
      case t('reviewProject.priorityWont'): return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ project: Project; task: Task } | null>(null);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState<string | null>(null); // 存储打开下拉列表的任务ID
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        // 首先尝试从正式数据库加载项目
        const loadedProject = await getProject(projectId);
        if (loadedProject) {
          setProject(loadedProject);
          setTasks(loadedProject.tasks);
        } else {
          // 如果正式项目中不存在，重定向到项目列表
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Failed to load project from database:', error);
        // 如果从数据库加载失败，尝试从localStorage加载
        try {
          const projects = JSON.parse(localStorage.getItem('ai-kanban-projects') || '[]');
          const localProject = projects.find(p => p.id === projectId);
          if (localProject) {
            setProject(localProject);
            setTasks(localProject.tasks);
          } else {
            // 如果localStorage中也不存在，重定向到项目列表
            navigate('/');
          }
        } catch (localError) {
          console.error('Failed to load project from localStorage:', localError);
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, navigate]);

  const getProgress = () => {
    if (tasks.length === 0) return 0;
    const doneTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((doneTasks / tasks.length) * 100);
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getFeatureTitle = (feature_id: number) => {
    const feature = project?.features.find(f => f.id === feature_id);
    return feature?.title || t('kanban.feature');
  };



  const handlePriorityChange = async (taskId: string, newPriority?: string) => {
    if (!project) return;
    
    // 如果没有提供新的优先级，则不进行更改
    if (newPriority === undefined) return;
    
    // 更新任务优先级
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? (newPriority === undefined ? { ...t, priority: undefined } : { ...t, priority: newPriority }) : t
    );
    
    setTasks(updatedTasks);
    
    // 保存到数据库
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(tasks);
    }
    
    // 如果当前选中的任务是被修改的任务，更新选中任务的优先级
    if (selectedTask && selectedTask.task.id === taskId) {
      setSelectedTask({
        project: updatedProject,
        task: { ...selectedTask.task, priority: newPriority }
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !project) {
      return;
    }

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      return; // 相同列，无需更新
    }

    // 更新任务状态
    const newStatus = destination.droppableId as Task['status'];
    const updatedTasks = tasks.map(task =>
      task.id === draggableId
        ? { ...task, status: newStatus, duration: task.duration }
        : task
    );

    setTasks(updatedTasks);

    // 保存到数据库
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(tasks);
    }
  };

  const handleTaskClick = (task: Task) => {
    if (project) {
      setSelectedTask({ project, task });
    }
  };

  const handleAddTask = async (status: Task['status']) => {
    if (!project) return;
    
    // 创建新任务
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: t('kanban.newTask'),
      description: '',
      status: status,
      fid: project.features.length > 0 ? project.features[0].id : 1, // 默认使用第一个功能
      estimatedEndDate: undefined,
      tag: '',
      priority: undefined,
      duration: 0
    };
    
    // 添加到任务列表
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // 保存到数据库
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(tasks);
      return;
    }
    
    // 打开任务详情弹窗
    setSelectedTask({ project: updatedProject, task: newTask });
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!project || !selectedTask) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    );
    
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(tasks);
      return;
    }
    
    setSelectedTask({
      project: updatedProject,
      task: updatedTask
    });
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!project) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, duration: t.duration } : t
    );
    
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(tasks);
      return;
    }
    
    // 如果当前选中的任务是被移动的任务，更新选中任务的状态
    if (selectedTask && selectedTask.task.id === taskId) {
      setSelectedTask({
        project: updatedProject,
        task: { ...selectedTask.task, status: newStatus, duration: selectedTask.task.duration }
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project) return;
    
    const originalTasks = [...tasks];
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    
    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };
    
    try {
      await saveProject(updatedProject);
      setProject(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
      // 如果保存失败，恢复原始任务列表
      setTasks(originalTasks);
      return;
    }
    
    setSelectedTask(null);
  };

  if (loading) {
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
      {/* 看板标题 */}
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
          
          {/* 看板进度 */}
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

      {/* 看板 */}
      <div className="w-fit mx-auto py-6 px-[150px]">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-x-3 gap-3 lg:w-[calc(100%+3.5rem)]">
            {Object.entries(columnConfig).map(([status, config]) => {
              const Icon = config.icon;
              const columnTasks = getTasksByStatus(status as Task['status']);

              return (
                <div key={status} className="flex flex-col">
                  {/* 看板列标题 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      <h2 className="font-semibold text-lg">{t(config.titleKey)}</h2>
                      <Badge variant="secondary" className="text-xs">
                        {columnTasks.length}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTask(status as Task['status']);
                      }}
                      title={t('kanban.addTask')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </Button>
                  </div>

                  {/* 看板列 */}
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 py-[10px] px-[10px] rounded-lg min-h-[500px] transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-primary/5 border-2 border-primary border-dashed' 
                            : config.bgColor
                        }`}
                      >
                        <div className="space-y-[10px]">
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`shadow-card hover:shadow-card-hover transition-smooth cursor-grab active:cursor-grabbing overflow-hidden ${
                                    snapshot.isDragging ? 'rotate-2 shadow-card-hover' : ''
                                  }`}
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <CardHeader className="pb-3 p-2.5 h-auto relative">
                                    <div className="flex">
                                      {/* 左侧优先级颜色条 */}
                                      <div 
                                        className={`w-[6px] h-full rounded cursor-pointer absolute top-0 bottom-0 left-0 ${getTaskPriorityColorBarColor(task.priority)}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePriorityChange(task.id, task.priority);
                                        }}
                                        title={task.priority || '设置优先级'}
                                      />
                                      
                                      {/* 右侧上下布局 */}
                                      <div className="flex-1 flex flex-col ml-2">
                                        {/* 上方：任务标题 */}
                                        <CardTitle className="text-sm font-medium leading-snug mb-2">
                                          {task.title}
                                        </CardTitle>
                                        
                                        {/* 下方：各种标签 */}
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
                                          <span className="text-xs text-blue-700 ml-auto">
                                            {task.estimatedEndDate ? new Date(task.estimatedEndDate).toLocaleDateString() : t('kanban.noDate')}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  {task.description && (
                                    <CardContent className="pt-0 p-2.5">
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

      {/* 任务详情弹窗 */}
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