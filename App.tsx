
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import IntegrationSetup from './components/IntegrationSetup';
import IntegrationDetails from './components/IntegrationDetails';
import UserProfileModal from './components/UserProfileModal';
import ProjectSetupModal from './components/ProjectSetupModal';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import Dashboard from './components/Dashboard';
import { Integration, Theme, UserProfile, Project, Message } from './types';

const App: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProjectSetupOpen, setIsProjectSetupOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'hunain',
    email: 'user@mcpforge.ai',
    plan: 'Pro'
  });

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleAddIntegration = (integration: Integration) => {
    setIntegrations(prev => [...prev, integration]);
  };

  const handleAddProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setActiveProjectId(project.id);
    setIsProjectSetupOpen(false);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
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

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setIsSidebarOpen(false);
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
        activeProjectId={activeProjectId}
        theme={theme}
        userProfile={userProfile}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onAddProject={() => setIsProjectSetupOpen(true)}
        onSelectProject={handleSelectProject}
        onGoHome={() => setActiveProjectId(null)}
        onToggleTheme={toggleTheme}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenProfile={() => setIsProfileOpen(true)}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {activeProject ? (
          <ChatInterface 
            project={activeProject}
            allIntegrations={integrations}
            theme={theme} 
            onUpdateMessages={handleUpdateMessages}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenProjectSettings={() => openSettings(activeProject)}
          />
        ) : (
          <Dashboard
            user={userProfile}
            projects={projects}
            integrations={integrations}
            theme={theme}
            onSelectProject={handleSelectProject}
            onAddProject={() => setIsProjectSetupOpen(true)}
            onAddIntegration={() => setIsSetupOpen(true)}
            onOpenIntegration={setSelectedIntegration}
            onOpenProjectSettings={openSettings}
          />
        )}
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
