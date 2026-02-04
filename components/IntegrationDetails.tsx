
import React, { useState } from 'react';
import { X, Globe, Shield, Trash2, Save, Terminal, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Integration, Endpoint, Theme } from '../types';

interface Props {
  integration: Integration;
  theme: Theme;
  onClose: () => void;
  onUpdate: (integration: Integration) => void;
  onDelete: (id: string) => void;
}

const IntegrationDetails: React.FC<Props> = ({ integration, theme, onClose, onUpdate, onDelete }) => {
  const isDark = theme === 'dark';
  const [apiKey, setApiKey] = useState(integration.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(integration.baseUrl || '');

  const handleSave = () => {
    onUpdate({
      ...integration,
      apiKey,
      baseUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border transition-colors ${
        isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600/10 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{integration.name}</h2>
              <p className={`text-[10px] uppercase tracking-wider font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>MCP Server Config</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#222] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Documentation</label>
                <a 
                  href={integration.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-sm transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  <Globe className="h-4 w-4" /> 
                  <span className="truncate max-w-[200px]">{integration.docsUrl}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Auth Type</label>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Shield className="h-4 w-4 text-green-500" />
                  {integration.authType}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>API Key / Token</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  placeholder="Update token..."
                />
              </div>
              <div>
                <label className={`block text-[10px] font-bold uppercase mb-1.5 tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Tools List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className={`block text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Exposed Tools ({integration.endpoints.length})
              </label>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-500 font-bold">ACTIVE</span>
              </div>
            </div>
            <div className={`space-y-2 border rounded-xl overflow-hidden transition-colors ${isDark ? 'bg-[#0a0a0a] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
              {integration.endpoints.map(ep => (
                <div key={ep.id} className={`p-3 border-b last:border-0 flex items-center justify-between transition-colors ${isDark ? 'border-[#222] hover:bg-[#111]' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      ep.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      ep.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>{ep.method}</span>
                    <div>
                      <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{ep.path}</p>
                      <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{ep.description}</p>
                    </div>
                  </div>
                  <CheckCircle2 className={`h-4 w-4 ${isDark ? 'text-blue-500/50' : 'text-blue-600/50'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
            <button 
              onClick={() => {
                if(confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
                  onDelete(integration.id);
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all font-medium text-sm"
            >
              <Trash2 className="h-4 w-4" /> Disconnect
            </button>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'hover:bg-[#222] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all text-white shadow-lg shadow-blue-500/20"
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

export default IntegrationDetails;
