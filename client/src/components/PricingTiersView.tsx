import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Crown, 
  ArrowRight, 
  CreditCard, 
  Clock, 
  Gauge, 
  Activity,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UsageStats, PlanTier } from '../types';
import { api } from '../services/api';

interface PricingTiersViewProps {
  usage: UsageStats | null;
  onTierChanged: (updated: UsageStats) => void;
}

export const PricingTiersView: React.FC<PricingTiersViewProps> = ({ usage, onTierChanged }) => {
  const [switching, setSwitching] = useState(false);

  const handleSelectTier = async (tier: PlanTier) => {
    setSwitching(true);
    try {
      const updated = await api.switchTier(tier);
      onTierChanged(updated);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const currentTier = usage?.tier || 'FREE';
  const pctUsed = usage ? Math.min(100, Math.round((usage.words_scanned / usage.words_limit) * 100)) : 24;

  const tiers = [
    {
      id: 'FREE' as PlanTier,
      name: 'Free Community',
      price: '$0',
      period: 'forever',
      badge: 'Zero Credit Card Required',
      desc: 'Free-tier sustainable architecture engineered to run with zero cloud overhead.',
      limitWords: '10,000 words / month',
      features: [
        '10,000 words / month included',
        'Deterministic local-first real-time scanning (<5ms latency)',
        'Ephemeral Zero-Data-Retention Vault mode',
        'Automated PII & Secret Scrubber (AWS, API keys)',
        'WCAG 2.1 AA Color Contrast & Alt-Text checks',
        'Verifiable SHA-256 Brand Clearance Certificates'
      ],
      highlight: false,
      btnColor: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
    },
    {
      id: 'PRO' as PlanTier,
      name: 'Pro Team',
      price: '$29',
      period: 'user / month',
      badge: 'Most Popular',
      desc: 'Designed for fast-growing marketing teams and agencies managing multi-channel brand copy.',
      limitWords: '250,000 words / month',
      features: [
        '250,000 words / month included',
        '100 active brand governance rules',
        'Collaborative review pipelines & threaded comments',
        'Multi-format batch document scans (.md, .txt)',
        'Visual asset palette & contrast checks'
      ],
      highlight: true,
      btnColor: 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/20'
    },
    {
      id: 'ENTERPRISE' as PlanTier,
      name: 'Enterprise Scale',
      price: '$199',
      period: 'org / month',
      badge: 'Maximum Governance',
      desc: 'For multi-brand enterprises requiring custom SLA verifications, SOC2 audit exports, and compliance sign-offs.',
      limitWords: '2,000,000+ words / month',
      features: [
        '2,000,000+ words / month with dedicated scale',
        'Unlimited custom brand rules & dictionaries',
        'Multi-role governance (Creator / Lead / Legal)',
        'SOC 2 Type II audit logging & CSV exports'
      ],
      highlight: false,
      btnColor: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
    }
  ];

  return (
    <div className="space-y-6 animate-in">
      
      {/* Top Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-black text-base md:text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Sustainable Free Tier & Production Scalability</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Engineered to operate sustainably on zero-cost cloud tiers while supporting millions of users without surprise fees
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-neutral-500">Active Tier:</span>
          <span className="font-bold text-white px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30">
            {usage?.tier_name || 'Free Community Tier'}
          </span>
        </div>
      </div>

      {/* Real-Time Free Tier Quota & Usage Meter */}
      <div className="bg-[#09090D]/90 border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h4 className="font-syne font-black text-sm uppercase text-white">Live Monthly Usage & Quota Meter</h4>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              Resetting in {usage?.reset_days_remaining || 9} days. Zero surprise billing — scans gracefully throttle to local-only cache when limits are reached.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-sm font-bold text-white font-mono">
              {usage?.words_scanned.toLocaleString() || '3,275'} / {usage?.words_limit.toLocaleString() || '10,000'} words
            </span>
            <span className="text-xs text-emerald-400 font-mono block mt-0.5 font-semibold">
              {pctUsed}% quota utilized ({usage?.words_remaining.toLocaleString() || '6,725'} remaining)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-white/[0.06]">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${pctUsed}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono pt-2">
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] uppercase text-neutral-500 block">Scans Run</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{usage?.scans_conducted || 205}</span>
          </div>
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] uppercase text-neutral-500 block">Active Rules</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{usage?.active_rules || 13} / {usage?.max_rules || 25}</span>
          </div>
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] uppercase text-neutral-500 block">Response SLA</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">&lt;4.2 ms</span>
          </div>
          <div className="p-3 bg-neutral-950/70 rounded-xl border border-white/[0.04]">
            <span className="text-[10px] uppercase text-neutral-500 block">Free Sustainability</span>
            <span className="font-bold text-amber-400 text-sm mt-0.5 block">100% Free Tier</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid (3 columns on desktop, 1 on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(t => {
          const isSelected = currentTier === t.id;

          return (
            <div
              key={t.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition relative space-y-6 shadow-xl ${
                t.highlight 
                  ? 'bg-neutral-900 border-amber-500/40 shadow-amber-500/5' 
                  : 'bg-[#09090D]/90 border-white/[0.08]'
              } ${isSelected ? 'ring-2 ring-rose-500' : ''}`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-syne font-bold text-[9px] uppercase tracking-wider rounded-full shadow-md">
                  Active Tier
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-syne font-black text-lg text-white uppercase">{t.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/[0.06] text-neutral-300 border border-white/[0.06]">
                    {t.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-syne">{t.price}</span>
                  <span className="text-xs text-neutral-400 font-mono">/{t.period}</span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans min-h-[40px]">
                  {t.desc}
                </p>

                <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block tracking-wider">
                    Plan Specifications:
                  </span>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    {t.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 font-sans">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isSelected || switching}
                  onClick={() => handleSelectTier(t.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-syne font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                    isSelected 
                      ? 'bg-neutral-800 text-neutral-500 cursor-default' 
                      : t.btnColor
                  }`}
                >
                  <span>{isSelected ? 'Current Active Tier' : `Simulate ${t.name}`}</span>
                  {!isSelected && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
