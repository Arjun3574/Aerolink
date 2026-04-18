"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Shield, 
  MessageSquare, 
  MapPin, 
  History, 
  ArrowLeft,
  Clock,
  ChevronRight,
  AlertCircle,
  Wifi,
  Activity,
  Cpu,
  RefreshCcw,
  Zap,
  CheckCircle2
} from "lucide-react";

export default function VictimPage() {
  const [view, setView] = useState<"monitor" | "history" | "detail">("monitor");
  const [history, setHistory] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [externalSignal, setExternalSignal] = useState({ message: "LISTENING...", state: "IDLE", timestamp: "" });
  const [signalLog, setSignalLog] = useState<{msg: string, time: string, status: string}[]>([]);

  // Monitor Polling (ESP32 Integration)
  useEffect(() => {
    const pollMonitor = async () => {
      try {
        const res = await fetch("/api/data");
        const data = await res.json();
        
        if (data.timestamp !== externalSignal.timestamp) {
           setExternalSignal(data);
           // Append to log if it's a real signal action
           if (data.state !== "IDLE") {
             setSignalLog(prev => [{
               msg: data.message, 
               time: new Date(data.timestamp).toLocaleTimeString(),
               status: data.state
             }, ...prev].slice(0, 5));
           }
        }
      } catch (err) {
        console.error("Monitor Sync Error");
      }
    };

    const interval = setInterval(pollMonitor, 1000); 
    return () => clearInterval(interval);
  }, [externalSignal]);

  // Load mission history
  const fetchHistory = async () => {
    const savedIds = localStorage.getItem("myDistressTickets");
    if (!savedIds) return;
    try {
      const res = await fetch(`/api/reconstruct?ids=${savedIds}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        if (selectedTicket) {
          const updated = data.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-serif text-[#0f172a]">
      {/* Tactical Nav */}
      <nav className="bg-[#1e293b] text-white px-8 py-4 flex justify-between items-center shadow-xl sticky top-0 z-50 border-b border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Cpu className="text-white" size={20} />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-[5px] block">Field Intake Node</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ESP32 Loop Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          <button 
            onClick={() => setView("monitor")}
            className={`text-[10px] font-black uppercase tracking-[3px] py-1 border-b-2 transition-all ${view === "monitor" ? "text-blue-400 border-blue-400" : "text-slate-500 border-transparent hover:text-slate-300"}`}
          >
            Live Monitor
          </button>
          <button 
            onClick={() => setView("history")}
            className={`text-[10px] font-black uppercase tracking-[3px] py-1 border-b-2 transition-all flex items-center gap-2 ${view === "history" || view === "detail" ? "text-blue-400 border-blue-400" : "text-slate-500 border-transparent hover:text-slate-300"}`}
          >
            <History size={12} /> Mission History
          </button>
        </div>
      </nav>

      <main className="flex-1 p-8 bg-[#f1f5f9]">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          {/* VIEW: LIVE MONITOR */}
          {view === "monitor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* State Panel */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white border border-slate-200 p-10 rounded-sm shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3">
                      <Wifi size={16} className={externalSignal.state !== "IDLE" ? "text-blue-600 animate-pulse" : "text-slate-100"} />
                   </div>
                   
                   <div className="space-y-12">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Current System State</p>
                        <h2 className="text-5xl font-normal text-[#1e293b] uppercase tracking-tighter">
                          {externalSignal.state === "IDLE" ? "LISTENING..." : 
                           externalSignal.state === "PROCESSING" ? "DECODING..." : 
                           externalSignal.state === "DISPATCHED" ? "SIGNAL UPLINKED" : externalSignal.state}
                        </h2>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-8 rounded-sm space-y-4">
                         <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Payload</span>
                            <span className="text-[9px] font-bold text-blue-600">ID: RF-IOT-{externalSignal.timestamp.slice(-4)}</span>
                         </div>
                         <p className="text-3xl font-serif text-slate-800 leading-tight">
                            "{externalSignal.message}"
                         </p>
                         <div className="flex items-center gap-2 pt-2">
                            <Clock size={12} className="text-slate-300" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                               Captured at: {externalSignal.timestamp ? new Date(externalSignal.timestamp).toLocaleTimeString() : "--:--:--"}
                            </span>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-white border border-slate-100 rounded shadow-sm text-center">
                           <Activity size={16} className="mx-auto mb-2 text-blue-500" />
                           <p className="text-[8px] font-black text-slate-400 uppercase">Input Node</p>
                           <p className="text-xs font-bold">ESP32-CORE</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded shadow-sm text-center">
                           <Zap size={16} className="mx-auto mb-2 text-amber-500" />
                           <p className="text-[8px] font-black text-slate-400 uppercase">Triage Mode</p>
                           <p className="text-xs font-bold">AUTO-INTEL</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded shadow-sm text-center">
                           <CheckCircle2 size={16} className="mx-auto mb-2 text-emerald-500" />
                           <p className="text-[8px] font-black text-slate-400 uppercase">Ticket Status</p>
                           <p className="text-xs font-bold">{externalSignal.state === "DISPATCHED" ? "VERIFIED" : "WAITING"}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Signal Waterfall Log */}
              <div className="lg:col-span-4 space-y-6">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px] mt-2">Signal Waterfall</h3>
                 <div className="space-y-4">
                    {signalLog.map((log, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm animate-in slide-in-from-right-4 transition-all border-l-4 border-l-blue-500">
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{log.status}</span>
                            <span className="text-[8px] text-slate-300 font-bold">{log.time}</span>
                         </div>
                         <p className="text-xs font-serif text-slate-600 italic">"{log.msg.slice(0, 40)}{log.msg.length > 40 ? "..." : ""}"</p>
                      </div>
                    ))}
                    {signalLog.length === 0 && (
                      <div className="py-20 text-center opacity-10">
                         <Radio size={32} className="mx-auto mb-4 animate-ping" />
                         <p className="text-[8px] font-black uppercase tracking-widest">Scanning Frequencies...</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* VIEW: LOG LIST (Same as before but filtered for ESP32 or all) */}
          {view === "history" && (
            <div className="space-y-6 bg-white p-10 border border-slate-200 shadow-xl">
               <h2 className="text-2xl text-[#1e293b] font-normal uppercase tracking-widest border-b border-slate-200 pb-4">Incident Log • Registered Items</h2>
               <div className="space-y-3 pt-6">
                 {history.length > 0 ? history.map((t) => (
                   <div 
                    key={t.id}
                    onClick={() => { setSelectedTicket(t); setView("detail"); }}
                    className="group border-b border-slate-100 py-6 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all px-4"
                   >
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[2px]">{t.category}</span>
                           <span className="text-[8px] text-slate-300 font-bold uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-full">
                              {t.source || "External Module"}
                           </span>
                        </div>
                        <h4 className="text-xl font-normal text-slate-800 uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                           {t.reconstructed}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                           Signal Integrity: High • Latency: 42ms • {new Date(t.timestamp).toLocaleTimeString()}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className={`text-[10px] font-black uppercase px-3 py-1 rounded-sm border ${
                          t.status === "received" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}>
                          {t.status}
                        </p>
                     </div>
                   </div>
                 )) : (
                   <div className="text-center py-20 opacity-20">
                     <AlertCircle size={48} className="mx-auto mb-4" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Mission Index Empty</p>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* DETAIL VIEW (Unchanged, for consistency) */}
          {view === "detail" && selectedTicket && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <button onClick={() => setView("history")} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600">
                <ArrowLeft size={12} /> Return to Mission Index
              </button>
              <div className="bg-white border border-slate-300 p-10 shadow-2xl space-y-10">
                 <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Strategic Asset: {selectedTicket.id}</p>
                       <h3 className="text-3xl text-slate-900 font-normal uppercase tracking-tight">{selectedTicket.category}</h3>
                    </div>
                    <div className="text-center p-4 bg-slate-50 border border-slate-200">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                       <p className="text-sm font-bold text-blue-600 uppercase">{selectedTicket.status}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <p className="stat-label">Raw Telemetry</p>
                         <div className="p-4 bg-slate-50 border border-slate-200 font-mono text-xs text-slate-500 rounded italic">"{selectedTicket.original}"</div>
                      </div>
                      <div className="space-y-3">
                         <p className="stat-label">AI Intelligence</p>
                         <p className="text-2xl text-slate-800 leading-snug uppercase tracking-tighter">{selectedTicket.reconstructed}</p>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <p className="stat-label">Command Log</p>
                         <div className="space-y-4 max-h-[200px] overflow-y-auto pr-4">
                           {selectedTicket.adminNotes.length > 0 ? selectedTicket.adminNotes.map((n: any, i: number) => (
                             <div key={i} className="flex gap-4 items-start border-l-2 border-blue-100 pl-4 py-1">
                                <Shield size={12} className="text-blue-600 mt-1" />
                                <div>
                                   <p className="text-sm text-slate-700 leading-relaxed font-serif uppercase tracking-tight">{n.text}</p>
                                   <p className="text-[8px] text-slate-400 uppercase font-black">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                </div>
                             </div>
                           )) : <p className="text-[10px] text-slate-300 italic">No command feedback issued.</p>}
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="mt-auto p-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[8px] opacity-20 border-t border-slate-200">
         Disas-ED Autonomous Response Node • Security Clearance ALPHA-9
      </footer>
    </div>
  );
}
