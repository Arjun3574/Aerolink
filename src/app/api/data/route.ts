import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getTickets, saveTickets } from "@/lib/db";
import { reconstructSignal } from "@/lib/intelligence";

const EXTERNAL_FILE = path.join(process.cwd(), "src/data/external.json");

function getExternalData() {
  if (fs.existsSync(EXTERNAL_FILE)) {
    return JSON.parse(fs.readFileSync(EXTERNAL_FILE, "utf-8"));
  }
  return { message: "READY", state: "IDLE", timestamp: new Date().toISOString() };
}

function saveExternalData(data: any) {
  fs.writeFileSync(EXTERNAL_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(getExternalData());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessage = body.message || "";
    const victimName = body.victimName || "Unknown";
    const manualLocation = body.manualLocation || "Unknown Location";
    const origId = body.origId || "";
    const lat = body.lat || 0;
    const lng = body.lng || 0;

    if (!rawMessage) return NextResponse.json({ error: "Empty signal" }, { status: 400 });

    const tickets = getTickets();
    const now = new Date();
    
    // Deduplication (same message from same user in 15s)
    const isDuplicate = tickets.some(t => 
      t.original === rawMessage && 
      t.victimName === victimName &&
      (now.getTime() - new Date(t.timestamp).getTime()) < 3000
    );

    if (isDuplicate) {
      return NextResponse.json({ success: true, status: "duplicate suppressed" });
    }

    saveExternalData({ 
      message: rawMessage, 
      state: "AWAITING_REVIEW", 
      timestamp: now.toISOString(), 
      victimName,
      manualLocation,
      origId,
      isNew: true
    });

    return NextResponse.json({ success: true, status: "Signal Buffered for Admin Review" });
  } catch (error: any) {
    saveExternalData({ message: "ERROR", state: "FAIL", timestamp: new Date().toISOString() });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH() {
  saveExternalData({ message: "SCANNING...", state: "IDLE", timestamp: new Date().toISOString() });
  return NextResponse.json({ success: true });
}
