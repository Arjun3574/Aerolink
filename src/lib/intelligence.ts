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
  if (!apiKey) throw new Error("API Key not configured.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const ctx = `
    VICTIM NAME: ${victimName || "Unknown"}
    REPORTED LOCATION: ${manualLocation || "Not specified"}
  `;

  const geminiResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `
        Emergency Response AI Analyst.
        Context: ${ctx}
        Signal Extraction: "${text}"
        
        Task: 
        1. Reconstruct fragmented signal into professional clean text.
        2. Categorize (e.g. Trauma, Fire, Drowning).
        3. Score urgency (1-10).
        
        Respond strictly in JSON: { "reconstructed": "...", "urgency": #, "category": "..." }
      ` }] }]
    })
  });

  const data = await geminiResponse.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse.replace(/```json|```/g, "").trim());
}
