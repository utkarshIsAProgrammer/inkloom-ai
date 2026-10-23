import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  Users, 
  BarChart3, 
  Lock, 
  CreditCard, 
  PlayCircle, 
  ShieldCheck, 
  ArrowRight, 
  X,
  Keyboard,
  PenTool,
  Scale,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onLoadPreset: (presetKey: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onToggleEphemeral: () => void;
  ephemeralMode: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onLoadPreset,
  onSwitchRole,
  onToggleEphemeral,
  ephemeralMode
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    // Navigation
    { id: 'nav-scanner', title: 'Open Content Scanner & Copilot', cat: 'Navigation', icon: Sparkles, run: () => onNavigateTab('scanner') },
    { id: 'nav-visual', title: 'Open Visual & Image Assets Inspector', cat: 'Navigation', icon: ImageIcon, run: () => onNavigateTab('visual') },
    { id: 'nav-rules', title: 'Open Brand Rule Repository', cat: 'Navigation', icon: BookOpen, run: () => onNavigateTab('rules') },
    { id: 'nav-review', title: 'Open Review & Editorial Pipeline', cat: 'Navigation', icon: Users, run: () => onNavigateTab('review') },
    { id: 'nav-analytics', title: 'Open Governance Analytics Dashboard', cat: 'Navigation', icon: BarChart3, run: () => onNavigateTab('analytics') },
    { id: 'nav-security', title: 'Open Security & Zero-Knowledge Vault', cat: 'Security', icon: Lock, run: () => onNavigateTab('security') },
    { id: 'nav-pricing', title: 'Open Free Tier Usage & Production Plans', cat: 'Plans', icon: CreditCard, run: () => onNavigateTab('pricing') },

    // Evaluation Presets
    { id: 'preset-saas', title: 'Load Evaluation Preset: SaaS Launch Draft (High Violations)', cat: 'Judge Presets', icon: Zap, run: () => { onLoadPreset('saas-launch'); onNavigateTab('scanner'); } },
    { id: 'preset-security', title: 'Load Evaluation Preset: Architecture Whitepaper (DEI & Claims)', cat: 'Judge Presets', icon: Lock, run: () => { onLoadPreset('security-whitepaper'); onNavigateTab('scanner'); } },
    { id: 'preset-social', title: 'Load Evaluation Preset: Social Teaser (Slang & Panic Urgency)', cat: 'Judge Presets', icon: Sparkles, run: () => { onLoadPreset('social-teaser'); onNavigateTab('scanner'); } },
    { id: 'preset-approved', title: 'Load Evaluation Preset: Governed Press Release (Clean Showcase)', cat: 'Judge Presets', icon: ShieldCheck, run: () => { onLoadPreset('approved-showcase'); onNavigateTab('scanner'); } },

    // Security & Roles
    { id: 'action-ephemeral', title: `${ephemeralMode ? 'Disable' : 'Enable'} Ephemeral Zero-Data-Retention Vault Mode`, cat: 'Security', icon: ShieldCheck, run: onToggleEphemeral },
    { id: 'role-creator', title: 'Switch Persona: Utkarsh Yadav (Creator)', cat: 'Persona', icon: PenTool, run: () => onSwitchRole('CREATOR') },
    { id: 'role-manager', title: 'Switch Persona: Shreya Kumari (Brand Manager)', cat: 'Persona', icon: ShieldCheck, run: () => onSwitchRole('BRAND_MANAGER') },
    { id: 'role-compliance', title: 'Switch Persona: Compliance Auditor (Sign-off)', cat: 'Persona', icon: Scale, run: () => onSwitchRole('COMPLIANCE_OFFICER') }
  ];

  const filtered = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.cat.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action: typeof actions[0]) => {
    action.run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-xl animate-in">
      <div 
        className="bg-[#09090D] border border-amber-500/20 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-2 left-2 text-white/10 text-xs font-mono pointer-events-none">+</div>
        <div className="absolute top-2 right-2 text-white/10 text-xs font-mono pointer-events-none">+</div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] bg-neutral-950/80">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-sans"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  className="w-full text-left px-3.5 py-3 rounded-xl transition flex items-center justify-between hover:bg-neutral-900 border border-transparent hover:border-white/[0.06] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-neutral-950 border border-white/5 text-amber-400">
                      <ActionIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-white group-hover:text-rose-400 transition block">
                        {action.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        {action.cat}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-400 transition group-hover:translate-x-0.5" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-white/[0.06] bg-neutral-950/90 flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 text-[10px] text-neutral-400 border border-white/10">Esc</kbd>
            <span>to close</span>
          </div>
          <span>Inkloom Command Protocol</span>
        </div>

      </div>
    </div>
  );
};
