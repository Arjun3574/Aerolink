"use client";

import React, { useState } from "react";
import StatsDashboard from "./StatsDashboard";
import IntelligenceModule from "./IntelligenceModule";
import RequestsPage from "./RequestsPage";
import PriorityBoard from "./PriorityBoard";
import AdminSidebar from "./AdminSidebar";
import { Bell, Search, Settings, ShieldCheck, User } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="admin-layout">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content bg-[var(--admin-bg)]">
        {/* Top Header - Professional Tactical Light */}
        <header className="flex justify-between items-center mb-12 border-b border-[var(--admin-border)] pb-8">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white border border-[var(--admin-border)] rounded-sm">
               <ShieldCheck className="text-[var(--admin-navy)]" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold tracking-[4px] text-[var(--admin-navy)] opacity-60 uppercase">
                  Security Clearance Tier-A
                </span>
              </div>
              <h1 className="text-3xl font-normal text-[var(--admin-text)] tracking-tight uppercase">
                {activeTab === "overview" ? "Command Overview" : 
                 activeTab === "intelligence" ? "Signal Intelligence" : 
                 activeTab === "requests" ? "Dispatcher Log" : 
                 activeTab === "priority" ? "Triage Priority" : activeTab}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-6 text-[9px] font-bold text-[var(--admin-subtext)] uppercase tracking-widest border-r border-[var(--admin-border)] pr-8 opacity-60">
              <span>Status: <span className="text-emerald-600">Secure</span></span>
              <span>Sync: <span className="text-[var(--admin-navy)]">Live</span></span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                <input 
                  type="text" 
                  placeholder="Registry search..."
                  className="bg-white border border-[var(--admin-border)] rounded-sm py-2 pl-9 pr-4 text-[10px] w-[180px] text-[var(--admin-text)] focus:outline-none focus:border-[var(--admin-navy)] transition-all font-sans"
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 relative hover:text-[var(--admin-navy)] transition-colors text-slate-400">
                  <Bell size={16} />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-[var(--admin-border)]">
                  <User size={14} className="text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Routing */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === "overview" && (
            <div className="space-y-12 animate-in fade-in duration-500 pb-20">
              <StatsDashboard />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 lucid-card border-dashed flex flex-col items-center justify-center py-28 text-center text-slate-300">
                  <ShieldCheck size={40} className="mb-4 opacity-10" />
                  <p className="stat-label">Tactical Situational Map</p>
                  <p className="text-[9px] uppercase font-bold tracking-[2px] opacity-40">Awaiting GIS Stream Authorization</p>
                </div>
                <div className="lucid-card border-dashed flex flex-col items-center justify-center py-28 text-center text-slate-300">
                  <Bell size={40} className="mb-4 opacity-10" />
                  <p className="stat-label">Alert Feed</p>
                  <p className="text-[9px] uppercase font-bold tracking-[2px] opacity-40">All Sectors Operational</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "intelligence" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 h-full">
              <IntelligenceModule />
            </div>
          )}

          {activeTab === "requests" && (
            <div className="animate-in slide-in-from-right-4 duration-500 h-full">
              <RequestsPage />
            </div>
          )}

          {activeTab === "priority" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 h-full">
              <PriorityBoard />
            </div>
          )}
        </div>
        
        {/* Professional Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--admin-border)] flex justify-between items-center text-[8px] text-[var(--admin-subtext)] font-semibold uppercase tracking-[3px] opacity-30">
          <div>Command System Protocol v4.3.0 • HIPAA & NATO Compliant AES-256</div>
          <div className="flex gap-10">
            <span className="hover:text-[var(--admin-navy)] cursor-pointer">Registry Index</span>
            <span className="hover:text-[var(--admin-navy)] cursor-pointer">Mission Logs</span>
            <span className="hover:text-[var(--admin-navy)] cursor-pointer">Security Directive 14</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
