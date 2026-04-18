"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Shield, 
  Clock,
  Wifi,
  Activity,
  Cpu,
  RefreshCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Send
} from "lucide-react";

export default function MonitorPage() {
  const [externalSignal, setExternalSignal] = useState({ message: "LISTENING...", state: "IDLE", timestamp: "", victimName: "" });
  const [signalLog, setSignalLog] = useState<{msg: string, time: string, status: string, name: string}[]>([]);

  useEffect(() => {
    const pollMonitor = async () => {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.timestamp !== externalSignal.timestamp) {
           setExternalSignal(data);
           if (data.state !== "IDLE") {
             setSignalLog(prev => [{
               msg: data.message, 
               time: new Date(data.timestamp).toLocaleTimeString(),
               status: data.state,
               name: data.victimName || "Unknown"
             }, ...prev].slice(0, 10));
           }
        }
      } catch (err) {
        console.error("Monitor Sync Error");
      }
    };

    const interval = setInterval(pollMonitor, 1000); 
    return () => clearInterval(interval);
  }, [externalSignal.timestamp]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-serif selection:bg-blue-500/30">
      {/* HUD Header */}
      <nav className="border-b border-slate-800 bg-[#020617] px-8 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-md">
             <Cpu className="text-blue-500" size={20} />
          </div>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[6px] text-white">Operational Intelligence Node</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" /> Hardware Sync Active
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-6 items-center">
           <div className="text-right hidden sm:block">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Intake End-Point</p>
              <p className="text-[9px] font-bold text-slate-400 font-mono">/api/data</p>
           </div>
           <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Live</span>
           </div>
        </div>
      </nav>

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          
          {/* Main Monitor Display */}
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-lg relative shadow-2xl overflow-hidden min-h-[450px] flex flex-col justify-center">
                {/* HUD Elements */}
                <div className="absolute top-4 left-4 border-l border-t border-slate-700 w-4 h-4" />
                <div className="absolute top-4 right-4 border-r border-t border-slate-700 w-4 h-4" />
                <div className="absolute bottom-4 left-4 border-l border-b border-slate-700 w-4 h-4" />
                <div className="absolute bottom-4 right-4 border-r border-b border-slate-700 w-4 h-4" />

                <div className="space-y-10 relative z-10 text-center lg:text-left">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-500 justify-center lg:justify-start">
                         <Activity size={12} className="animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-[4px]">CodeRed Intake Status</span>
                      </div>
                      <h2 className="text-7xl font-normal text-white uppercase tracking-tighter leading-none">
                         {externalSignal.state === "IDLE" ? "LISTENING" : 
                          externalSignal.state === "PROCESSING" ? "DECODING" : 
                          externalSignal.state === "DISPATCHED" ? "UPLINK_DONE" : externalSignal.state}
                      </h2>
                   </div>

                   <div className="bg-slate-950/60 border border-slate-800/50 p-10 rounded-sm space-y-6 backdrop-blur-sm border-l-4 border-l-blue-500 shadow-2xl">
                      <div className="flex justify-between items-center border-b border-slate-800/50 pb-3">
                         <div className="flex items-center gap-2">
                           <Database size={12} className="text-slate-600" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                             {externalSignal.victimName ? `${externalSignal.victimName} • RAW PAYLOAD` : "AWAITING INTERRUPT"}
                           </span>
                         </div>
                         <span className="text-[8px] font-mono text-blue-500 bg-blue-500/5 px-2 py-0.5 border border-blue-500/20">
                            AES_SECURED
                         </span>
                      </div>
                      <p className="text-4xl font-normal text-slate-200 leading-tight tracking-tight italic font-serif">
                         "{externalSignal.message || "Awaiting hardware interrupt from Base Station..."}"
                      </p>
                      <div className="flex items-center justify-between pt-4">
                         <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-600" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                               {externalSignal.timestamp ? new Date(externalSignal.timestamp).toLocaleTimeString() : "--:--:--"}
                            </span>
                         </div>
                         <div className="flex items-center gap-1.5 text-emerald-500">
                             <Zap size={12} className="animate-bounce" />
                             <span className="text-[9px] font-black uppercase tracking-widest">AI VALIDATED</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="stat-node">
                         <Radio size={16} className="text-blue-500 mb-2" />
                         <p className="stat-tag">Source</p>
                         <p className="stat-val">ESP32-STN</p>
                      </div>
                      <div className="stat-node">
                         <Shield size={16} className="text-slate-500 mb-2" />
                         <p className="stat-tag">Security</p>
                         <p className="stat-val">ENCRYPTED</p>
                      </div>
                      <div className="stat-node">
                         <Zap size={16} className="text-amber-500 mb-2" />
                         <p className="stat-tag">Protocol</p>
                         <p className="stat-val">CodeRed_v2</p>
                      </div>
                      <div className="stat-node border-blue-500/50 bg-blue-500/5">
                         <CheckCircle2 size={16} className="text-blue-500 mb-2" />
                         <p className="stat-tag text-blue-400">Dispatch</p>
                         <p className="stat-val">AUTOMATED</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Signal Stream */}
          <div className="lg:col-span-4 space-y-6">
             <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Signal Waterfall</h3>
                <RefreshCcw size={10} className="text-slate-700 animate-spin-slow" />
             </div>
             <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {signalLog.map((log, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-sm animate-in slide-in-from-right-4 group hover:border-slate-600 transition-colors">
                     <div className="flex justify-between items-center mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                          log.status === "DISPATCHED" ? "text-emerald-500 bg-emerald-500/5" : "text-blue-500 bg-blue-500/5"
                        }`}>
                           {log.status}
                        </span>
                        <span className="text-[8px] text-slate-600 font-mono">{log.time}</span>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{log.name}</p>
                     <p className="text-xs text-slate-200 font-normal leading-relaxed italic border-l border-slate-700 pl-3">
                        "{log.msg.slice(0, 80)}{log.msg.length > 80 ? '...' : ''}"
                     </p>
                  </div>
                ))}
                {signalLog.length === 0 && (
                  <div className="py-40 text-center opacity-10">
                     <Radio size={40} className="mx-auto mb-4 animate-ping" />
                     <p className="text-[9px] font-black uppercase tracking-[6px]">Scanning Frequencies</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .stat-node {
          @apply bg-slate-950/40 border border-slate-800/50 p-4 rounded flex flex-col items-center justify-center text-center;
        }
        .stat-tag {
          @apply text-[7px] font-black uppercase text-slate-500 tracking-[1px] mb-0.5;
        }
        .stat-val {
          @apply text-[10px] font-bold text-slate-100 uppercase;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-800 rounded-full; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
