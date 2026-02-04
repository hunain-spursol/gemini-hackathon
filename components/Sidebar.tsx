
import React from 'react';
import { Plus, Settings, Zap, Home, Folder, X, ChevronLeft, ChevronRight, Sun, Moon, Terminal, Cpu, Layers, Globe, Database, Briefcase } from 'lucide-react';
import { Project, Theme, UserProfile } from '../types';

interface Props {
  projects: Project[];
  activeProjectId: string | null;
  theme: Theme;
  userProfile: UserProfile;
  isOpen: boolean;
  isCollapsed: boolean;
  onAddProject: () => void;
  onSelectProject: (id: string) => void;
  onGoHome: () => void;
  onToggleTheme: () => void;
  onToggleCollapse: () => void;
  onOpenProfile: () => void;
  onClose: () => void;
}

const ICONS: Record<string, any> = {
  folder: Folder,
  terminal: Terminal,
  cpu: Cpu,
  layers: Layers,
  globe: Globe,
  database: Database,
  briefcase: Briefcase,
};

const Sidebar: React.FC<Props> = ({ 
  projects, 
  activeProjectId,
  theme, 
  userProfile,
  isOpen, 
  isCollapsed, 
  onAddProject, 
  onSelectProject, 
  onGoHome,
  onToggleTheme, 
  onToggleCollapse, 
  onOpenProfile,
  onClose 
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`
      fixed md:relative inset-y-0 left-0 z-50 h-full border-r flex flex-col transition-all duration-300 transform
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      ${isCollapsed ? 'md:w-20' : 'md:w-80 w-80'}
      ${isDark ? 'border-[#1a1a1a] bg-[#050505]' : 'border-gray-200 bg-white'}
    `}>
      {/* Header */}
      <div className={`p-4 md:p-6 border-b flex items-center justify-between overflow-hidden ${isDark ? 'border-[#1a1a1a]' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div onClick={onGoHome} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0 cursor-pointer">
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className={`text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Forge<span className="text-blue-500">MCP</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <button 
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors hidden md:block ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button 
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg transition-colors hidden md:block ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button 
            onClick={onClose}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Navigation */}
        <div className="space-y-1">
          <button
            onClick={onGoHome}
            title={isCollapsed ? "Dashboard" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              !activeProjectId 
                ? (isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600 font-bold')
                : (isDark ? 'text-gray-400 hover:bg-[#1a1a1a]' : 'text-gray-500 hover:bg-gray-50')
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Home className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="text-sm">Dashboard</span>}
          </button>
        </div>

        {/* Projects Section */}
        <div>
          <div className={`flex items-center mb-3 px-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed ? (
              <>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Projects</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-gray-500' : 'bg-gray-100 text-gray-600'}`}>
                  {projects.length}
                </span>
              </>
            ) : (
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>PRJ</span>
            )}
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => {
              const ProjectIcon = ICONS[project.icon || 'folder'] || Folder;
              return (
                <button 
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  title={isCollapsed ? project.name : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeProjectId === project.id
                      ? (isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600 font-bold')
                      : (isDark ? 'text-gray-400 hover:bg-[#1a1a1a]' : 'text-gray-500 hover:bg-gray-50')
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <ProjectIcon className={`h-4 w-4 shrink-0 ${activeProjectId === project.id ? 'text-blue-500' : ''}`} />
                  {!isCollapsed && <span className="text-sm truncate">{project.name}</span>}
                </button>
              );
            })}
            
            <button 
              onClick={onAddProject}
              title={isCollapsed ? "New Project" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border border-dashed ${
                isDark ? 'border-[#333] text-gray-600 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">New Project</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Profile */}
      <div className={`p-4 border-t transition-colors ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-gray-200 bg-gray-50'}`}>
        <div 
          onClick={onOpenProfile}
          className={`flex items-center rounded-xl transition-colors cursor-pointer group ${isCollapsed ? 'justify-center p-1' : 'gap-3 p-2'} ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-white hover:shadow-sm'}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 shadow-md shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
            {userProfile.avatar ? <img src={userProfile.avatar} className="w-full h-full rounded-full" /> : userProfile.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{userProfile.name}</p>
              <p className={`text-[10px] font-bold uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{userProfile.plan} Plan</p>
            </div>
          )}
          {!isCollapsed && (
            <Settings className={`h-4 w-4 transition-colors group-hover:rotate-45 ${isDark ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
