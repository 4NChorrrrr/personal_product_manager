import { Project, Config } from '../types/project';

const PROJECTS_KEY = 'ai-kanban-projects';
const CONFIG_KEY = 'ai-kanban-config';

export const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading projects from localStorage:', error);
    return [];
  }
};

export const saveProject = (project: Project): void => {
  try {
    const projects = getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving project to localStorage:', error);
  }
};

export const getProject = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

export const deleteProject = (id: string): void => {
  try {
    const projects = getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error deleting project from localStorage:', error);
  }
};

export const getConfig = (): Config => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    const defaultConfig: Config = {
      ollamaUrl: 'http://host.docker.internal:11434',
      modelName: 'llama3.1:8b',
      modelType: 'ollama',
      selectedProvider: '',
      selectedModel: '',
      customEndpoint: '',
      apiKey: ''
    };
    
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // 处理旧配置格式兼容性
      let config = {
        ...defaultConfig,
        ...parsed,
        modelType: parsed.modelType || 'ollama'
      };
      
      // 如果有旧的OpenAI配置，迁移到新格式
      if (parsed.openaiEndpoint && parsed.openaiApiKey && !config.selectedProvider) {
        config.selectedProvider = 'openai';
        config.customEndpoint = parsed.openaiEndpoint;
        config.apiKey = parsed.openaiApiKey;
        config.selectedModel = 'gpt-4o'; // 默认模型
      }
      
      return config;
    }
    
    return defaultConfig;
  } catch (error) {
    console.error('Error reading config from localStorage:', error);
    return {
      ollamaUrl: 'http://host.docker.internal:11434',
      modelName: 'llama3.1:8b',
      modelType: 'ollama',
      selectedProvider: '',
      selectedModel: '',
      customEndpoint: '',
      apiKey: ''
    };
  }
};

export const saveConfig = (config: Config): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving config to localStorage:', error);
  }
};

export const createDemoProject = (): Project => {
  return {
    id: 'demo-habit-tracker',
    name: 'Habit Tracker Web App',
    startAt: new Date().toISOString(),
    prd: `# Product Requirements Document: Minimalist Habit Tracker Web App

## Overview
A clean, intuitive web application that helps users build and maintain positive habits through simple daily tracking.

## Core Features
- **Habit Creation**: Users can create custom habits with names and optional descriptions
- **Daily Tracking**: Simple checkbox interface to mark habits as completed each day
- **Visual Progress**: Clean streak counters and progress indicators
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## User Experience
The app prioritizes simplicity and speed, allowing users to quickly check off completed habits without friction. Visual feedback encourages consistency through streak tracking and subtle animations.`,
    features: [
      {
        id: 1,
        title: 'Habit Management System',
        description: 'Create, edit, and delete personal habits with custom names and descriptions'
      },
      {
        id: 2,
        title: 'Daily Check-in Interface',
        description: 'Simple, fast checkbox interface for marking daily habit completion'
      },
      {
        id: 3,
        title: 'Progress Tracking',
        description: 'Visual streak counters and completion statistics to motivate users'
      },
      {
        id: 4,
        title: 'Responsive Mobile Design',
        description: 'Mobile-optimized interface for quick habit tracking on any device'
      }
    ],
    tasks: [
      // Feature 1 tasks
      { id: 'task-1-1', fid: 1, title: 'Create habit data models and TypeScript interfaces', status: 'todo' },
      { id: 'task-1-2', fid: 1, title: 'Build habit creation form with validation', status: 'todo' },
      { id: 'task-1-3', fid: 1, title: 'Implement habit editing and deletion functionality', status: 'todo' },
      { id: 'task-1-4', fid: 1, title: 'Add localStorage persistence for habit data', status: 'todo' },
      
      // Feature 2 tasks
      { id: 'task-2-1', fid: 2, title: 'Design daily habit list component', status: 'todo' },
      { id: 'task-2-2', fid: 2, title: 'Create checkbox interaction with smooth animations', status: 'todo' },
      { id: 'task-2-3', fid: 2, title: 'Build date navigation for viewing different days', status: 'todo' },
      
      // Feature 3 tasks
      { id: 'task-3-1', fid: 3, title: 'Calculate and display current streaks', status: 'todo' },
      { id: 'task-3-2', fid: 3, title: 'Create progress visualization charts', status: 'todo' },
      { id: 'task-3-3', fid: 3, title: 'Add completion percentage statistics', status: 'todo' },
      
      // Feature 4 tasks
      { id: 'task-4-1', fid: 4, title: 'Implement responsive grid layout', status: 'todo' },
      { id: 'task-4-2', fid: 4, title: 'Optimize touch interactions for mobile', status: 'todo' },
      { id: 'task-4-3', fid: 4, title: 'Test and refine mobile user experience', status: 'todo' }
    ]
  };
};