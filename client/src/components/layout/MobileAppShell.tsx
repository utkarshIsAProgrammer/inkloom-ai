import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Lock, 
  Wifi, 
  Battery, 
  Signal, 
  ChevronDown, 
  Sliders,
  CheckCircle2,
  Cpu,
  Building2
} from 'lucide-react';
import { UserRole, UsageStats } from '../../types';
import { MobileTabBar } from './MobileTabBar';

interface MobileAppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onOpenTour: () => void;
  onOpenCommandPalette: () => void;
  isConnected: boolean;
  ephemeralMode: boolean;
  setEphemeralMode: (enabled: boolean) => void;
  usage: UsageStats | null;
  onLoadPreset: (presetKey: string) => void;
  violationsCount?: number;
  pendingReviewsCount?: number;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  onOpenTour,
  onOpenCommandPalette,
  isConnected,
  ephemeralMode,
  setEphemeralMode,
  usage,
  onLoadPreset,
  violationsCount = 0,
  pendingReviewsCount = 0
}) => {
  // Device display mode: 'phone' (realistic iPhone 16 Pro mockup) or 'fluid' (mobile-first full width)
  const [deviceMode, setDeviceMode] = useState<'phone' | 'fluid'>('phone');
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');

  // Keep a realistic live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    {
      role: 'CREATOR' as UserRole,
      title: 'Utkarsh Yadav',
      sub: 'Content Creator & Marketer',
      icon: '✍️',
      desc: 'Author drafts, auto-scrub PII, run instant AI remediation'
    },
    {
      role: 'BRAND_MANAGER' as UserRole,
      title: 'Shreya Kumari',
      sub: 'Brand Lead & Reviewer',
      icon: '🛡️',
      desc: 'Approve campaigns, enforce brand guidelines, sign certificates'
    },
    {
      role: 'COMPLIANCE_OFFICER' as UserRole,
      title: 'Compliance Auditor',
      sub: 'Legal & Risk Sign-off',
      icon: '⚖️',
      desc: 'Verify regulatory claims, audit zero-retention logs'
    }
  ];

  const currentRoleObj = roles.find(r => r.role === currentRole) || roles[0];

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-200 flex flex-col font-sans selection:bg-red-500/30 selection:text-white relative">
      
      {/* Desktop Evaluator Control Strip (Visible on desktop viewports) */}
      <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-neutral-950/95 border-b border-white/10 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-syne font-bold text-sm tracking-wider uppercase text-white">
              Inkloom<span className="text-red-500">.AI</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Mobile App Experience
            </span>
          </div>
          <span className="text-neutral-700">|</span>
          <span className="text-xs text-neutral-400 font-sans">
            Team: <strong className="text-neutral-200 font-syne">indiedevs</strong> (Utkarsh Yadav & Shreya Kumari)
          </span>
        </div>

        {/* View Mode Switcher + Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-900 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setDeviceMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition ${
                deviceMode === 'phone'
                  ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-red-400" />
              <span>iPhone Frame</span>
            </button>
            <button
              onClick={() => setDeviceMode('fluid')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition ${
                deviceMode === 'fluid'
                  ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
              <span>Fluid Mobile</span>
            </button>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-neutral-300 hover:text-white transition"
            title="Global Quick Actions (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded font-mono text-[10px] text-neutral-400">⌘K</kbd>
          </button>
        </div>
      </header>

      {/* Main Container: either inside iPhone frame or fluid container */}
      <div className={`flex-1 flex flex-col items-center justify-center ${deviceMode === 'phone' ? 'md:py-8' : 'w-full'}`}>
        
        <div
          className={
            deviceMode === 'phone'
              ? 'w-full max-w-[430px] h-[92vh] max-h-[920px] bg-neutral-950 rounded-[48px] border-[10px] border-neutral-900/90 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] relative flex flex-col overflow-hidden ring-1 ring-white/10 transition-all duration-300'
              : 'w-full max-w-md min-h-screen bg-neutral-950 flex flex-col relative transition-all duration-300'
          }
        >
          {/* Subtle Corner Crosshairs */}
          <div className="absolute top-3 left-3 text-white/10 font-mono text-xs pointer-events-none z-30">+</div>
          <div className="absolute top-3 right-3 text-white/10 font-mono text-xs pointer-events-none z-30">+</div>

          {/* iOS Native Status Bar */}
          <div className="shrink-0 pt-3 pb-1 px-6 flex items-center justify-between text-xs text-neutral-300 select-none z-40 bg-neutral-950/80 backdrop-blur-md">
            <span className="font-semibold font-mono tracking-tight text-[11px]">{currentTime}</span>

            {/* Dynamic Island Pill (in Phone Frame mode) */}
            {deviceMode === 'phone' && (
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner border border-white/5 mx-auto">
                <span className="w-2 h-2 rounded-full bg-red-500/80 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-neutral-400">
              <Signal className="w-3.5 h-3.5 text-neutral-300" />
              <Wifi className="w-3.5 h-3.5 text-neutral-300" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-4 h-4 text-neutral-200 fill-current" />
              </div>
            </div>
          </div>

          {/* Mobile App Header */}
          <div className="shrink-0 px-4 py-2.5 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md z-30 flex items-center justify-between gap-2">
            
            {/* Brand Logo & Status */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/15 flex items-center justify-center text-red-500 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-red-600/20" />
                <ShieldCheck className="w-4 h-4 relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-syne font-black text-sm tracking-tight text-white uppercase">
                    Inkloom<span className="text-red-500">.AI</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[9px] font-mono text-neutral-500 leading-none">Brand Governance</p>
              </div>
            </div>

            {/* Persona Switcher Pill */}
            <button
              onClick={() => setRoleSheetOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-white/10 hover:border-red-500/40 transition text-xs shadow-sm"
            >
              <span className="text-xs">{currentRoleObj.icon}</span>
              <span className="font-syne font-semibold text-[11px] text-white">
                {currentRoleObj.title.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
          </div>

          {/* Quota & Zero-Data Mode Alert Strip */}
          <div className="shrink-0 px-3 py-1.5 bg-neutral-900/60 border-b border-white/5 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setEphemeralMode(!ephemeralMode)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                  ephemeralMode 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-white/5 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Lock className="w-2.5 h-2.5" />
                <span>{ephemeralMode ? 'VAULT ACTIVE' : 'STANDARD'}</span>
              </button>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">
                {usage ? `${usage.words_limit - usage.words_scanned} wds` : 'PRO TIER'}
              </span>
            </div>

            <button
              onClick={() => onLoadPreset('saas-launch')}
              className="text-red-400 hover:text-red-300 font-medium tracking-tight flex items-center gap-0.5"
            >
              <span>Sample Draft</span>
              <span>→</span>
            </button>
          </div>

          {/* Scrollable Viewport for Screen Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative p-3 pb-24">
            {children}
          </div>

          {/* Floating Bottom Navigation Dock */}
          <MobileTabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            violationsCount={violationsCount}
            pendingReviewsCount={pendingReviewsCount}
          />

          {/* Bottom Home Indicator Bar (iOS style) */}
          <div className="shrink-0 py-1.5 flex justify-center bg-neutral-950 pointer-events-none z-40">
            <div className="w-28 h-1 bg-white/20 rounded-full" />
          </div>

        </div>

      </div>

      {/* Role Switcher Bottom Sheet / Modal */}
      {roleSheetOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-3 sm:items-center"
          onClick={() => setRoleSheetOpen(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-5 shadow-2xl animate-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-syne font-bold text-base text-white">Switch Persona</h3>
                <p className="text-xs text-neutral-400">Experience role-based governance workflows</p>
              </div>
              <span className="text-xl">👥</span>
            </div>

            <div className="space-y-2">
              {roles.map(r => {
                const isSelected = r.role === currentRole;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setRoleSheetOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-red-500/10 border-red-500/40 text-white'
                        : 'bg-neutral-950 border-white/5 text-neutral-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{r.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-syne font-bold text-sm text-white">{r.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                      </div>
                      <p className="text-xs text-red-400 font-medium">{r.sub}</p>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setRoleSheetOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
