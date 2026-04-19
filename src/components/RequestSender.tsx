"use client";

import React, { useState } from "react";
import { Send, MapPin, Radio, CheckCircle } from "lucide-react";

export default function RequestSender() {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/reconstruct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, location }),
      });
      if (res.ok) {
        setSent(true);
        setText("");
        setTimeout(() => setSent(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-normal text-[var(--emerald-accent)] uppercase tracking-widest">
          Emergency Signal Uplink
        </h2>
        <p className="text-xs text-[var(--slate-text)] uppercase font-bold tracking-tighter">
          Secure LoRa Transmission Protocol • DT-114
        </p>
      </div>

      <div className="lucid-card space-y-6">
        <div className="space-y-2">
          <label className="stat-label">Raw Fragmented Input</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. h...lp f...ire a...t sc...hool"
            className="w-full h-32 bg-black/20 border border-[var(--card-border)] rounded p-4 text-[var(--foreground)] focus:border-[var(--emerald-accent)] outline-none transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={fetchLocation}
            className="flex items-center gap-2 text-[var(--emerald-accent)] text-xs font-bold uppercase hover:opacity-70 transition-opacity"
          >
            <MapPin size={16} />
            {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Tag Coordinates"}
          </button>

          <button
            onClick={handleSend}
            disabled={isSending || !text}
            className="sleek-btn"
          >
            {isSending ? (
              <Radio className="animate-pulse" size={16} />
            ) : (
              <Send size={16} />
            )}
            {isSending ? "Transmitting..." : "Send Signal"}
          </button>
        </div>

        {sent && (
          <div className="flex items-center gap-2 text-[var(--emerald-accent)] bg-[var(--emerald-accent)]/5 p-4 border border-[var(--emerald-accent)]/20 rounded animate-in slide-in-from-top-2">
            <CheckCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Signal Locked and Transmitted to Command</span>
          </div>
        )}
      </div>

      <div className="p-4 border-l-2 border-[var(--emerald-accent)]/20 bg-white/5 space-y-1">
        <p className="text-[12px] text-[var(--slate-text)] uppercase font-black">Operator Notice</p>
        <p className="text-[12px] text-[var(--slate-text)] opacity-80 italic">
          Signals are automatically decrypted via the Gemini Resilience Engine before dispatching forces.
        </p>
      </div>
    </div>
  );
}
