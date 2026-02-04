
import React, { useState } from 'react';
import { X, FolderPlus, CheckCircle2, Folder, Terminal, Cpu, Layers, Globe, Database, Briefcase } from 'lucide-react';
import { Integration, Theme, Project } from '../types';

interface Props {
  integrations: Integration[];
  theme: Theme;
  onClose: () => void;
  onComplete: (project: Project) => void;
}

const ICONS = [
  { id: 'folder', Icon: Folder },
  { id: 'terminal', Icon: Terminal },
  { id: 'cpu', Icon: Cpu },
  { id: 'layers', Icon: Layers },
  { id: 'globe', Icon: Globe },
  { id: 'database', Icon: Database },
  { id: 'briefcase', Icon: Briefcase },
];

const ProjectSetupModal: React.FC<Props> = ({ integrations, theme, onClose, onComplete }) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleIntegration = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      icon: selectedIcon,
      integrationIds: Array.from(selectedIds),
      messages: [],
      createdAt: Date.now()
    };
    onComplete(newProject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border transition-colors ${
        isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
          <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>New Project</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Project Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Startup, Enterprise Work..."
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-3 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Project Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedIcon === id
                      ? (isDark ? 'bg-blue-600 border-blue-600 text-white' : 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20')
                      : (isDark ? 'bg-[#1a1a1a] border-[#333] text-gray-500 hover:border-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300')
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Select Integrations</label>
            {integrations.length === 0 ? (
              <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No integrations connected yet. Close this and add some first!</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                {integrations.map(int => (
                  <div
                    key={int.id}
                    onClick={() => toggleIntegration(int.id)}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedIds.has(int.id)
                        ? (isDark ? 'bg-blue-600/10 border-blue-500/50' : 'bg-blue-50 border-blue-400')
                        : (isDark ? 'border-[#222] hover:bg-[#1a1a1a]' : 'border-gray-100 hover:bg-gray-50')
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedIds.has(int.id) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-400'}`}>
                      {selectedIds.has(int.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{int.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500 rounded-xl font-bold text-sm transition-all text-white shadow-lg shadow-blue-500/20"
          >
            <FolderPlus className="h-4 w-4" /> Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSetupModal;
