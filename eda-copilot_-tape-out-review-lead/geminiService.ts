
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, MODEL_NAME } from "./constants";
import { MultiLogAnalysisResult } from "./types";

export const analyzeEDALogs = async (
  logs: { name: string; content: string }[],
  userQuestion?: string,
  historicalContext?: string
): Promise<MultiLogAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const logsPayload = logs.map(l => `FILE: ${l.name}\nCONTENT: ${l.content.substring(0, 4500)}`).join('\n---\n');

  const prompt = `
    REVIEW_INITIATED:
    BATCH_MANIFEST: ${logs.map(l => l.name).join(', ')}
    USER_OBJECTIVE: ${userQuestion || "Perform standard tape-out gate review and generate RTL fixes where needed."}
    ${historicalContext ? `HISTORICAL_DATA:\n${historicalContext}` : ""}
    
    LOG_STREAM:
    ${logsPayload}
    
    INSTRUCTION: Generate the 10-point JSON assessment. If an RTL change is required for a timing or fanout fix, include the "verilogFix" object. Terminate at }.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        maxOutputTokens: 4000, // Increased for Verilog code space
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallVerdict: { type: Type.STRING },
            overallRiskScore: { type: Type.NUMBER },
            globalSummary: { type: Type.STRING },
            tierCounts: {
              type: Type.OBJECT,
              properties: {
                green: { type: Type.NUMBER },
                yellow: { type: Type.NUMBER },
                red: { type: Type.NUMBER },
                critical: { type: Type.NUMBER }
              }
            },
            logs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  fileName: { type: Type.STRING },
                  tool: { type: Type.STRING },
                  decision: { type: Type.STRING },
                  riskScore: { type: Type.NUMBER },
                  executiveSummary: { type: Type.STRING },
                  topIssues: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { title: { type: Type.STRING }, impact: { type: Type.STRING } }
                    }
                  },
                  rootCauseAnalysis: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { cause: { type: Type.STRING }, effect: { type: Type.STRING }, confidence: { type: Type.NUMBER } }
                    }
                  },
                  counterfactualInsights: { type: Type.STRING },
                  fixStrategy: {
                    type: Type.OBJECT,
                    properties: { recommendation: { type: Type.STRING }, cost: { type: Type.STRING }, risk: { type: Type.STRING }, debt: { type: Type.STRING } }
                  },
                  verilogFix: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      code: { type: Type.STRING }
                    }
                  },
                  predictiveOutcomes: { type: Type.STRING },
                  debugPlaybook: { type: Type.STRING },
                  valueMetrics: {
                    type: Type.OBJECT,
                    properties: { debugTimeSavedHours: { type: Type.NUMBER }, iterationsAvoided: { type: Type.NUMBER }, valueStatement: { type: Type.STRING } }
                  }
                },
                required: ["fileName", "decision", "riskScore", "fixStrategy"]
              }
            }
          },
          required: ["overallVerdict", "overallRiskScore", "logs"]
        }
      },
    });

    let text = response.text || "";
    text = text.replace(/End-of-[a-zA-Z-]+/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Analysis engine failed to produce a valid JSON stream.");
    }
    
    const cleanedJson = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleanedJson) as MultiLogAnalysisResult;

  } catch (err: any) {
    console.error("EDA Copilot Internal Error:", err);
    throw err;
  }
};
