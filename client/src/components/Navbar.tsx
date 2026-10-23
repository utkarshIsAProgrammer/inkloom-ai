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
  Cpu,
  ArrowRight
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
      color: 'text-neutral-200 bg-neutral-900 border-white/10'
    },
    {
      role: 'BRAND_MANAGER' as UserRole,
      title: 'Shreya Kumari',
      sub: 'Brand Lead & Reviewer',
      icon: '🛡️',
      color: 'text-red-400 bg-red-950/30 border-red-500/30'
    },
    {
      role: 'COMPLIANCE_OFFICER' as UserRole,
      title: 'Compliance Auditor',
      sub: 'Legal & Risk Sign-off',
      icon: '⚖️',
      color: 'text-amber-400 bg-amber-950/30 border-amber-500/30'
    }
  ];

  const currentRoleObj = roles.find(r => r.role === currentRole) || roles[0];

  const tabs = [
    { id: 'scanner', label: 'Scanner & Copilot', icon: Sparkles },
    { id: 'visual', label: 'Visual & Images', icon: ImageIcon },
    { id: 'rules', label: 'Brand Rules', icon: BookOpen },
    { id: 'review', label: 'Reviews & Approvals', icon: Users },
    { id: 'analytics', label: 'Governance Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security & Vault', icon: Lock },
    { id: 'pricing', label: 'Plans & Free Tier', icon: CreditCard }
  ];

  const pctQuota = usage ? Math.round((usage.words_scanned / usage.words_limit) * 100) : 25;

  return (
    <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-white/10">
      
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Subtle corner crosshair */}
        <div className="absolute left-2 -bottom-[5px] text-white/30 text-xs hidden md:block z-20">+</div>
        <div className="absolute right-2 -bottom-[5px] text-white/30 text-xs hidden md:block z-20">+</div>

        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-900 border border-white/15 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-transparent to-transparent opacity-80" />
              <ShieldCheck className="w-5 h-5 text-red-500 relative z-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-syne font-black text-lg tracking-tight text-white uppercase">
                  Inkloom<span className="text-red-500">.AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase rounded bg-white/5 text-neutral-400 border border-white/10">
                  Round 2 Build
                </span>
              </div>

              {/* Workspace Switcher */}
              <div className="relative">
                <button
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition"
                >
                  <Building2 className="w-3 h-3 text-neutral-500" />
                  <span className="font-medium text-neutral-300 font-sans">{currentWorkspace}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-neutral-500" />
                </button>

                {workspaceOpen && (
                  <div
                    className="absolute left-0 mt-1.5 w-60 rounded-xl bg-neutral-900 border border-white/15 shadow-2xl p-1.5 z-50 text-xs"
                    onClick={() => setWorkspaceOpen(false)}
                  >
                    <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                      /// Workspace
                    </div>
                    {workspaces.map(ws => (
                      <button
                        key={ws}
                        onClick={() => setCurrentWorkspace(ws)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                          currentWorkspace === ws ? 'bg-red-500/10 text-red-400 font-semibold border border-red-500/20' : 'text-neutral-300 hover:bg-white/5'
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
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md bg-neutral-900/80 border border-white/10 hover:border-white/20 text-xs text-neutral-400 hover:text-neutral-200 transition group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-red-400 transition-colors" />
                <span className="font-sans">Search or ⌘K...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-950 border border-white/10 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Preset Selector with Animated Rotating Border from demo */}
          <div className="relative">
            <div className="relative group cursor-pointer" onClick={() => setPresetMenuOpen(!presetMenuOpen)}>
              <div className="absolute -inset-[1px] rounded-md bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_300deg,#ef4444_360deg)] opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-border-spin blur-[0.5px]"></div>
              <div className="relative bg-neutral-900 border border-red-500/30 text-neutral-200 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-lg shadow-red-500/5 group-hover:text-red-400 group-hover:border-red-500/60 transition-all duration-300 text-xs font-semibold font-syne uppercase tracking-wider">
                <PlayCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden sm:inline">Judge Presets</span>
                <span className="sm:hidden">Presets</span>
                <ChevronDown className="w-3 h-3 text-red-400" />
              </div>
            </div>

            {presetMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 rounded-xl bg-neutral-900 border border-white/15 shadow-2xl p-2 z-50 text-xs"
                onClick={() => setPresetMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  /// 60-Second Evaluation Scenarios
                </div>
                <button
                  onClick={() => onLoadPreset('saas-launch')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">1. SaaS Launch Draft (High Violations)</span>
                  <span className="text-[11px] text-neutral-400">Tests 100% SLA, competitor name & hyperbole fixes</span>
                </button>
                <button
                  onClick={() => onLoadPreset('security-whitepaper')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">2. Security Architecture Paper</span>
                  <span className="text-[11px] text-neutral-400">Tests master/slave DEI & unverified claims</span>
                </button>
                <button
                  onClick={() => onLoadPreset('social-teaser')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">3. Social Teaser Campaign</span>
                  <span className="text-[11px] text-neutral-400">Tests informal slang, urgency panic & X attribution</span>
                </button>
                <button
                  onClick={() => onLoadPreset('approved-showcase')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">4. Governed & Certified Press Release</span>
                  <span className="text-[11px] text-neutral-400">Demonstrates 98% score & signed audit certificate</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Controls: Free Tier Quota, Ephemeral Vault Pill, Persona Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Free Tier Quota Badge */}
            <button
              onClick={() => setActiveTab('pricing')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-900 border border-white/10 hover:border-white/20 text-xs transition"
              title="Click to inspect Free Tier usage & production plan details"
            >
              <div className="w-10 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${pctQuota}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-neutral-300">
                {usage?.words_scanned || 2450}/10k
              </span>
            </button>

            {/* Ephemeral Vault Mode Toggle */}
            <button
              onClick={() => setEphemeralMode(!ephemeralMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition border ${
                ephemeralMode 
                  ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                  : 'bg-neutral-900 text-neutral-400 border-white/10 hover:text-white'
              }`}
              title="Toggle Zero-Data Retention Ephemeral Vault Mode"
            >
              <Lock className={`w-3.5 h-3.5 ${ephemeralMode ? 'text-red-400' : 'text-neutral-500'}`} />
              <span className="hidden sm:inline">VAULT:{ephemeralMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Product Tour */}
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 border border-white/10 rounded-md transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden lg:inline">Tour</span>
            </button>

            {/* Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition ${currentRoleObj.color}`}
              >
                <span>{currentRoleObj.icon}</span>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white text-[11px] leading-tight font-sans">{currentRoleObj.title}</div>
                  <div className="text-[9px] text-neutral-400 font-mono uppercase">{currentRoleObj.sub}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-white/15 shadow-2xl p-1.5 z-50 text-xs"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
                    /// Switch Persona
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => setCurrentRole(r.role)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2.5 transition ${
                        currentRole === r.role ? 'bg-red-500/10 border border-red-500/30 text-white' : 'hover:bg-white/5 text-neutral-300'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{r.title}</div>
                        <div className="text-[11px] text-neutral-400">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Navigation Tabs Bar with sleek Luminal style */}
        <nav className="flex space-x-1 py-1.5 overflow-x-auto scrollbar-none border-t border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition uppercase tracking-wider font-syne ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
