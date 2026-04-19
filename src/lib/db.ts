import fs from "fs";
import path from "path";
import { encrypt, decrypt } from "./encryption";

const TICKETS_FILE = path.join(process.cwd(), "src/data/tickets.json");

export interface Ticket {
  id: string;
  original: string;
  reconstructed: string;
  urgency: number;
  category: string;
  location: { lat: number, lng: number };
  manualLocation?: string;
  victimName?: string;
  timestamp: string;
  status: string;
  markerColor: "green" | "yellow" | "red" | "none";
  adminNotes: { text: string, timestamp: string, sender: "admin" | "system" }[];
  source?: string;
}

export function getTickets(): Ticket[] {
  if (fs.existsSync(TICKETS_FILE)) {
    const fileData = fs.readFileSync(TICKETS_FILE, "utf-8");
    const serializedTickets = JSON.parse(fileData);
    
    return serializedTickets.map((t: any) => {
      try {
        return {
          ...t,
          original: decrypt(t.original),
          reconstructed: decrypt(t.reconstructed),
          location: JSON.parse(decrypt(t.location)),
          manualLocation: t.manualLocation ? decrypt(t.manualLocation) : "",
          victimName: t.victimName ? decrypt(t.victimName) : "Unknown",
          adminNotes: (t.adminNotes || []).map((n: any) => ({
            ...n,
            text: decrypt(n.text)
          }))
        };
      } catch (e) {
        // Fallback for legacy data
        return t;
      }
    });
  }
  return [];
}

export function saveTickets(tickets: Ticket[]) {
  const encryptedTickets = tickets.map((t: any) => ({
    ...t,
    original: encrypt(t.original),
    reconstructed: encrypt(t.reconstructed),
    location: encrypt(JSON.stringify(t.location)),
    manualLocation: t.manualLocation ? encrypt(t.manualLocation) : "",
    victimName: t.victimName ? encrypt(t.victimName) : "",
    adminNotes: (t.adminNotes || []).map((n: any) => ({
      ...n,
      text: encrypt(n.text)
    }))
  }));
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(encryptedTickets, null, 2));
}
