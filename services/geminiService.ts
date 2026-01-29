
import { GoogleGenAI, Type } from "@google/genai";
import { Parameter, DesignIntent, AIModificationResult, ActiveAdjustFeedback } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function modifyParametricModel(
  prompt: string,
  currentParameters: Parameter[],
  intents: DesignIntent[]
): Promise<AIModificationResult> {
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    You are an expert Mechanical Engineer and Parametric CAD specialized AI.
    Your task is to update CAD parameters based on a natural language request.
    
    You must respect the "Design Intent" constraints provided.
    If a request violates a high-priority intent, mention it in the intentViolations.
    
    Current Parameters: ${JSON.stringify(currentParameters)}
    Design Intents: ${JSON.stringify(intents)}
    
    Return a JSON object with:
    1. updatedParameters: Array of the full parameter objects with their new values.
    2. explanation: A technical explanation of why these specific changes were made.
    3. intentViolations: Array of strings describing any constraints that were challenged or violated.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedParameters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  description: { type: Type.STRING },
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                },
                required: ["id", "name", "value", "unit"]
              }
            },
            explanation: { type: Type.STRING },
            intentViolations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["updatedParameters", "explanation", "intentViolations"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIModificationResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process AI modification.");
  }
}

export async function analyzeActiveAdjust(
  assemblyContext: string,
  parameters: Parameter[],
  intents: DesignIntent[]
): Promise<ActiveAdjustFeedback> {
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `
    You are a Senior Mechanical Engineering Auditor. 
    Analyze the current CAD model's parameters in the context of a specific assembly requirement.
    
    Return a JSON object with:
    1. stability: (0-100) Structural rigidity score based on parameters.
    2. feasibility: (0-100) Can it be manufactured given the constraints?
    3. fitScore: (0-100) How well does it fit the described assembly?
    4. engineeringInsights: 3-4 bullet points of high-level engineering advice.
    5. suggestedAssemblyTweak: A concise suggestion for a parameter change to improve fit.
    6. contextGeometry: One of ['rail', 'motor', 'wall', 'none'] based on the assembly description.
  `;

  const prompt = `
    Assembly Context: ${assemblyContext}
    Current Model Parameters: ${JSON.stringify(parameters)}
    Engineering Intents: ${JSON.stringify(intents)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stability: { type: Type.NUMBER },
            feasibility: { type: Type.NUMBER },
            fitScore: { type: Type.NUMBER },
            engineeringInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedAssemblyTweak: { type: Type.STRING },
            contextGeometry: { type: Type.STRING }
          },
          required: ["stability", "feasibility", "fitScore", "engineeringInsights", "suggestedAssemblyTweak", "contextGeometry"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as ActiveAdjustFeedback;
  } catch (error) {
    console.error("Active Adjust Error:", error);
    throw new Error("Failed to analyze assembly context.");
  }
}
