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
  HeartHandshake
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
        particleCount: 40,
        spread: 50,
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
      badge: 'Zero Card Required',
      desc: 'Free-tier sustainable architecture engineered to run with zero credit card required.',
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
        '250,000 words / month',
        '100 active brand governance rules',
        'Team review pipelines & threaded comments',
        'Multi-format batch document scans (.md, .txt)',
        'Visual asset palette & contrast checks'
      ],
      highlight: true,
      btnColor: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
    },
    {
      id: 'ENTERPRISE' as PlanTier,
      name: 'Enterprise Scale',
      price: '$199',
      period: 'org / month',
      badge: 'Max Governance',
      desc: 'For multi-brand enterprises requiring custom SLA verifications and audit exports.',
      limitWords: '2,000,000+ words / month',
      features: [
        '2,000,000+ words / month with dedicated scale',
        'Unlimited custom brand rules & dictionaries',
        'Multi-role governance (Creator / Lead / Legal)',
        'SOC 2 Type II audit logging'
      ],
      highlight: false,
      btnColor: 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
    }
  ];

  return (
    <div className="space-y-3 animate-in">
      
      {/* Live Monthly Quota Meter Card */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <h3 className="font-syne font-bold text-xs uppercase text-white">Live Monthly Quota</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Resets in {usage?.reset_days_remaining || 9} days
          </span>
        </div>

        <div className="flex items-baseline justify-between text-xs">
          <span className="font-mono text-neutral-300">
            <strong className="text-white font-bold">{usage?.words_scanned.toLocaleString() || '2,450'}</strong> / {usage?.words_limit.toLocaleString() || '10,000'} words
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            {pctUsed}% Used
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-white/5">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-500"
            style={{ width: `${pctUsed}%` }}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono pt-1">
          <div className="p-2 rounded-xl bg-neutral-950 border border-white/5">
            <span className="text-[9px] uppercase text-neutral-500 block">Scans Run</span>
            <span className="font-bold text-white text-xs mt-0.5 block">{usage?.scans_conducted || 14}</span>
          </div>
          <div className="p-2 rounded-xl bg-neutral-950 border border-white/5">
            <span className="text-[9px] uppercase text-neutral-500 block">Avg Latency</span>
            <span className="font-bold text-emerald-400 text-xs mt-0.5 block">&lt;4.2 ms</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Stack */}
      <div className="space-y-2.5">
        {tiers.map(t => {
          const isSelected = currentTier === t.id;

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl border transition relative space-y-3 ${
                t.highlight 
                  ? 'bg-neutral-900 border-red-500/50 shadow-lg shadow-red-500/5' 
                  : 'bg-neutral-900/80 border-white/10'
              } ${isSelected ? 'ring-1 ring-red-500' : ''}`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-600 text-white font-syne font-bold text-[8px] uppercase tracking-wider rounded-full shadow-sm">
                  Active Tier
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-syne font-bold text-sm text-white uppercase">{t.name}</h4>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-white/5 text-neutral-400 border border-white/5">
                    {t.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-syne">{t.price}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">/{t.period}</span>
                </div>

                <p className="text-[11px] text-neutral-400 leading-snug">
                  {t.desc}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <ul className="space-y-1 text-[11px] text-neutral-300">
                  {t.features.slice(0, 3).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={isSelected || switching}
                onClick={() => handleSelectTier(t.id)}
                className={`w-full py-2 rounded-xl text-xs font-syne font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                  isSelected 
                    ? 'bg-neutral-800 text-neutral-500 cursor-default' 
                    : t.btnColor
                }`}
              >
                <span>{isSelected ? 'Current Active Tier' : `Simulate ${t.name}`}</span>
                {!isSelected && <ArrowRight className="w-3 h-3" />}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
