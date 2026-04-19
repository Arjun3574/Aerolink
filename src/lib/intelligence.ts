export interface AnalysisResult {
  reconstructed: string;
  urgency: number;
  category: string;
}

export async function reconstructSignal(
  text: string, 
  victimName?: string, 
  manualLocation?: string
): Promise<AnalysisResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const model = "gemini-2.5-flash"; // Reverted to 2.5 as requested
  
  if (apiKey && !apiKey.endsWith("abcDWY")) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const ctx = `VICTIM NAME: ${victimName || "Unknown"}\nREPORTED LOCATION: ${manualLocation || "Not specified"}`;

      const geminiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Respond strictly in JSON: { "reconstructed": "...", "urgency": #, "category": "..." }\nTask: Reconstruct and categorize Signal: "${text}" within Context: ${ctx}` }] }]
        })
      });

      const data = await geminiResponse.json();
      
      if (geminiResponse.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } else {
        console.error(`[AI ERROR] Status ${geminiResponse.status}:`, JSON.stringify(data, null, 2));
      }
    } catch (e) {
      console.error("[AI CRITICAL ERROR] Fetch failed:", e);
    }
  }

  // --- LOCAL HEURISTIC FALLBACK ---
  // This executes if API key is invalid, model fails, or network is down.
  console.warn("[INTELLIGENCE] Using Local Heuristic Fallback for Signal.");
  
  const lower = text.toLowerCase();
  let category = "General Emergency";
  let urgency = 5;

  if (lower.includes("fire") || lower.includes("burn") || lower.includes("smoke")) { category = "Fire Hazard"; urgency = 9; }
  else if (lower.includes("water") || lower.includes("flood") || lower.includes("drown")) { category = "Flood/Water"; urgency = 8; }
  else if (lower.includes("hurt") || lower.includes("bleed") || lower.includes("breath")) { category = "Medical"; urgency = 10; }
  else if (lower.includes("trap") || lower.includes("stuck") || lower.includes("wall")) { category = "Structural"; urgency = 7; }

  return {
    reconstructed: `[AUTO-RECONSTRUCT] ${text} (Reported by ${victimName || "Unknown"})`,
    urgency: urgency,
    category: category
  };
}
