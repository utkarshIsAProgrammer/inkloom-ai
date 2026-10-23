import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
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
  ShieldCheck
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

  // Quick preset samples
  const presets = [
    {
      id: 'saas-launch',
      label: '⚡ SaaS Launch (Violations)',
      title: 'Announcing Inkloom NextGen: Enterprise Workflow Automation',
      channel: 'Marketing Copy',
      text: `We are thrilled to unveil the new release of Inkloom Classic! It is the world's greatest workflow platform and an infinitely superior solution for all modern teams.\n\nUnlike traditional systems where AWS is clunky and slow, our new real-time distributed engine guarantees 100% uptime with zero downtime under any circumstances. Deployed in every country in the world, our cluster delivers <1ms latency everywhere with military-grade zero-hack encryption.\n\nYou'd be foolish not to upgrade immediately! Follow our updates on Twitter to learn more.`
    },
    {
      id: 'security-whitepaper',
      label: '🔒 Security Draft',
      title: 'Inkloom Distributed Architecture & Zero-Knowledge Verification',
      channel: 'Technical Docs',
      text: `This technical brief outlines Inkloom's enterprise deployment model. Our proprietary distributed consensus architecture achieves a verified 99.95% SLA with automated multi-region failover.\n\nAll cryptographic proofs are computed client-side using WebCrypto SHA-256 primitives, ensuring uncompromised data sovereignty without storing customer tokens or credentials.`
    },
    {
      id: 'social-teaser',
      label: '📱 Social Teaser',
      title: 'X/LinkedIn Teaser: Brand Compliance at Scale',
      channel: 'Social Media',
      text: `Stop letting rogue marketing claims slip through to production. Inkloom empowers enterprise teams to enforce brand guidelines, verify SLA claims, and sign audit certificates before publishing.\n\nCheck out the live interactive demo today: inkloom.ai`
    },
    {
      id: 'approved-showcase',
      label: '✅ Certified Clean',
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
      // Switch back to editor or score
      setMobileTab('score');
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

  return (
    <div className="space-y-3">
      
      {/* Horizontally Scrollable Sample Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => handleLoadPresetItem(p)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono bg-neutral-900 border border-white/10 hover:border-red-500/40 text-neutral-300 hover:text-white transition flex items-center gap-1 shadow-sm"
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Segmented Touch Controller */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-1 flex items-center shadow-lg backdrop-blur-md">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'editor'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-red-400" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => setMobileTab('flags')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 relative ${
            mobileTab === 'flags'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Flags</span>
          {violationCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold">
              {violationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setMobileTab('score')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
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

      {/* Secret / PII Shield Alert Banner */}
      {scanResult && scanResult.pii_detected && scanResult.pii_detected.length > 0 && (
        <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between gap-2 text-xs text-red-300 shadow-sm animate-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              Masked {scanResult.pii_detected.length} credential(s) prior to analysis.
            </span>
          </div>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold uppercase shrink-0">
            Shielded
          </span>
        </div>
      )}

      {/* TAB 1: DRAFT EDITOR */}
      {mobileTab === 'editor' && (
        <div className="space-y-3 animate-in">
          
          {/* Metadata Card */}
          <div className="p-3 bg-neutral-900/80 border border-white/10 rounded-2xl space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-syne font-bold text-sm text-white placeholder-neutral-500 focus:outline-none border-b border-white/5 focus:border-red-500/40 pb-1"
              placeholder="Campaign or Document Title..."
            />

            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['Marketing Copy', 'Technical Docs', 'Press Release', 'Social Media'].map(ch => (
                  <button
                    key={ch}
                    onClick={() => {
                      setChannel(ch);
                      runScan(content, title, ch);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-syne font-semibold whitespace-nowrap transition ${
                      channel === ch
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'text-neutral-400 hover:text-white bg-neutral-950 border border-white/5'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <label className="shrink-0 p-1 rounded-lg bg-neutral-950 border border-white/10 hover:border-white/20 text-neutral-300 cursor-pointer">
                <FileUp className="w-3.5 h-3.5" />
                <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Editor Container */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Editor Action Bar */}
            <div className="px-3 py-2 bg-neutral-950/80 border-b border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-white font-medium">
                  {content.split(/\s+/).filter(Boolean).length} words
                </span>
                <span className="text-neutral-600">•</span>
                <span>{scanResult?.processing_time_ms || 18}ms</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyContent}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                  title="Copy text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => runScan(content)}
                  disabled={isScanning}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-syne font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
                >
                  <Sparkles className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => runScan(content)}
              placeholder="Write or paste your draft here for instant brand-governance scanning..."
              className="w-full min-h-[260px] p-3.5 bg-transparent text-neutral-200 placeholder-neutral-600 text-xs leading-relaxed focus:outline-none resize-none font-mono"
            />

            {/* Bottom Bar inside Editor */}
            <div className="px-3 py-2 bg-neutral-950/60 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <span>Tone: <strong className="text-white">{scanResult?.formality_label || 'Executive'}</strong></span>
                <span className="text-neutral-600">•</span>
                <span>Sent: <strong className="text-white">{scanResult?.sentiment_label || 'Measured'}</strong></span>
              </div>

              <button
                onClick={() => setScrubPii(!scrubPii)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  scrubPii ? 'text-amber-400 bg-amber-950/30' : 'text-neutral-500'
                }`}
              >
                <Key className="w-2.5 h-2.5" />
                <span>PII-Mask:{scrubPii ? 'ON' : 'OFF'}</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: GOVERNANCE FLAGS & CITATIONS */}
      {mobileTab === 'flags' && (
        <div className="space-y-3 animate-in">
          
          {/* Filter Pills */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400 font-syne uppercase text-[10px] tracking-wider font-semibold">
              Filtered Breaches
            </span>

            <div className="flex items-center gap-1">
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(flt => (
                <button
                  key={flt}
                  onClick={() => setActiveFilter(flt)}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase transition ${
                    activeFilter === flt
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white bg-neutral-900 border border-white/5'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          {/* List of Violations */}
          <div className="space-y-2.5">
            {filteredViolations.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl bg-neutral-900/60 border border-white/10 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-syne font-bold text-sm text-white uppercase">
                  Zero Violations Detected
                </h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Your draft complies with approved brand guidelines, SLA claims, and terminology rules.
                </p>
                <button
                  onClick={handleSubmitForReview}
                  className="mt-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-syne font-bold uppercase tracking-wider shadow-lg hover:bg-neutral-200 transition"
                >
                  Submit for Approval 🚀
                </button>
              </div>
            ) : (
              filteredViolations.map((v, idx) => {
                const isSelected = selectedViolationIndex === idx;
                const severityBadge = {
                  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
                  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }[v.severity];

                return (
                  <div
                    key={`${v.rule_id}-${idx}`}
                    onClick={() => setSelectedViolationIndex(idx)}
                    className={`p-3 rounded-2xl border transition space-y-2 ${
                      isSelected
                        ? 'bg-neutral-900 border-red-500/60 shadow-lg'
                        : 'bg-neutral-900/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${severityBadge}`}>
                          {v.severity}
                        </span>
                        <span className="text-xs font-syne font-bold text-white">
                          {v.rule_name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500">
                        {v.rule_id}
                      </span>
                    </div>

                    {/* Flagged Snippet */}
                    <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/30 text-xs">
                      <span className="text-[9px] uppercase font-mono text-red-400 block mb-0.5 font-bold">
                        Offending Phrase:
                      </span>
                      <code className="font-mono text-red-200 font-semibold text-[11px]">
                        "{v.flagged_text}"
                      </code>
                    </div>

                    {/* Rule Citation */}
                    <div className="text-[11px] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-300 font-mono">
                        <BookOpen className="w-3 h-3 text-red-400" />
                        <span>Rule Citation: {v.guideline_citation}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 italic bg-neutral-950/60 p-2 rounded-xl border border-white/5">
                        "{v.guideline_excerpt}"
                      </p>
                    </div>

                    {/* Suggested Fix Action */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-emerald-400 min-w-0 flex-1 truncate font-mono">
                        <span className="text-neutral-500 text-[10px]">Fix: </span>
                        <span>{v.suggested_fix}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyFix(v, idx);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition shrink-0 shadow-sm"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply</span>
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 3: QUALITY SCORE & PILLARS */}
      {mobileTab === 'score' && (
        <div className="space-y-3 animate-in">
          
          {/* Main Radial Score Card */}
          <div className="p-4 bg-neutral-900/80 border border-white/10 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-4">
              
              {/* Radial Meter */}
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
                    className={score >= 85 ? 'text-emerald-400' : (score >= 60 ? 'text-amber-400' : 'text-red-500')}
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

              <div className="flex-1">
                <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">
                  /// Overall Quality
                </span>
                <h3 className="text-sm font-bold font-syne uppercase text-white mt-0.5">
                  {score >= 85 ? 'Certified Compliant' : (score >= 60 ? 'Revisions Needed' : 'Action Required')}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {violationCount} policy violations flagged across brand guidelines
                </p>
              </div>
            </div>

            {/* Pillar Grid */}
            {scanResult && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10">
                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-syne font-semibold uppercase">Tone & Voice</span>
                    <span className="font-mono text-white font-bold">{scanResult.score_breakdown.tone}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${scanResult.score_breakdown.tone}%` }} />
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-syne font-semibold uppercase">Facts & SLA</span>
                    <span className="font-mono text-white font-bold">{scanResult.score_breakdown.facts}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${scanResult.score_breakdown.facts}%` }} />
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-syne font-semibold uppercase">Terminology</span>
                    <span className="font-mono text-white font-bold">{scanResult.score_breakdown.terminology}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${scanResult.score_breakdown.terminology}%` }} />
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-400">
                    <span className="font-syne font-semibold uppercase">Clarity</span>
                    <span className="font-mono text-white font-bold">{scanResult.score_breakdown.clarity}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${scanResult.score_breakdown.clarity}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cryptographic SHA-256 Stamp */}
          {scanResult?.cryptographic_hash && (
            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase">
                <Fingerprint className="w-3.5 h-3.5 text-red-400" />
                <span>SHA-256 Provenance Digest</span>
              </div>
              <div className="font-mono text-[10px] text-neutral-300 break-all bg-neutral-950 p-2 rounded-xl border border-white/5">
                {scanResult.cryptographic_hash}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Floating Bottom Action Strip (Thumb zone right above the bottom tab dock) */}
      <div className="sticky bottom-0 pt-2 pb-1 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-20">
        <div className="flex items-center gap-2">
          
          {/* Fix All Button */}
          {violationCount > 0 && (
            <div className="flex-1 relative group cursor-pointer" onClick={handleFixAll}>
              <div className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_300deg,#ef4444_360deg)] opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-border-spin blur-[0.5px]" />
              <button
                disabled={isScanning}
                className="w-full relative bg-neutral-900 border border-red-500/30 text-white px-3 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 hover:text-red-300 transition text-xs font-bold font-syne uppercase tracking-wider"
              >
                <Wand2 className="w-3.5 h-3.5 text-red-500" />
                <span>Fix All ({violationCount})</span>
              </button>
            </div>
          )}

          {/* Submit for Review Button */}
          <button
            onClick={handleSubmitForReview}
            disabled={submitSuccess || ephemeralMode}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase font-syne tracking-wider transition shadow-lg ${
              ephemeralMode
                ? 'bg-neutral-900 text-neutral-600 border border-white/5 cursor-not-allowed'
                : submitSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-black hover:bg-neutral-200 shadow-white/10'
            }`}
          >
            {submitSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Submitted!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
