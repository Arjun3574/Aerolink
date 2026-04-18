"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Zap,
  ArrowUpRight,
  Clock,
  Info
} from "lucide-react";

interface Ticket {
  id: string;
  original: string;
  reconstructed: string;
  urgency: number;
  category: string;
  timestamp: string;
  tacticalReasoning?: string;
}

export default function PriorityBoard() {
  const [prioritizedTickets, setPrioritizedTickets] = useState<Ticket[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/prioritize", { method: "POST" });
      const data = await res.json();
      setPrioritizedTickets(data);
    } catch (err) {
      console.error("Prioritization Analysis Failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-[var(--admin-border)] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--admin-navy)]">
            <ShieldAlert size={16} />
            <h2 className="text-2xl font-normal uppercase tracking-widest text-[var(--admin-text)]">
              Tactical Triage Assessment
            </h2>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[2px]">AI Comparative Analysis • Priority Protocol v4.3</p>
        </div>
        
        <button 
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="sleek-btn px-8"
        >
          <Zap size={14} className={isAnalyzing ? "animate-pulse" : ""} />
          {isAnalyzing ? "Processing Horizons..." : "Run Priority Analysis"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prioritizedTickets.length > 0 ? (
          prioritizedTickets.map((t, index) => (
            <div 
              key={t.id}
              className={`lucid-card flex flex-col md:flex-row items-stretch gap-0 md:gap-8 relative overflow-hidden group p-0 transition-all ${
                index === 0 ? "border border-[var(--admin-navy)]/30" : ""
              }`}
            >
              {/* Priority Indicator */}
              <div className="bg-slate-50 flex flex-col items-center justify-center px-10 border-r border-slate-100">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-60">Rank</span>
                <span className="text-3xl font-light text-[var(--admin-navy)]">#{index + 1}</span>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-sm font-bold border tracking-widest ${
                    t.urgency > 8 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-[var(--admin-navy)] border-blue-100"
                  }`}>
                    TRIAGE L{t.urgency}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-[2px]">
                    Sector Ops • {new Date(t.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {t.category}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">
                    {t.reconstructed}
                  </h4>
                  {t.tacticalReasoning && (
                    <div className="flex gap-3 items-start bg-slate-50/50 p-4 border-l-2 border-[var(--admin-navy)]/20">
                      <Info size={14} className="text-slate-300 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <span className="font-bold uppercase text-[8px] text-[var(--admin-navy)] opacity-60 tracking-widest">AI Strategic Reasoning</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          {t.tacticalReasoning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action/Meta */}
              <div className="p-6 bg-slate-50/30 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 min-w-[200px]">
                <div className="text-right">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-60">Survival Strategy</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${index === 0 ? "text-red-600" : "text-[var(--admin-navy)]"}`}>
                    {index === 0 ? "Critical Response" : "Staged Deployment"}
                  </p>
                </div>
              </div>

              {index === 0 && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-red-600 text-white text-[8px] font-bold uppercase tracking-[2px]">
                  Priority Alpha
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="lucid-card border-dashed py-32 flex flex-col items-center justify-center space-y-4 text-slate-200">
            <Activity size={40} className="opacity-10" />
            <div className="text-center">
              <p className="stat-label">System Idle • No Active Matrix</p>
              <p className="text-[10px] font-bold opacity-30">Compare survival horizons to initialize prioritized logistics.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-100">
        <div className="space-y-3">
          <p className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-red-500 rounded-full" /> Survival Horizon</p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            Priorities locked to physiological time-limits. Thermal and hydration events override logistics instantly.
          </p>
        </div>
        <div className="space-y-3">
          <p className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-[var(--admin-navy)] rounded-full" /> Force Capacity</p>
          <div className="flex items-center justify-between text-[8px] font-bold uppercase mb-1 opacity-60">
            <span>Readiness Index</span>
            <span>82%</span>
          </div>
          <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--admin-navy)] w-[82%] opacity-60"></div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Clear Logistics</p>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
            Deployment path active for Sector 7. Estimated air/ground intercept window: <span className="text-[var(--admin-navy)] font-bold">4.2m</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
