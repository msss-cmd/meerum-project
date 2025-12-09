export enum AppStatus {
  IDLE = 'IDLE',
  PARSING_PDF = 'PARSING_PDF',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface PaperMetadata {
  title: string;
  abstract: string;
  text: string;
}

export interface SummaryData {
  mainSummary: string;
  contributions: string[];
  method: string[];
  results: string[];
  limitations: string[];
}

export interface SimilarPaper {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
}

export interface EvaluationData {
  score: number;
  reasoning: string;
  semanticSimilarityScore: number;
  keypointCoverageScore: number;
  missingKeypoints: string[];
}

export interface AnalysisResult {
  metadata: PaperMetadata;
  summary: SummaryData;
  similarPapers: SimilarPaper[];
  evaluation: EvaluationData;
}

// Auth & Admin Types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  timestamp: number;
  paperTitle: string;
  actionType: 'ANALYSIS_COMPLETED';
}