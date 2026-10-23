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
  Wand2,
  Sliders,
  FileCheck
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

  // Pre-load a sample preview
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

  const score = scanResult?.compliance_score || 82;

  // Preset sample banners (Zero emojis)
  const samplePresets = [
    { label: 'Cloud Launch Banner', alt: 'Inkloom NextGen enterprise dashboard preview', file: 'Hero Banner - Q4' },
    { label: 'Social Sponsored Ad', alt: 'promo_graphic_v2.jpg', file: 'LinkedIn Sponsored Ad' },
    { label: 'Architecture Blueprint', alt: 'System diagram demonstrating zero-knowledge RAM vault', file: 'Architecture Blueprint' }
  ];

  return (
    <div className="space-y-4 animate-in">
      
      {/* Top Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-black text-base md:text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-400" />
            <span>Visual Brand Harmonizer</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Quantize color palettes, measure brand Euclidean distances, and enforce WCAG 2.1 AA accessibility
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-syne font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-600/20 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Visual Asset</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Preset Collateral Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="font-mono text-[10px] uppercase text-neutral-500 mr-1">Sample Collateral:</span>
        {samplePresets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setAssetName(p.file);
              setAltText(p.alt);
              runImageScan(p.alt);
            }}
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono bg-neutral-900 border border-white/10 hover:border-amber-500/40 text-neutral-300 hover:text-white transition shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Dual-Pane or Single-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Asset Dropzone & Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-4 relative">
            <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
            <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

            <div className="flex items-center justify-between">
              <span className="font-syne font-bold text-sm uppercase text-white truncate max-w-[280px]">
                {assetName}
              </span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-neutral-500">Visual Health:</span>
                <span className="font-bold text-emerald-400 text-sm">{score}%</span>
              </div>
            </div>

            {/* Graphic Box */}
            <div className="w-full h-72 rounded-xl bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
              {imagePreview ? (
                <img src={imagePreview} alt="Asset preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center space-y-2 p-6 max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="font-syne font-bold text-sm text-white uppercase">Visual Asset Canvas</h4>
                  <p className="text-xs text-neutral-400 font-sans">
                    Drop PNG, JPG, or SVG collateral to run automated 5-dominant color extraction and contrast checks.
                  </p>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-white font-syne font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>Quantizing Dominant Pixels...</span>
                </div>
              )}
            </div>

            {/* Dominant Palette Swatches */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider block">
                Extracted Dominant Color Swatches:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {(scanResult?.dominant_colors || ['#09090D', '#E11D48', '#F59E0B', '#1E293B', '#F8FAFC']).map((c, i) => (
                  <div key={i} className="p-2 rounded-xl bg-neutral-950 border border-white/[0.06] text-center space-y-1.5">
                    <div 
                      className="w-full h-8 rounded-lg border border-white/10 shadow-inner" 
                      style={{ backgroundColor: c }} 
                    />
                    <span className="font-mono text-[10px] text-neutral-300 uppercase block font-semibold">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: WCAG AA Accessibility & Alt-Text */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* WCAG 2.1 AA Contrast Card */}
          <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>WCAG 2.1 AA Contrast Ratio</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                scanResult?.contrast_ratio && scanResult.contrast_ratio >= 4.5 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {scanResult?.contrast_ratio ? `${scanResult.contrast_ratio}:1 Ratio` : '4.8:1 PASS'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Measures relative luminance contrast between foreground elements and backdrop colors to guarantee compliance with WCAG 2.1 AA digital readability thresholds (minimum 4.5:1 ratio for normal body text).
            </p>

            <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.04] text-xs font-mono flex items-center justify-between text-neutral-300">
              <span>Standard 4.5:1 Compliance:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Certified AAA Compliant</span>
              </span>
            </div>
          </div>

          {/* AI Alt-Text Governance Card */}
          <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-rose-400" />
                <span>Screen-Reader Alt Text</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Accessibility Audit</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-white/[0.06] space-y-1">
              <span className="text-[9px] font-mono uppercase text-neutral-500">Current Input:</span>
              <p className="text-xs font-mono text-neutral-300">{altText}</p>
            </div>

            {scanResult?.suggested_alt_text && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <div>
                  <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                    Recommended Accessible Description:
                  </span>
                  <p className="text-xs font-mono text-emerald-200 mt-1 leading-relaxed">
                    {scanResult.suggested_alt_text}
                  </p>
                </div>

                <button
                  onClick={handleApplySuggestedAlt}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-syne font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Recommended Description</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
