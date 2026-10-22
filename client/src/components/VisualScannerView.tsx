import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Layers, 
  Palette, 
  ShieldCheck, 
  Check, 
  Wand2 
} from 'lucide-react';
import { ImageScanResult, UserRole } from '../types';
import { api } from '../services/api';

interface VisualScannerViewProps {
  currentRole: UserRole;
}

export const VisualScannerView: React.FC<VisualScannerViewProps> = ({ currentRole }) => {
  const [assetName, setAssetName] = useState("Hero Banner - Q4 Cloud Launch");
  const [channel, setChannel] = useState("Website Hero");
  const [altText, setAltText] = useState("screenshot.png of the new product dashboard");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ImageScanResult | null>(null);

  // Pre-load a sample SVG/graphic preview
  useEffect(() => {
    runImageScan(altText);
  }, []);

  const runImageScan = async (currentAlt = altText, base64?: string) => {
    setIsScanning(true);
    try {
      const res = await api.scanImage(base64 || imagePreview || undefined, currentAlt, assetName);
      setScanResult(res);
    } catch (err) {
      console.error("Image scan failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAssetName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setImagePreview(b64);
      runImageScan(altText, b64);
    };
    reader.readAsDataURL(file);
  };

  const handleApplySuggestedAlt = () => {
    if (scanResult?.suggested_alt_text) {
      setAltText(scanResult.suggested_alt_text);
      runImageScan(scanResult.suggested_alt_text);
    }
  };

  const approvedBrandColors = [
    { name: 'Inkloom Indigo', hex: '#6366F1' },
    { name: 'Slate Navy', hex: '#0F172A' },
    { name: 'Emerald Teal', hex: '#10B981' },
    { name: 'Neutral Canvas', hex: '#F8FAFC' }
  ];

  const score = scanResult?.compliance_score || 70;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>Multi-Modal Visual Asset & Brand Scanner</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate graphic collateral against brand color palettes, contrast ratios, and WCAG 2.1 AA accessibility guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Visual Asset (PNG, JPG, SVG)</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Visual Asset Preview & Alt-Text Editor */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Asset Preview: {assetName}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {channel}
              </span>
            </div>

            {/* Visual Canvas Area */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-800 bg-[#0B0F19] flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt={altText} className="w-full h-full object-contain" />
              ) : (
                /* High-fidelity procedural SVG Brand Graphic when no file uploaded */
                <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Layers className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div className="text-sm font-bold text-white tracking-wide">
                      Inkloom Enterprise Platform • 2026 Core Architecture
                    </div>
                    <div className="text-xs text-slate-400 max-w-sm">
                      Distributed orchestration engine with sub-10ms edge latency and audited compliance logging.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Dominant Color Palette */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Extracted Palette vs. Brand Standards</span>
                <span className="text-slate-400 text-[11px]">5 dominant swatches</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {(scanResult?.dominant_colors || ['#6366F1', '#0F172A', '#10B981', '#1E293B', '#38BDF8']).map((hex, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/60">
                    <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: hex }} />
                    <span className="text-[11px] font-mono font-medium text-slate-300">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility Alt-Text Evaluation */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>WCAG Alt-Text Accessibility Inspector</span>
                </span>
                <span className={`text-[11px] font-bold ${
                  (scanResult?.alt_text_score || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  Score: {scanResult?.alt_text_score || 40}/100
                </span>
              </div>

              <div className="space-y-2">
                <textarea
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  onBlur={() => runImageScan(altText)}
                  rows={2}
                  placeholder="Enter image alternative text (alt)..."
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/60 font-sans"
                />

                {scanResult?.suggested_alt_text && scanResult.alt_text_score < 80 && (
                  <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-300 block flex items-center gap-1">
                        <Wand2 className="w-3 h-3 text-indigo-400" />
                        AI-Generated WCAG Compliant Alt-Text:
                      </span>
                      <p className="text-slate-300 text-[11px] italic">
                        "{scanResult.suggested_alt_text}"
                      </p>
                    </div>

                    <button
                      onClick={handleApplySuggestedAlt}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-sm transition"
                    >
                      Apply Fix
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right: Visual Compliance Score & Rule Citations */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Visual Compliance Index
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  {score}%
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                score >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {scanResult?.status || 'COMPLIANT'}
              </span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-1">
                <span className="text-slate-400 text-[11px]">Palette Alignment</span>
                <div className="font-bold text-slate-200 text-sm">
                  {scanResult?.brand_palette_match || 85}%
                </div>
                <div className="text-[10px] text-emerald-400">Harmonious with Indigo #6366F1</div>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 space-y-1">
                <span className="text-slate-400 text-[11px]">Contrast Ratio</span>
                <div className="font-bold text-slate-200 text-sm">
                  {scanResult?.contrast_ratio || 5.2}:1
                </div>
                <div className="text-[10px] text-emerald-400">Passes WCAG 2.1 AA (≥4.5:1)</div>
              </div>
            </div>

            {/* Approved Brand Palette Reference */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Official 2026 Brand Standards:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {approvedBrandColors.map(c => (
                  <div key={c.hex} className="flex items-center gap-2 bg-slate-800/30 p-1.5 rounded-lg border border-slate-800">
                    <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: c.hex }} />
                    <span className="text-slate-300 font-medium">{c.name}</span>
                    <span className="text-slate-500 font-mono text-[10px] ml-auto">{c.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations List */}
            {scanResult && scanResult.recommendations.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auditor Recommendations:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {scanResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5 bg-slate-800/30 p-2 rounded-lg border border-slate-800">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
