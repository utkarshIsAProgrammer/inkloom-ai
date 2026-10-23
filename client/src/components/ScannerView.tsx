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
  Zap
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

  useEffect(() => {
    if (presetDraft) {
      setTitle(presetDraft.title || "Demo Draft");
      setChannel(presetDraft.channel || "Marketing Copy");
      setContent(presetDraft.content || "");
      setDocumentId(presetDraft.id || `doc-${Date.now()}`);
      runScan(presetDraft.content, presetDraft.title, presetDraft.channel);
    } else {
      const defaultText = `We are thrilled to unveil the new release of Inkloom Classic! It is the world's greatest workflow platform and an infinitely superior solution for all modern teams.\n\nUnlike traditional systems where AWS is clunky and slow, our new real-time distributed engine guarantees 100% uptime with zero downtime under any circumstances. Deployed in every country in the world, our cluster delivers <1ms latency everywhere with military-grade zero-hack encryption.\n\nYou'd be foolish not to upgrade immediately! Follow our updates on Twitter to learn more.`;
      setContent(defaultText);
      runScan(defaultText, title, channel);
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
      }, 1200);
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

  return (
    <div className="space-y-6">
      
      {/* Top Header & Settings with Luminal Studio styling */}
      <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-4 relative backdrop-blur-sm">
        <div className="absolute -left-[5px] -top-[5px] text-white/30 text-xs hidden md:block">+</div>
        <div className="absolute -right-[5px] -top-[5px] text-white/30 text-xs hidden md:block">+</div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-syne font-bold text-lg text-white placeholder-neutral-600 focus:outline-none border-b border-transparent focus:border-red-500/60 transition pb-1"
              placeholder="Campaign or Document Title..."
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-mono text-[10px] uppercase text-neutral-500">/// Channel:</span>
              {['Marketing Copy', 'Technical Docs', 'Press Release', 'Social Media', 'Investor Relations'].map(ch => (
                <button
                  key={ch}
                  onClick={() => {
                    setChannel(ch);
                    runScan(content, title, ch);
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition uppercase font-syne tracking-wider ${
                    channel === ch 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30 font-semibold' 
                      : 'bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 border border-white/5'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Action Controls & Vault Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
            
            <button
              onClick={() => {
                setEphemeralMode(!ephemeralMode);
                runScan(content);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition border ${
                ephemeralMode
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-neutral-950 text-neutral-400 border-white/10 hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 text-red-500" />
              <span>VAULT:{ephemeralMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                setScrubPii(!scrubPii);
                runScan(content);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition border ${
                scrubPii
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-neutral-950 text-neutral-500 border-white/10'
              }`}
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span>PII_SHIELD:{scrubPii ? 'ON' : 'OFF'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-md cursor-pointer transition">
              <FileUp className="w-3.5 h-3.5 text-neutral-400" />
              <span>Upload (.md, .txt)</span>
              <input type="file" accept=".txt,.md,.markdown,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => runScan(content)}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-md shadow-lg shadow-red-500/20 transition uppercase font-syne tracking-wider"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Analyzing...' : 'Re-Scan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PII Alert Banner */}
      {scanResult && scanResult.pii_detected && scanResult.pii_detected.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong className="text-white">Secret Leak Prevented: </strong>
              Masked {scanResult.pii_detected.length} credential(s) ({scanResult.pii_detected.map(p => p.type).join(', ')}) prior to processing.
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30 uppercase">
            Auto-Shielded
          </span>
        </div>
      )}

      {/* Main Dual-Pane Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Pane: Editor */}
        <div className="lg:col-span-7 flex flex-col bg-neutral-900/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
          
          {/* Mac window header bar with traffic light dots */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-white/10 text-xs">
            <div className="flex items-center gap-3">
              {/* Traffic light window controls from demo */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
              </div>
              <span className="font-mono text-[11px] text-neutral-400 ml-1">editor.markdown</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400 text-[11px]">{scanResult?.total_words || content.split(/\s+/).filter(Boolean).length} words</span>
              {scanResult && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {scanResult.processing_time_ms} ms
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyContent}
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                title="Copy content"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  const resetDraft = `We are thrilled to unveil the new release of Inkloom Classic! It is the world's greatest workflow platform and an infinitely superior solution for all modern teams.\n\nUnlike traditional systems where AWS is clunky and slow, our new real-time distributed engine guarantees 100% uptime with zero downtime under any circumstances. Deployed in every country in the world, our cluster delivers <1ms latency everywhere with military-grade zero-hack encryption.\n\nYou'd be foolish not to upgrade immediately! Follow our updates on Twitter to learn more.`;
                  setContent(resetDraft);
                  runScan(resetDraft);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col min-h-[380px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => runScan(content)}
              placeholder="Write or paste your draft here for real-time brand governance analysis..."
              className="w-full flex-1 bg-transparent text-neutral-200 placeholder-neutral-600 font-normal text-sm leading-relaxed focus:outline-none resize-none font-mono"
              rows={14}
            />

            {/* Bottom Status bar */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>Tone: <strong className="text-white">{scanResult?.formality_label || 'Executive'}</strong></span>
                <span>Sentiment: <strong className="text-white">{scanResult?.sentiment_label || 'Measured'}</strong></span>
                {scanResult?.cryptographic_hash && (
                  <span className="text-neutral-500 hidden sm:inline">
                    {scanResult.cryptographic_hash.slice(0, 16)}...
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitForReview}
                disabled={submitSuccess || ephemeralMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase font-syne tracking-wider transition ${
                  ephemeralMode
                    ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-white/5'
                    : submitSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white text-black hover:bg-neutral-200 shadow-md'
                }`}
              >
                {submitSuccess ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Submitted to Pipeline!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{ephemeralMode ? 'Vault Active (No Store)' : 'Submit for Review'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Pane: AI Governance Copilot */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Executive Scorecard */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between">
              
              {/* Circular Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
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
                    <span className="font-extrabold text-lg text-white font-syne leading-none">{score}%</span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{scanResult?.grade || '—'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">
                    /// Governance Health
                  </div>
                  <div className="text-sm font-bold text-white font-syne uppercase tracking-wide mt-0.5">
                    {score >= 85 ? 'Certified Compliant' : (score >= 60 ? 'Revisions Required' : 'Critical Violations')}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                    {scanResult?.violations.length || 0} policy breaches intercepted
                  </div>
                </div>
              </div>

              {/* Fix All Button with Spinning Border from Luminal demo */}
              {scanResult && scanResult.violations.length > 0 && (
                <div className="relative group cursor-pointer" onClick={handleFixAll}>
                  <div className="absolute -inset-[1px] rounded-md bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_300deg,#ef4444_360deg)] opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-border-spin blur-[0.5px]"></div>
                  <button
                    disabled={isScanning}
                    className="relative bg-neutral-900 border border-red-500/30 text-white px-3 py-2 rounded-md flex items-center gap-1.5 shadow-lg shadow-red-500/10 group-hover:text-red-400 group-hover:border-red-500/60 transition-all text-xs font-bold font-syne uppercase tracking-wider"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Fix All ({scanResult.violations.length})</span>
                  </button>
                </div>
              )}

            </div>

            {/* Pillar Breakdown mini-bars */}
            {scanResult && (
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                <div className="bg-neutral-950/60 p-2 rounded border border-white/5">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">Tone</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-mono">{scanResult.score_breakdown.tone}%</div>
                </div>
                <div className="bg-neutral-950/60 p-2 rounded border border-white/5">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">Facts & SLA</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-mono">{scanResult.score_breakdown.facts}%</div>
                </div>
                <div className="bg-neutral-950/60 p-2 rounded border border-white/5">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">Vocab & DEI</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-mono">{scanResult.score_breakdown.terminology}%</div>
                </div>
                <div className="bg-neutral-950/60 p-2 rounded border border-white/5">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">Clarity</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-mono">{scanResult.score_breakdown.clarity}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Violations List Container */}
          <div className="bg-neutral-900/80 border border-white/10 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm relative">
            
            {/* Header & Filter Tabs */}
            <div className="p-3 bg-neutral-950/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white font-syne uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Explainable Policy Flags ({filteredViolations.length})</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setActiveFilter(flt)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase transition ${
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

            {/* List */}
            <div className="p-3 space-y-3 overflow-y-auto max-h-[460px]">
              {filteredViolations.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                  <div className="font-semibold text-white text-sm font-syne uppercase tracking-wide">
                    Zero Governance Violations Found
                  </div>
                  <div className="text-xs max-w-xs mx-auto text-neutral-400">
                    Draft complies with enterprise brand standards, certified SLAs, and tone dimensions.
                  </div>
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
                      className={`p-3.5 rounded-lg border transition space-y-2.5 ${
                        isSelected 
                          ? 'bg-neutral-850 border-red-500/50 shadow-lg' 
                          : 'bg-neutral-950/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${severityBadge}`}>
                            {v.severity}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {v.rule_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {v.rule_id}
                        </span>
                      </div>

                      {/* Flagged Snippet */}
                      <div className="p-2 rounded bg-red-950/30 border border-red-900/40 text-xs text-red-200">
                        <span className="text-[9px] uppercase font-mono font-bold text-red-400 block mb-0.5">Flagged Phrase:</span>
                        <code className="font-mono text-red-300 font-semibold">"{v.flagged_text}"</code>
                      </div>

                      {/* Rule Citation from Manual */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-300 font-mono">
                          <BookOpen className="w-3 h-3 text-red-400" />
                          <span>Citation: {v.guideline_citation}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 italic bg-neutral-900/60 p-2 rounded border border-white/5">
                          "{v.guideline_excerpt}"
                        </p>
                      </div>

                      {/* AI Rationale */}
                      <div className="text-[11px] text-neutral-300 bg-neutral-900/40 p-2 rounded border border-white/5">
                        <strong className="text-amber-400">Risk Assessment: </strong>
                        {v.ai_rationale}
                      </div>

                      {/* Suggested Fix Action */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-emerald-400 min-w-0 flex-1 truncate">
                          <span className="text-neutral-500 font-mono text-[10px]">Fix: </span>
                          <span className="font-mono font-medium">{v.suggested_fix}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyFix(v, idx);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition shrink-0 uppercase font-syne tracking-wider"
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

        </div>

      </div>

    </div>
  );
};
