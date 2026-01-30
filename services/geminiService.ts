
import { GoogleGenAI, Type } from "@google/genai";
import { Parameter, DesignIntent, AIModificationResult, ActiveAdjustFeedback, PhysicsStats, ManufacturingAudit, Material } from "../types";

// Always use gemini-3-pro-preview for complex engineering reasoning and STEM tasks.
// Instantiate GoogleGenAI inside functions to ensure the most up-to-date API key from process.env.API_KEY.

export async function modifyParametricModel(
  prompt: string,
  currentParameters: Parameter[],
  intents: DesignIntent[]
): Promise<AIModificationResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `
    You are an expert Mechanical Engineer and Parametric CAD specialized AI.
    Your task is to update CAD parameters based on a natural language request.
    Respect the "Design Intent" constraints.
    Return the updated parameters, a brief explanation, and any intent violations.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Request: ${prompt}\nContext: ${JSON.stringify({currentParameters, intents})}`,
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
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                },
                required: ['id', 'name', 'value', 'unit', 'description'],
              }
            },
            explanation: { type: Type.STRING },
            intentViolations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['updatedParameters', 'explanation', 'intentViolations'],
        }
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}') as AIModificationResult;
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `
    Analyze the current CAD model's parameters in the context of an assembly.
    Return engineering insights and scores for stability and feasibility.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Assembly: ${assemblyContext}\nParams: ${JSON.stringify(parameters)}`,
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
            contextGeometry: { 
              type: Type.STRING, 
              description: 'Target geometry type: rail, motor, wall, or none.' 
            },
          },
          required: ['stability', 'feasibility', 'fitScore', 'engineeringInsights', 'suggestedAssemblyTweak', 'contextGeometry'],
        }
      }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '{}') as ActiveAdjustFeedback;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function runManufacturingAudit(
  parameters: Parameter[],
  material: Material
): Promise<ManufacturingAudit> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `
    Perform a DFM (Design for Manufacturing) audit based on parameters and material properties.
  `;
  const response = await ai.models.generateContent({
    model,
    contents: `Params: ${JSON.stringify(parameters)}\nMaterial: ${JSON.stringify(material)}`,
    config: { 
      systemInstruction, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          method: { type: Type.STRING, description: 'CNC, 3D Print, or Injection Mold' },
          rating: { type: Type.NUMBER },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['method', 'rating', 'issues', 'recommendations'],
      }
    }
  });
  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr || '{}');
}

export async function calculatePhysics(
  parameters: Parameter[],
  material: Material
): Promise<PhysicsStats> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `
    Estimate mechanical physics properties like mass and structural integrity.
  `;
  const response = await ai.models.generateContent({
    model,
    contents: `Params: ${JSON.stringify(parameters)}\nMaterial: ${JSON.stringify(material)}`,
    config: { 
      systemInstruction, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedMass: { type: Type.NUMBER, description: 'Mass in kg' },
          cost: { type: Type.NUMBER, description: 'Estimated cost in USD' },
          centerOfGravity: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: '[x, y, z] coordinates' 
          },
          structuralIntegrityScore: { type: Type.NUMBER, description: '0 to 100' },
        },
        required: ['estimatedMass', 'cost', 'centerOfGravity', 'structuralIntegrityScore'],
      }
    }
  });
  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr || '{}');
}
