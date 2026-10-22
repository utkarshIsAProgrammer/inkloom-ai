import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  BookOpen, 
  Layers, 
  Users, 
  BarChart3,
  Award
} from 'lucide-react';

interface GuidedTourModalProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ onClose, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Inkloom AI (Round 2 — The Build)",
      subtitle: "Enterprise Brand-Governance Platform by Team indiedevs (Utkarsh Yadav & Shreya Kumari)",
      desc: "Inkloom AI transforms decentralized content creation into a governed, trustworthy pipeline. Unlike blunt rejection filters, our intelligent co-pilot explains why an issue is flagged, cites exact guideline sections, and offers context-preserving one-click fixes.",
      icon: ShieldCheck,
      highlight: "100% Core End-to-End Workflow Implemented & Working",
      actionLabel: "Next: Step 1 (Brand Rules)",
      actionTab: "rules"
    },
    {
      title: "Step 1: Centralized Brand Rule Repository",
      subtitle: "Single Source of Truth for Enterprise Communications",
      desc: "Explore active rules governing Tone-of-Voice, Verified Product Facts & SLAs (e.g. 99.95% standard SLA), Restricted Vocabulary (DEI terms, sunset product names, competitor bashing), and Visual Colors. Brand managers can add, edit, toggle, or export rules.",
      icon: BookOpen,
      highlight: "Try adding a custom brand rule or toggling active rules",
      actionLabel: "Next: Step 2 (Multi-Format Scan)",
      actionTab: "scanner"
    },
    {
      title: "Step 2: Multi-Format Scanner & Explainable Co-Pilot",
      subtitle: "Real-time Text, Claims & Visual Asset Governance",
      desc: "Paste copy, upload files (.md, .txt), or select 'Judge Demo Presets' at the top. The scanner highlights violations, scores compliance across 4 pillars, and provides one-click 'Apply Fix' or 'Fix All' auto-remediation.",
      icon: Sparkles,
      highlight: "Click 'Fix All' in the top right to watch the score jump to 98%!",
      actionLabel: "Next: Step 3 (Review & Approvals)",
      actionTab: "review"
    },
    {
      title: "Step 3: Collaborative Review & Governance Pipeline",
      subtitle: "Multi-Role Editorial Approval & Audit Trails",
      desc: "Switch personas between Creator (Utkarsh), Brand Manager (Shreya), and Compliance Lead. Compare original draft vs. governed version in Side-by-Side Diff, participate in threaded comments, approve content, and generate signed Clearance Certificates.",
      icon: Users,
      highlight: "Switch role to 'Brand Manager' to approve or 'Compliance' to certify!",
      actionLabel: "Next: Step 4 (Analytics)",
      actionTab: "analytics"
    },
    {
      title: "Step 4: Governance Analytics & Round 3 Improvements",
      subtitle: "Macro-Insights & Continuous Improvement",
      desc: "View the organizational Brand Health Index, department compliance leaderboards, top friction rules, and the Guideline Clarity Index. Export full audit logs in CSV.",
      icon: BarChart3,
      highlight: "Complete Round 2 submission package ready for evaluation",
      actionLabel: "Finish Tour & Start Testing",
      actionTab: "scanner"
    }
  ];

  const step = steps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (step.actionTab) {
      onNavigateTab(step.actionTab);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Guided Judge Tour • Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{step.title}</h3>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">{step.subtitle}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-850/60 p-3.5 rounded-2xl border border-slate-800">
            {step.desc}
          </p>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{step.highlight}</span>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === currentStep ? 'bg-indigo-500 w-5' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
