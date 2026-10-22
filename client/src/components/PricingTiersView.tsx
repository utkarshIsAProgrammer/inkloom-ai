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
      desc: 'Free-tier sustainable architecture engineered to run seamlessly with zero credit card required.',
      limitWords: '10,000 words / month',
      limitRules: '25 custom rules',
      features: [
        '10,000 words / month included',
        'Deterministic local-first real-time scanning (<5ms latency)',
        'Ephemeral Zero-Data-Retention Vault mode',
        'Automated PII & Secret Scrubber (AWS, API keys)',
        'WCAG 2.1 AA Color Contrast & Alt-Text checks',
        'Verifiable SHA-256 Brand Clearance Certificates'
      ],
      highlight: false,
      btnColor: 'bg-slate-800 hover:bg-slate-700 text-slate-200'
    },
    {
      id: 'PRO' as PlanTier,
      name: 'Pro Team',
      price: '$29',
      period: 'user / month',
      badge: 'Most Popular',
      desc: 'Designed for fast-growing marketing teams, startups, and agencies managing multi-channel brand copy.',
      limitWords: '250,000 words / month',
      limitRules: '100 custom rules',
      features: [
        '250,000 words / month',
        '100 active brand governance rules',
        'Team review pipelines & threaded editorial comments',
        'Multi-format batch document scans (.md, .docx)',
        'Visual asset palette & contrast checks',
        'CI/CD GitHub Action & Webhook integrations'
      ],
      highlight: true,
      btnColor: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
    },
    {
      id: 'ENTERPRISE' as PlanTier,
      name: 'Enterprise Scale',
      price: '$199',
      period: 'organization / month',
      badge: 'Maximum Governance',
      desc: 'For multi-brand enterprises requiring custom SLA verifications, SOC2 audit exports, and compliance sign-offs.',
      limitWords: '2,000,000+ words / month',
      limitRules: '500+ custom rules',
      features: [
        '2,000,000+ words / month with dedicated scale',
        'Unlimited custom brand rules & dictionaries',
        'Multi-role governance (Creator / Brand Lead / Legal)',
        'SOC 2 Type II compliant audit logging',
        'Custom verified SLA & legal disclaimer engines',
        'Dedicated tenant isolation & SSO/SAML'
      ],
      highlight: false,
      btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>Sustainable Free Tier & Production Scalability</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Architected to serve millions of users sustainably on zero-cost cloud tiers, scaling effortlessly to enterprise volume.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Current Plan:</span>
          <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40">
            {usage?.tier_name || 'Free Community Tier'}
          </span>
        </div>
      </div>

      {/* Real-Time Free Tier Quota & Usage Meter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Live Monthly Usage & Quota Meter</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Resetting in {usage?.reset_days_remaining || 9} days. Zero surprise billing — scans gracefully throttle to local-only cache when limits are reached.
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-white">
              {usage?.words_scanned.toLocaleString() || '2,450'} / {usage?.words_limit.toLocaleString() || '10,000'} words
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {pctUsed}% quota utilized ({usage?.words_remaining.toLocaleString() || '7,550'} remaining)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              pctUsed > 85 ? 'bg-rose-500' : (pctUsed > 60 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400')
            }`}
            style={{ width: `${pctUsed}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs pt-2">
          <div className="p-2.5 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Scans Run</span>
            <span className="font-bold text-slate-200 text-sm mt-0.5 block">{usage?.scans_conducted || 14}</span>
          </div>
          <div className="p-2.5 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Active Rules</span>
            <span className="font-bold text-slate-200 text-sm mt-0.5 block">{usage?.active_rules || 13} / {usage?.max_rules || 25}</span>
          </div>
          <div className="p-2.5 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Avg Response</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">&lt;4.2 ms</span>
          </div>
          <div className="p-2.5 bg-slate-850/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block">Free Sustainability</span>
            <span className="font-bold text-indigo-400 text-sm mt-0.5 block">100% Free Tier</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map(t => {
          const isSelected = currentTier === t.id;

          return (
            <div
              key={t.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition relative ${
                t.highlight 
                  ? 'bg-slate-850/90 border-indigo-500/60 shadow-xl shadow-indigo-500/10' 
                  : 'bg-slate-900/80 border-slate-800'
              } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                  Active Tier
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-white">{t.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {t.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{t.price}</span>
                  <span className="text-xs text-slate-400">/{t.period}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                  {t.desc}
                </p>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
                    Plan Specifications:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {t.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={isSelected || switching}
                  onClick={() => handleSelectTier(t.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected 
                      ? 'bg-slate-800 text-slate-400 cursor-default' 
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

      {/* Sustainable Free-Tier Architecture Note */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-300">
        <HeartHandshake className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block">Free-Tier Sustainable Design (Hackathon Alignment):</strong>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Just like Knots., Inkloom AI is architected to operate sustainably on 100% free-tier cloud resources without requiring a credit card:
            in-memory deterministic rule matching eliminates costly vector database bills; local IndexedDB caching reduces API egress; and zero-retention ephemeral processing ensures zero persistent storage consumption.
          </p>
        </div>
      </div>

    </div>
  );
};
