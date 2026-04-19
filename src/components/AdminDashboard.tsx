"use client";

import React, { useState } from "react";
import StatsDashboard from "./StatsDashboard";
import IntelligenceModule from "./IntelligenceModule";
import RequestsPage from "./RequestsPage";
import PriorityBoard from "./PriorityBoard";
import AdminSidebar from "./AdminSidebar";
import SituationalMap from "./SituationalMap";
import { Bell, Search, User } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [baseCoord, setBaseCoord] = useState<{lat: number, lng: number} | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  React.useEffect(() => {
    if (navigator.geolocation && !baseCoord) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setBaseCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Location permission denied or unavailable"),
        { enableHighAccuracy: true }
      );
    }
  }, [baseCoord]);

  React.useEffect(() => {
    if (activeTab !== "overview") return;
    const fetchT = async () => { try { const r = await fetch("/api/reconstruct"); setTickets(await r.json()); } catch {} };
    fetchT();
    const i = setInterval(fetchT, 4000);
    return () => clearInterval(i);
  }, [activeTab]);

  const title: Record<string, string> = {
    overview: "Overview",
    intelligence: "Signal Intelligence",
    requests: "Dispatcher Log",
    priority: "Triage Priority",
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{title[activeTab] || "Overview"}</h1>
            <p className="text-[13px] text-[var(--text-3)] mt-0.5">Aerolink Basecamp · Tier-A</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] w-3.5 h-3.5" />
              <input type="text" placeholder="Search..." className="bc-input py-2 pl-8 pr-3 text-[13px] w-[160px]" />
            </div>
            <button className="p-2 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-3)] hover:text-[var(--text)]">
              <Bell size={15} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[var(--plum)] flex items-center justify-center">
              <User size={13} className="text-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {activeTab === "overview" && (
            <div className="space-y-6 pb-12">
              <StatsDashboard />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 h-[320px]">
                  <SituationalMap tickets={tickets} baseCoord={baseCoord} height={320} />
                </div>
                <div className="bento-card border-dashed flex items-center justify-center py-20 text-center">
                  <div>
                    <p className="stat-label mb-1">Alert Feed</p>
                    <p className="text-[13px] text-[var(--text-3)]">All sectors clear</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "intelligence" && <IntelligenceModule />}
          {activeTab === "requests" && <RequestsPage />}
          {activeTab === "priority" && <PriorityBoard />}
        </div>
        
        <footer className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between text-[11px] text-[var(--text-3)]">
          <span>Aerolink v4.3 · AES-256</span>
          <div className="flex gap-5">
            <span className="hover:text-[var(--mint)] cursor-pointer">Registry</span>
            <span className="hover:text-[var(--mint)] cursor-pointer">Logs</span>
            <span className="hover:text-[var(--mint)] cursor-pointer">Security</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
