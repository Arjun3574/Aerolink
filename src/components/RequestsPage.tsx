"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Clock, MessageSquare, CheckCircle, Send, AlertTriangle, RefreshCcw, Radio, Inbox, Crosshair, Circle } from "lucide-react";
import SituationalMap from "./SituationalMap";

interface TicketNote { text: string; timestamp: string; sender: "admin" | "system"; }
interface Ticket {
  id: string; original: string; reconstructed: string; urgency: number; category: string;
  location: { lat: number; lng: number }; timestamp: string; status: string;
  markerColor: "green" | "yellow" | "red" | "none";
  adminNotes: TicketNote[]; source?: string; victimName?: string; manualLocation?: string;
}

const MARKER_LABELS: Record<string, { label: string; color: string; css: string }> = {
  green: { label: "Forces on the way", color: "#47E5BC", css: "bg-[#47E5BC]" },
  yellow: { label: "Message read", color: "#E5C247", css: "bg-[#E5C247]" },
  red: { label: "Not read", color: "#E5475A", css: "bg-[#E5475A]" },
  none: { label: "No status", color: "#5C5F6E", css: "bg-[#5C5F6E]" },
};

export default function RequestsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [outboundMsg, setOutboundMsg] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingSignal, setPendingSignal] = useState<any>(null);
  const [baseCoord, setBaseCoord] = useState<{lat: number, lng: number} | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation && !baseCoord) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setBaseCoord({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Location permission denied"),
        { enableHighAccuracy: true }
      );
    }
  }, [baseCoord]);

  const fetchPendingSignal = async () => { try { const r = await fetch("/api/data"); const d = await r.json(); setPendingSignal(d.state === "AWAITING_REVIEW" ? d : null); } catch {} };
  const handleApproveSignal = async () => { setIsUpdating(true); try { const r = await fetch("/api/data/approve", { method: "POST" }); if (r.ok) { setPendingSignal(null); fetchTickets(); } } catch {} setIsUpdating(false); };

  const fetchTickets = async () => {
    try {
      const r = await fetch("/api/reconstruct");
      const d = await r.json();
      const s = d.sort((a: Ticket, b: Ticket) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTickets(s);
      if (selectedTicket) {
        const u = s.find((t: Ticket) => t.id === selectedTicket.id);
        if (u) setSelectedTicket(u);
      }
    } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTickets(); fetchPendingSignal(); const a = setInterval(fetchTickets, 3000); const b = setInterval(fetchPendingSignal, 1500); return () => { clearInterval(a); clearInterval(b); }; }, [selectedTicket?.id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [selectedTicket?.adminNotes?.length]);

  const sendMessage = async () => {
    if (!outboundMsg.trim() || !selectedTicket) return;
    setIsUpdating(true);
    try {
      await fetch("/api/reconstruct", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedTicket.id, note: outboundMsg, sender: "admin" }) });
      setOutboundMsg("");
      fetchTickets();
    } catch {} finally { setIsUpdating(false); }
  };

  const sendMarker = async (color: "green" | "yellow" | "red") => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    const label = MARKER_LABELS[color].label;
    try {
      await fetch("/api/reconstruct", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedTicket.id, markerColor: color, note: `[MARKER] ${label}`, sender: "system" }) });
      fetchTickets();
    } catch {} finally { setIsUpdating(false); }
  };

  const markComplete = async () => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    try {
      await fetch("/api/reconstruct", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedTicket.id, status: "completed" }) });
      fetchTickets();
    } catch {} finally { setIsUpdating(false); }
  };

  const uc = (u: number) => u > 8 ? "var(--danger)" : u > 5 ? "var(--warning)" : "var(--mint)";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full pb-8">
      {/* LEFT: Feed */}
      <div className="xl:col-span-4 flex flex-col space-y-4">
        {/* Pending Signal */}
        {pendingSignal && (
          <div className="lucid-card space-y-3 border-[var(--mint)]">
            <div className="flex items-center gap-2">
              <Radio size={13} className="text-[var(--mint)]" />
              <span className="text-[13px] font-bold text-[var(--mint)] uppercase tracking-wider">Signal Intercepted</span>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[var(--text-3)]">Unit</span>
                <span className="font-semibold text-[var(--teal)]">{pendingSignal.victimName?.toUpperCase()}</span>
              </div>
              <p className="text-[14px] text-[var(--frost)] leading-relaxed border-t border-[var(--border)] pt-2">&ldquo;{pendingSignal.message}&rdquo;</p>
            </div>
            <button onClick={handleApproveSignal} disabled={isUpdating} className="sleek-btn sleek-btn-primary w-full">Authorize <CheckCircle size={12} className="ml-1" /></button>
          </div>
        )}

        {/* Feed Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox size={14} className="text-[var(--teal)]" />
            <span className="text-[15px] font-bold text-[var(--text)]">Intake</span>
          </div>
          <span className="text-[12px] text-[var(--text-3)]">{tickets.length} active</span>
        </div>

        {/* Ticket List */}
        <div className="space-y-2 overflow-y-auto max-h-[700px] pr-1 custom-scrollbar">
          {tickets.map((t) => {
            const marker = MARKER_LABELS[t.markerColor || "none"];
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`lucid-card cursor-pointer p-4 space-y-2 ${selectedTicket?.id === t.id ? "border-[var(--mint)]" : ""}`}
                style={{ borderLeftWidth: '3px', borderLeftColor: selectedTicket?.id === t.id ? 'var(--mint)' : marker.color }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: uc(t.urgency) }}>{t.category}</span>
                    <p className="text-[14px] font-semibold text-[var(--text)] mt-0.5">{t.victimName || `Unit ${t.id}`}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Marker dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ${marker.css}`} title={marker.label} />
                    <span className="text-[11px] text-[var(--text-3)]">{new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {t.manualLocation && t.manualLocation !== "Unknown Location" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-3)]"><MapPin size={9} /> {t.manualLocation}</div>
                )}
                <p className="text-[13px] text-[var(--text-2)] line-clamp-2 leading-relaxed">{t.reconstructed}</p>
                <div className="flex items-center gap-3 pt-1.5 border-t border-[var(--border)] text-[11px] text-[var(--text-3)]">
                  <span className="font-semibold" style={{ color: uc(t.urgency) }}>L{t.urgency}</span>
                  <span className="flex items-center gap-1">{t.status === "received" ? <CheckCircle size={9} className="text-[var(--mint)]" /> : <Clock size={9} />} {t.status}</span>
                  {t.adminNotes.length > 0 && <MessageSquare size={9} className="text-[var(--plum)] ml-auto" />}
                </div>
              </div>
            );
          })}
          {!isLoading && tickets.length === 0 && (
            <div className="bento-card border-dashed py-20 text-center">
              <p className="text-[13px] text-[var(--text-3)]">No casualties reported</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detail */}
      <div className="xl:col-span-8 flex flex-col h-full">
        {selectedTicket ? (
          <div className="bento-card flex-1 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start pb-5 mb-5 border-b border-[var(--border)]">
              <div>
                <p className="text-[12px] text-[var(--text-3)] mb-0.5">Signal #{selectedTicket.id}</p>
                <h3 className="text-lg font-bold text-[var(--text)]">{selectedTicket.victimName || "Unknown"}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`bc-badge border border-[var(--border)] ${selectedTicket.status === "received" ? "text-[var(--mint)] bg-[var(--surface-2)]" : "text-[var(--warning)] bg-[var(--surface-2)]"}`}>{selectedTicket.status}</span>
                  <span className="text-[11px] text-[var(--text-3)]">{new Date(selectedTicket.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Current marker display */}
                <div className="text-center px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <p className="text-[9px] text-[var(--text-3)] uppercase tracking-wider mb-1">Marker</p>
                  <div className="flex items-center gap-1.5 justify-center">
                    <div className={`w-3 h-3 rounded-full ${MARKER_LABELS[selectedTicket.markerColor || "none"].css}`} />
                    <span className="text-[12px] font-semibold" style={{ color: MARKER_LABELS[selectedTicket.markerColor || "none"].color }}>{MARKER_LABELS[selectedTicket.markerColor || "none"].label}</span>
                  </div>
                </div>
                <div className="text-center px-4 py-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <p className="text-[9px] text-[var(--text-3)] uppercase tracking-wider mb-1">Triage</p>
                  <p className="text-xl font-light" style={{ color: uc(selectedTicket.urgency) }}>{selectedTicket.urgency}</p>
                </div>
                
                {/* Complete Button */}
                {selectedTicket.status !== "completed" ? (
                  <button onClick={markComplete} disabled={isUpdating} className="h-full flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] hover:border-[var(--mint)] text-[var(--text-3)] hover:text-[var(--mint)] transition-colors" title="Mark Rescue Complete">
                    <CheckCircle size={15} className="mb-1" />
                    <span className="text-[9px] uppercase tracking-wider font-bold">Close</span>
                  </button>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center px-4 py-2 rounded-lg border border-[var(--mint)] bg-[var(--surface-2)] text-[var(--mint)]" title="Rescue Completed">
                    <CheckCircle size={15} className="mb-1" />
                    <span className="text-[9px] uppercase tracking-wider font-bold">Closed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {/* Left: Signal Data */}
              <div className="space-y-4">
                {/* Broken/Raw Signal */}
                <div>
                  <p className="stat-label mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" /> Broken Signal (Raw)
                  </p>
                  <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-[14px] text-[var(--danger)] leading-relaxed">
                    &ldquo;{selectedTicket.original}&rdquo;
                  </div>
                </div>
                {/* AI Decoded */}
                <div>
                  <p className="stat-label mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)]" /> AI Decoded
                  </p>
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[16px] text-[var(--text)] font-medium leading-snug">{selectedTicket.reconstructed}</div>
                </div>
                {/* Location */}
                <div>
                  <p className="stat-label mb-2">Location Tracker</p>
                  <div className="h-[200px] mb-3">
                    <SituationalMap tickets={[selectedTicket]} baseCoord={baseCoord} height={200} />
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] shrink-0 shadow-sm">
                      <Crosshair size={15} className="text-[var(--text-2)]" />
                    </div>
                    <div>
                      {selectedTicket.manualLocation && selectedTicket.manualLocation.includes(",") ? (
                        <p className="text-[14px] font-bold text-[var(--text)] font-mono">{selectedTicket.manualLocation}</p>
                      ) : (
                        <>
                          <p className="text-[14px] font-bold text-[var(--text)] font-mono">{selectedTicket.location.lat.toFixed(6)}, {selectedTicket.location.lng.toFixed(6)}</p>
                          <p className="text-[11px] text-[var(--text-3)] mt-0.5 uppercase tracking-wider">{selectedTicket.manualLocation || "No manual location"}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Marker Buttons */}
                <div className="pt-2 border-t border-[var(--border)] mt-4">
                  <p className="stat-label text-[var(--teal)] mb-3 flex items-center gap-1.5"><Radio size={12}/> Dispatch Status Marker</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["green", "yellow", "red"] as const).map((c) => {
                      const m = MARKER_LABELS[c];
                      const isActive = selectedTicket.markerColor === c;
                      return (
                        <button
                          key={c}
                          onClick={() => sendMarker(c)}
                          disabled={isUpdating}
                          className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                            isActive
                              ? `border-[${m.color}] bg-[var(--surface-2)] shadow-sm`
                              : "border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] hover:border-[var(--text-3)]"
                          }`}
                          style={{ borderColor: isActive ? m.color : undefined }}
                        >
                          <Circle size={11} fill={m.color} stroke="none" className={isActive ? "animate-pulse" : ""} />
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isActive ? m.color : "var(--text-3)" }}>
                            {c === "green" ? "Forces En Route" : m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Chat */}
              <div className="flex flex-col">
                <p className="stat-label mb-2">Communications</p>

                {/* Chat Messages */}
                <div className="flex-1 min-h-[220px] max-h-[420px] overflow-y-auto rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4 space-y-3 custom-scrollbar shadow-inner mt-1">
                  {selectedTicket.adminNotes.length > 0 ? selectedTicket.adminNotes.map((n, i) => {
                    const isSystem = n.sender === "system";
                    const isMarker = n.text.startsWith("[MARKER]");
                    return (
                      <div key={i} className={`flex flex-col ${isSystem ? "items-center my-3" : "items-end"}`}>
                        {isMarker ? (
                          <div className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text-3)] text-center uppercase tracking-wider shadow-sm">
                            {n.text.replace("[MARKER] ", "")} · {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="max-w-[75%]">
                            <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[var(--mint)] text-[var(--bg)] shadow-sm">
                              <p className="text-[14px] font-medium leading-relaxed">{n.text}</p>
                            </div>
                            <p className="text-[10px] text-[var(--text-3)] mt-1 text-right font-medium">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        )}
                      </div>
                    );
                  }) : <p className="text-[12px] text-[var(--text-3)] font-medium text-center py-10 opacity-70">Awaiting transmission. Send a message or status marker.</p>}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="pt-5 mt-5 border-t border-[var(--border)] pb-2">
              <div className="flex gap-3 bg-[var(--surface-2)] p-1.5 rounded-2xl border border-[var(--border)] focus-within:border-[var(--mint)] transition-colors shadow-sm">
                <input type="text" value={outboundMsg} onChange={(e) => setOutboundMsg(e.target.value)} placeholder="Transmit a message to the victim..." className="bg-transparent flex-1 py-1.5 px-3 text-[14px] font-medium outline-none text-[var(--text)] placeholder:text-[var(--text-3)]" onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} disabled={!outboundMsg.trim() || isUpdating} className="w-10 h-10 rounded-xl bg-[var(--mint)] text-[var(--bg)] flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity shadow-sm">
                  <Send size={15} className="-ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bento-card border-dashed">
            <Inbox size={32} className="text-[var(--text-3)] mb-3 opacity-30" />
            <p className="text-[14px] text-[var(--text-3)]">Select a signal from the feed</p>
          </div>
        )}
      </div>
    </div>
  );
}
