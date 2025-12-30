
export interface AnalysisResult {
  overallScore: number;
  atsCompatibility: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  formattingScore: number;
  contentQualityScore: number;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
