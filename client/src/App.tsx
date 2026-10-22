import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowSteps } from './components/WorkflowSteps';
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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <strong className="text-slate-300">Inkloom AI</strong>
            <span className="text-slate-600">•</span>
            <span>Zero-Knowledge Brand-Governance Platform</span>
            <span className="text-slate-600">•</span>
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-slate-400 hover:text-indigo-400 font-mono text-[11px] underline"
            >
              ⌘K Quick Actions
            </button>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Team: <strong className="text-slate-200">indiedevs</strong></span>
            <span>Utkarsh Yadav • Shreya Kumari</span>
            <span className="text-indigo-400 font-semibold">Hackathon Round 2 Production Build</span>
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
