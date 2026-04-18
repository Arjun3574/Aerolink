/**
 * DISAST-ED MISSION BRIDGE (DUPLEX v2.0)
 * -------------------
 * Bridges ESP32 Base Station (COM12) to the Intelligence Dashboard.
 * 
 * PROTOCOL: (Name|Location|message)
 * 
 * INSTALL: npm install serialport
 * RUN: node scripts/bridge.js COM12
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const API_ROOT = 'http://localhost:3001/api';
const BAUD_RATE = 115200;
const POLL_INTERVAL = 2000; // Poll for Admin replies every 2s

const args = process.argv.slice(2);
const portPath = args[0] || 'COM12';

if (portPath === '--list') {
  SerialPort.list().then(ports => {
    console.log('\n--- SYSTEM PORTS ---');
    ports.forEach(p => console.log(`${p.path}\t${p.manufacturer || 'Unknown'}`));
    process.exit(0);
  });
}

const port = new SerialPort({ path: portPath, baudRate: BAUD_RATE });
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const seenNoteTimestamps = new Set(); // To avoid repeating admin notes
let activeTicketIds = new Set();

console.log(`\n[BRIDGE] CodeRed Base Station Linked @ ${portPath}`);
console.log(`[BRIDGE] Protocol: (Name|Location|Message)`);
console.log(`[BRIDGE] Monitoring for Admin Feedback...\n`);

// 1. UPLINK: ESP32 -> DASHBOARD
parser.on('data', async (line) => {
  const cleanLine = line.trim();
  if (!cleanLine) return;

  console.log(`[ESP] Incoming Raw: ${cleanLine}`);

  // Protocol 1: (Name|Location|Message)
  // Protocol 2: [TKT-1812] Name: Paritosh | Loc: Kantidhan | Msg: My leg is broken
  const match1 = cleanLine.match(/\(([^|]+)\|([^|]+)\|([^)]+)\)/);
  const match2 = cleanLine.match(/\[TKT-\d+\]\s*Name:\s*([^|]+)\|\s*Loc:\s*([^|]+)\|\s*Msg:\s*([^]+)/i);
  
  const match = match1 || match2;
  
  if (match) {
    const payload = {
      victimName: match[1].trim(),
      manualLocation: match[2].trim(),
      message: match[3].trim(),
      lat: 0, 
      lng: 0
    };

    console.log(`[BRIDGE] Parsed SOS from ${payload.victimName}. Uplinking...`);

    try {
      const res = await fetch(`${API_ROOT}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ticketId) {
        activeTicketIds.add(data.ticketId);
        console.log(`[BRIDGE] Ticket Created: ${data.ticketId}`);
      }
    } catch (e) { console.error(`[ERROR] Dispatch Offline: ${e.message}`); }
  } else {
    console.log(`[WARN] Non-protocol signal ignored: ${cleanLine}`);
  }
});

// 2. DOWNLINK: DASHBOARD -> ESP32 BROWADCAST
setInterval(async () => {
  if (activeTicketIds.size === 0) return;

  try {
    const ids = Array.from(activeTicketIds).join(',');
    const res = await fetch(`${API_ROOT}/reconstruct?ids=${ids}`);
    if (!res.ok) return;

    const tickets = await res.json();

    for (const ticket of tickets) {
      if (!ticket.adminNotes) continue;

      for (const note of ticket.adminNotes) {
        const noteId = `${ticket.id}-${note.timestamp}`;
        
        if (!seenNoteTimestamps.has(noteId)) {
          seenNoteTimestamps.add(noteId);
          
          console.log(`[COMMAND] New Feedback for ${ticket.victimName}: ${note.text}`);
          
          // Send to ESP32 followed by newline as per ESP code
          const broadcastMsg = `COMMAND TO ${ticket.victimName.toUpperCase()}: ${note.text.toUpperCase()}\n`;
          port.write(broadcastMsg, (err) => {
            if (err) console.error(`[ERROR] Broadcast Link Failure: ${err.message}`);
          });
        }
      }
    }
  } catch (e) { /* Backend likely restarting */ }
}, POLL_INTERVAL);

port.on('error', (err) => console.error(`[CRITICAL] Serial Link Failure: ${err.message}`));
