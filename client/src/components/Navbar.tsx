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
  ArrowRight,
  PenTool,
  Scale,
  Compass,
  Zap,
  Activity
} from 'lucide-react';
import { UserRole, UsageStats } from '../types';
import { LuxuryLogo } from './LuxuryLogo';

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
  pendingReviewsCount?: number;
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
  usage,
  pendingReviewsCount = 0
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
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
      sub: 'Content Creator & Marketer',
      icon: PenTool,
      color: 'text-neutral-300 bg-neutral-900 border-white/10'
    },
    {
      role: 'BRAND_MANAGER' as UserRole,
      title: 'Shreya Kumari',
      sub: 'Brand Lead & Reviewer',
      icon: ShieldCheck,
      color: 'text-rose-400 bg-rose-950/30 border-rose-500/30'
    },
    {
      role: 'COMPLIANCE_OFFICER' as UserRole,
      title: 'Compliance Auditor',
      sub: 'Legal & Risk Sign-off',
      icon: Scale,
      color: 'text-amber-400 bg-amber-950/30 border-amber-500/30'
    }
  ];

  const currentRoleObj = roles.find(r => r.role === currentRole) || roles[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  const tabs = [
    { id: 'scanner', label: 'Scanner & Copilot', icon: Sparkles },
    { id: 'visual', label: 'Visual & Images', icon: ImageIcon },
    { id: 'rules', label: 'Brand Rules', icon: BookOpen },
    { id: 'review', label: 'Review & Approvals', icon: Users, badge: pendingReviewsCount > 0 ? pendingReviewsCount : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security Vault', icon: Lock },
    { id: 'pricing', label: 'Free Tier & Plans', icon: CreditCard }
  ];

  const pctQuota = usage ? Math.round((usage.words_scanned / usage.words_limit) * 100) : 25;

  return (
    <header className="sticky top-0 z-50 bg-[#07070A]/95 backdrop-blur-xl border-b border-white/[0.08]">
      
      {/* Subtle laser highlight bar at top */}
      <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-rose-500/50 to-amber-500/40" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Subtle corner crosshairs */}
        <div className="absolute left-2 -bottom-[5px] text-white/20 text-xs hidden lg:block z-20">+</div>
        <div className="absolute right-2 -bottom-[5px] text-white/20 text-xs hidden lg:block z-20">+</div>

        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Luxury Brand Logo & Workspace Switcher */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('scanner')} 
              className="text-left focus:outline-none"
            >
              <LuxuryLogo size={34} showText={true} />
            </button>

            {/* Desktop Workspace Switcher */}
            <div className="relative hidden xl:block pl-4 border-l border-white/[0.08]">
              <button
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-medium text-neutral-300 font-sans">{currentWorkspace}</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {workspaceOpen && (
                <div
                  className="absolute left-4 mt-2 w-64 rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl p-1.5 z-50 text-xs animate-in"
                  onClick={() => setWorkspaceOpen(false)}
                >
                  <div className="px-2.5 py-1 text-[9px] uppercase font-mono tracking-wider text-neutral-500">
                    Workspace Partition
                  </div>
                  {workspaces.map(ws => (
                    <button
                      key={ws}
                      onClick={() => setCurrentWorkspace(ws)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                        currentWorkspace === ws ? 'bg-rose-500/10 text-rose-300 font-semibold' : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <span>{ws}</span>
                      {currentWorkspace === ws && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Navigation Tabs (Visible on Desktop lg:) */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-950/70 p-1 rounded-2xl border border-white/[0.08] shadow-inner">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-syne font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-neutral-800/90 text-white shadow-md border border-white/10'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-neutral-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Persona Switcher, Walkthrough Tour & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Walkthrough Tour Button */}
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-syne font-bold uppercase tracking-wider transition shadow-sm"
              title="Launch Guided Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline">Tour</span>
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${currentRoleObj.color}`}
              >
                <CurrentRoleIcon className="w-3.5 h-3.5" />
                <div className="text-left hidden sm:block">
                  <div className="font-syne font-bold text-xs text-white leading-none">{currentRoleObj.title}</div>
                  <div className="text-[9px] text-neutral-400 font-sans leading-none mt-0.5">{currentRoleObj.sub}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-neutral-900 border border-white/15 shadow-2xl p-2 z-50 text-xs animate-in"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[9px] uppercase font-mono tracking-wider text-neutral-500">
                    Switch Editorial Persona
                  </div>
                  {roles.map(r => {
                    const RoleIcon = r.icon;
                    return (
                      <button
                        key={r.role}
                        onClick={() => setCurrentRole(r.role)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 ${
                          currentRole === r.role ? 'bg-rose-500/10 border border-rose-500/30 text-white' : 'hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="p-1 rounded-lg bg-neutral-950 border border-white/5 mt-0.5">
                          <RoleIcon className="w-3.5 h-3.5 text-neutral-300" />
                        </div>
                        <div className="flex-1">
                          <div className="font-syne font-bold text-white text-xs">{r.title}</div>
                          <div className="text-[10px] text-neutral-400">{r.sub}</div>
                        </div>
                        {currentRole === r.role && <CheckCircle2 className="w-4 h-4 text-rose-400 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Global Cmd+K trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-400 hover:text-white transition"
              title="Global Command Palette (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <kbd className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-white/5">⌘K</kbd>
            </button>

          </div>

        </div>

      </div>

      {/* Sustainable Free Tier Quota Alert Strip */}
      <div className="bg-neutral-950/80 border-t border-white/[0.04] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-400">Deterministic Engine:</span>
              <strong className="text-white">&lt;4.2ms SLA</strong>
            </div>

            <span className="text-neutral-700 hidden md:inline">|</span>

            <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>Sustainable Cloud:</span>
              <span className="text-amber-400 font-bold">100% Free Tier</span>
              <span>({usage ? `${(usage.words_limit - usage.words_scanned).toLocaleString()} wds left` : '10,000 wds free'})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLoadPreset('saas-launch')}
              className="text-neutral-400 hover:text-rose-400 transition flex items-center gap-1 text-[10px] font-syne uppercase tracking-wider"
            >
              <span>Load Evaluator Preset</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

    </header>
  );
};
