import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ShieldCheck, Printer, X, Download } from 'lucide-react';
import { api } from '../services/api';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-700 text-slate-300 text-xs">
          Generating cryptographic certificate...
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-[#111827] p-6 rounded-2xl border border-slate-700 text-slate-300 text-xs text-center space-y-3">
          <div>Certificate not available yet. Approve the document to issue clearance.</div>
          <button onClick={onClose} className="px-3 py-1.5 bg-slate-800 rounded-lg text-white">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0F172A] border-2 border-indigo-500/40 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6 text-slate-100 print:bg-white print:text-black">
        
        {/* Close Button (Hidden in Print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 print:hidden transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-xl shadow-indigo-500/30 mx-auto">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">
            Official Brand Governance Clearance Certificate
          </h2>
          <p className="text-xs text-indigo-400 font-mono tracking-wider font-semibold">
            {cert.certificate_id}
          </p>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-xs">
          <p className="text-center text-slate-300 leading-relaxed text-sm">
            This certifies that the publication titled <strong className="text-white">"{cert.title}"</strong> has completed automated multi-format compliance auditing and approved editorial peer review under the <strong className="text-indigo-300">Inkloom AI Brand-Governance Protocol</strong>.
          </p>

          {/* Audit Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Governance Score</span>
              <span className="text-base font-extrabold text-emerald-400 mt-0.5 block">{cert.compliance_score}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Tone Health</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{cert.score_breakdown.tone}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Facts & SLA</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{cert.score_breakdown.facts}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">DEI & Vocab</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{cert.score_breakdown.terminology}%</span>
            </div>
          </div>

          {/* Signatures & Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] border-t border-slate-800">
            <div>
              <span className="text-slate-400 block">Publication Channel:</span>
              <span className="font-semibold text-slate-200">{cert.channel}</span>
              <span className="text-slate-400 block mt-2">Certified Author:</span>
              <span className="font-semibold text-slate-200">{cert.author}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Certified Sign-off:</span>
              <span className="font-semibold text-emerald-400">{cert.approved_by}</span>
              <span className="text-slate-400 block mt-2">Digital Cryptographic Checksum:</span>
              <span className="font-mono text-[10px] text-indigo-400">{cert.digital_signature_hash}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">Ready for public publication</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
            >
              Dismiss
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
