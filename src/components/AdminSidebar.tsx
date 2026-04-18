"use client";

import React from "react";
import {
  LayoutDashboard,
  Activity,
  LogOut,
  AlertCircle,
  Zap,
  ClipboardList,
  ExternalLink,
  ShieldIcon
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Mission Control" },
    { id: "requests", icon: ClipboardList, label: "Dispatcher Log" },
    { id: "priority", icon: Zap, label: "Tactical Priority" },
    { id: "intelligence", icon: Activity, label: "Signal Intel" },
  ];

  return (
    <aside className="sidebar flex flex-col p-8 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-4 mb-16 px-1">
        <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-white/5">
          <ShieldIcon className="text-white" size={18} />
        </div>
        <div>
          <h1 className="text-lg font-normal tracking-[5px] text-white leading-none mb-1 uppercase">Disast-ED</h1>
          <p className="text-[7px] font-bold text-white/40 uppercase tracking-[2px]">Clinical Ops • v4.3</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <p className="text-[9px] font-bold text-white/30 uppercase tracking-[4px] mb-8">Command Center</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 transition-all font-normal text-[10px] uppercase tracking-[2.5px] text-left rounded-sm ${activeTab === item.id
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
          >
            <item.icon
              size={14}
              className={activeTab === item.id ? "text-white" : "opacity-40"}
            />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="p-4 bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">System Link</span>
            <span className="text-[7px] font-bold text-emerald-400 uppercase">Secure</span>
          </div>
          <div className="w-full h-[1px] bg-white/10">
            <div className="h-full bg-white/60 w-full"></div>
          </div>
        </div>

        <div className="space-y-1">
          <a
            href="/victim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 w-full text-white/40 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-[2px]"
          >
            <ExternalLink size={14} />
            External Portal
          </a>

          <button className="flex items-center gap-4 px-4 py-3 w-full text-white/40 hover:text-red-400 transition-colors text-[9px] font-bold uppercase tracking-[2px]">
            <LogOut size={14} />
            Exit Terminal
          </button>
        </div>
      </div>
    </aside>
  );
}
