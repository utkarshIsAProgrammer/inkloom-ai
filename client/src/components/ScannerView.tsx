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

  // Load preset or initial default
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

  // Filter violations
  const filteredViolations = scanResult?.violations.filter(v => {
    if (activeFilter === 'ALL') return true;
    return v.severity === activeFilter;
  }) || [];

  const score = scanResult?.compliance_score || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Settings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-bold text-lg text-white placeholder-slate-500 focus:outline-none border-b border-transparent focus:border-indigo-500/60 transition pb-1"
            placeholder="Document or Campaign Title..."
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Target Channel:</span>
            {['Marketing Copy', 'Technical Docs', 'Press Release', 'Social Media', 'Investor Relations'].map(ch => (
              <button
                key={ch}
                onClick={() => {
                  setChannel(ch);
                  runScan(content, title, ch);
                }}
                className={`px-2.5 py-1 rounded-md transition ${
                  channel === ch 
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-medium' 
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-400'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Security Toggles & Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
          
          {/* Ephemeral Mode Toggle */}
          <button
            onClick={() => {
              setEphemeralMode(!ephemeralMode);
              runScan(content);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              ephemeralMode
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border-slate-700'
            }`}
            title="When active, content is evaluated purely in volatile RAM without disk writes"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Vault Mode: {ephemeralMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Scrub PII Toggle */}
          <button
            onClick={() => {
              setScrubPii(!scrubPii);
              runScan(content);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              scrubPii
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto-mask API keys, credentials, and customer emails"
          >
            <Key className="w-3.5 h-3.5" />
            <span>PII Shield: {scrubPii ? 'ON' : 'OFF'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg cursor-pointer transition">
            <FileUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload (.md, .txt)</span>
            <input 
              type="file" 
              accept=".txt,.md,.markdown,.json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={() => runScan(content)}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm shadow-indigo-500/20 transition"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing...' : 'Re-Scan'}</span>
          </button>
        </div>
      </div>

      {/* PII / Secrets Warning Banner if detected */}
      {scanResult && scanResult.pii_detected && scanResult.pii_detected.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>PII / Credential Leak Intercepted: </strong>
              Masked {scanResult.pii_detected.length} potential secrets ({scanResult.pii_detected.map(p => p.type).join(', ')}) before audit processing.
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 font-bold border border-amber-500/30">
            Auto-Shielded
          </span>
        </div>
      )}

      {/* Main Dual-Pane Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Pane: Editor */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          
          <div className="flex items-center justify-between px-4 py-3 bg-slate-850/80 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-4 text-slate-400">
              <span className="font-semibold text-slate-300">Content Draft</span>
              <span>{scanResult?.total_words || content.split(/\s+/).filter(Boolean).length} words</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {scanResult?.reading_time_seconds || 15}s read
              </span>
              {scanResult && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]" title="Zero-lag local evaluation performance">
                  <Zap className="w-3 h-3" />
                  {scanResult.processing_time_ms} ms
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyContent}
                className="p-1.5 rounded hover:bg-slate-750 text-slate-400 hover:text-slate-200 transition"
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
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-750 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col min-h-[380px]">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
              }}
              onBlur={() => runScan(content)}
              placeholder="Paste or write your marketing draft, documentation, or announcement here..."
              className="w-full flex-1 bg-transparent text-slate-200 placeholder-slate-600 font-normal text-sm leading-relaxed focus:outline-none resize-none font-mono"
              rows={14}
            />

            {/* Bottom Status bar */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span>Tone: <strong className="text-slate-200">{scanResult?.formality_label || 'Executive'}</strong></span>
                <span>Sentiment: <strong className="text-slate-200">{scanResult?.sentiment_label || 'Measured'}</strong></span>
                {scanResult?.cryptographic_hash && (
                  <span className="font-mono text-[10px] text-slate-500 hidden sm:inline" title="Client-Side Cryptographic Fingerprint">
                    {scanResult.cryptographic_hash.slice(0, 16)}...
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitForReview}
                disabled={submitSuccess || ephemeralMode}
                title={ephemeralMode ? "Disabled in Zero-Data Retention Mode" : "Push to collaborative review pipeline"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  ephemeralMode
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : submitSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              
              {/* Circular Gauge */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
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
                    <span className="font-extrabold text-lg text-white leading-none">{score}%</span>
                    <span className="text-[10px] text-slate-400 font-medium">{scanResult?.grade || '—'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Governance Health
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {score >= 85 ? 'Certified Brand Compliant' : (score >= 60 ? 'Requires Revision' : 'Critical Violations Flagged')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {scanResult?.violations.length || 0} issues detected across 4 pillars
                  </div>
                </div>
              </div>

              {/* Fix All Button */}
              {scanResult && scanResult.violations.length > 0 && (
                <button
                  onClick={handleFixAll}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition transform active:scale-95"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Fix All ({scanResult.violations.length})</span>
                </button>
              )}

            </div>

            {/* Pillar Breakdown mini-bars */}
            {scanResult && (
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Tone</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{scanResult.score_breakdown.tone}%</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Facts & SLA</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{scanResult.score_breakdown.facts}%</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Vocab & DEI</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{scanResult.score_breakdown.terminology}%</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-400 uppercase">Clarity</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">{scanResult.score_breakdown.clarity}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Violations List Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
            
            {/* Header & Filter Tabs */}
            <div className="p-3 bg-slate-850/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>Explainable Violations ({filteredViolations.length})</span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(flt => (
                  <button
                    key={flt}
                    onClick={() => setActiveFilter(flt)}
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      activeFilter === flt
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                  <div className="font-semibold text-slate-200 text-sm">No Governance Violations Found</div>
                  <div className="text-xs max-w-xs mx-auto">
                    This content draft fully complies with enterprise brand standards, certified SLAs, and tone requirements.
                  </div>
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
                          ? 'bg-slate-800/90 border-indigo-500/60 shadow-md' 
                          : 'bg-slate-850/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${severityBadge}`}>
                            {v.severity}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">
                            {v.rule_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {v.rule_id}
                        </span>
                      </div>

                      {/* Flagged Snippet */}
                      <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-rose-200">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block mb-0.5">Flagged Expression:</span>
                        <code className="font-mono text-rose-300 font-semibold">"{v.flagged_text}"</code>
                      </div>

                      {/* Rule Citation from Manual */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-400">
                          <BookOpen className="w-3 h-3" />
                          <span>Citation: {v.guideline_citation}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800/60">
                          "{v.guideline_excerpt}"
                        </p>
                      </div>

                      {/* AI Rationale */}
                      <div className="text-[11px] text-slate-300 bg-slate-800/40 p-2 rounded border border-slate-700/40">
                        <strong className="text-amber-400">Brand Risk: </strong>
                        {v.ai_rationale}
                      </div>

                      {/* Suggested Fix Action */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-emerald-400 min-w-0 flex-1 truncate">
                          <span className="text-slate-400">Fix: </span>
                          <span className="font-mono font-medium">{v.suggested_fix}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyFix(v, idx);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 transition shrink-0"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply Fix</span>
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
