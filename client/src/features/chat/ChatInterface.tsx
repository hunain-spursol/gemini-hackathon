
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Terminal, Menu, Settings, Folder, Cpu, Layers, Globe, Database, Briefcase } from 'lucide-react';
import { chatWithAgent } from '../../services/geminiService';
import { Integration, Message, Theme, Project } from '../../types';

interface Props {
  project: Project;
  allIntegrations: Integration[];
  theme: Theme;
  onUpdateMessages: (messages: Message[]) => void;
  onOpenSidebar: () => void;
  onOpenProjectSettings: () => void;
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

const ChatInterface: React.FC<Props> = ({
  project,
  allIntegrations,
  theme,
  onUpdateMessages,
  onOpenSidebar,
  onOpenProjectSettings
}) => {
  const isDark = theme === 'dark';
  const projectIntegrations = allIntegrations.filter(i => project.integrationIds.includes(i.id));
  const ProjectIcon = ICONS[project.icon || 'folder'] || Folder;

  // Initialize messages from project or default welcome
  const [messages, setMessages] = useState<Message[]>(project.messages.length > 0 ? project.messages : [
    {
      id: '1',
      role: 'assistant',
      content: projectIntegrations.length > 0
        ? `Hello! This project is connected to ${projectIntegrations.map(i => i.name).join(', ')}. How can I help you?`
        : "Welcome! This project doesn't have any integrations yet. Add some to get started.",
      timestamp: Date.now()
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep messages in sync with parent when they change locally
  useEffect(() => {
    onUpdateMessages(messages);
  }, [messages]);

  // Handle project switching - reset local message state
  useEffect(() => {
    setMessages(project.messages.length > 0 ? project.messages : [
      {
        id: '1',
        role: 'assistant',
        content: projectIntegrations.length > 0
          ? `Hello! This project is connected to ${projectIntegrations.map(i => i.name).join(', ')}. How can I help you?`
          : "Welcome! This project doesn't have any integrations yet. Add some to get started.",
        timestamp: Date.now()
      }
    ]);
  }, [project.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Only pass integrations relevant to THIS project
      const response = await chatWithAgent(input, projectIntegrations, history);

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text || "I processed your request, but had no text output.",
        timestamp: Date.now(),
        toolCalls: response.functionCalls || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Sorry, I encountered an error connecting to the intelligence core.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-4 border-b z-20 transition-colors ${isDark ? 'bg-[#0a0a0a]/80 border-[#1a1a1a] text-white' : 'bg-white/80 border-gray-200 text-gray-900'} backdrop-blur-md sticky top-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <ProjectIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold tracking-tight text-sm md:text-base">
                  <span className="text-blue-500">Project:</span> {project.name}
                </h1>
                <button
                  onClick={onOpenProjectSettings}
                  className={`p-1 rounded hover:bg-gray-500/10 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {projectIntegrations.map(int => (
                  <span key={int.id} className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1.5 transition-all ${isDark ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-500 border border-gray-200 shadow-sm'
                    }`}>
                    <div className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </div>
                    {int.name}
                  </span>
                ))}
                {projectIntegrations.length === 0 && <span className="text-[9px] text-gray-500 italic">No integrations</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex -space-x-2">
            {projectIntegrations.slice(0, 3).map(int => (
              <div key={int.id} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-[#1a1a1a] border-[#0a0a0a] text-blue-400' : 'bg-white border-white text-blue-600 shadow-sm'}`}>
                {int.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'}`}></div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-8 space-y-8 relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 md:gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shrink-0 ${m.role === 'user'
                  ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                  : (isDark ? 'bg-[#1a1a1a] border border-[#333] text-blue-400' : 'bg-white border border-gray-200 text-blue-600')
                }`}>
                {m.role === 'user' ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
              </div>
              <div className={`space-y-3 max-w-[85%] ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`px-4 md:px-5 py-3 md:py-3 rounded-2xl leading-relaxed text-sm md:text-[15px] border ${m.role === 'user'
                    ? (isDark ? 'bg-[#1a1a1a] text-gray-200 border-[#333]' : 'bg-white text-gray-800 border-gray-200 shadow-sm')
                    : (isDark ? 'bg-[#0f0f0f]/50 text-gray-300 border-[#1a1a1a]' : 'bg-white/50 text-gray-700 border-gray-200')
                  }`}>
                  {m.content}
                </div>

                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="space-y-2">
                    {m.toolCalls.map((tc, idx) => (
                      <div key={idx} className={`border rounded-xl p-3 flex items-center gap-3 ${isDark ? 'bg-[#111] border-[#333]' : 'bg-white border-gray-200 shadow-sm'
                        }`}>
                        <div className={`p-1.5 rounded-md ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                          <Terminal className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                          <p className={`text-[10px] md:text-xs font-mono truncate ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>MCP_CALL: {tc.name}</p>
                          <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
                            {Object.entries(tc.args).map(([key, val]) => (
                              <span key={key} className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded truncate ${isDark ? 'bg-[#222] text-gray-500' : 'bg-gray-100 text-gray-500'}`}>
                                {key}: {String(val)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] md:text-[10px] font-bold text-green-500 uppercase shrink-0">Success</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1a1a1a] border border-[#333] text-blue-400' : 'bg-white border border-gray-200 text-blue-600'}`}>
                <Bot className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className={`px-4 py-4 rounded-2xl border ${isDark ? 'bg-[#0f0f0f]/50 border-[#1a1a1a]' : 'bg-white/50 border-gray-200'}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className={`absolute -inset-0.5 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition-opacity bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            <div className={`relative border rounded-2xl flex items-end p-2 pl-3 md:pl-4 transition-colors ${isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-white border-gray-200 shadow-sm'}`}>
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={projectIntegrations.length > 0 ? `Ask your project tools (${projectIntegrations.length} active)...` : "No integrations in this project..."}
                className={`w-full bg-transparent border-none focus:ring-0 py-3 text-sm md:text-[15px] resize-none max-h-40 outline-none ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || projectIntegrations.length === 0}
                className={`p-2.5 md:p-3 mb-1 rounded-xl transition-all shadow-lg active:scale-95 shrink-0 ${isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400'
                  }`}
              >
                {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <p className={`text-center text-[10px] mt-3 uppercase tracking-widest font-bold flex items-center justify-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <Sparkles className="h-3 w-3" /> Powered by Gemini
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
