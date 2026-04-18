import React, { useState, useEffect } from "react";
import { 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  icon: any;
  chartColor?: string;
}

function StatCard({ label, value, subValue, icon: Icon, chartColor = "#1e3a8a" }: StatCardProps) {
  return (
    <div className="lucid-card group flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="stat-label">{label}</p>
          <h3 className="stat-value">{(typeof value === 'number' && value < 10 && value !== 0) ? `0${value}` : value}</h3>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">{subValue}</p>
        </div>
        <div className="p-2.5 bg-slate-50 border border-[#f1f5f9] rounded-sm group-hover:border-[var(--admin-navy)] transition-colors">
          <Icon className="text-[var(--admin-navy)]" size={18} />
        </div>
      </div>
      <div className="w-full h-[1px] bg-[#f1f5f9] group-hover:bg-[var(--admin-navy)] transition-all duration-500 opacity-30"></div>
    </div>
  );
}

export default function StatsDashboard() {
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    deployed: 0,
    resolved: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/reconstruct");
      if (res.ok) {
        const tickets = await res.json();
        setStats({
          active: tickets.filter((t: any) => t.status !== "resolved").length,
          pending: tickets.filter((t: any) => t.status === "pending").length,
          deployed: tickets.filter((t: any) => t.status === "received").length,
          resolved: tickets.filter((t: any) => t.status === "resolved").length
        });
      }
    } catch (err) {
      console.error("Stats Sync Error");
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard 
        label="Deployed Units" 
        value={stats.deployed} 
        subValue={stats.deployed > 0 ? "Active Field Support" : "Awaiting Operational Order"} 
        icon={ShieldCheck} 
      />
      <StatCard 
        label="Active Signals" 
        value={stats.active} 
        subValue="Live Mesh Intelligence" 
        icon={Activity} 
      />
      <StatCard 
        label="Pending Triage" 
        value={stats.pending} 
        subValue={stats.pending > 0 ? "High Priority Queue" : "Survival Assessment Idle"} 
        icon={Zap} 
      />
      <StatCard 
        label="Resolved Ops" 
        value={stats.resolved} 
        subValue="District Mission History" 
        icon={CheckCircle2} 
      />
    </div>
  );
}
