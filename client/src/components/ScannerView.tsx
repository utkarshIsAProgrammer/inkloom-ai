import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileUp, 
  ArrowRight, 
  RotateCcw, 
  Send, 
  Wand2, 
  Check, 
  Copy, 
  MessageSquare, 
  ShieldAlert,
  Clock,
  BookOpen,
  Filter,
  Lock,
  Cpu,
  Key,
  Fingerprint,
  Zap,
  Edit3,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Share2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScanResult, ViolationItem, UserRole, Severity, DocumentStatus } from '../types';
import { api } from '../services/api';

interface ScannerViewProps {
  currentRole: UserRole;
  onNavigateToReview: (docId?: string) => void;
  presetDraft?: any;
  ephemeralMode: boolean;
  setEphemeralMode: (enabled: boolean) => void;
  onScanCompleted?: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  currentRole,
  onNavigateToReview,
  presetDraft,
  ephemeralMode,
  setEphemeralMode,
  onScanCompleted
}) => {
  // Mobile segmented view state: 'editor' | 'flags' | 'score'
  const [mobileTab, setMobileTab] = useState<'editor' | 'flags' | 'score'>('editor');
  
  const [title, setTitle] = useState("Announcing Inkloom NextGen: Enterprise Workflow Automation");
  const [channel, setChannel] = useState("Marketing Copy");
  const [content, setContent] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | Severity>('ALL');
  const [selectedViolationIndex, setSelectedViolationIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [documentId, setDocumentId] = useState<string>("draft-saas-launch");
  const [scrubPii, setScrubPii] = useState(true);

  // Quick preset samples (Zero emojis, pure Lucide icons)
  const presets = [
    {
      id: 'saas-launch',
      label: 'SaaS Launch (Violations)',
      icon: Zap,
      iconColor: 'text-rose-400',
      title: 'Announcing Inkloom NextGen: Enterprise Workflow Automation',
      channel: 'Marketing Copy',
      text: `We are thrilled to unveil the new release of Inkloom Classic! It is the world's greatest workflow platform and an infinitely superior solution for all modern teams.\n\nUnlike traditional systems where AWS is clunky and slow, our new real-time distributed engine guarantees 100% uptime with zero downtime under any circumstances. Deployed in every country in the world, our cluster delivers <1ms latency everywhere with military-grade zero-hack encryption.\n\nYou'd be foolish not to upgrade immediately! Follow our updates on Twitter to learn more.`
    },
    {
      id: 'security-whitepaper',
      label: 'Security Technical Brief',
      icon: Lock,
      iconColor: 'text-amber-400',
      title: 'Inkloom Distributed Architecture & Zero-Knowledge Verification',
      channel: 'Technical Docs',
      text: `This technical brief outlines Inkloom's enterprise deployment model. Our proprietary distributed consensus architecture achieves a verified 99.95% SLA with automated multi-region failover.\n\nAll cryptographic proofs are computed client-side using WebCrypto SHA-256 primitives, ensuring uncompromised data sovereignty without storing customer tokens or credentials.`
    },
    {
      id: 'social-teaser',
      label: 'Social Teaser Campaign',
      icon: Share2,
      iconColor: 'text-rose-400',
      title: 'Brand Compliance at Scale: Executive Announcement',
      channel: 'Social Media',
      text: `Stop letting rogue marketing claims slip through to production. Inkloom empowers enterprise teams to enforce brand guidelines, verify SLA claims, and sign audit certificates before publishing.\n\nCheck out the live interactive demonstration today: inkloom.ai`
    },
    {
      id: 'approved-showcase',
      label: 'Governed Showcase',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      title: 'Official Press Release: Inkloom Enterprise Launch',
      channel: 'Press Release',
      text: `Inkloom today announced its enterprise brand-governance co-pilot designed to streamline outbound content verification for regulated industries.\n\nThe platform combines deterministic linguistic checks with large language model evaluation to ensure all published materials align strictly with approved brand guidelines and factual claims.`
    }
  ];

  useEffect(() => {
    if (presetDraft) {
      setTitle(presetDraft.title || "Demo Draft");
      setChannel(presetDraft.channel || "Marketing Copy");
      setContent(presetDraft.content || "");
      setDocumentId(presetDraft.id || `doc-${Date.now()}`);
      runScan(presetDraft.content, presetDraft.title, presetDraft.channel);
    } else {
      setContent(presets[0].text);
      runScan(presets[0].text, presets[0].title, presets[0].channel);
    }
  }, [presetDraft]);

  const runScan = async (textToScan: string, currentTitle = title, currentChannel = channel) => {
    if (!textToScan.trim()) return;
    setIsScanning(true);
    try {
      const res = await api.scanContent(
        textToScan, 
        currentTitle, 
        currentChannel, 
        documentId, 
        ephemeralMode, 
        scrubPii
      );
      setScanResult(res);
      if (onScanCompleted) onScanCompleted();
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyFix = (violation: ViolationItem, idx: number) => {
    let updated = content;
    if (violation.flagged_text && updated.includes(violation.flagged_text)) {
      updated = updated.replace(violation.flagged_text, violation.suggested_fix);
    } else if (violation.start_char >= 0 && violation.end_char <= updated.length) {
      updated = updated.slice(0, violation.start_char) + violation.suggested_fix + updated.slice(violation.end_char);
    }

    setContent(updated);
    runScan(updated);
  };

  const handleFixAll = async () => {
    if (!scanResult || scanResult.violations.length === 0) return;
    try {
      setIsScanning(true);
      const res = await api.fixAll(content, scanResult.violations);
      setContent(res.content);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      await runScan(res.content);
    } catch (err) {
      console.error("Fix all error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadPresetItem = (p: typeof presets[0]) => {
    setTitle(p.title);
    setChannel(p.channel);
    setContent(p.text);
    setDocumentId(`doc-${p.id}-${Date.now()}`);
    runScan(p.text, p.title, p.channel);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      runScan(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleSubmitForReview = async () => {
    try {
      const authorName = currentRole === 'CREATOR' ? 'Utkarsh Yadav' : (currentRole === 'BRAND_MANAGER' ? 'Shreya Kumari' : 'Compliance Lead');
      
      await api.saveDocument({
        id: documentId,
        title,
        channel,
        author: authorName,
        author_role: currentRole,
        content,
        original_content: content,
        compliance_score: scanResult ? scanResult.compliance_score : 50,
        score_breakdown: scanResult?.score_breakdown || { tone: 70, facts: 70, terminology: 70, clarity: 70 },
        violations: scanResult?.violations || [],
        status: 'IN_REVIEW' as DocumentStatus
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onNavigateToReview(documentId);
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredViolations = scanResult?.violations.filter(v => {
    if (activeFilter === 'ALL') return true;
    return v.severity === activeFilter;
  }) || [];

  const score = scanResult?.compliance_score || 0;
  const violationCount = scanResult?.violations.length || 0;

  // Reusable Violations List Component
  const renderViolationsList = () => (
    <div className="bg-[#09090D]/90 border border-white/[0.08] rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl relative">
      <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
      <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

      {/* Filter Tabs Header */}
      <div className="p-3.5 bg-neutral-950/80 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="font-syne font-bold text-xs uppercase tracking-wider text-white">
            Policy Citations ({filteredViolations.length})
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[10px]">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(flt => (
            <button
              key={flt}
              onClick={() => setActiveFilter(flt)}
              className={`px-2 py-0.5 rounded-lg transition uppercase ${
                activeFilter === flt
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {flt}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="p-3.5 space-y-3 overflow-y-auto max-h-[500px]">
        {filteredViolations.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-90" />
            <h4 className="font-syne font-bold text-sm text-white uppercase tracking-wide">
              100% Policy Compliant
            </h4>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Draft complies with verified brand standards, certified SLAs, and approved terminology.
            </p>
          </div>
        ) : (
          filteredViolations.map((v, idx) => {
            const isSelected = selectedViolationIndex === idx;
            const severityBadge = {
              CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
              WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }[v.severity];

            return (
              <div
                key={`${v.rule_id}-${idx}`}
                onClick={() => setSelectedViolationIndex(idx)}
                className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                  isSelected
                    ? 'bg-neutral-900 border-rose-500/60 shadow-lg'
                    : 'bg-neutral-950/70 border-white/[0.06] hover:border-white/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${severityBadge}`}>
                      {v.severity}
                    </span>
                    <span className="text-xs font-syne font-bold text-white">
                      {v.rule_name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {v.rule_id}
                  </span>
                </div>

                {/* Flagged Phrase */}
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs">
                  <span className="text-[9px] uppercase font-mono text-rose-400 block mb-0.5 font-bold">
                    Flagged In Content:
                  </span>
                  <code className="font-mono text-rose-200 font-semibold text-xs">
                    "{v.flagged_text}"
                  </code>
                </div>

                {/* Citation */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Citation: {v.guideline_citation}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 italic bg-neutral-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                    "{v.guideline_excerpt}"
                  </p>
                </div>

                {/* AI Rationale */}
                <div className="text-[11px] text-neutral-300 bg-neutral-900/40 p-2 rounded-xl border border-white/[0.04]">
                  <strong className="text-amber-400 font-syne">Risk Assessment: </strong>
                  {v.ai_rationale}
                </div>

                {/* Suggested Fix */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <div className="text-xs text-emerald-400 min-w-0 flex-1 truncate font-mono">
                    <span className="text-neutral-500 text-[10px]">Fix: </span>
                    <span>{v.suggested_fix}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyFix(v, idx);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-syne font-bold uppercase tracking-wider rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition shrink-0 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Reusable Scorecard Component
  const renderScorecard = () => (
    <div className="bg-[#09090D]/90 border border-white/[0.08] rounded-2xl p-4 shadow-xl relative overflow-hidden backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        
        {/* Radial Meter */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={score >= 85 ? 'text-emerald-400' : (score >= 60 ? 'text-amber-400' : 'text-rose-500')}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-extrabold text-base text-white font-syne leading-none">{score}%</span>
              <span className="text-[9px] text-neutral-400 font-mono mt-0.5">{scanResult?.grade || '—'}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">
              Governance Health
            </div>
            <div className="text-sm font-bold text-white font-syne uppercase tracking-wide mt-0.5">
              {score >= 85 ? 'Certified Compliant' : (score >= 60 ? 'Revisions Required' : 'Critical Breaches')}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5 font-sans">
              {violationCount} policy violations flagged
            </div>
          </div>
        </div>

        {/* Autonomous Remediation Button */}
        {violationCount > 0 && (
          <div className="relative group cursor-pointer" onClick={handleFixAll}>
            <div className="absolute -inset-[1px] rounded-xl bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_300deg,#f43f5e_360deg)] opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-border-spin blur-[0.5px]" />
            <button
              disabled={isScanning}
              className="relative bg-neutral-900 border border-rose-500/40 text-white px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-500/10 hover:text-rose-300 transition text-xs font-bold font-syne uppercase tracking-wider"
            >
              <Wand2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Remediate All ({violationCount})</span>
            </button>
          </div>
        )}

      </div>

      {/* 4 Pillars Grid */}
      {scanResult && (
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.08] text-center">
          <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">Tone</span>
            <span className="text-xs font-bold text-white mt-0.5 font-mono block">{scanResult.score_breakdown.tone}%</span>
          </div>
          <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">Facts & SLA</span>
            <span className="text-xs font-bold text-white mt-0.5 font-mono block">{scanResult.score_breakdown.facts}%</span>
          </div>
          <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">Vocabulary</span>
            <span className="text-xs font-bold text-white mt-0.5 font-mono block">{scanResult.score_breakdown.terminology}%</span>
          </div>
          <div className="bg-neutral-950/70 p-2 rounded-xl border border-white/[0.04]">
            <span className="text-[9px] font-mono text-neutral-500 uppercase block">Clarity</span>
            <span className="text-xs font-bold text-white mt-0.5 font-mono block">{scanResult.score_breakdown.clarity}%</span>
          </div>
        </div>
      )}
    </div>
  );

  // Reusable Editor Component
  const renderEditor = () => (
    <div className="bg-[#09090D]/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
      <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
      <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

      {/* Editor Top Bar */}
      <div className="px-4 py-3 bg-neutral-950/80 border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-neutral-500 ml-1">markdown_workspace</span>
          <span className="text-neutral-700">|</span>
          <span className="text-white font-medium">{content.split(/\s+/).filter(Boolean).length} words</span>
          <span className="text-neutral-700">|</span>
          <span className="text-emerald-400 font-bold">{scanResult?.processing_time_ms || 18}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyContent}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setContent(presets[0].text);
              runScan(presets[0].text);
            }}
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-0.5 rounded-lg hover:bg-neutral-800 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Draft</span>
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => runScan(content)}
        placeholder="Type or paste draft collateral here for instantaneous multi-pillar compliance verification..."
        className="w-full min-h-[360px] p-4 bg-transparent text-neutral-200 placeholder-neutral-600 text-xs md:text-sm leading-relaxed focus:outline-none resize-none font-mono"
      />

      {/* Bottom Bar inside Editor */}
      <div className="px-4 py-3 bg-neutral-950/60 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-3 font-mono">
        <div className="flex items-center gap-3">
          <span>Tone: <strong className="text-white">{scanResult?.formality_label || 'Executive'}</strong></span>
          <span className="text-neutral-700">|</span>
          <span>Sentiment: <strong className="text-white">{scanResult?.sentiment_label || 'Measured'}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScrubPii(!scrubPii)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
              scrubPii ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-neutral-900 text-neutral-500 border-white/5'
            }`}
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>PII Shield: {scrubPii ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleSubmitForReview}
            disabled={submitSuccess || ephemeralMode}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-syne font-bold uppercase tracking-wider transition shadow-lg ${
              ephemeralMode
                ? 'bg-neutral-900 text-neutral-600 border border-white/5 cursor-not-allowed'
                : submitSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-black hover:bg-neutral-200 shadow-white/10'
            }`}
          >
            {submitSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submitted!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Review Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      
      {/* Top Header Card: Title, Channel Selector & Preset Chips */}
      <div className="p-4 bg-[#09090D]/90 border border-white/[0.08] rounded-2xl relative shadow-xl backdrop-blur-md space-y-3">
        <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
        <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-syne font-black text-base md:text-lg text-white placeholder-neutral-600 focus:outline-none border-b border-transparent focus:border-rose-500/50 pb-1"
            placeholder="Campaign Document Title..."
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-xs font-syne font-bold uppercase tracking-wider text-neutral-300 hover:text-white cursor-pointer transition">
              <FileUp className="w-3.5 h-3.5 text-neutral-400" />
              <span>Upload Document</span>
              <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => runScan(content)}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-syne font-bold uppercase tracking-wider transition shadow-lg shadow-rose-600/20"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
            </button>
          </div>
        </div>

        {/* Channel Selector & Evaluator Presets Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs">
          {/* Channels */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] uppercase text-neutral-500 mr-1">Channel:</span>
            {['Marketing Copy', 'Technical Docs', 'Press Release', 'Social Media', 'Investor Relations'].map(ch => (
              <button
                key={ch}
                onClick={() => {
                  setChannel(ch);
                  runScan(content, title, ch);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-syne font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  channel === ch
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-neutral-950 text-neutral-400 border border-white/[0.04] hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] uppercase text-neutral-500 mr-1">Evaluator Presets:</span>
            {presets.map(p => {
              const PIcon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => handleLoadPresetItem(p)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-neutral-900 border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-white transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <PIcon className={`w-3 h-3 ${p.iconColor}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Secret / PII Shield Alert Banner */}
      {scanResult && scanResult.pii_detected && scanResult.pii_detected.length > 0 && (
        <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-300 shadow-sm animate-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong className="text-white">Confidential Shield: </strong>
              Masked {scanResult.pii_detected.length} secret credential(s) prior to inference.
            </span>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase shrink-0">
            Protected
          </span>
        </div>
      )}

      {/* 
        RESPONSIVE VIEWPORT SYSTEM:
        - On Desktop (lg: and up): Dual-pane workstation side-by-side
        - On Mobile & Tablet (< lg): Segmented controller tabs [Editor] | [Flags] | [Score]
      */}

      {/* Desktop Viewport (lg: and up) */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {renderEditor()}
        </div>
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {renderScorecard()}
          {renderViolationsList()}
        </div>
      </div>

      {/* Mobile & Tablet Viewport (< lg) */}
      <div className="lg:hidden space-y-3">
        {/* Mobile Segmented Controller */}
        <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-1 flex items-center shadow-lg backdrop-blur-md">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'editor'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-rose-400" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => setMobileTab('flags')}
            className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 relative ${
              mobileTab === 'flags'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Flags</span>
            {violationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold">
                {violationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileTab('score')}
            className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
              mobileTab === 'score'
                ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Score</span>
            <span className="font-mono text-[10px] text-white bg-white/10 px-1 rounded">
              {score}%
            </span>
          </button>
        </div>

        {/* Tab Displays */}
        {mobileTab === 'editor' && renderEditor()}
        {mobileTab === 'flags' && renderViolationsList()}
        {mobileTab === 'score' && renderScorecard()}
      </div>

    </div>
  );
};
