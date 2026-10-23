import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowSteps } from './components/WorkflowSteps';
import { MarqueeRibbon } from './components/MarqueeRibbon';
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

  // Check backend health & fetch usage stats on mount
  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.getHealth();
        setIsConnected(true);
        const u = await api.getUsage();
        setUsage(u);
      } catch (e) {
        setIsConnected(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 20000);
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
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans selection:bg-red-500/30 selection:text-white relative">
      
      {/* Top Global Navigation, Quota Gauge & Persona Switcher */}
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
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Product Workflow 4-Step Journey Header */}
        <WorkflowSteps activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Capabilities Marquee Ribbon from Luminal demo */}
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
          />
        )}

        {activeTab === 'pricing' && (
          <PricingTiersView
            usage={usage}
            onTierChanged={(updated) => setUsage(updated)}
          />
        )}

      </main>

      {/* Footer styled with Luminal Studio aesthetic */}
      <footer className="border-t border-white/10 bg-neutral-950/80 py-6 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <strong className="text-white font-syne uppercase tracking-wider">Inkloom.AI</strong>
            <span className="text-neutral-600 font-mono">///</span>
            <span className="text-neutral-400 font-sans">Zero-Knowledge Brand-Governance Protocol</span>
            <span className="text-neutral-600 font-mono">///</span>
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-neutral-400 hover:text-red-400 font-mono text-[11px] underline transition-colors"
            >
              ⌘K Quick Actions
            </button>
          </div>
          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>TEAM: <strong className="text-white font-syne">INDIEDEVS</strong></span>
            <span>Utkarsh Yadav • Shreya Kumari</span>
            <span className="text-red-500 font-semibold uppercase">Round 2 Build</span>
          </div>
        </div>
      </footer>

      {/* Modals & Command Palette */}
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
