import React from 'react';
import { ShieldCheck, Sparkles, Lock, Cpu, Eye, CheckCircle2, Award, Zap } from 'lucide-react';

export const MarqueeRibbon: React.FC = () => {
  const items = [
    { label: "REAL-TIME TONE GOVERNANCE", icon: Sparkles, color: "text-red-500" },
    { label: "SLA ACCURACY VERIFICATION (99.95%)", icon: ShieldCheck, color: "text-emerald-400" },
    { label: "ZERO-RETENTION EPHEMERAL VAULT", icon: Lock, color: "text-indigo-400" },
    { label: "WCAG 2.1 AA COLOR CONTRAST (4.5:1)", icon: Eye, color: "text-amber-400" },
    { label: "CLIENT WEBCRYPTO SHA-256 SIGNATURES", icon: Cpu, color: "text-red-400" },
    { label: "DEI & INCLUSIVE VOCABULARY NORMALIZER", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "CRYPTOGRAPHIC CLEARANCE CERTIFICATION", icon: Award, color: "text-indigo-300" },
    { label: "SUB-5MS DETERMINISTIC LATENCY", icon: Zap, color: "text-amber-300" },
  ];

  return (
    <section className="z-20 overflow-hidden bg-neutral-950/80 w-full border-white/10 border-t border-b relative my-4 backdrop-blur-sm">
      {/* Grid Overlay with corner crosshairs */}
      <div className="absolute inset-0 w-full h-full grid grid-cols-4 pointer-events-none z-10">
        <div className="border-r border-white/10 h-full hidden md:block relative">
          <div className="absolute -right-[5px] -top-[5px] text-white/30 text-xs">+</div>
        </div>
        <div className="border-r border-white/10 h-full hidden md:block relative">
          <div className="absolute -right-[5px] -top-[5px] text-white/30 text-xs">+</div>
        </div>
        <div className="border-r border-white/10 h-full hidden md:block relative">
          <div className="absolute -right-[5px] -top-[5px] text-white/30 text-xs">+</div>
        </div>
        <div className="hidden md:block"></div>
      </div>

      {/* Marquee Content */}
      <div className="flex z-0 overflow-hidden py-3 relative items-center">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none"></div>

        <div className="flex gap-12 animate-marquee-infinite whitespace-nowrap min-w-full">
          {[...items, ...items].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span className="font-mono text-neutral-600 text-xs">///</span>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-xs font-semibold tracking-wider uppercase font-syne text-neutral-300">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
