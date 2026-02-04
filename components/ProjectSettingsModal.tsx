
import React, { useState } from 'react';
import { X, Save, Trash2, CheckCircle2, Folder, Settings, Terminal, Cpu, Layers, Globe, Database, Briefcase } from 'lucide-react';
import { Integration, Theme, Project } from '../types';

interface Props {
  project: Project;
  integrations: Integration[];
  theme: Theme;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onDelete: (id: string) => void;
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

const ProjectSettingsModal: React.FC<Props> = ({ project, integrations, theme, onClose, onUpdate, onDelete }) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState(project.name);
  const [selectedIcon, setSelectedIcon] = useState(project.icon || 'folder');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(project.integrationIds));

  const toggleIntegration = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onUpdate({
      ...project,
      name,
      icon: selectedIcon,
      integrationIds: Array.from(selectedIds),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl border transition-colors ${
        isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <Settings className="h-5 w-5" />
            </div>
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Project Settings</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Project Name</label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>
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
            <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Connected Integrations</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
              {integrations.map(int => (
                <div
                  key={int.id}
                  onClick={() => toggleIntegration(int.id)}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    selectedIds.has(int.id)
                      ? (isDark ? 'bg-blue-600/10 border-blue-500/50' : 'bg-blue-50 border-blue-400 shadow-sm shadow-blue-500/5')
                      : (isDark ? 'border-[#222] hover:bg-[#1a1a1a]' : 'border-gray-100 hover:bg-gray-50')
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedIds.has(int.id) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-400'}`}>
                    {selectedIds.has(int.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium block truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{int.name}</span>
                    <span className="text-[9px] uppercase font-bold text-gray-500">{int.endpoints.length} endpoints available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this project? All chat history will be lost.')) {
                  onDelete(project.id);
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs"
            >
              <Trash2 className="h-4 w-4" /> Delete Project
            </button>
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all text-white shadow-lg shadow-blue-500/20"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
