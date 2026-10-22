import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  ChevronDown, 
  PlayCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onLoadPreset: (presetKey: string) => void;
  onOpenTour: () => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onLoadPreset,
  onOpenTour,
  isConnected
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);

  const roles = [
    {
      role: 'CREATOR' as UserRole,
      title: 'Utkarsh Yadav',
      sub: 'Creator / Marketer',
      icon: '✍️',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      role: 'BRAND_MANAGER' as UserRole,
      title: 'Shreya Kumari',
      sub: 'Brand Lead & Reviewer',
      icon: '🛡️',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      role: 'COMPLIANCE_OFFICER' as UserRole,
      title: 'Compliance Auditor',
      sub: 'Legal & Risk Sign-off',
      icon: '⚖️',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    }
  ];

  const currentRoleObj = roles.find(r => r.role === currentRole) || roles[0];

  const tabs = [
    { id: 'scanner', label: 'Content Scanner & Copilot', icon: Sparkles },
    { id: 'visual', label: 'Visual & Image Assets', icon: ImageIcon },
    { id: 'rules', label: 'Brand Rule Repository', icon: BookOpen },
    { id: 'review', label: 'Review & Approvals', icon: Users },
    { id: 'analytics', label: 'Governance Analytics', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Hackathon Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Inkloom<span className="text-indigo-400">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Round 2 Build
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Brand-Governance Platform • Team <span className="text-slate-300 font-medium">indiedevs</span>
              </p>
            </div>
          </div>

          {/* Quick Preset Selector for Judges */}
          <div className="relative">
            <button
              onClick={() => setPresetMenuOpen(!presetMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
              title="Load demo content for immediate testing"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Judge Demo Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {presetMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 rounded-xl bg-[#111827] border border-slate-700 shadow-2xl p-2 z-50 text-xs"
                onClick={() => setPresetMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Select Evaluation Scenario
                </div>
                <button
                  onClick={() => onLoadPreset('saas-launch')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-200">1. SaaS Launch Draft (High Violations)</span>
                  <span className="text-[11px] text-slate-400">Tests 100% SLA, competitor name & hyperbole fixes</span>
                </button>
                <button
                  onClick={() => onLoadPreset('security-whitepaper')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-200">2. Security Architecture Paper</span>
                  <span className="text-[11px] text-slate-400">Tests master/slave DEI & unverified claim checks</span>
                </button>
                <button
                  onClick={() => onLoadPreset('social-teaser')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-200">3. Social Teaser Campaign</span>
                  <span className="text-[11px] text-slate-400">Tests informal slang, urgency panic & X attribution</span>
                </button>
                <button
                  onClick={() => onLoadPreset('approved-showcase')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-200">4. Governed & Certified Press Release</span>
                  <span className="text-[11px] text-slate-400">Demonstrates 98% score & signed audit certificate</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Actions: Tour, Role Switcher, Backend Connection */}
          <div className="flex items-center gap-3">
            
            {/* Guided Tour button */}
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Product Tour</span>
            </button>

            {/* Backend connection pill */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-400 hidden lg:inline">
                {isConnected ? 'API Live' : 'Connecting'}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${currentRoleObj.color}`}
              >
                <span>{currentRoleObj.icon}</span>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight">{currentRoleObj.title}</div>
                  <div className="text-[10px] text-slate-400">{currentRoleObj.sub}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#111827] border border-slate-700 shadow-2xl p-2 z-50 text-xs"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Switch Active Persona
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => setCurrentRole(r.role)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                        currentRole === r.role ? 'bg-indigo-600/20 border border-indigo-500/40 text-white' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{r.title}</div>
                        <div className="text-[11px] text-slate-400">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 py-1 overflow-x-auto scrollbar-none border-t border-slate-800/60">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
