
import React, { useState } from 'react';
import { X, User, Mail, Shield, CreditCard, Save, LogOut, Camera, Check, Zap, Rocket, Building2, Key, Bell, Globe, Search, ChevronRight } from 'lucide-react';
import { UserProfile, Theme } from '../types';

interface Props {
  profile: UserProfile;
  theme: Theme;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
}

const PLANS = [
  {
    id: 'Free',
    name: 'Free',
    price: '0',
    icon: Zap,
    description: 'Perfect for exploring MCP Forge and local development.',
    features: ['3 Active Projects', '5 Integrations', 'Standard Speed', 'Community Support'],
    color: 'gray'
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: '29',
    icon: Rocket,
    description: 'Best for power users and professional builders.',
    features: ['Unlimited Projects', 'Unlimited Integrations', 'Gemini Pro Access', 'Priority Support'],
    color: 'blue',
    recommended: true
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 'Custom',
    icon: Building2,
    description: 'Full-scale solution for teams and organizations.',
    features: ['Dedicated Infra', 'SAML SSO', 'Advanced Security', '24/7 Support'],
    color: 'purple'
  }
];

const UserProfileModal: React.FC<Props> = ({ profile, theme, onClose, onUpdate }) => {
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'notifications'>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  const tabs = [
    { id: 'profile', label: 'Account Profile', icon: User, desc: 'Personal details & avatar' },
    { id: 'security', label: 'Security & Privacy', icon: Shield, desc: 'Authentication & API keys' },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard, desc: 'Subscription & invoices' },
    { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Alerts & email preferences' },
  ];

  const handlePlanSelect = (planId: 'Free' | 'Pro' | 'Enterprise') => {
    setFormData({ ...formData, plan: planId });
  };

  const filteredTabs = searchQuery 
    ? tabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 bg-black/90 backdrop-blur-xl transition-all duration-500 ease-out">
      <div className={`w-full max-w-6xl rounded-none md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border transition-all flex flex-col md:flex-row h-full md:h-[90vh] max-h-[900px] ${
        isDark ? 'bg-[#080808] border-[#1a1a1a]' : 'bg-white border-gray-100'
      }`}>
        
        {/* Navigation Sidebar */}
        <div className={`w-full md:w-80 border-r transition-all flex flex-col p-6 md:p-8 gap-8 ${
          isDark ? 'bg-[#050505] border-[#1a1a1a]' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <div className="space-y-1">
            <h1 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Workspace Preferences</p>
          </div>

          <div className="flex flex-col flex-1 gap-1">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? (isDark ? 'bg-blue-600/10 text-white' : 'bg-blue-50 text-blue-600 font-bold')
                    : (isDark ? 'text-gray-500 hover:bg-[#111] hover:text-gray-300' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
                }`}
              >
                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full" />
                )}
                
                <div className={`p-2 rounded-xl shrink-0 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-blue-600 text-white shadow-md shadow-blue-500/10') 
                    : (isDark ? 'bg-[#1a1a1a] group-hover:bg-[#222]' : 'bg-white shadow-sm group-hover:bg-gray-50')
                }`}>
                  <tab.icon className="h-4 w-4" />
                </div>
                <div className="text-left hidden md:block">
                  <span className={`text-sm block leading-none ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
                  <span className={`text-[10px] font-bold tracking-tight mt-1 block ${activeTab === tab.id ? 'opacity-70' : 'opacity-40'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-[#1a1a1a]/50 space-y-4">
            <button className={`w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 transition-all ${
              isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
            }`}>
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-colors ${isDark ? 'bg-[#080808]' : 'bg-white'}`}>
          {/* Header with Search */}
          <div className={`px-8 md:px-12 py-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-20 ${isDark ? 'border-[#1a1a1a] bg-[#080808]/80' : 'border-gray-50 bg-white/80'} backdrop-blur-xl`}>
            <div className="flex-1 max-w-md relative group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isDark ? 'text-gray-600 group-focus-within:text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
              <input 
                type="text" 
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                  isDark ? 'bg-[#0f0f0f] border-[#1a1a1a] text-white focus:border-blue-500/50' : 'bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-500'
                }`}
              />
            </div>
            <button onClick={onClose} className={`p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'hover:bg-[#1a1a1a] text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-8">
            <div className="max-w-5xl mx-auto h-full">
              
              {activeTab === 'profile' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                      <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-orange-500 via-red-500 to-pink-500 shadow-2xl overflow-hidden flex items-center justify-center text-white text-5xl font-black transition-all duration-700 group-hover:rotate-3 group-hover:scale-105 ${isDark ? 'ring-8 ring-[#1a1a1a]' : 'ring-8 ring-white'}`}>
                        {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : formData.name.charAt(0)}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-2xl border-4 border-transparent hover:border-white transition-all transform active:scale-90 hover:rotate-12">
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-center md:text-left space-y-3">
                      <div>
                        <h3 className={`text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{formData.name}</h3>
                        <p className={`text-base font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formData.email}</p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest uppercase border ${
                          formData.plan === 'Pro' ? 'bg-blue-600 text-white border-blue-400' : 
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {formData.plan} Plan
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Display Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full border rounded-[1.5rem] px-6 py-4 text-base font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                          isDark ? 'bg-[#0f0f0f] border-[#1a1a1a] text-white focus:border-blue-500/50 shadow-inner shadow-black' : 'bg-gray-50 border-gray-100 text-gray-900 shadow-sm focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full border rounded-[1.5rem] px-6 py-4 text-base font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                          isDark ? 'bg-[#0f0f0f] border-[#1a1a1a] text-white focus:border-blue-500/50 shadow-inner shadow-black' : 'bg-gray-50 border-gray-100 text-gray-900 shadow-sm focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Workspace Billing</h3>
                      <p className={`text-sm mt-0.5 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Select a plan to scale your MCP development.</p>
                    </div>
                    <div className={`px-5 py-2.5 rounded-2xl text-xs font-black ${isDark ? 'bg-[#1a1a1a] text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700'}`}>
                      Active: {formData.plan}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1">
                    {PLANS.map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => handlePlanSelect(plan.id as any)}
                        className={`relative p-6 border-2 rounded-[2.5rem] cursor-pointer transition-all duration-300 flex flex-col group h-full ${
                          formData.plan === plan.id
                            ? (isDark ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.1)]' : 'bg-blue-50 border-blue-500 shadow-xl shadow-blue-500/10')
                            : (isDark ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-gray-800' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg')
                        }`}
                      >
                        {plan.recommended && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white z-10 shadow-lg">
                            Most Popular
                          </div>
                        )}

                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-4 transition-all duration-500 group-hover:scale-110 ${
                          formData.plan === plan.id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : (isDark ? 'bg-[#1a1a1a] text-gray-500' : 'bg-gray-50 text-gray-400')
                        }`}>
                          <plan.icon className="h-7 w-7" />
                        </div>

                        <div className="mb-4">
                          <h4 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h4>
                          <p className={`text-xs mt-1 leading-tight h-8 line-clamp-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{plan.description}</p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-1">
                            {plan.price !== 'Custom' && <span className={`text-lg font-black ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>$</span>}
                            <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                            {plan.price !== 'Custom' && <span className={`text-[10px] font-bold ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>/mo</span>}
                          </div>
                        </div>

                        <div className="space-y-3 flex-1">
                          {plan.features.map(f => (
                            <div key={f} className="flex items-center gap-2">
                              <Check className={`h-3 w-3 shrink-0 ${formData.plan === plan.id ? 'text-blue-500' : 'text-gray-600'}`} />
                              <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{f}</span>
                            </div>
                          ))}
                        </div>

                        <button className={`mt-8 w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 ${
                          formData.plan === plan.id
                            ? (isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black')
                            : (isDark ? 'bg-[#1a1a1a] text-gray-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-600 group-hover:text-white')
                        }`}>
                          {formData.plan === plan.id ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-blue-600/5 border-blue-500/20 shadow-2xl shadow-blue-500/5' : 'bg-blue-50 border-blue-100 shadow-lg shadow-blue-500/5'}`}>
                    <div className="flex items-start gap-6">
                      <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-white shadow-sm text-blue-600'}`}>
                        <Shield className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className={`text-xl font-black mb-1 ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>Multi-Factor Authentication</h4>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Protect your account with an extra layer of security.</p>
                        <button className="mt-5 px-8 py-3.5 bg-blue-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95">
                          Secure Account
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Access Tokens</label>
                    <div className={`p-6 border rounded-[2rem] font-mono text-sm flex items-center justify-between gap-4 transition-all ${
                      isDark ? 'bg-[#050505] border-[#1a1a1a] text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-500'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Key className="h-4 w-4 shrink-0 text-blue-500" />
                        <span className="truncate">forge_live_••••••••••••••••••••••••••••</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-[10px] font-black uppercase px-4 py-2 rounded-xl bg-gray-500/10 hover:bg-gray-500/20">Copy</button>
                        <button className="text-[10px] font-black uppercase px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20">Revoke</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>System Preferences</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { label: 'Security Alerts', desc: 'Notify on new login attempts.', enabled: true, icon: Shield },
                        { label: 'Tool Performance', desc: 'Weekly metrics on tool executions.', enabled: true, icon: Zap },
                        { label: 'Platform News', desc: 'Updates on new MCP features.', enabled: false, icon: Rocket },
                      ].map((notif, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-6 border rounded-[2rem] ${isDark ? 'border-[#1a1a1a] bg-[#0f0f0f]' : 'border-gray-50 bg-white shadow-sm'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                              <notif.icon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.label}</p>
                              <p className="text-xs text-gray-500">{notif.desc}</p>
                            </div>
                          </div>
                          <button className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${notif.enabled ? 'bg-blue-600' : (isDark ? 'bg-[#222]' : 'bg-gray-200')}`}>
                            <div className={`w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${notif.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persistent Save Footer */}
          <div className={`px-12 py-8 border-t flex flex-col sm:flex-row justify-between items-center gap-8 sticky bottom-0 z-20 ${isDark ? 'border-[#1a1a1a] bg-[#080808]' : 'border-gray-50 bg-white/95'} backdrop-blur-xl`}>
             <div className="hidden md:flex flex-col">
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  System Health
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Operational • US-West
                  </p>
                </div>
             </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className={`flex-1 sm:flex-none px-10 py-4 text-xs font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all active:scale-95 ${isDark ? 'hover:bg-[#1a1a1a] text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-14 py-4 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] transform active:scale-95"
              >
                <Save className="h-5 w-5" /> Save Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
