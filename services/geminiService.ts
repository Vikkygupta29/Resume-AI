
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData } from "../types";

export const analyzeResume = async (
  resumeFile: FileData,
  jobDescription: string
): Promise<AnalysisResult> => {
  // Creating a new instance right before the call to ensure it uses the latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a World-Class Senior Recruiter and ATS (Applicant Tracking System) Expert. 
    Your task is to analyze a candidate's resume against a specific job description (or provide a general audit if none is given).

    Provide a highly professional, constructive, and quantitative analysis.
    - Overall Score: General quality and impact (0-100).
    - ATS Compatibility: How well it parses and follows standard formats (0-100).
    - Formatting Score: Layout, whitespace, and font usage (0-100).
    - Content Quality: Use of action verbs, metrics, and achievements (0-100).
    - Keywords: Extract specific technical and soft skill keywords from the JD and match them against the resume.

    Output MUST be valid JSON and exactly match the provided response schema.
  `;

  const prompt = `
    Job Description: 
    """
    ${jobDescription || 'Professional professional audit without a specific role target.'}
    """

    Analyze the attached resume file for:
    1. Direct keyword matches vs missing keywords from the JD.
    2. Strength of bullet points (did they use the STAR method?).
    3. Actionable improvements for "quick wins".
    4. A concise summary of their professional brand.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: resumeFile.base64,
            mimeType: resumeFile.mimeType,
          },
        },
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
        required: [
          "overallScore", "atsCompatibility", "formattingScore", "contentQualityScore",
          "matchedKeywords", "missingKeywords", "summary", "strengths", "improvements"
        ],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("The AI failed to generate a response. Please try again.");
  
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    throw new Error("Failed to parse AI analysis. The model may have returned an invalid format.");
  }
};
