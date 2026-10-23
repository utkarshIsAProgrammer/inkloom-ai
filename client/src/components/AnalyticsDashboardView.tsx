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
    link.setAttribute("download", `inkloom_governance_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in">
      
      {/* Top Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne font-black text-base md:text-lg text-white uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Governance Analytics</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 font-sans">
            Macro consistency metrics, organizational compliance velocity, and guideline clarity index
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-200 text-xs font-syne font-bold uppercase tracking-wider transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* KPI Grid (4 columns on desktop, 2 on mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Brand Health Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-white">{analytics?.brand_health_index || 88}%</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">+4.2%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block font-sans">Overall corporate compliance score</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Violations Intercepted</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-rose-400">{analytics?.violations_intercepted || 142}</span>
            <span className="text-xs text-neutral-400 font-mono">breaches</span>
          </div>
          <span className="text-[11px] text-neutral-400 block font-sans">Pre-empted prior to live publishing</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Editorial Hours Saved</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-emerald-400">{analytics?.editorial_hours_saved || 36}h</span>
          </div>
          <span className="text-[11px] text-neutral-400 block font-sans">Automated AI remediation velocity</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">Guideline Clarity Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-syne text-white">{analytics?.guideline_clarity_index || 94}%</span>
          </div>
          <span className="text-[11px] text-neutral-400 block font-sans">Unambiguous policy standards</span>
        </div>
      </div>

      {/* Two Column Breakdown on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Recurring Brand Policy Violations */}
        <div className="p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-4">
          <span className="font-syne font-black text-sm uppercase text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Most Frequent Policy Violations (Training Opportunities)</span>
          </span>

          <div className="space-y-3">
            {(analytics?.top_violated_rules || [
              { name: "Unsubstantiated absolute uptime claims (100% guarantee)", violations: 42 },
              { name: "Competitor disparagement (non-constructive comparison)", violations: 28 },
              { name: "Unregistered trademark usage without disclaimer", violations: 19 }
            ]).map((r, i) => (
              <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-white/[0.04] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-medium">{r.name}</span>
                  <span className="font-mono text-rose-400 font-bold text-xs shrink-0">{r.violations} times</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (r.violations / 50) * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Compliance Breakdown */}
        <div className="p-5 rounded-2xl bg-[#09090D]/90 border border-white/[0.08] shadow-xl space-y-4">
          <span className="font-syne font-black text-sm uppercase text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Departmental Compliance Readiness</span>
          </span>

          <div className="space-y-3">
            {(analytics?.department_compliance || [
              { department: "Product Marketing", score: 94, trend: "+3.2%" },
              { department: "Developer Relations & Docs", score: 87, trend: "+5.1%" },
              { department: "Sales Enablement", score: 76, trend: "-1.8%" }
            ]).map((d, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-neutral-950 border border-white/[0.04] flex items-center justify-between text-xs font-sans">
                <span className="font-medium text-white">{d.department}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-emerald-400 font-bold text-sm">{d.score}%</span>
                  <span className="text-[11px] text-neutral-400">{d.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
