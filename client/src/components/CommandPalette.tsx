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
  Keyboard
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
    { id: 'nav-scanner', title: 'Open Content Scanner & Co-Pilot', cat: 'Navigation', icon: Sparkles, run: () => onNavigateTab('scanner') },
    { id: 'nav-visual', title: 'Open Visual & Image Assets Inspector', cat: 'Navigation', icon: ImageIcon, run: () => onNavigateTab('visual') },
    { id: 'nav-rules', title: 'Open Brand Rule Repository', cat: 'Navigation', icon: BookOpen, run: () => onNavigateTab('rules') },
    { id: 'nav-review', title: 'Open Review & Editorial Pipeline', cat: 'Navigation', icon: Users, run: () => onNavigateTab('review') },
    { id: 'nav-analytics', title: 'Open Governance Analytics Dashboard', cat: 'Navigation', icon: BarChart3, run: () => onNavigateTab('analytics') },
    { id: 'nav-security', title: 'Open Security & Zero-Knowledge Vault', cat: 'Security', icon: Lock, run: () => onNavigateTab('security') },
    { id: 'nav-pricing', title: 'Open Free Tier Usage & Production Plans', cat: 'Plans', icon: CreditCard, run: () => onNavigateTab('pricing') },

    // Evaluation Presets
    { id: 'preset-saas', title: 'Load Evaluation Preset: SaaS Launch Draft (High Violations)', cat: 'Judge Presets', icon: PlayCircle, run: () => { onLoadPreset('saas-launch'); onNavigateTab('scanner'); } },
    { id: 'preset-security', title: 'Load Evaluation Preset: Architecture Whitepaper (DEI & Claims)', cat: 'Judge Presets', icon: PlayCircle, run: () => { onLoadPreset('security-whitepaper'); onNavigateTab('scanner'); } },
    { id: 'preset-social', title: 'Load Evaluation Preset: Social Teaser (Slang & Panic Urgency)', cat: 'Judge Presets', icon: PlayCircle, run: () => { onLoadPreset('social-teaser'); onNavigateTab('scanner'); } },
    { id: 'preset-approved', title: 'Load Evaluation Preset: Governed Press Release (98% Score)', cat: 'Judge Presets', icon: PlayCircle, run: () => { onLoadPreset('approved-showcase'); onNavigateTab('scanner'); } },

    // Security & Roles
    { id: 'action-ephemeral', title: `${ephemeralMode ? 'Disable' : 'Enable'} Ephemeral Zero-Data-Retention Vault Mode`, cat: 'Security', icon: ShieldCheck, run: onToggleEphemeral },
    { id: 'role-creator', title: 'Switch Persona: Utkarsh Yadav (Creator)', cat: 'Persona', icon: Users, run: () => onSwitchRole('CREATOR') },
    { id: 'role-manager', title: 'Switch Persona: Shreya Kumari (Brand Manager)', cat: 'Persona', icon: Users, run: () => onSwitchRole('BRAND_MANAGER') },
    { id: 'role-compliance', title: 'Switch Persona: Compliance Auditor (Sign-off)', cat: 'Persona', icon: Users, run: () => onSwitchRole('COMPLIANCE_OFFICER') }
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search rules, or jump to view (e.g. 'vault', 'saas', 'pro')..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-96">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or actions found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-semibold' 
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider shrink-0 ml-2 ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.cat}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Use ↑ ↓ to navigate, Enter to select</span>
          </div>
          <span>Inkloom Command Protocol</span>
        </div>

      </div>
    </div>
  );
};
