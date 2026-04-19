"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Radio, Activity, MapPin, Gauge } from "lucide-react";

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

export default function Dashboard() {
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
      setError("Failed to connect to the server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return "text-[#ff3d71] borderColor-[#ff3d71]";
    if (score >= 5) return "text-[#ffaa00] borderColor-[#ffaa00]";
    return "text-[#00e096] borderColor-[#00e096]";
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            DISAST-<span className="gradient-text">ED</span>
          </h1>
          <p className="text-gray-400 mt-1">Emergency Data Reconstruction System</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium">BAMP-1 Active</span>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">System Nominal</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input & Simulation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="text-cyan-400" />
              <h2 className="text-xl font-semibold">Incoming Signal</h2>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter garbled LoRa text (e.g. H..lp f..od r..sing)"
              className="w-full h-40 bg-black/30 border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}
            
            <button
              onClick={handleReconstruct}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isProcessing 
                ? "bg-gray-700 cursor-not-allowed" 
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_0_20px_rgba(0,123,255,0.4)] active:scale-95"
              }`}
            >
              {isProcessing ? "DECODING..." : "RECONSTRUCT SIGNAL"}
            </button>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Simulation Presets</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "H..lp.. flo..d 2nd f..r",
                  "Med...cal ne..d blee..ding",
                  "W..ter r..sing 45 Ma..n St"
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setInputText(preset)}
                    className="text-[12px] px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                  >
                    Simulate Signal
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Processed Alerts Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="text-green-400" />
              Priority Action Queue
            </h2>
            <span className="text-xs text-gray-500">{messages.length} signals tracked</span>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-12 text-center text-gray-500 italic"
                >
                  Waiting for signals from Base Camp...
                </motion.div>
              ) : (
                messages
                .sort((a, b) => b.urgency - a.urgency)
                .map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className={`glass-panel glass-card p-6 border-l-4 ${
                      msg.urgency >= 8 ? "border-l-[#ff3d71] critical-pulse" : 
                      msg.urgency >= 5 ? "border-l-[#ffaa00]" : "border-l-[#00e096]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[12px] font-bold uppercase tracking-tighter ${
                          msg.urgency >= 8 ? "bg-red-500/20 text-red-500" : 
                          msg.urgency >= 5 ? "bg-amber-500/20 text-amber-500" : "bg-green-500/20 text-green-500"
                        }`}>
                          {msg.category}
                        </span>
                        <span className="text-[12px] text-gray-500 font-mono">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        <Gauge className="w-3 h-3 text-cyan-400" />
                        <span className="text-sm">Priority {msg.urgency}/10</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium text-white mb-2 leading-snug">
                      {msg.reconstructed}
                    </h3>
                    
                    <p className="text-xs text-gray-400 italic mb-4">
                      Original Signal: "{msg.original}"
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                      {msg.entities.map((entity, i) => (
                        <div key={i} className="flex items-center gap-1 text-[12px] bg-white/5 px-2 py-1 rounded">
                          <MapPin className="w-2 h-2 text-cyan-400" />
                          {entity}
                        </div>
                      ))}
                      <div className="ml-auto text-[12px] text-gray-600">
                        AI Confidence: {(msg.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
