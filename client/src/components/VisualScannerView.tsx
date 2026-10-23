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
  Sliders
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

  const score = scanResult?.compliance_score || 72;

  // Preset sample banners
  const samplePresets = [
    { label: 'Cloud Launch Banner', alt: 'Inkloom NextGen enterprise dashboard preview', file: 'Hero Banner - Q4' },
    { label: 'Social Ad Graphic', alt: 'promo_graphic_v2.jpg', file: 'LinkedIn Sponsored Ad' },
    { label: 'Developer Docs Diagram', alt: 'Arch diagram showing zero-data vault', file: 'Architecture Blueprint' }
  ];

  return (
    <div className="space-y-3 animate-in">
      
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-red-400" />
            <span>Visual Brand Scanner</span>
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Color palette harmony & WCAG 2.1 AA accessibility
          </p>
        </div>

        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-syne font-bold uppercase tracking-wider cursor-pointer shadow-sm transition">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {samplePresets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setAssetName(p.file);
              setAltText(p.alt);
              runImageScan(p.alt);
            }}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-mono bg-neutral-900 border border-white/10 hover:border-red-500/40 text-neutral-300 hover:text-white transition shadow-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Visual Asset Preview & Score Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-syne font-bold text-xs uppercase text-white truncate max-w-[200px]">
            {assetName}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-neutral-500">Score:</span>
            <span className="font-bold text-emerald-400">{score}%</span>
          </div>
        </div>

        {/* Graphic Box */}
        <div className="w-full h-36 rounded-xl bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
          {imagePreview ? (
            <img src={imagePreview} alt="Asset preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center space-y-1.5 p-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-syne font-bold text-neutral-300 uppercase">Visual Graphic Simulator</p>
              <p className="text-[10px] text-neutral-500 font-mono">Quantizing dominant colors & contrast</p>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-red-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Dominant Palette Swatches */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
            /// Extracted Dominant Palette
          </span>
          <div className="grid grid-cols-4 gap-2">
            {(scanResult?.dominant_colors || ['#0a0a0a', '#ef4444', '#1e293b', '#f8fafc']).map((c, i) => (
              <div key={i} className="p-2 rounded-xl bg-neutral-950 border border-white/5 text-center space-y-1">
                <div 
                  className="w-full h-6 rounded-lg border border-white/10 shadow-inner" 
                  style={{ backgroundColor: c }} 
                />
                <span className="font-mono text-[9px] text-neutral-400 uppercase block truncate">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WCAG AA Accessibility & Contrast Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>WCAG 2.1 AA Contrast</span>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
            scanResult?.contrast_ratio && scanResult.contrast_ratio >= 4.5 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {scanResult?.contrast_ratio ? `${scanResult.contrast_ratio}:1 Ratio` : '4.8:1 PASS'}
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Evaluates foreground text readability over background graphics to prevent accessibility violations before launch.
        </p>
      </div>

      {/* AI Alt-Text Governance Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Descriptive Alt-Text</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-500">Screen Reader Check</span>
        </div>

        <div className="p-2.5 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
          <span className="text-[9px] font-mono uppercase text-neutral-500">Current Alt Text:</span>
          <p className="text-xs font-mono text-neutral-300">{altText}</p>
        </div>

        {scanResult?.suggested_alt_text && scanResult.suggested_alt_text !== altText && (
          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div>
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">
                AI Suggested Accessible Alt-Text:
              </span>
              <p className="text-xs font-mono text-emerald-200 mt-0.5">{scanResult.suggested_alt_text}</p>
            </div>

            <button
              onClick={handleApplySuggestedAlt}
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-syne font-bold uppercase tracking-wider transition shadow-sm"
            >
              Apply Recommended Alt Text ✨
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
