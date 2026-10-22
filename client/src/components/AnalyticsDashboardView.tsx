import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Download, 
  Lightbulb, 
  CheckCircle2, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { AnalyticsData, UserRole } from '../types';
import { api } from '../services/api';

interface AnalyticsDashboardViewProps {
  currentRole: UserRole;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({ currentRole }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Metric", "Value"],
      ["Brand Health Index", `${analytics.brand_health_index}%`],
      ["Total Scans Conducted", `${analytics.total_scans}`],
      ["Violations Prevented", `${analytics.violations_intercepted}`],
      ["Editorial Hours Saved", `${analytics.editorial_hours_saved} hrs`],
      ["Guideline Clarity Score", `${analytics.guideline_clarity_index}%`],
      [],
      ["Top Violated Rules", "Violations Count"],
      ...analytics.top_violated_rules.map(r => [r.name, r.violations.toString()]),
      [],
      ["Department", "Compliance Score", "Trend"],
      ...analytics.department_compliance.map(d => [d.department, `${d.score}%`, d.trend])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inkloom_governance_audit_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading governance telemetry...
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    PRODUCT_FACTS: 'Product Facts & SLA Disclosures',
    TONE_OF_VOICE: 'Tone of Voice & Hyperbole',
    RESTRICTED_TERMINOLOGY: 'Restricted Terminology & DEI',
    VISUAL_GUIDELINES: 'Visual Palette & WCAG Accessibility'
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Enterprise Governance Analytics & Audit Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro-insights into recurring brand consistency errors, department compliance health, and guideline friction over time.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Brand Health Index</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.brand_health_index}%
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+5.8% improvement this quarter</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Automated Audits Run</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.total_scans}
          </div>
          <div className="text-[11px] text-slate-400">
            Continuous CI/CD pipeline scans
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Violations Intercepted</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.violations_intercepted}
          </div>
          <div className="text-[11px] text-amber-400">
            0 unvetted claims reached public channels
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Editorial Hours Saved</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics.editorial_hours_saved}h
          </div>
          <div className="text-[11px] text-slate-400">
            Estimated review velocity acceleration
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Violation Distribution by Category */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Violation Distribution Across Core Pillars</h3>
            <span className="text-[11px] text-slate-400">Last 30 Days</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(analytics.category_distribution).map(([cat, count]) => {
              const total = Object.values(analytics.category_distribution).reduce((a, b) => a + b, 0);
              const pct = Math.round((count / Math.max(1, total)) * 100);

              const color = {
                PRODUCT_FACTS: 'bg-rose-500',
                TONE_OF_VOICE: 'bg-indigo-500',
                RESTRICTED_TERMINOLOGY: 'bg-amber-500',
                VISUAL_GUIDELINES: 'bg-emerald-500'
              }[cat] || 'bg-slate-500';

              return (
                <div key={cat} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">{categoryLabels[cat] || cat}</span>
                    <span className="font-bold text-slate-200">{count} occurrences ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Clarity Recommendation Box */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 mt-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Guideline Clarity Index: {analytics.guideline_clarity_index}%</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-200">Governance Recommendation: </strong>
              {analytics.clarity_recommendation}
            </p>
          </div>
        </div>

        {/* Department Compliance Leaderboard */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Department Compliance Matrix</h3>
            <span className="text-[11px] text-slate-400">Target ≥ 85%</span>
          </div>

          <div className="space-y-3">
            {analytics.department_compliance.map((dept, i) => (
              <div key={i} className="p-3 bg-slate-850/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-200">{dept.department}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">{dept.trend} this month</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">{dept.score}%</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">
                    {dept.score >= 90 ? 'Certified' : 'Reviewing'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Violated Rules */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Top Friction Rules (Training Gaps)
            </span>
            <div className="space-y-1.5">
              {analytics.top_violated_rules.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] p-2 bg-slate-950/40 rounded-lg border border-slate-850">
                  <span className="text-slate-300 truncate max-w-[200px]">{r.name}</span>
                  <span className="font-mono text-amber-400 font-bold">{r.violations} flags</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
