import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowSteps } from './components/WorkflowSteps';
import { MarqueeRibbon } from './components/MarqueeRibbon';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { ScannerView } from './components/ScannerView';
import { VisualScannerView } from './components/VisualScannerView';
import { BrandRulesView } from './components/BrandRulesView';
import { ReviewWorkflowView } from './components/ReviewWorkflowView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
import { SecurityVaultView } from './components/SecurityVaultView';
import { PricingTiersView } from './components/PricingTiersView';
import { BrandCertificateModal } from './components/BrandCertificateModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { CommandPalette } from './components/CommandPalette';
import { UserRole, UsageStats } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [currentRole, setCurrentRole] = useState<UserRole>('CREATOR');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [presetDraft, setPresetDraft] = useState<any>(null);
  const [reviewDocId, setReviewDocId] = useState<string | undefined>(undefined);
  const [certificateDocId, setCertificateDocId] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [ephemeralMode, setEphemeralMode] = useState<boolean>(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(1);
  const [violationsCount, setViolationsCount] = useState<number>(3);

  // Check backend health & auto-trigger guided walkthrough on first launch
  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.getHealth();
        setIsConnected(true);
        const u = await api.getUsage();
        setUsage(u);
        const docs = await api.getDocuments();
        const pending = docs.filter(d => d.status === 'IN_REVIEW').length;
        setPendingReviewsCount(pending);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 25000);

    // Auto-launch guided walkthrough if not previously completed
    try {
      const tourSeen = localStorage.getItem('inkloom_tour_completed');
      if (!tourSeen) {
        setIsTourOpen(true);
      }
    } catch (e) {
      console.warn("Tour storage check skipped:", e);
    }

    return () => clearInterval(interval);
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshUsage = async () => {
    try {
      const u = await api.getUsage();
      setUsage(u);
      const docs = await api.getDocuments();
      const pending = docs.filter(d => d.status === 'IN_REVIEW').length;
      setPendingReviewsCount(pending);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadPreset = async (presetKey: string) => {
    try {
      const docs = await api.getDocuments();
      let match = null;
      if (presetKey === 'saas-launch') match = docs.find(d => d.id === 'draft-saas-launch');
      else if (presetKey === 'security-whitepaper') match = docs.find(d => d.id === 'draft-security-whitepaper');
      else if (presetKey === 'social-teaser') match = docs.find(d => d.id === 'draft-social-teaser');
      else if (presetKey === 'approved-showcase') match = docs.find(d => d.id === 'draft-approved-showcase');

      if (match) {
        setPresetDraft(match);
        setActiveTab('scanner');
      }
    } catch (e) {
      console.error("Failed to load preset:", e);
    }
  };

  const handleNavigateToReview = (docId?: string) => {
    setReviewDocId(docId);
    setActiveTab('review');
    refreshUsage();
  };

  return (
    <div className="min-h-screen bg-[#060608] text-neutral-200 flex flex-col font-sans selection:bg-rose-500/30 selection:text-white relative">
      
      {/* Background Laser Grid Lines from demo */}
      <div className="absolute inset-0 pointer-events-none grid grid-cols-6 max-w-7xl mx-auto px-6 z-0">
        <div className="border-x border-white/[0.02] h-full w-full relative">
          <div className="absolute top-0 left-0 w-[1px] h-32 bg-gradient-to-b from-transparent via-rose-500/20 to-transparent animate-beam" />
        </div>
        <div className="border-r border-white/[0.02] h-full w-full relative"></div>
        <div className="border-r border-white/[0.02] h-full w-full relative">
          <div className="absolute top-1/4 right-0 w-[1px] h-32 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent animate-beam" style={{ animationDelay: '2s' }} />
        </div>
        <div className="border-r border-white/[0.02] h-full w-full relative"></div>
        <div className="border-r border-white/[0.02] h-full w-full relative"></div>
        <div className="border-r border-white/[0.02] h-full w-full relative"></div>
      </div>

      {/* Top Global Executive Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onLoadPreset={handleLoadPreset}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isConnected={isConnected}
        ephemeralMode={ephemeralMode}
        setEphemeralMode={setEphemeralMode}
        usage={usage}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Responsive Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 pb-24 lg:pb-8">
        
        {/* Product Workflow 4-Step Journey Header (Responsive) */}
        <WorkflowSteps activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Capabilities Marquee Ribbon */}
        <MarqueeRibbon />

        {/* Tab Views */}
        {activeTab === 'scanner' && (
          <ScannerView
            currentRole={currentRole}
            onNavigateToReview={handleNavigateToReview}
            presetDraft={presetDraft}
            ephemeralMode={ephemeralMode}
            setEphemeralMode={setEphemeralMode}
            onScanCompleted={refreshUsage}
          />
        )}

        {activeTab === 'visual' && (
          <VisualScannerView currentRole={currentRole} />
        )}

        {activeTab === 'rules' && (
          <BrandRulesView currentRole={currentRole} />
        )}

        {activeTab === 'review' && (
          <ReviewWorkflowView
            currentRole={currentRole}
            selectedDocId={reviewDocId}
            onOpenCertificate={(id) => setCertificateDocId(id)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardView currentRole={currentRole} />
        )}

        {activeTab === 'security' && (
          <SecurityVaultView
            currentRole={currentRole}
            ephemeralMode={ephemeralMode}
            setEphemeralMode={setEphemeralMode}
            usage={usage}
            onUsageChanged={(updated) => setUsage(updated)}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTiersView
            usage={usage}
            onTierChanged={(updated) => setUsage(updated)}
          />
        )}

      </main>

      {/* Floating Bottom Navigation Dock for Mobile & Tablet (hidden on desktop lg:) */}
      <MobileTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        violationsCount={violationsCount}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Luxury Footer styled with Luminal Studio aesthetic */}
      <footer className="border-t border-white/[0.08] bg-[#07070A]/95 py-6 text-center text-xs text-neutral-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <strong className="text-white font-syne uppercase tracking-wider">INKLOOM.AI</strong>
            <span className="text-neutral-700 font-mono">///</span>
            <span className="text-neutral-400 font-sans">Autonomous Brand Governance & Integrity Protocol</span>
            <span className="text-neutral-700 font-mono">///</span>
            <button 
              onClick={() => setIsTourOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-mono text-[11px] underline transition-colors"
            >
              Interactive Tour
            </button>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>TEAM: <strong className="text-white font-syne">INDIEDEVS</strong></span>
            <span>Utkarsh Yadav • Shreya Kumari</span>
            <span className="text-rose-500 font-semibold uppercase">Round 2 Build</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onLoadPreset={handleLoadPreset}
        onSwitchRole={setCurrentRole}
        onToggleEphemeral={() => setEphemeralMode(prev => !prev)}
        ephemeralMode={ephemeralMode}
      />

      {isTourOpen && (
        <GuidedTourModal
          onClose={() => setIsTourOpen(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
          }}
        />
      )}

      {certificateDocId && (
        <BrandCertificateModal
          docId={certificateDocId}
          onClose={() => setCertificateDocId(null)}
        />
      )}

    </div>
  );
};
