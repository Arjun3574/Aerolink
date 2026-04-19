import { NextResponse } from "next/server";
import { getTickets, saveTickets } from "@/lib/db";
import { reconstructSignal } from "@/lib/intelligence";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, location, source } = body;
    
    // Use shared intelligence utility
    const result = await reconstructSignal(text);
    
    const ticket = {
      id: Math.random().toString(36).substring(2, 9),
      original: text, 
      reconstructed: result.reconstructed, 
      urgency: result.urgency, 
      category: result.category,
      location: location || { lat: 0, lng: 0 }, 
      timestamp: new Date().toISOString(), 
      status: "pending", 
      markerColor: "none" as const,
      adminNotes: [] as any[],
      source: source || "Manual Uplink"
    };
    
    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    return NextResponse.json(ticket);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("ids");
  const tickets = getTickets();
  if (idStr) {
    const idList = idStr.split(",");
    const filtered = tickets.filter((t: any) => idList.includes(t.id));
    return NextResponse.json(filtered);
  }
  const id = searchParams.get("id");
  if (id) {
    const ticket = tickets.find((t: any) => t.id === id);
    return ticket ? NextResponse.json(ticket) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tickets);
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, note, markerColor, sender } = body;
    const tickets = getTickets();
    const index = tickets.findIndex((t: any) => t.id === id);
    if (index === -1) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (status) tickets[index].status = status;
    if (markerColor) tickets[index].markerColor = markerColor;
    if (note) tickets[index].adminNotes.push({ text: note, timestamp: new Date().toISOString(), sender: sender || "admin" });
    saveTickets(tickets);
    return NextResponse.json(tickets[index]);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
