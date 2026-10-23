import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';

interface WorkflowStepsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ activeTab, setActiveTab }) => {
  const steps = [
    {
      id: 'rules',
      num: '01',
      title: 'Brand Standards & SLAs',
      desc: 'Centralized rulebook & facts database',
      icon: BookOpen
    },
    {
      id: 'scanner',
      num: '02',
      title: 'Multi-Format Governance',
      desc: 'Real-time text & claim remediation',
      icon: Sparkles
    },
    {
      id: 'review',
      num: '03',
      title: 'Collaborative Sign-off',
      desc: 'Threaded reviews & role approvals',
      icon: CheckCircle2
    },
    {
      id: 'analytics',
      num: '04',
      title: 'Continuous Intelligence',
      desc: 'Error trends & Guideline Clarity index',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-neutral-900/60 border border-white/10 rounded-xl p-4 mb-6 relative overflow-hidden backdrop-blur-sm">
      
      {/* Corner crosshairs from Luminal demo */}
      <div className="absolute -left-[5px] -top-[5px] text-white/30 text-xs hidden md:block">+</div>
      <div className="absolute -right-[5px] -top-[5px] text-white/30 text-xs hidden md:block">+</div>
      <div className="absolute -left-[5px] -bottom-[5px] text-white/30 text-xs hidden md:block">+</div>
      <div className="absolute -right-[5px] -bottom-[5px] text-white/30 text-xs hidden md:block">+</div>

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          <span className="text-rose-500">///</span>
          <span>End-to-End Governance Architecture</span>
        </div>
        <div className="text-[10px] font-mono text-neutral-500 hidden sm:block">
          Interactive Pipeline: Click any stage to test
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeTab === step.id;

          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id)}
              className={`text-left p-3.5 rounded-xl border transition group relative flex items-start gap-3 overflow-hidden ${
                isCurrent 
                  ? 'bg-neutral-900 border-rose-500/50 shadow-lg shadow-rose-500/10' 
                  : 'bg-neutral-950/70 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              {/* Vertical light beam animation on active/hover */}
              {isCurrent && (
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition ${
                isCurrent ? 'bg-gradient-to-br from-rose-600 to-amber-600 text-white border-rose-400' : 'bg-neutral-900 border-white/10 text-neutral-400 group-hover:text-white'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-rose-400' : 'text-neutral-500'}`}>
                    /// {step.num}
                  </span>
                </div>
                <div className={`text-xs font-syne font-bold uppercase tracking-wider truncate mt-0.5 ${isCurrent ? 'text-white' : 'text-neutral-300'}`}>
                  {step.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-sans">
                  {step.desc}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-neutral-600">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
