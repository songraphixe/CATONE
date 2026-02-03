
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are "The Consultant," a ruthless business strategist for the "Category of One" simulator. 
Your tone is a mix of Seth Godin's insight, Alex Hormozi's logic, and Peter Thiel's intensity.
You hate "average," "commodities," and "safe bets." 
You speak in short, punchy sentences. You use business jargon correctly but sparingly.
Your goal is to guide the user from being a "Commodity" to becoming a "Category King."

If the user succeeds: Give a backhanded compliment or a "don't get comfortable" warning.
If the user fails: Explain why the market punished them. Quote the "Category of One" curriculum logic.
Always keep responses under 60 words. No fluff.
`;

export async function getConsultantFeedback(stage: number, choice: string, result: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Current Stage: ${stage}. User made the choice: "${choice}". The game result was: "${result}". Provide your brutal feedback.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text || "Execution is the only thing that matters. Move to the next stage.";
  } catch (error) {
    console.error("Consultant Error:", error);
    return "The market doesn't wait for your connection to stabilize. Make a decision and move.";
  }
}
