import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Download, 
  X, 
  Tag, 
  ShieldCheck,
  Check
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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
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

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "inkloom_brand_rules_v2.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredRules = rules.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guideline_section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pattern_or_terms.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === "ALL" || r.category === selectedCategory;
    const matchesSev = selectedSeverity === "ALL" || r.severity === selectedSeverity;

    return matchesSearch && matchesCat && matchesSev;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Centralized Brand Rule Repository</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Single source of truth for tone-of-voice dimensions, certified product claims, restricted vocabulary, and visual standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
            title="Reset to official enterprise brand rules"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Rules</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand Rule</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidelines, rules, trigger keywords, citations..."
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="TONE_OF_VOICE">Tone of Voice</option>
            <option value="PRODUCT_FACTS">Product Facts & SLA</option>
            <option value="RESTRICTED_TERMINOLOGY">Restricted Vocab</option>
            <option value="VISUAL_GUIDELINES">Visual Standards</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950/70 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => {
          const sevClass = {
            CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
          }[rule.severity];

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition space-y-3 ${
                rule.active 
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                  : 'bg-slate-950/50 border-slate-850 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${sevClass}`}>
                      {rule.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{rule.id}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{rule.name}</h3>
                </div>

                {/* Active switch toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.active ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Guideline Section Citation */}
              <div className="text-xs text-indigo-400 font-medium">
                {rule.guideline_section}
              </div>

              {/* Guideline text excerpt */}
              <div className="text-xs text-slate-300 bg-slate-850/80 p-2.5 rounded-xl border border-slate-800">
                "{rule.guideline_text}"
              </div>

              {/* Pattern / Trigger Terms */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Flagged Triggers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {rule.pattern_or_terms.map((term, i) => (
                    <span key={i} className="px-2 py-0.5 text-[11px] rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Replacement */}
              <div className="text-xs pt-1 border-t border-slate-800/80 flex items-start gap-1.5 text-emerald-400">
                <span className="font-semibold text-slate-400 shrink-0">Prescribed Fix:</span>
                <span className="font-mono text-[11px]">{rule.suggested_fix}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create Brand Governance Rule</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rule Title</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Certified Pricing Disclosures"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newRule.category}
                    onChange={(e) => setNewRule({ ...newRule, category: e.target.value as RuleCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TONE_OF_VOICE">Tone of Voice</option>
                    <option value="PRODUCT_FACTS">Product Facts & SLA</option>
                    <option value="RESTRICTED_TERMINOLOGY">Restricted Vocab</option>
                    <option value="VISUAL_GUIDELINES">Visual Standards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity Level</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as Severity })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">Critical (Blocking)</option>
                    <option value="WARNING">Warning</option>
                    <option value="INFO">Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Guideline Section Reference</label>
                <input
                  type="text"
                  value={newRule.guideline_section}
                  onChange={(e) => setNewRule({ ...newRule, guideline_section: e.target.value })}
                  placeholder="e.g. Section 4.2 — Commercial Terms"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Guideline Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={newRule.guideline_text}
                  onChange={(e) => setNewRule({ ...newRule, guideline_text: e.target.value })}
                  placeholder="Official rule text from corporate style guide..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  value={newRule.pattern_or_terms?.join(', ')}
                  onChange={(e) => setNewRule({ ...newRule, pattern_or_terms: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="term 1, phrase 2, keyword 3"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Rationale (Why this creates risk)</label>
                <input
                  type="text"
                  value={newRule.rationale}
                  onChange={(e) => setNewRule({ ...newRule, rationale: e.target.value })}
                  placeholder="Exposes company to misrepresentation claims..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prescribed Context-Preserving Fix</label>
                <input
                  type="text"
                  value={newRule.suggested_fix}
                  onChange={(e) => setNewRule({ ...newRule, suggested_fix: e.target.value })}
                  placeholder="safe, verified alternative phrasing..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Brand Rule
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
