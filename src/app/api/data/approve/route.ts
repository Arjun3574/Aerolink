import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTickets, saveTickets } from "@/lib/db";
import { reconstructSignal } from "@/lib/intelligence";

const EXTERNAL_FILE = path.join(process.cwd(), "src/data/external.json");

export async function POST(req: Request) {
  try {
    if (!fs.existsSync(EXTERNAL_FILE)) {
      return NextResponse.json({ error: "No pending signals found" }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(EXTERNAL_FILE, "utf-8"));
    
    if (data.state !== "AWAITING_REVIEW") {
      return NextResponse.json({ error: "Signal already processed or not pending" }, { status: 400 });
    }

    // Trigger AI Reconstruction
    const analysis = await reconstructSignal(data.message, data.victimName, data.manualLocation);

    const ticket = {
      id: data.origId || Math.random().toString(36).substring(2, 9),
      original: data.message,
      reconstructed: analysis.reconstructed,
      urgency: analysis.urgency,
      category: analysis.category,
      location: { lat: 0, lng: 0 },
      manualLocation: data.manualLocation,
      victimName: data.victimName,
      timestamp: new Date().toISOString(),
      status: "pending",
      markerColor: "none" as const,
      adminNotes: [] as any[],
      source: "ESP32 Device"
    };

    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);

    // Reset buffer
    fs.writeFileSync(EXTERNAL_FILE, JSON.stringify({ 
      message: "READY", 
      state: "IDLE", 
      timestamp: new Date().toISOString() 
    }, null, 2));

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
