import React, { useState, useEffect } from 'react';
import { MobileAppShell } from './components/layout/MobileAppShell';
import { ScannerView } from './components/ScannerView';
import { VisualScannerView } from './components/VisualScannerView';
import { BrandRulesView } from './components/BrandRulesView';
import { ReviewWorkflowView } from './components/ReviewWorkflowView';
import { SecurityVaultView } from './components/SecurityVaultView';
import { AnalyticsDashboardView } from './components/AnalyticsDashboardView';
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

  // Check backend health, usage stats, and pending docs count on mount
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
    <MobileAppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentRole={currentRole}
      setCurrentRole={setCurrentRole}
      onOpenTour={() => setIsTourOpen(true)}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      isConnected={isConnected}
      ephemeralMode={ephemeralMode}
      setEphemeralMode={setEphemeralMode}
      usage={usage}
      onLoadPreset={handleLoadPreset}
      violationsCount={violationsCount}
      pendingReviewsCount={pendingReviewsCount}
    >
      {/* Active Tab View */}
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

      {activeTab === 'security' && (
        <SecurityVaultView
          currentRole={currentRole}
          ephemeralMode={ephemeralMode}
          setEphemeralMode={setEphemeralMode}
          usage={usage}
          onUsageChanged={(updated) => setUsage(updated)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboardView currentRole={currentRole} />
      )}

      {activeTab === 'pricing' && (
        <PricingTiersView
          usage={usage}
          onTierChanged={(updated) => setUsage(updated)}
        />
      )}

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

    </MobileAppShell>
  );
};
