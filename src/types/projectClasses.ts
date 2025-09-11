// 定义任务状态类型
export type TaskStatus = 'todo' | 'doing' | 'testing' | 'fixing' | 'done';

/**
 * 任务类
 */
export class Task {
  id: string;
  fid: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: string; // 遵循MoSCoW方法：Must have, Should have, Could have, Won't have
  tag?: string; // 父功能标题
  estimatedEndDate?: string; // 格式：YYYY-MM-DDTHH:mm
  duration?: number; // 任务持续时间（小时）
  createdAt?: string;
  updatedAt?: string;

  constructor(
    id: string,
    fid: number,
    title: string,
    status: TaskStatus = 'todo',
    description?: string,
    priority?: string,
    tag?: string,
    estimatedEndDate?: string,
    duration?: number
  ) {
    this.id = id;
    this.fid = fid.toString();
    this.title = title;
    this.status = status;
    this.description = description;
    this.priority = priority;
    this.tag = tag;
    this.estimatedEndDate = estimatedEndDate;
    this.duration = duration;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务状态
   * @param status 新状态
   */
  updateStatus(status: TaskStatus): void {
    this.status = status;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务标题
   * @param title 新标题
   */
  updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务描述
   * @param description 新描述
   */
  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务优先级
   * @param priority 新优先级
   */
  updatePriority(priority: string): void {
    this.priority = priority;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务标签
   * @param tag 新标签
   */
  updateTag(tag: string): void {
    this.tag = tag;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务预计结束日期
   * @param estimatedEndDate 新预计结束日期
   */
  updateEstimatedEndDate(estimatedEndDate: string): void {
    this.estimatedEndDate = estimatedEndDate;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新任务持续时间
   * @param duration 新持续时间（小时）
   */
  updateDuration(duration: number): void {
    this.duration = duration;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 将任务对象转换为普通对象，用于JSON序列化
   * @returns 普通对象
   */
  toJSON() {
    return {
      id: this.id,
      fid: this.fid,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      tag: this.tag,
      estimatedEndDate: this.estimatedEndDate,
      duration: this.duration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * 功能类
 */
export class Feature {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
  createdAt?: string;
  updatedAt?: string;

  constructor(id: number, title: string, description?: string) {
    this.id = id.toString();
    this.title = title;
    this.description = description;
    this.tasks = [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 添加任务
   * @param task 任务对象
   */
  addTask(task: Task): void {
    this.tasks.push(task);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 移除任务
   * @param taskId 任务ID
   * @returns 是否成功移除
   */
  removeTask(taskId: string): boolean {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * 更新功能标题
   * @param title 新标题
   */
  updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新功能描述
   * @param description 新描述
   */
  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  getTasks(): Task[] {
    return this.tasks;
  }

  /**
   * 根据状态获取任务
   * @param status 任务状态
   * @returns 符合状态的任务数组
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * 将功能对象转换为普通对象，用于JSON序列化
   * @returns 普通对象
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      tasks: this.tasks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * 项目类
 */
export class Project {
  id: string;
  name: string;
  startAt?: string;
  prd?: string;
  features: Feature[];
  tasks: Task[];
  createdAt?: string;
  updatedAt?: string;

  constructor(id: string, name: string, startAt?: string, prd?: string) {
    this.id = id;
    this.name = name;
    this.startAt = startAt || new Date().toISOString();
    this.prd = prd;
    this.features = [];
    this.tasks = [];
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 添加功能
   * @param feature 功能对象
   */
  addFeature(feature: Feature): void {
    this.features.push(feature);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 移除功能
   * @param featureId 功能ID
   * @returns 是否成功移除
   */
  removeFeature(featureId: string): boolean {
    const index = this.features.findIndex(feature => feature.id === featureId);
    if (index !== -1) {
      this.features.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * 添加任务
   * @param task 任务对象
   */
  addTask(task: Task): void {
    this.tasks.push(task);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 移除任务
   * @param taskId 任务ID
   * @returns 是否成功移除
   */
  removeTask(taskId: string): boolean {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * 更新项目名称
   * @param name 新名称
   */
  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新项目开始时间
   * @param startAt 新开始时间
   */
  updateStartAt(startAt: string): void {
    this.startAt = startAt;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 更新项目PRD
   * @param prd 新PRD
   */
  updatePrd(prd: string): void {
    this.prd = prd;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * 获取所有功能
   * @returns 功能数组
   */
  getFeatures(): Feature[] {
    return this.features;
  }

  /**
   * 获取所有任务
   * @returns 任务数组
   */
  getTasks(): Task[] {
    return this.tasks;
  }

  /**
   * 根据状态获取任务
   * @param status 任务状态
   * @returns 符合状态的任务数组
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * 获取所有功能中的所有任务
   * @returns 所有功能中的任务数组
   */
  getAllFeatureTasks(): Task[] {
    const allTasks: Task[] = [];
    this.features.forEach(feature => {
      allTasks.push(...feature.getTasks());
    });
    return allTasks;
  }

  /**
   * 获取所有功能中特定状态的任务
   * @param status 任务状态
   * @returns 所有功能中符合状态的任务数组
   */
  getAllFeatureTasksByStatus(status: TaskStatus): Task[] {
    const allTasks: Task[] = [];
    this.features.forEach(feature => {
      allTasks.push(...feature.getTasksByStatus(status));
    });
    return allTasks;
  }

  /**
   * 将项目对象转换为普通对象，用于JSON序列化
   * @returns 普通对象
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      startAt: this.startAt,
      prd: this.prd,
      features: this.features,
      tasks: this.tasks,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}