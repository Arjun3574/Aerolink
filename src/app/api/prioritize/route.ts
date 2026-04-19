import { NextResponse } from "next/server";
import { getTickets } from "@/lib/db";

export async function POST() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key not configured." }, { status: 500 });

    const tickets = getTickets().filter((t: any) => t.status !== "completed");
    if (tickets.length === 0) return NextResponse.json([]);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `
          Tactical Triage Officer Analysis.
          PROTOCOL: 
          1. Tier 1 (minutes): Fire, Drowning, Trauma.
          2. Tier 2 (hours): Food, Water, Shelter.
          Tier 1 overrides Tier 2 regardless of count.

          TICKETS: ${JSON.stringify(tickets)}

          Respond strictly in JSON format:
          {
            "sortedIds": ["id1", "id2", ...],
            "rationale": { "id1": "reason", "id2": "reason" }
          }
        ` }] }]
      })
    });

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(responseText.replace(/```json|```/g, "").trim());

    const prioritizedTickets = result.sortedIds.map((id: string) => {
      const ticket = tickets.find((t: any) => t.id === id);
      if (ticket) return { ...ticket, tacticalReasoning: result.rationale[id] };
      return null;
    }).filter(Boolean);

    const missing = tickets.filter((t: any) => !result.sortedIds.includes(t.id));
    return NextResponse.json([...prioritizedTickets, ...missing]);
  } catch (error: any) {
    console.error("Prioritization Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
