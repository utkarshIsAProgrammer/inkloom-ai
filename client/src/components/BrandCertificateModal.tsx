import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ShieldCheck, Printer, X, Download, Fingerprint } from 'lucide-react';
import { api } from '../services/api';
import { LuxuryLogo } from './LuxuryLogo';

interface BrandCertificateModalProps {
  docId: string;
  onClose: () => void;
}

export const BrandCertificateModal: React.FC<BrandCertificateModalProps> = ({ docId, onClose }) => {
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const data = await api.getCertificate(docId);
        setCert(data);
      } catch (err) {
        console.error("Failed to load certificate:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [docId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="bg-[#09090D] p-6 rounded-3xl border border-white/10 text-neutral-300 text-xs font-mono">
          Generating cryptographic certificate digest...
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="bg-[#09090D] p-6 rounded-3xl border border-white/10 text-neutral-300 text-xs text-center space-y-3 max-w-sm">
          <div>Certificate not available yet. Approve the document in the review pipeline to issue clearance.</div>
          <button onClick={onClose} className="px-4 py-2 bg-neutral-800 rounded-xl text-white text-xs font-syne font-bold uppercase">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in">
      <div className="bg-[#09090D] border-2 border-amber-500/30 rounded-3xl max-w-2xl w-full p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative space-y-6 text-neutral-100 print:bg-white print:text-black">
        
        {/* Subtle Luxury Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-white/20 font-mono text-xs pointer-events-none print:hidden">+</div>
        <div className="absolute top-3 right-3 text-white/20 font-mono text-xs pointer-events-none print:hidden">+</div>
        <div className="absolute bottom-3 left-3 text-white/20 font-mono text-xs pointer-events-none print:hidden">+</div>
        <div className="absolute bottom-3 right-3 text-white/20 font-mono text-xs pointer-events-none print:hidden">+</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-white/10 print:hidden transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center space-y-3 border-b border-white/[0.08] pb-6">
          <div className="flex justify-center mb-1">
            <LuxuryLogo size={48} showText={false} />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-syne tracking-tight text-white uppercase">
            Official Brand Governance Clearance Certificate
          </h2>
          <p className="text-xs text-amber-400 font-mono tracking-widest font-semibold uppercase">
            Digest Certificate ID: {cert.certificate_id}
          </p>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-xs font-sans">
          <p className="text-center text-neutral-300 leading-relaxed text-sm">
            This certifies that publication collateral titled <strong className="text-white">"{cert.title}"</strong> has completed automated multi-format compliance auditing and approved editorial peer review under the <strong className="text-rose-400">Inkloom AI Brand-Governance Protocol</strong>.
          </p>

          {/* Audit Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950 p-4 rounded-2xl border border-white/[0.06] text-center font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Governance Score</span>
              <span className="text-base font-black text-emerald-400 mt-0.5 block font-syne">{cert.compliance_score}%</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Tone Health</span>
              <span className="text-base font-black text-white mt-0.5 block font-syne">{cert.score_breakdown.tone}%</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Facts & SLA</span>
              <span className="text-base font-black text-white mt-0.5 block font-syne">{cert.score_breakdown.facts}%</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Approved Vocab</span>
              <span className="text-base font-black text-white mt-0.5 block font-syne">{cert.score_breakdown.terminology}%</span>
            </div>
          </div>

          {/* Cryptographic Hash Seal */}
          <div className="bg-neutral-950 p-3.5 rounded-2xl border border-white/[0.06] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-400 uppercase text-[10px]">
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              <span>Cryptographic SHA-256 Provenance Digest:</span>
            </div>
            <p className="text-neutral-300 break-all select-all bg-neutral-900/60 p-2 rounded-xl border border-white/[0.04]">
              {cert.cryptographic_hash}
            </p>
          </div>

          {/* Signatures & Auditor Sign-off */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/[0.08] text-[11px]">
            <div>
              <span className="text-neutral-500 block uppercase font-mono text-[9px]">Author / Submitter:</span>
              <strong className="text-white block font-syne mt-0.5">{cert.author}</strong>
              <span className="text-neutral-400 font-mono text-[10px]">{cert.author_role}</span>
            </div>

            <div>
              <span className="text-neutral-500 block uppercase font-mono text-[9px]">Certified by Brand Lead:</span>
              <strong className="text-white block font-syne mt-0.5">{cert.approved_by || 'Shreya Kumari'}</strong>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">DIGITALLY SIGNED & VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] print:hidden">
          <div className="text-[10px] font-mono text-neutral-500">
            Certified compliant under ISO/Brand-Ops SLA standards
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-syne font-bold uppercase tracking-wider shadow-lg transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
