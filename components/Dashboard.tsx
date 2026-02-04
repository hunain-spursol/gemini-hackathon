import React from 'react';
import { Plus, LayoutGrid, Terminal, Clock, Folder, ChevronRight, Settings, Cpu, Layers, Globe, Database, Briefcase, Zap } from 'lucide-react';
import { Project, Integration, Theme, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  projects: Project[];
  integrations: Integration[];
  theme: Theme;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onAddIntegration: () => void;
  onOpenIntegration: (int: Integration) => void;
  onOpenProjectSettings: (project: Project) => void;
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

const Dashboard: React.FC<Props> = ({
  user,
  projects,
  integrations,
  theme,
  onSelectProject,
  onAddProject,
  onAddIntegration,
  onOpenIntegration,
  onOpenProjectSettings
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 relative transition-colors duration-500 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
      {/* Background Gradient Fade (Top to Bottom) */}
      <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 -z-10 ${isDark
          ? 'bg-gradient-to-b from-blue-900/15 via-[#0a0a0a] to-[#0a0a0a]'
          : 'bg-gradient-to-b from-blue-100/40 via-gray-50 to-gray-50'
        }`} />

      {/* Background Glows for Depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 select-none">
        <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] blur-[120px] rounded-full transition-colors duration-1000 ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/5'}`}></div>
        <div className={`absolute top-[-15%] left-[-10%] w-[40%] h-[40%] blur-[160px] rounded-full transition-colors duration-1000 ${isDark ? 'bg-blue-600/15' : 'bg-blue-400/5'}`}></div>
        <div className={`absolute top-[-15%] right-[-10%] w-[40%] h-[40%] blur-[160px] rounded-full transition-colors duration-1000 ${isDark ? 'bg-purple-600/15' : 'bg-purple-400/5'}`}></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-16 pb-20 relative z-10">
        {/* Compact Welcome Section */}
        <div className="text-center space-y-4 pt-4 pb-4">
          <div className="inline-flex items-center justify-center p-px rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-1">
            <div className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
              System Online
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
            Hi, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 via-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
              {user.name.split(' ')[0]}
            </span>!
          </h1>
          <p className={`text-lg md:text-xl font-medium max-w-xl mx-auto leading-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Ready to build something amazing today?
          </p>
        </div>

        {/* Sections Stacking Vertically */}
        <div className="flex flex-col gap-16">

          {/* Main Action Area: Active Integrations (Primary Selling Point) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                  <Terminal className="h-5 w-5" />
                </div>
                Active Integrations
              </h2>
              <button
                onClick={onAddIntegration}
                className={`flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-black transition-all transform active:scale-95 text-white shadow-lg shadow-purple-500/20`}
              >
                <Plus className="h-4 w-4" /> Add Server
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.length === 0 ? (
                <div onClick={onAddIntegration} className={`col-span-full p-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group transition-all ${isDark ? 'border-[#222] hover:border-purple-500/50 hover:bg-purple-500/5' : 'border-gray-100 hover:border-purple-400 hover:bg-purple-50/30'
                  }`}>
                  <Zap className={`h-10 w-10 mb-4 transition-transform group-hover:scale-110 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`font-bold text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No servers connected.<br />Start by adding an API.</p>
                </div>
              ) : (
                integrations.map(int => (
                  <div
                    key={int.id}
                    onClick={() => onOpenIntegration(int)}
                    className={`p-5 border rounded-[1.75rem] cursor-pointer transition-all flex flex-col gap-4 group ${isDark ? 'bg-[#0f0f0f]/60 border-[#222] hover:border-purple-500/40' : 'bg-white border-gray-100 hover:border-purple-400 shadow-sm'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 transition-all group-hover:rotate-6 ${isDark ? 'bg-[#1a1a1a] text-purple-400 border border-[#333]' : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                        {int.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-bold truncate text-base ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{int.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Connected</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full w-fit ${isDark ? 'bg-[#1a1a1a] text-gray-500' : 'bg-gray-100 text-gray-600'}`}>
                      {int.endpoints.length} TOOLS EXPOSED
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Secondary Area: Active Projects */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className={`text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <LayoutGrid className="h-5 w-5" />
                </div>
                Active Projects
              </h2>
              <button
                onClick={onAddProject}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black transition-all transform active:scale-95 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  }`}
              >
                <Plus className="h-4 w-4" /> New Project
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div onClick={onAddProject} className={`col-span-full p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group transition-all ${isDark ? 'border-[#222] hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-gray-100 hover:border-blue-400 hover:bg-blue-50/30'
                  }`}>
                  <Folder className={`h-8 w-8 mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Create a project to start</p>
                </div>
              ) : (
                projects.map(project => {
                  const ProjectIcon = ICONS[project.icon || 'folder'] || Folder;
                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className={`relative p-5 border rounded-[1.75rem] cursor-pointer transition-all hover:translate-x-1 flex items-center gap-4 group overflow-hidden ${isDark
                          ? 'bg-[#0f0f0f]/80 border-[#222] hover:border-blue-500/40 shadow-xl shadow-black/40'
                          : 'bg-white border-gray-100 hover:border-blue-400 shadow-md'
                        }`}
                    >
                      <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${isDark ? 'bg-[#1a1a1a] text-blue-400 shadow-inner shadow-black' : 'bg-blue-50 text-blue-600'}`}>
                        <ProjectIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.name}</h3>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5">
                          {project.integrationIds.length} ACTIVE TOOLS
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProjectSettings(project);
                          }}
                          className={`p-2 rounded-lg transition-all active:scale-90 ${isDark ? 'hover:bg-white/10 text-gray-600 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <ChevronRight className={`h-4 w-4 transition-all group-hover:translate-x-1 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
