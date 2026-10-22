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
  HardDrive
} from 'lucide-react';
import { SecuritySpecs, UserRole } from '../types';
import { api } from '../services/api';

interface SecurityVaultViewProps {
  currentRole: UserRole;
  ephemeralMode: boolean;
  setEphemeralMode: (enabled: boolean) => void;
}

export const SecurityVaultView: React.FC<SecurityVaultViewProps> = ({
  currentRole,
  ephemeralMode,
  setEphemeralMode
}) => {
  const [specs, setSpecs] = useState<SecuritySpecs | null>(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [clientCryptoHash, setClientCryptoHash] = useState<string>("");

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
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Security & Zero-Knowledge Privacy Vault</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hardware-accelerated cryptography, volatile in-memory processing, and zero-data retention controls for confidential enterprise drafts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Client WebCrypto: Active</span>
          </span>
        </div>
      </div>

      {/* Ephemeral Zero-Data Retention Control Card */}
      <div className={`p-5 rounded-2xl border transition ${
        ephemeralMode 
          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">
                Ephemeral Zero-Data Retention Mode (Confidential Vault)
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                ephemeralMode 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {ephemeralMode ? 'ARMED & ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When enabled, incoming drafts are processed strictly in volatile RAM. 
              <strong> Zero bytes</strong> are written to the database, persistent disks, or external server logs. Ideal for pre-release M&A disclosures, embargoed financials, and strict NDA collateral.
            </p>
          </div>

          <button
            onClick={() => setEphemeralMode(!ephemeralMode)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              ephemeralMode
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{ephemeralMode ? 'Deactivate Vault Mode' : 'Arm Zero-Retention Mode'}</span>
          </button>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Hardware Crypto Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Client-Side Hardware Crypto</h4>
            <p className="text-xs text-slate-400 mt-1">
              Document integrity checksums and clearance signatures are computed locally using <code className="text-indigo-300">window.crypto.subtle</code> SHA-256.
            </p>
          </div>
          <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 truncate">
            Entropy: {clientCryptoHash ? `${clientCryptoHash}...` : 'Initializing WebCrypto...'}
          </div>
        </div>

        {/* PII & Secret Scrubber */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Automated Secret & PII Scrubber</h4>
            <p className="text-xs text-slate-400 mt-1">
              Real-time pattern interception masks AWS credentials, bearer tokens, customer email lists, and credit card numbers prior to scan execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            {['AWS (AKIA...)', 'OpenAI/Gemini (sk-...)', 'Bearer Auth', 'Emails'].map(s => (
              <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Regulatory Compliance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileLock2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Compliance & Sovereignty</h4>
            <p className="text-xs text-slate-400 mt-1">
              Engineered to satisfy SOC 2 Type II audit trail requirements and GDPR Article 17 "Right to Erasure" protocol.
            </p>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audit-trail immutability guaranteed</span>
          </div>
        </div>

      </div>

      {/* Threat Model & Emergency Data Purge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-rose-400" />
              <span>Emergency Data Erasure & Sovereign Reset</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly purge all stored documents, comments, and cached drafts. Zero recoverable traces left in database or memory.
            </p>
          </div>

          <button
            onClick={handlePurge}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/60 rounded-xl transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{purgeSuccess ? 'Purged Successfully!' : 'Purge All Cached Drafts'}</span>
          </button>
        </div>

        {/* Threat Model Table */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Inkloom Sovereign Threat Model Matrix
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 pr-4 font-semibold">Threat Vector</th>
                  <th className="py-2 pr-4 font-semibold">Risk Classification</th>
                  <th className="py-2 font-semibold">Inkloom Architectural Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-white">Server Seizure / Host Breach</td>
                  <td className="py-2.5 pr-4 text-emerald-400 font-semibold">Zero Exposure (Vault Mode)</td>
                  <td className="py-2.5 text-slate-400">Volatile RAM processing; zero plaintext persisted to disk when Ephemeral Mode is active.</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-white">Accidental Secret Leakage</td>
                  <td className="py-2.5 pr-4 text-amber-400 font-semibold">Pre-Emptive Interception</td>
                  <td className="py-2.5 text-slate-400">Automated regex PII scrubber masks keys (AWS, API tokens) before AI evaluation.</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-white">Audit Trail Tampering</td>
                  <td className="py-2.5 pr-4 text-indigo-400 font-semibold">Cryptographic Lock</td>
                  <td className="py-2.5 text-slate-400">Clearance certificates embed SHA-256 digital signature hashes generated via WebCrypto.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
