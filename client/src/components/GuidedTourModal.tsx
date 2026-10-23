import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Users, 
  Lock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Compass, 
  Sliders, 
  Check, 
  Eye, 
  Key, 
  Building2,
  ChevronRight
} from 'lucide-react';
import { LuxuryLogo } from './LuxuryLogo';

interface GuidedTourModalProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ onClose, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      badge: "Platform Mission & Architecture",
      title: "Autonomous Brand Governance Protocol",
      subtitle: "Eliminating Decentralized Publishing Risk for Modern Enterprises",
      desc: "Growing organizations publish across multiple channels through diverse teams, agencies, and generative AI tools. Unverified product claims, off-brand tone, restricted terminology, and accessibility breaches frequently slip into production. Inkloom AI acts as an intelligent co-pilot—flagging violations, citing exact corporate guidelines, and offering context-preserving one-click remediation while keeping human reviewers firmly in control.",
      icon: ShieldCheck,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      location: "Global Overview",
      actionTab: "scanner",
      actionLabel: "Explore the Scanner & Copilot",
      highlights: [
        "Deterministic sub-5ms heuristic and semantic verification",
        "Role-based sign-off pipeline: Creator, Brand Manager, Compliance Auditor",
        "Cryptographically signed SHA-256 Brand Clearance Certificates"
      ]
    },
    {
      badge: "Step 1 • Main Workstation",
      title: "Multi-Format Scanner & Explainable Copilot",
      subtitle: "Real-Time Linguistic Verification & 1-Click Reverse-Offset Remediation",
      desc: "Type or paste copy into the Markdown editor, upload files, or select one of the pre-loaded Judge Demo Presets. The scanner instantaneously evaluates content across 4 core pillars: Tone of Voice, Fact Verification & SLAs, Approved Lexicon, and Clarity. Every violation cites the official Brand Operations Manual section and provides a 1-click 'Apply Fix' or 'Autonomous Fix All' action.",
      icon: Sparkles,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      location: "Navigation Tab: Scanner & Copilot",
      actionTab: "scanner",
      actionLabel: "Open Content Scanner",
      highlights: [
        "Automated PII & secret scrubber (masks AWS keys, tokens, emails)",
        "Zero-delay radial Brand Health Scorecard (0–100%) and letter grades",
        "Single-click 'Autonomous AI Remediation' with reverse-offset precision"
      ]
    },
    {
      badge: "Step 2 • Multi-Modal Inspection",
      title: "Visual Brand Harmonizer & WCAG 2.1 AA",
      subtitle: "Dominant Palette Extraction & Digital Accessibility Standards",
      desc: "Marketing graphics and announcement collateral are verified for brand consistency. The multi-modal visual analyzer quantizes the 5 dominant colors in any uploaded image, calculates Euclidean distances to certified brand hex standards, evaluates text-to-background contrast ratios against WCAG 2.1 AA standards (4.5:1 minimum), and scores screen-reader alt text.",
      icon: Layers,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      location: "Navigation Tab: Visual & Images",
      actionTab: "visual",
      actionLabel: "View Visual Inspector",
      highlights: [
        "Automated 5-color palette quantization with exact hex mapping",
        "WCAG 2.1 AA contrast ratio pass/fail verification",
        "AI-assisted accessible alt-text generation with 1-click application"
      ]
    },
    {
      badge: "Step 3 • Brand Knowledge Base",
      title: "Centralized Brand Rules Repository",
      subtitle: "The Single Source of Truth for Enterprise Communications",
      desc: "Brand managers and legal teams configure live policies across 4 pillars: Tone of Voice registers, Certified Product SLAs (e.g. 99.95% uptime guarantees), Restricted Terminology (sunset product names, competitor bashing, sensitive legal words), and Approved Visual Palettes. Every rule includes guideline citations, risk rationales, and replacement patterns.",
      icon: BookOpen,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      location: "Navigation Tab: Brand Rules",
      actionTab: "rules",
      actionLabel: "Inspect Brand Rules",
      highlights: [
        "Instant toggle switches to activate or deactivate policies dynamically",
        "Keyword pattern matchers and suggested drop-in replacements",
        "Full rule creation form with category and severity classifications"
      ]
    },
    {
      badge: "Step 4 • Editorial Sign-Off",
      title: "Collaborative Editorial Pipeline & Certification",
      subtitle: "Multi-Role Editorial Governance & Verifiable Clearance Certificates",
      desc: "Switch seamlessly between roles: Content Creator (Utkarsh Yadav), Brand Manager (Shreya Kumari), or Compliance Auditor. Review drafts through visual Side-by-Side Diff comparisons, participate in threaded comments with resolution states, approve releases, and generate cryptographically signed Brand Clearance Certificates backed by SHA-256 hashes.",
      icon: Users,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      location: "Navigation Tab: Review & Approvals",
      actionTab: "review",
      actionLabel: "Enter Review Pipeline",
      highlights: [
        "Document lifecycle states: Draft → In Review → Revisions → Approved",
        "Visual diff tracking comparing original submission vs. governed output",
        "Printable & downloadable Brand Governance Clearance Certificates"
      ]
    },
    {
      badge: "Step 5 • Enterprise Security & Scale",
      title: "Zero-Knowledge Vault & Sustainable Free Tier",
      subtitle: "Volatile In-Memory Processing & Zero-Cost Cloud Architecture",
      desc: "Engineered for high-volume enterprise compliance while operating sustainably on 100% free-tier cloud resources without requiring a credit card. Features an Ephemeral Zero-Data Retention Mode where sensitive NDA drafts execute in volatile RAM with zero disk writes, real-time client-side WebCrypto SHA-256 hashing, and a live monthly usage meter with 10,000 words included free.",
      icon: Lock,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      location: "Navigation Tab: Security & Vault",
      actionTab: "security",
      actionLabel: "Inspect Security Vault",
      highlights: [
        "Ephemeral zero-data retention mode for confidential NDA materials",
        "Live monthly quota tracker with graceful local-first throttling",
        "Emergency data purge button for complete local privacy"
      ]
    }
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('inkloom_tour_completed', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleJumpToTab = (tab: string) => {
    onNavigateTab(tab);
    handleFinish();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in">
      
      {/* Luxury Obsidian Card Container */}
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#09090D] border border-amber-500/20 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Luxury Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-white/20 font-mono text-xs pointer-events-none">+</div>
        <div className="absolute top-3 right-3 text-white/20 font-mono text-xs pointer-events-none">+</div>
        <div className="absolute bottom-3 left-3 text-white/20 font-mono text-xs pointer-events-none">+</div>
        <div className="absolute bottom-3 right-3 text-white/20 font-mono text-xs pointer-events-none">+</div>

        {/* Top Header Strip */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-neutral-950/80 flex items-center justify-between gap-4">
          <LuxuryLogo size={32} showText={true} />

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400/90 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Walkthrough • {currentStep + 1} of {steps.length}
            </span>

            <button 
              onClick={handleFinish}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
              title="Close Walkthrough"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Step Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Step Badge & Location */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
              {step.badge}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>{step.location}</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="font-syne font-black text-xl md:text-2xl text-white tracking-tight uppercase leading-snug">
              {step.title}
            </h2>
            <p className="font-sans text-xs md:text-sm text-neutral-400 leading-normal">
              {step.subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans bg-neutral-950/60 p-4 rounded-2xl border border-white/[0.06]">
            {step.desc}
          </p>

          {/* Key Feature Highlights */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider font-semibold block">
              Core Capabilities:
            </span>
            <div className="space-y-1.5">
              {step.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Navigation Shortcut */}
          <div className="pt-2">
            <button
              onClick={() => handleJumpToTab(step.actionTab)}
              className="w-full p-3 rounded-2xl bg-neutral-900 border border-white/10 hover:border-amber-500/40 text-neutral-200 hover:text-white transition flex items-center justify-between text-xs font-syne font-bold uppercase tracking-wider group"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${step.iconColor}`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span>{step.actionLabel}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Bottom Controls & Step Dots */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-neutral-950/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-neutral-900 border-white/20 text-rose-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[11px] font-sans">Do not display on startup</span>
          </label>

          {/* Step Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep === i ? 'w-6 bg-gradient-to-r from-rose-500 to-amber-400' : 'w-1.5 bg-neutral-800 hover:bg-neutral-600'
                }`}
                title={`Jump to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-syne font-bold uppercase text-neutral-300 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-syne font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? "Complete Tour" : "Next Step"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
