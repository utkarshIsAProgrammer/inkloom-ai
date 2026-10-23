import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Download, 
  X, 
  Tag, 
  ShieldCheck,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import { BrandRule, RuleCategory, Severity, UserRole } from '../types';
import { api } from '../services/api';

interface BrandRulesViewProps {
  currentRole: UserRole;
}

export const BrandRulesView: React.FC<BrandRulesViewProps> = ({ currentRole }) => {
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Rule form state
  const [newRule, setNewRule] = useState<Partial<BrandRule>>({
    name: "",
    category: "TONE_OF_VOICE" as RuleCategory,
    severity: "WARNING" as Severity,
    guideline_section: "Section 1.5 — Style Standards",
    guideline_text: "",
    pattern_or_terms: [""],
    rationale: "",
    suggested_fix: "",
    active: true
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggleActive = async (rule: BrandRule) => {
    try {
      const updated = { ...rule, active: !rule.active };
      await api.updateRule(rule.id, updated);
      setRules(rules.map(r => r.id === rule.id ? updated : r));
    } catch (err) {
      console.error("Failed to update rule:", err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm("Are you sure you want to delete this brand rule?")) return;
    try {
      await api.deleteRule(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all rules to enterprise defaults? Any custom rules will be cleared.")) return;
    try {
      await api.resetRules();
      await loadRules();
    } catch (err) {
      console.error("Failed to reset rules:", err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.guideline_text) return;

    try {
      const created = await api.createRule({
        ...newRule,
        pattern_or_terms: (newRule.pattern_or_terms || []).filter(t => t.trim().length > 0)
      });
      setRules([...rules, created]);
      setIsAddModalOpen(false);
      setNewRule({
        name: "",
        category: "TONE_OF_VOICE" as RuleCategory,
        severity: "WARNING" as Severity,
        guideline_section: "Section 1.5 — Style Standards",
        guideline_text: "",
        pattern_or_terms: [""],
        rationale: "",
        suggested_fix: "",
        active: true
      });
    } catch (err) {
      console.error("Failed to create rule:", err);
    }
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guideline_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pattern_or_terms.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "ALL" || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 animate-in">
      
      {/* Header Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-black text-base md:text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Brand Rules Repository</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            {rules.filter(r => r.active).length} of {rules.length} active corporate governance policies enforced
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white text-xs font-mono transition"
            title="Reset to corporate defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-syne font-bold uppercase tracking-wider shadow-lg shadow-rose-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand Rule</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidelines, terms, or SLA benchmarks..."
            className="w-full bg-[#09090D]/90 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'ALL', label: 'All Rules' },
            { id: 'TONE_OF_VOICE', label: 'Tone of Voice' },
            { id: 'FACT_CLAIM', label: 'Fact & SLA Claims' },
            { id: 'TERMINOLOGY', label: 'Restricted Lexicon' },
            { id: 'INCLUSIVITY', label: 'Inclusivity' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-syne font-bold uppercase tracking-wider transition ${
                selectedCategory === cat.id
                  ? 'bg-white text-black'
                  : 'bg-neutral-900 text-neutral-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-500 text-xs bg-neutral-950/40 rounded-2xl border border-white/5">
            No brand rules match your search query.
          </div>
        ) : (
          filteredRules.map(rule => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 relative shadow-sm ${
                rule.active
                  ? 'bg-[#09090D]/90 border-white/[0.08] hover:border-white/20'
                  : 'bg-neutral-950/40 border-white/[0.04] opacity-60'
              }`}
            >
              <div className="space-y-3">
                {/* Header with Switch */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {rule.severity}
                    </span>
                    <h4 className="text-xs font-syne font-bold text-white">
                      {rule.name}
                    </h4>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                      rule.active ? 'bg-rose-600' : 'bg-neutral-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        rule.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Guideline Citation & Text */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 block">
                    {rule.guideline_section}
                  </span>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-white/[0.04]">
                    "{rule.guideline_text}"
                  </p>
                </div>

                {/* Monitored Patterns */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-neutral-500">Monitored Phrases:</span>
                  <div className="flex flex-wrap gap-1">
                    {rule.pattern_or_terms.map((t, idx) => (
                      <span key={idx} className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-neutral-300 border border-white/[0.04]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Fix & Delete */}
              <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono truncate max-w-[200px]">
                  Fix: <span className="text-emerald-400">{rule.suggested_fix}</span>
                </span>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1 transition"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl bg-[#09090D] border border-amber-500/20 p-6 shadow-2xl animate-in space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-syne font-black text-base text-white uppercase tracking-tight">Create Enterprise Brand Rule</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Prohibit unverified absolute uptime guarantees"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Category</label>
                  <select
                    value={newRule.category}
                    onChange={e => setNewRule({ ...newRule, category: e.target.value as RuleCategory })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="TONE_OF_VOICE">Tone of Voice</option>
                    <option value="FACT_CLAIM">Fact Claim</option>
                    <option value="TERMINOLOGY">Terminology</option>
                    <option value="INCLUSIVITY">Inclusivity</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={e => setNewRule({ ...newRule, severity: e.target.value as Severity })}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="WARNING">Warning</option>
                    <option value="INFO">Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Guideline Text</label>
                <textarea
                  required
                  rows={2}
                  value={newRule.guideline_text}
                  onChange={e => setNewRule({ ...newRule, guideline_text: e.target.value })}
                  placeholder="State the official corporate policy clearly..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Monitored Phrases (comma separated)</label>
                <input
                  type="text"
                  value={(newRule.pattern_or_terms || []).join(', ')}
                  onChange={e => setNewRule({ ...newRule, pattern_or_terms: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="e.g. 100% uptime, zero downtime, infinitely superior"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">Suggested Correction</label>
                <input
                  type="text"
                  value={newRule.suggested_fix}
                  onChange={e => setNewRule({ ...newRule, suggested_fix: e.target.value })}
                  placeholder="e.g. 99.95% verified SLA"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 font-syne font-bold uppercase text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-syne font-bold uppercase text-xs shadow-lg"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
