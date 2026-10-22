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
  Layers,
  Lock,
  Search,
  CreditCard,
  Building2,
  Cpu
} from 'lucide-react';
import { UserRole, UsageStats } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onLoadPreset: (presetKey: string) => void;
  onOpenTour: () => void;
  onOpenCommandPalette: () => void;
  isConnected: boolean;
  ephemeralMode: boolean;
  setEphemeralMode: (enabled: boolean) => void;
  usage: UsageStats | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onLoadPreset,
  onOpenTour,
  onOpenCommandPalette,
  isConnected,
  ephemeralMode,
  setEphemeralMode,
  usage
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState("Acme Corp (Production)");

  const workspaces = [
    "Acme Corp (Production)",
    "Global Marketing EMEA",
    "Security & Arch Whitepapers",
    "Confidential Sandbox (Ephemeral)"
  ];

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
    { id: 'analytics', label: 'Governance Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security & Vault', icon: Lock },
    { id: 'pricing', label: 'Plans & Free Tier', icon: CreditCard }
  ];

  const pctQuota = usage ? Math.round((usage.words_scanned / usage.words_limit) * 100) : 25;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Inkloom<span className="text-indigo-400">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Round 2 Build
                </span>
              </div>

              {/* Workspace Switcher */}
              <div className="relative">
                <button
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="font-medium text-slate-300">{currentWorkspace}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                </button>

                {workspaceOpen && (
                  <div
                    className="absolute left-0 mt-1 w-56 rounded-xl bg-[#111827] border border-slate-700 shadow-2xl p-1 z-50 text-xs"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400">
                      Select Organization Workspace
                    </div>
                    {workspaces.map(ws => (
                      <button
                        key={ws}
                        onClick={() => setCurrentWorkspace(ws)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                          currentWorkspace === ws ? 'bg-indigo-600/30 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {ws}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center Search / Cmd+K Command Palette Trigger */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-2">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search or Cmd+K...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Preset Selector for Judges */}
          <div className="relative">
            <button
              onClick={() => setPresetMenuOpen(!presetMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition"
              title="Load demo content for immediate testing"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Judge Demo Presets</span>
              <span className="sm:hidden">Presets</span>
              <ChevronDown className="w-3 h-3 text-emerald-400" />
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

          {/* Right Status Badges: Free Tier Quota, Ephemeral Mode, Role Switcher */}
          <div className="flex items-center gap-2.5">
            
            {/* Free Tier Quota Gauge Button */}
            <button
              onClick={() => setActiveTab('pricing')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition"
              title="Click to view Free Tier usage & production plan details"
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  style={{ width: `${pctQuota}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                Free: <strong className="text-white">{usage?.words_scanned || 2450}</strong>/10k
              </span>
            </button>

            {/* Ephemeral Privacy Vault Mode Pill */}
            <button
              onClick={() => setEphemeralMode(!ephemeralMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                ephemeralMode 
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Zero-Data Retention Ephemeral Vault Mode"
            >
              <Lock className={`w-3.5 h-3.5 ${ephemeralMode ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Vault: {ephemeralMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Tour Button */}
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Tour</span>
            </button>

            {/* Role Persona Switcher */}
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
