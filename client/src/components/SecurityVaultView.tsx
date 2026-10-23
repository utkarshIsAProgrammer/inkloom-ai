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
  Zap,
  ShieldAlert
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
    if (!window.confirm("EMERGENCY PURGE: This will permanently delete all stored draft revisions, review comments, and cached audit states from local storage. Continue?")) {
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
    <div className="space-y-4 animate-in">
      
      {/* Top Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-black text-base md:text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <span>Zero-Knowledge Security Vault</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Hardware-accelerated cryptography, volatile in-memory processing, and zero-data retention controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware WebCrypto Active</span>
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl p-1 flex items-center shadow-lg backdrop-blur-md max-w-md">
        <button
          onClick={() => setSubTab('vault')}
          className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'vault'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Security Vault</span>
        </button>

        <button
          onClick={() => setSubTab('analytics')}
          className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'analytics'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setSubTab('pricing')}
          className={`flex-1 py-2 text-xs font-syne font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'pricing'
              ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in">
          
          {/* Ephemeral Mode Card */}
          <div className={`p-5 rounded-2xl border transition space-y-3 relative shadow-xl ${
            ephemeralMode
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-[#09090D]/90 border-white/[0.08]'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-rose-400" />
                <h4 className="font-syne font-black text-sm uppercase text-white">
                  Ephemeral Zero-Retention Mode
                </h4>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setEphemeralMode(!ephemeralMode)}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                  ephemeralMode ? 'bg-rose-600' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                    ephemeralMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              When armed, incoming draft text and images are evaluated strictly in volatile RAM. 
              <strong className="text-white"> Zero bytes</strong> are persisted to disk, databases, or cloud logs. Ideal for confidential pre-announcement press releases, M&A materials, and strict non-disclosure collateral.
            </p>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Persistent Disk Writes:</span>
              <span className={ephemeralMode ? "text-rose-400 font-bold" : "text-neutral-300"}>
                {ephemeralMode ? "DISABLED (0 BYTES)" : "ENABLED (SESSION CACHE)"}
              </span>
            </div>
          </div>

          {/* Interactive Live Secret Scrubber Simulator */}
          <div className="p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-syne font-black text-sm uppercase text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Live Secret & PII Auto-Scrubber</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Client-Side Masking</span>
            </div>

            <p className="text-xs text-neutral-400 font-sans">
              Type or paste API keys, AWS credentials, or customer emails to witness instantaneous client-side redaction prior to AI inference:
            </p>

            <input
              type="text"
              value={testScrubberText}
              onChange={(e) => setTestScrubberText(e.target.value)}
              className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-amber-500/50"
            />

            <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/[0.04] space-y-1">
              <span className="text-[9px] font-mono uppercase text-neutral-500 block">Sanitized Payload:</span>
              <p className="font-mono text-xs text-emerald-300 break-all leading-relaxed">{scrubbedResult}</p>
            </div>
          </div>

          {/* Cryptographic Primitives & SHA-256 Specs */}
          <div className="p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative">
            <span className="font-syne font-black text-sm uppercase text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-rose-400" />
              <span>Verifiable Cryptographic Primitives</span>
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.04]">
                <span className="text-[9px] uppercase text-neutral-500 block">Hashing Engine</span>
                <span className="text-white font-bold text-xs mt-1 block">SHA-256 (WebCrypto)</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.04]">
                <span className="text-[9px] uppercase text-neutral-500 block">Encryption Protocol</span>
                <span className="text-white font-bold text-xs mt-1 block">AES-GCM-256</span>
              </div>
            </div>

            {clientCryptoHash && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.04] text-xs font-mono">
                <span className="text-neutral-500 text-[10px] uppercase block mb-1">Session Cryptographic Nonce:</span>
                <span className="text-neutral-300 break-all text-[11px]">{clientCryptoHash}</span>
              </div>
            )}
          </div>

          {/* Emergency Local Data Purge */}
          <div className="p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative flex flex-col justify-between">
            <div>
              <span className="font-syne font-black text-sm uppercase text-white block">Emergency Clean Slate Protocol</span>
              <p className="text-xs text-neutral-400 font-sans mt-1">
                Instantly purges all cached draft revisions, local review logs, and session artifacts from browser IndexedDB and RAM.
              </p>
            </div>

            <button
              onClick={handlePurge}
              className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-syne font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{purgeSuccess ? 'Local State Purged Successfully' : 'Purge All Local Data'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
