"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  MapPin, 
  Clock, 
  MessageSquare, 
  CheckCircle,
  Map as MapIcon,
  Send,
  AlertTriangle,
  RefreshCcw,
  Radio,
  Inbox
} from "lucide-react";

interface TicketNote {
  text: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  original: string;
  reconstructed: string;
  urgency: number;
  category: string;
  location: { lat: number, lng: number };
  timestamp: string;
  status: string;
  adminNotes: TicketNote[];
  source?: string;
  victimName?: string;
  manualLocation?: string;
}

export default function RequestsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [outboundMsg, setOutboundMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingSignal, setPendingSignal] = useState<any>(null);

  const fetchPendingSignal = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      if (data.state === "AWAITING_REVIEW") {
        setPendingSignal(data);
      } else {
        setPendingSignal(null);
      }
    } catch (err) { console.error("Signal Sync Error"); }
  };

  const handleApproveSignal = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/data/approve", { method: "POST" });
      if (res.ok) {
        setPendingSignal(null);
        fetchTickets();
      }
    } catch (err) { console.error(err); }
    setIsUpdating(true);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/reconstruct");
      const data = await res.json();
      const sorted = data.sort((a: Ticket, b: Ticket) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setTickets(sorted);
      if (selectedTicket) {
        const updated = sorted.find((t: Ticket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchPendingSignal();
    const tInterval = setInterval(fetchTickets, 5000);
    const sInterval = setInterval(fetchPendingSignal, 1500);
    return () => {
      clearInterval(tInterval);
      clearInterval(sInterval);
    };
  }, [selectedTicket]);

  const handleAction = async (id: string, actionType: string, payload?: any) => {
    setIsUpdating(true);
    try {
      let body: any = { id };
      if (actionType === "marker") body.status = "received";
      if (actionType === "location") body.note = "COMMAND SYSTEM: Requesting updated GPS coordinates.";
      if (actionType === "message") {
        body.note = outboundMsg;
        setOutboundMsg("");
      }

      await fetch("/api/reconstruct", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full animate-in fade-in duration-500 pb-10">
      {/* Sidebar - Ticket Feed */}
      <div className="xl:col-span-4 flex flex-col space-y-4">
        {/* TACTICAL INTERCEPTION BANNER */}
        {pendingSignal && (
          <div className="bg-[#f0f9ff] p-6 shadow-sm space-y-4 border border-[var(--admin-navy)] rounded-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Radio size={16} className="text-[var(--admin-navy)]" />
                <h3 className="text-[10px] font-bold text-[var(--admin-navy)] uppercase tracking-[3px]">Signal Intercepted</h3>
              </div>
              <span className="text-[8px] font-bold text-[var(--admin-navy)] opacity-40 uppercase tracking-widest">Awaiting Auth</span>
            </div>
            
            <div className="bg-white border border-blue-100 p-4 rounded-sm space-y-2">
               <div className="flex justify-between">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Field ID</span>
                  <span className="text-[9px] font-bold text-[var(--admin-navy)] uppercase">COM12 / BASE-STN</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-[10px] text-slate-700 font-medium">UNIT: {pendingSignal.victimName.toUpperCase()}</span>
                  <span className="text-[10px] text-slate-500 italic max-w-[150px] truncate">{pendingSignal.manualLocation}</span>
               </div>
               <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3 mt-1">
                  "{pendingSignal.message}"
               </p>
            </div>

            <button 
              onClick={handleApproveSignal}
              disabled={isUpdating}
              className="sleek-btn w-full justify-center group bg-[var(--admin-navy)] text-white hover:bg-[var(--admin-navy-dark)]"
            >
              Authorize Mission Intake <CheckCircle size={14} className="ml-2" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-[var(--admin-blue)]" />
            <h2 className="stat-label">Tactical Intake</h2>
          </div>
          <div className="flex items-center gap-3">
            {isLoading && <RefreshCcw size={10} className="animate-spin text-slate-400" />}
            <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black tracking-widest border border-slate-200">
              {tickets.length} ACTIVE
            </span>
          </div>
        </div>
        
        <div className="space-y-4 overflow-y-auto max-h-[750px] pr-2">
          {tickets.map((t) => (
            <div 
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`lucid-card cursor-pointer p-5 space-y-4 border-l-2 transition-all relative ${
                selectedTicket?.id === t.id ? "border-l-[var(--admin-navy)] bg-blue-50/20" : 
                t.status === "received" ? "border-l-emerald-400" :
                t.urgency > 8 ? "border-l-red-500" : "border-l-slate-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${t.urgency > 8 ? "text-red-500" : "text-[var(--admin-navy)]"}`}>
                    {t.category}
                  </span>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">
                    {t.victimName || `Unit ${t.id}`}
                  </p>
                </div>
                <span className="text-[9px] text-slate-400">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              {t.manualLocation && t.manualLocation !== "Unknown Location" && (
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-sm flex items-center gap-2">
                  <MapPin size={10} className="text-slate-400" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">
                    {t.manualLocation}
                  </span>
                </div>
              )}
              <p className="text-sm font-normal text-[var(--admin-text)] line-clamp-2 leading-relaxed italic">
                "{t.reconstructed}"
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1 text-[9px] font-black ${t.urgency > 8 ? "text-red-500" : "text-slate-400"}`}>
                    <AlertTriangle size={10} />
                    L{t.urgency}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {t.status === "received" ? <CheckCircle size={10} className="text-emerald-500" /> : <Clock size={10} />}
                    {t.status}
                  </div>
                </div>
                {t.adminNotes.length > 0 && (
                  <MessageSquare size={10} className="text-[var(--admin-blue)] opacity-40" />
                )}
              </div>
            </div>
          ))}
          {!isLoading && tickets.length === 0 && (
            <div className="lucid-card border-dashed py-32 text-center opacity-30">
              <p className="stat-label">No casualties reported</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="xl:col-span-8 flex flex-col h-full">
        {selectedTicket ? (
          <div className="lucid-card flex-1 space-y-8 animate-in slide-in-from-right-4 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-2xl font-normal text-[var(--admin-text)] uppercase tracking-widest">
                    Intake #{selectedTicket.id}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[3px]">
                  State: <span className={selectedTicket.status === "received" ? "text-emerald-500" : "text-amber-500"}>{selectedTicket.status}</span>
                </p>
              </div>
              <div className="px-6 py-2 bg-slate-50 border border-slate-200 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Triage Score</p>
                <p className="text-2xl font-normal text-[var(--admin-blue)]">{selectedTicket.urgency}.0</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
              {/* Intelligence Section */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <h4 className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full" /> Raw Fragmented Uplink</h4>
                  <div className="p-4 bg-slate-50 text-slate-500 italic text-sm font-mono border border-slate-100 rounded-sm leading-relaxed">
                    "{selectedTicket.original}"
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-emerald-400 rounded-full" /> AI Decoded Signal</h4>
                  <div className="p-4 bg-blue-50/30 text-[var(--admin-text)] text-lg border border-blue-100/50 rounded-sm uppercase tracking-tight leading-snug">
                    {selectedTicket.reconstructed}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-amber-400 rounded-full" /> Reported Field Location</h4>
                  <div className="p-4 bg-amber-50/20 text-slate-700 italic text-sm border border-amber-100/50 rounded-sm">
                    {selectedTicket.manualLocation || "No manual location provided"}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="stat-label flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> Geospatial Coordinate</h4>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-sm border border-slate-100">
                    <MapIcon className="text-[var(--admin-blue)]" size={32} />
                    <div>
                      <p className="text-xs font-bold text-[var(--admin-text)]">LAT: {selectedTicket.location.lat.toFixed(6)}</p>
                      <p className="text-xs font-bold text-[var(--admin-text)]">LNG: {selectedTicket.location.lng.toFixed(6)}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">
                        {selectedTicket.source === "ESP32 Device" ? "Hardware Gateway Link" : "Client PC Localization"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ops Section */}
              <div className="space-y-8 flex flex-col">
                <div className="space-y-3">
                  <h4 className="stat-label text-[var(--admin-blue)]">Mission Dispatch Actions</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => handleAction(selectedTicket.id, "location")}
                      className="sleek-btn justify-center"
                    >
                      <MapPin size={14} /> Request Location Refresh
                    </button>
                    <button 
                      onClick={() => handleAction(selectedTicket.id, "marker")}
                      className={`sleek-btn justify-center gap-3 ${selectedTicket.status === "received" ? "opacity-40 border-slate-200" : "border-emerald-500 text-emerald-600 bg-emerald-50"}`}
                    >
                      <CheckCircle size={14} /> Send "Target Received" Signal
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 flex flex-col">
                  <h4 className="stat-label">Comms History</h4>
                  <div className="flex-1 min-h-[150px] overflow-y-auto bg-slate-50/50 border border-slate-100 rounded-sm p-4 space-y-3">
                    {selectedTicket.adminNotes.length > 0 ? selectedTicket.adminNotes.map((note, i) => (
                      <div key={i} className="animate-in slide-in-from-left-2 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8px] font-black text-[var(--admin-blue)] uppercase tracking-widest">Outgoing Command</span>
                          <span className="text-[8px] text-slate-400 uppercase">{new Date(note.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-[var(--admin-subtext)] leading-relaxed">{note.text}</p>
                      </div>
                    )) : (
                      <div className="h-full flex items-center justify-center opacity-20">
                         <p className="text-[10px] font-bold uppercase tracking-widest italic">No outgoing transmissions</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Bar */}
            <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
              <h4 className="stat-label">Tactical Uplink (Direct)</h4>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={outboundMsg}
                  onChange={(e) => setOutboundMsg(e.target.value)}
                  placeholder="Type secure instruction to casualty..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-sm p-4 text-xs font-serif text-[var(--admin-text)] focus:border-[var(--admin-blue)] outline-none" 
                  onKeyPress={(e) => e.key === 'Enter' && outboundMsg.trim() && handleAction(selectedTicket.id, "message")}
                />
                <button 
                  onClick={() => handleAction(selectedTicket.id, "message")}
                  className="sleek-btn px-10 bg-[var(--admin-blue)] text-white"
                  disabled={!outboundMsg.trim() || isUpdating}
                >
                  {isUpdating ? <RefreshCcw size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center lucid-card border-dashed opacity-20 bg-slate-50">
            <Inbox size={64} className="mb-6 text-slate-400" />
            <p className="stat-label text-slate-500">Select a signal for priority override</p>
          </div>
        )}
      </div>
    </div>
  );
}
