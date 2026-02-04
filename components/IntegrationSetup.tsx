
import React, { useState } from 'react';
import { Search, Globe, ChevronRight, CheckCircle2, Shield, ArrowLeft, Loader2, X } from 'lucide-react';


import { searchForDocs, analyzeCapabilities, analyzeAuthRequirements } from '../services/geminiService';
import { Integration, Endpoint, Theme, Capability, AuthConfig } from '../types';

interface Props {
  onClose: () => void;
  onComplete: (integration: Integration) => void;
  theme: Theme;
}


type Step = 'name' | 'discovery' | 'manual' | 'capabilities' | 'config' | 'confirm';

const IntegrationSetup: React.FC<Props> = ({ onClose, onComplete, theme }) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedCapabilityIds, setSelectedCapabilityIds] = useState<Set<string>>(new Set());
  const [fileContent, setFileContent] = useState<string>('');
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const handleSearch = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const result = await searchForDocs(name);
      if (result && result.url) {
        setDocsUrl(result.url);
        setDescription(result.description);
        setStep('discovery');
      } else {
        setStep('manual');
      }
    } catch (error) {
      console.error(error);
      setStep('manual');
    } finally {
      setLoading(false);
    }
  };



  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const result = await analyzeCapabilities(docsUrl, name, fileContent);
      setCapabilities(result);
      setSelectedCapabilityIds(new Set(result.map(c => c.id)));
      setStep('capabilities');

      // Pre-fetch auth requirements while user selects capabilities
      analyzeAuthRequirements(docsUrl, name, fileContent).then(config => {
        setAuthConfig(config);
        // Initialize default values
        const defaults: Record<string, string> = {};
        config.fields.forEach(f => {
          defaults[f.key] = '';
        });
        setConfigValues(defaults);
      }).catch(console.error);

    } catch (error) {
      console.error(error);
      alert("Failed to analyze capabilities.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = (id: string) => {
    const next = new Set(selectedCapabilityIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCapabilityIds(next);
  };

  const finalize = () => {
    // Collect specific endpoints from selected capabilities
    const selectedCapabilities = capabilities.filter(c => selectedCapabilityIds.has(c.id));
    const allEndpoints = selectedCapabilities.flatMap(c => c.endpoints);

    // Remove duplicates based on endpoint ID
    const uniqueEndpointsMap = new Map();
    allEndpoints.forEach(ep => uniqueEndpointsMap.set(ep.id, ep));
    const uniqueEndpoints = Array.from(uniqueEndpointsMap.values());

    const newIntegration: Integration = {
      id: crypto.randomUUID(),
      name,
      description,
      docsUrl,
      endpoints: uniqueEndpoints,
      status: 'connected',
      authConfig: authConfig || undefined,
      config: configValues,
      createdAt: Date.now()
    };
    onComplete(newIntegration);
    setStep('confirm');
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connect a new service</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Tell us what platform you want to turn into an AI tool.</p>
            </div>
            <div className="relative">
              <input
                autoFocus
                type="text"
                placeholder="e.g. Jira, Slack, Notion, Stripe..."
                className={`w-full border rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg transition-all ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !name}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors text-white"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Github', 'Trello', 'Linear', 'Zendesk'].map(item => (
                <button
                  key={item}
                  onClick={() => setName(item)}
                  className={`p-3 border rounded-lg text-left transition-all ${isDark
                    ? 'border-[#333] text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/5'
                    : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                >
                  <span className="text-sm font-medium">{item}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'discovery':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-blue-500">Documentation Found</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>We've located the API reference for {name}.</p>
            </div>
            <div className={`p-4 border rounded-xl flex items-start gap-4 ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
              <Globe className={`h-6 w-6 mt-1 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="min-w-0">
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium hover:underline break-all ${isDark ? 'text-blue-100' : 'text-blue-900'}`}
                >
                  {docsUrl}
                </a>
                <p className={`text-sm mt-1 ${isDark ? 'text-blue-300/70' : 'text-blue-600/80'}`}>{description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('manual')}
                className={`flex-1 px-4 py-3 border rounded-xl transition-colors font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                Wrong URL?
              </button>
              <button
                onClick={handleAnalysis}
                disabled={loading}
                className="flex-[2] px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg text-white flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Parse Capabilities <ChevronRight className="h-5 w-5" /></>}
              </button>
            </div>
          </div>
        );

      case 'capabilities':
        return (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Select Features</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>What would you like your AI agent to do with {name}?</p>
            </div>
            <div className={`max-h-[300px] overflow-y-auto space-y-3 pr-2 border-y py-4 ${isDark ? 'border-[#333]' : 'border-gray-200'}`}>
              {capabilities.map(cap => (
                <div
                  key={cap.id}
                  onClick={() => toggleCapability(cap.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${selectedCapabilityIds.has(cap.id)
                    ? (isDark ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-400')
                    : (isDark ? 'bg-transparent border-[#333] opacity-60' : 'bg-transparent border-gray-100 opacity-60')
                    }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedCapabilityIds.has(cap.id) ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-400'}`}>
                    {selectedCapabilityIds.has(cap.id) && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{cap.name}</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{cap.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cap.endpoints.slice(0, 3).map(ep => (
                        <span key={ep.id} className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${isDark ? 'bg-[#222] border-[#333] text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                          {ep.method} {ep.path}
                        </span>
                      ))}
                      {cap.endpoints.length > 3 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          +{cap.endpoints.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('discovery')}
                className={`px-4 py-3 border rounded-xl transition-colors ${isDark ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                Back
              </button>
              <button
                onClick={() => setStep('config')}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all text-white"
              >
                Configure Authentication
              </button>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connect & Secure</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Securely provide credentials for the {name} API.</p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Analyzing authentication requirements...</p>
              </div>
            ) : !authConfig ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load configuration.</p>
                <button onClick={() => handleAnalysis()} className="text-blue-500 underline">Retry</button>
              </div>
            ) : (
              <div className="space-y-4">
                {authConfig.fields.map((field) => (
                  <div key={field.key}>
                    <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      {field.type === 'password' && <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />}
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className={`w-full border rounded-lg ${field.type === 'password' ? 'pl-10' : 'px-4'} pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        value={configValues[field.key] || ''}
                        onChange={(e) => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    </div>
                    {field.description && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{field.description}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('capabilities')} className={`px-4 py-3 border rounded-xl ${isDark ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}>Back</button>
              <button
                onClick={finalize}
                disabled={loading || !authConfig || authConfig.fields.some(f => f.required && !configValues[f.key])}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-400 rounded-xl font-bold text-white"
              >
                Connect {name}
              </button>
            </div>
          </div>
        );

      case 'manual':
        return (
          <div className="space-y-6">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Manual Setup</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>We couldn't auto-discover the documentation. Please provide it manually.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Documentation URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="https://api.example.com/docs"
                    className={`w-full border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    value={docsUrl}
                    onChange={(e) => setDocsUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className={`w-full border-t ${isDark ? 'border-[#333]' : 'border-gray-200'}`} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${isDark ? 'bg-[#0f0f0f] text-gray-500' : 'bg-white text-gray-500'}`}>Or upload file</span>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Upload Documentation (JSON/Markdown)</label>
                <input
                  type="file"
                  accept=".json,.md,.txt,.yml,.yaml"
                  className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white file:bg-[#333] file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2' : 'bg-gray-50 border-gray-200 text-gray-900 file:bg-gray-200 file:text-gray-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2'
                    }`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setFileContent(e.target?.result as string);
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('name')}
                className={`px-4 py-3 border rounded-xl transition-colors ${isDark ? 'bg-[#1a1a1a] border-[#333] hover:bg-[#222] text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                Back
              </button>
              <button
                onClick={handleAnalysis}
                disabled={loading || (!docsUrl && !fileContent)}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg text-white flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Parse Capabilities <ChevronRight className="h-5 w-5" /></>}
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="text-center py-10 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connected!</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>The <strong>{name}</strong> MCP server is now active and accessible to your AI agent.</p>
            </div>
            <button
              onClick={onClose}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                }`}
            >
              Start Chatting
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border transition-colors ${isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-white border-gray-200'
        }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-[#222]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className={`font-bold tracking-tight text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>MCP Setup Wizard</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#222] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default IntegrationSetup;
