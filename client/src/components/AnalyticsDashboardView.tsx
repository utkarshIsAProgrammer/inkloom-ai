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
    <div className="space-y-3 animate-in">
      
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-syne font-bold text-sm text-white uppercase tracking-tight flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-red-400" />
            <span>Governance Analytics</span>
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Macro consistency trends & organizational compliance
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-300 text-[11px] font-syne font-bold uppercase tracking-wider transition"
        >
          <Download className="w-3 h-3 text-red-400" />
          <span>Export</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500">Brand Health Index</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-syne text-white">{analytics?.brand_health_index || 88}%</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">+4.2%</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Overall corporate score</span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500">Breaches Intercepted</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-syne text-red-400">{analytics?.violations_intercepted || 142}</span>
            <span className="text-[10px] text-neutral-400 font-mono">errors</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Before public release</span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500">Editorial Hours Saved</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-syne text-emerald-400">{analytics?.editorial_hours_saved || 36}h</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Automated AI fixes</span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500">Guideline Clarity</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-syne text-white">{analytics?.guideline_clarity_index || 94}%</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Unambiguous rules</span>
        </div>
      </div>

      {/* Top Recurring Brand Policy Violations */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
        <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Most Frequent Governance Breaches</span>
        </span>

        <div className="space-y-2">
          {(analytics?.top_violated_rules || [
            { name: "Unsubstantiated absolute uptime claims", violations: 42 },
            { name: "Competitor deprecation (non-constructive)", violations: 28 },
            { name: "Unregistered trademark usage without disclaimer", violations: 19 }
          ]).map((r, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-neutral-950 border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium truncate max-w-[200px]">{r.name}</span>
                <span className="font-mono text-red-400 font-bold text-[11px] shrink-0">{r.violations} times</span>
              </div>
              <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (r.violations / 50) * 100)}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Compliance Breakdown */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2.5">
        <span className="font-syne font-bold text-xs uppercase text-white flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Department Compliance Readiness</span>
        </span>

        <div className="space-y-2">
          {(analytics?.department_compliance || [
            { department: "Product Marketing", score: 94, trend: "+3%" },
            { department: "Developer Relations", score: 87, trend: "+5%" },
            { department: "Sales Enablement", score: 76, trend: "-2%" }
          ]).map((d, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-neutral-950 border border-white/5 flex items-center justify-between text-xs">
              <span className="font-medium text-white">{d.department}</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-emerald-400 font-bold">{d.score}%</span>
                <span className="text-[10px] text-neutral-500">{d.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
