import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewProject } from "./components/NewProject";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskDetail } from "./components/TaskDetail";
import { ProjectsList } from "./components/ProjectsList";
import { SettingsModal } from "./components/SettingsModal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { ReviewProject } from "./components/ReviewProject";
import { getProjects, saveProject, createDemoProject } from "./utils/storage";
import "./i18n"; // 导入i18n配置

const queryClient = new QueryClient();

type AppView = 'projects' | 'new-project' | 'kanban';

// 包装组件，用于从URL参数中获取projectId
const KanbanBoardWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const handleBackToProjects = () => {
    navigate('/');
  };
  
  if (!projectId) {
    navigate('/');
    return null;
  }
  
  return (
    <KanbanBoard
      projectId={projectId}
      onBack={handleBackToProjects}
    />
  );
};

// 包装组件，用于从URL参数中获取projectId并传递给ReviewProject
const ReviewProjectWrapper = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  const handleBackToProjects = () => {
    navigate('/');
  };
  
  const handleProjectConfirmed = (project: any) => {
    // 导航到项目看板页面
    navigate(`/project/${project.id}`);
  };
  
  const handleOpenSettings = () => {
    setShowSettings(true);
  };
  
  if (!projectId) {
    navigate('/');
    return null;
  }
  
  // 获取项目数据
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    navigate('/');
    return null;
  }
  
  return (
    <>
      <ReviewProject
        project={project}
        onProjectConfirmed={handleProjectConfirmed}
        onBack={handleBackToProjects}
        onOpenSettings={handleOpenSettings}
      />
      <SettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('projects');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showDemoButton, setShowDemoButton] = useState(false);

  useEffect(() => {
    // Check if this is first load and show demo button if no projects exist
    const projects = getProjects();
    if (projects.length === 0) {
      setShowDemoButton(true);
      setCurrentView('new-project');
    }
  }, []);

  const handleProjectGenerated = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView('kanban');
    // 导航到项目审查页面
    window.location.href = `/review/${projectId}`;
  };

  const handleBackToProjects = () => {
    setCurrentView('projects');
    setCurrentProjectId('');
  };

  const handleNewProject = () => {
    setCurrentView('new-project');
  };

  const handleTryDemo = () => {
    const demoProject = createDemoProject();
    saveProject(demoProject);
    setCurrentProjectId(demoProject.id);
    setCurrentView('kanban');
    setShowDemoButton(false);
    // 导航到项目看板页面
    window.location.href = `/project/${demoProject.id}`;
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={
                currentView === 'projects' ? (
                  <ProjectsList 
                    onNewProject={handleNewProject}
                  />
                ) : currentView === 'new-project' ? (
                  <NewProject
                    onProjectGenerated={handleProjectGenerated}
                    onOpenSettings={() => setShowSettings(true)}
                    onTryDemo={handleTryDemo}
                    showDemoButton={showDemoButton}
                  />
                ) : null
              } />
              
              <Route path="/review/:projectId" element={
                <ReviewProjectWrapper />
              } />
              
              <Route path="/project/:projectId" element={
                <KanbanBoardWrapper />
              } />
              
              <Route path="/project/:projectId/task/:taskId" element={
                <TaskDetail />
              } />
            </Routes>
            
            <SettingsModal
              open={showSettings}
              onOpenChange={setShowSettings}
            />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;