import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ImageIcon, BookOpen, Users, Shield } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  violationsCount?: number;
  pendingReviewsCount?: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  setActiveTab,
  violationsCount = 0,
  pendingReviewsCount = 0
}) => {
  const tabs = [
    { id: 'scanner', label: 'Scanner', icon: Sparkles, badge: violationsCount > 0 ? violationsCount : null },
    { id: 'visual', label: 'Visual', icon: ImageIcon, badge: null },
    { id: 'rules', label: 'Rules', icon: BookOpen, badge: null },
    { id: 'review', label: 'Review', icon: Users, badge: pendingReviewsCount > 0 ? pendingReviewsCount : null },
    { id: 'security', label: 'Vault', icon: Shield, badge: null }
  ];

  return (
    <div className="absolute inset-x-3 bottom-4 z-40 pointer-events-none flex justify-center">
      <nav className="pointer-events-auto flex w-full max-w-sm items-center justify-around gap-1 rounded-2xl border border-white/10 bg-neutral-950/90 p-1.5 shadow-2xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = 
            activeTab === tab.id || 
            (tab.id === 'security' && ['security', 'pricing', 'analytics'].includes(activeTab));

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-tabbar-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/15"
                />
              )}

              <span className="relative z-10 flex flex-col items-center gap-1">
                <span className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-neutral-500'}`} />
                  {tab.badge !== null && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-red-600 text-white font-mono text-[8px] font-bold rounded-full border border-neutral-950">
                      {tab.badge}
                    </span>
                  )}
                </span>
                <span className="font-syne font-semibold tracking-wider uppercase text-[8px]">
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
