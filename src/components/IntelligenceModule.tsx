"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Activity, CheckCircle2, MapPin, Gauge } from "lucide-react";

interface ReconstructedMessage {
  id: string;
  original: string;
  reconstructed: string;
  urgency: number;
  category: string;
  entities: string[];
  confidence: number;
  timestamp: Date;
}

export default function IntelligenceModule() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ReconstructedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReconstruct = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch("/api/reconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        const newMessage: ReconstructedMessage = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };
        setMessages([newMessage, ...messages]);
        setInputText("");
      }
    } catch (err) {
      setError("Failed to connect to the intelligence server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
      {/* Input Analysis */}
      <div className="xl:col-span-4 space-y-4">
        <div className="lucid-card space-y-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="text-[var(--admin-navy)]" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-[2px]">Signal Decoder</h2>
          </div>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Input raw fragmented signal data..."
            className="w-full flex-1 bg-slate-50 border border-slate-100 rounded-sm p-4 text-[10px] focus:outline-none focus:border-[var(--admin-navy)]/30 transition-all font-sans"
          />
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-sm text-[10px] font-bold uppercase tracking-wider">
              {error}
            </div>
          )}
          
          <button
            onClick={handleReconstruct}
            disabled={isProcessing}
            className="sleek-btn w-full justify-center bg-[var(--admin-navy)] text-white hover:bg-[var(--admin-navy-dark)]"
          >
            {isProcessing ? "DECRYPTING..." : "ANALYZE FRAGMENT"}
          </button>

          <div className="flex flex-wrap gap-2 pt-2">
            {["H..lp flo..d", "Med...cal blee..ding", "W..ter r..sing"].map((preset) => (
              <button
                key={preset}
                onClick={() => setInputText(preset)}
                className="text-[9px] px-3 py-1 bg-slate-50 border border-slate-100 rounded-sm hover:border-[var(--admin-navy)] transition-colors text-slate-500 uppercase font-bold"
              >
                Sample
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligence Feed */}
      <div className="xl:col-span-8 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-[4px] text-slate-400">Threat Intelligence</h2>
          <span className="text-[8px] px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-sm text-emerald-600 font-bold uppercase tracking-widest">
            Stream Active
          </span>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="lucid-card py-24 text-center text-slate-300 uppercase text-[9px] font-bold tracking-[3px] border-dashed">
                Awaiting mission telemetry...
              </div>
            ) : (
              messages
              .sort((a, b) => b.urgency - a.urgency)
              .map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`lucid-card border-l-2 ${
                    msg.urgency >= 8 ? "border-l-red-500" : 
                    msg.urgency >= 5 ? "border-l-amber-500" : "border-l-emerald-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-sm tracking-widest text-[var(--admin-navy)]">
                        {msg.category}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Gauge size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-600">{msg.urgency}/10</span>
                    </div>
                  </div>
                  
                  <p className="font-bold text-slate-900 text-sm leading-snug mb-3">
                    {msg.reconstructed}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 border-t border-slate-50 pt-3">
                    {msg.entities.map((e, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                        <MapPin size={9} className="text-slate-300" /> {e}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
