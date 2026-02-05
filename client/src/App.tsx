import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import ChatInterface from './features/chat/ChatInterface';
import IntegrationSetup from './features/integrations/IntegrationSetup';
import IntegrationDetails from './features/integrations/IntegrationDetails';
import UserProfileModal from './features/user/UserProfileModal';
import ProjectSetupModal from './features/projects/ProjectSetupModal';
import ProjectSettingsModal from './features/projects/ProjectSettingsModal';
import Dashboard from './features/dashboard/Dashboard';
import { Integration, Theme, UserProfile, Project, Message } from './types';

// Wrapper for ChatInterface to handle routing params
const ChatInterfaceWrapper: React.FC<{
  projects: Project[];
  allIntegrations: Integration[];
  theme: Theme;
  onUpdateMessages: (messages: Message[]) => void;
  onOpenSidebar: () => void;
  onOpenProjectSettings: () => void;
}> = ({ projects, ...props }) => {
  const { projectId } = useParams();
  const project = projects.find(p => p.id === projectId);

  if (!project) return <Navigate to="/" replace />;

  return <ChatInterface project={project} {...props} />;
};

const App: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectSetupOpen, setIsProjectSetupOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  // activeProjectId is now derived from URL
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'hunain',
    email: 'user@mcpforge.ai',
    plan: 'Pro'
  });

  const location = useLocation();
  // Derive activeProjectId from current URL for legacy uses if any, but mostly redundant now
  const activeProjectId = location.pathname.startsWith('/projects/')
    ? location.pathname.split('/')[2]
    : null;

  const handleAddIntegration = (integration: Integration) => {
    setIntegrations(prev => [...prev, integration]);
  };

  const handleAddProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
    // Navigation is handled by Sidebar Link or navigate() if we wanted to auto-redirect
    setIsProjectSetupOpen(false);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Redirect if deleting current project is handled by Router (if we were on that page, user is still there potentially)
    // Ideally we should navigate to home if current project is deleted.
    // simpler: If we are on that project page, it will redirect to home due to wrapper check.
  };

  const handleUpdateMessages = (messages: Message[]) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, messages } : p));
  };

  const handleUpdateIntegration = (updated: Integration) => {
    setIntegrations(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleRemoveIntegration = (id: string) => {
    setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const openSettings = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectSettingsOpen(true);
  };

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-[#0a0a0a] text-[#ededed]' : 'bg-gray-50 text-gray-900';
  }, [theme]);

  return (
    <div className={`flex h-screen w-full overflow-hidden relative ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        projects={projects}
        theme={theme}
        userProfile={userProfile}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onAddProject={() => setIsProjectSetupOpen(true)}
        onToggleTheme={toggleTheme}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenProfile={() => setIsProfileOpen(true)}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={
            <Dashboard
              user={userProfile}
              projects={projects}
              integrations={integrations}
              theme={theme}
              onAddProject={() => setIsProjectSetupOpen(true)}
              onAddIntegration={() => setIsSetupOpen(true)}
              onOpenIntegration={setSelectedIntegration}
              onOpenProjectSettings={openSettings}
            />
          } />
          <Route path="/projects/:projectId" element={
            <ChatInterfaceWrapper
              projects={projects}
              allIntegrations={integrations}
              theme={theme}
              onUpdateMessages={handleUpdateMessages}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenProjectSettings={() => openSettings(projects.find(p => p.id === activeProjectId) as Project)}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {isSetupOpen && (
        <IntegrationSetup
          onClose={() => setIsSetupOpen(false)}
          onComplete={handleAddIntegration}
          theme={theme}
        />
      )}

      {isProjectSetupOpen && (
        <ProjectSetupModal
          integrations={integrations}
          theme={theme}
          onClose={() => setIsProjectSetupOpen(false)}
          onComplete={handleAddProject}
        />
      )}

      {isProjectSettingsOpen && projectToEdit && (
        <ProjectSettingsModal
          project={projectToEdit}
          integrations={integrations}
          theme={theme}
          onClose={() => {
            setIsProjectSettingsOpen(false);
            setProjectToEdit(null);
          }}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      )}

      {selectedIntegration && (
        <IntegrationDetails
          integration={selectedIntegration}
          theme={theme}
          onClose={() => setSelectedIntegration(null)}
          onUpdate={handleUpdateIntegration}
          onDelete={handleRemoveIntegration}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal
          profile={userProfile}
          theme={theme}
          onClose={() => setIsProfileOpen(false)}
          onUpdate={setUserProfile}
        />
      )}
    </div>
  );
};

export default App;
