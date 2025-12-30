
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeResume = async (resumeFile, jobDescription) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a World-Class Senior Recruiter and ATS Expert. 
    Analyze the candidate's resume against the job description.
    Provide scores from 0-100 for Overall, ATS, Formatting, and Content.
    Extract keywords and provide strategic feedback.
    Output MUST be valid JSON.
  `;

  const prompt = `
    Job Description: """${jobDescription || 'General professional audit.'}"""
    Resume: [Provided as document part]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        { inlineData: { data: resumeFile.base64, mimeType: resumeFile.mimeType } },
        { text: prompt },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          atsCompatibility: { type: Type.NUMBER },
          formattingScore: { type: Type.NUMBER },
          contentQualityScore: { type: Type.NUMBER },
          matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["overallScore", "atsCompatibility", "formattingScore", "contentQualityScore", "matchedKeywords", "missingKeywords", "summary", "strengths", "improvements"],
      },
    },
  });

  if (!response.text) throw new Error("AI failed to generate report.");
  return JSON.parse(response.text);
};
