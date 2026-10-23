import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileLock2, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Fingerprint, 
  Layers, 
  RefreshCw,
  HardDrive,
  BarChart3,
  CreditCard,
  Zap
} from 'lucide-react';
import { SecuritySpecs, UserRole, UsageStats } from '../types';
import { api } from '../services/api';
import { AnalyticsDashboardView } from './AnalyticsDashboardView';
import { PricingTiersView } from './PricingTiersView';

interface SecurityVaultViewProps {
  currentRole: UserRole;
  ephemeralMode: boolean;
  setEphemeralMode: (enabled: boolean) => void;
  usage?: UsageStats | null;
  onUsageChanged?: (updated: UsageStats) => void;
}

export const SecurityVaultView: React.FC<SecurityVaultViewProps> = ({
  currentRole,
  ephemeralMode,
  setEphemeralMode,
  usage = null,
  onUsageChanged
}) => {
  const [subTab, setSubTab] = useState<'vault' | 'analytics' | 'pricing'>('vault');
  const [specs, setSpecs] = useState<SecuritySpecs | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [clientCryptoHash, setClientCryptoHash] = useState<string>("");

  // Live PII Scrubber Demo test text
  const [testScrubberText, setTestScrubberText] = useState(
    "Deploying AWS key AKIAIOSFODNN7EXAMPLE and OpenAI secret sk-live-99948247921 to utkarsh@example.com"
  );
  const [scrubbedResult, setScrubbedResult] = useState<string>("");

  useEffect(() => {
    api.getSecuritySpecs().then(setSpecs).catch(console.error);
    
    // Demonstrate client-side WebCrypto SHA-256 computation
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode("Inkloom-AI-Zero-Knowledge-Entropy-" + Date.now());
      window.crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setClientCryptoHash(hashHex.slice(0, 32));
      });
    }
  }, []);

  const handleTestScrubber = () => {
    let scrubbed = testScrubberText
      .replace(/AKIA[0-9A-Z]{16}/g, "[REDACTED_AWS_KEY]")
      .replace(/sk-[a-zA-Z0-9]{20,}/g, "[REDACTED_API_SECRET]")
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[REDACTED_EMAIL]");
    setScrubbedResult(scrubbed);
  };

  useEffect(() => {
    handleTestScrubber();
  }, [testScrubberText]);

  const handlePurge = async () => {
    if (!window.confirm("⚠️ EMERGENCY PURGE: This will permanently delete all stored draft revisions, review comments, and cached audit states from local storage. Continue?")) {
      return;
    }
    try {
      await api.purgeData();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3 animate-in">
      
      {/* Sub-Tab Navigation Bar */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-1 flex items-center shadow-lg backdrop-blur-md">
        <button
          onClick={() => setSubTab('vault')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'vault'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-red-400" />
          <span>Security</span>
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'analytics'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-red-400" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setSubTab('pricing')}
          className={`flex-1 py-1.5 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'pricing'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-red-400" />
          <span>Free Tier</span>
        </button>
      </div>

      {subTab === 'analytics' && <AnalyticsDashboardView currentRole={currentRole} />}
      
      {subTab === 'pricing' && (
        <PricingTiersView 
          usage={usage} 
          onTierChanged={(u) => {
            if (onUsageChanged) onUsageChanged(u);
          }} 
        />
      )}

      {subTab === 'vault' && (
        <div className="space-y-3 animate-in">
          
          {/* Header Banner */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-syne font-bold text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-red-400" />
                <span>Zero-Knowledge Security Vault</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Volatile in-memory processing & zero-data retention
              </p>
            </div>

            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              Hardware WebCrypto
            </span>
          </div>

          {/* Ephemeral Mode Card */}
          <div className={`p-3.5 rounded-2xl border transition space-y-2.5 ${
            ephemeralMode
              ? 'bg-red-950/20 border-red-500/40 shadow-lg'
              : 'bg-neutral-900/80 border-white/10'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-red-400" />
                <span className="font-syne font-bold text-xs uppercase text-white">
                  Ephemeral Zero-Retention Mode
                </span>
              </div>

              {/* Active Toggle Switch */}
              <button
                onClick={() => setEphemeralMode(!ephemeralMode)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                  ephemeralMode ? 'bg-red-600' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    ephemeralMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              When armed, incoming draft text and images are evaluated strictly in volatile RAM. 
              <strong> Zero bytes</strong> are persisted to disk or cloud databases. Ideal for confidential pre-announcement press releases and M&A materials.
            </p>
          </div>

          {/* Interactive Live Secret Scrubber Simulator */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Secret & PII Auto-Scrubber</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Client-Side</span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Type or paste secrets below to witness instantaneous redaction before LLM inference:
            </p>

            <input
              type="text"
              value={testScrubberText}
              onChange={(e) => setTestScrubberText(e.target.value)}
              className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none focus:border-red-500/50"
            />

            <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-white/5 space-y-1">
              <span className="text-[9px] font-mono uppercase text-neutral-500">Sanitized Output Payload:</span>
              <p className="font-mono text-xs text-emerald-300 break-all">{scrubbedResult}</p>
            </div>
          </div>

          {/* Cryptographic Entropy & Specifications */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
            <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-red-400" />
              <span>Verifiable Cryptographic Primitives</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-neutral-950 border border-white/5">
                <span className="text-[9px] uppercase text-neutral-500 block">Hash Engine</span>
                <span className="text-white font-bold text-[11px]">SHA-256 (WebCrypto)</span>
              </div>
              <div className="p-2 rounded-xl bg-neutral-950 border border-white/5">
                <span className="text-[9px] uppercase text-neutral-500 block">Encryption Standard</span>
                <span className="text-white font-bold text-[11px]">AES-GCM-256</span>
              </div>
            </div>

            {clientCryptoHash && (
              <div className="p-2 rounded-xl bg-neutral-950 border border-white/5 text-[10px] font-mono">
                <span className="text-neutral-500 block mb-0.5">Session Entropy Hash:</span>
                <span className="text-neutral-300 break-all">{clientCryptoHash}</span>
              </div>
            )}
          </div>

          {/* Emergency Local Purge Button */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-syne font-bold text-xs uppercase text-white block">Emergency Clean Slate</span>
                <p className="text-[11px] text-neutral-400">Purge all local cache, drafts, and session data</p>
              </div>

              <button
                onClick={handlePurge}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-syne font-bold uppercase tracking-wider transition"
              >
                {purgeSuccess ? 'Purged ✓' : 'Purge All'}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
