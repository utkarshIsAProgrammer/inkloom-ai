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
      title: 'Brand Guidelines Setup',
      desc: 'Define tone, facts & restricted terms',
      icon: BookOpen
    },
    {
      id: 'scanner',
      num: '02',
      title: 'Multi-Format AI Scan',
      desc: 'Real-time text & claim analysis',
      icon: Sparkles
    },
    {
      id: 'review',
      num: '03',
      title: 'Collaborative Governance',
      desc: 'Threaded reviews & role approvals',
      icon: CheckCircle2
    },
    {
      id: 'analytics',
      num: '04',
      title: 'Macro Analytics & Audit',
      desc: 'Track error trends & health metrics',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Complete Product Workflow (Round 1 Blueprint Execution)
        </div>
        <div className="text-[11px] text-slate-500 hidden sm:block">
          Interactive Journey: Click any step to test
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
              className={`text-left p-3 rounded-xl border transition group relative flex items-start gap-3 ${
                isCurrent 
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                  : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {step.num}
                  </span>
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                    {step.title}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {step.desc}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
