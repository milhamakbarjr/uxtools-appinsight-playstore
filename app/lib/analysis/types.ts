export interface AnalysisProgress {
  stage: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  error?: string;
}

export interface AnalyzerInterface {
  analyze(reviews: any[]): Promise<any>;
  getProgress(): AnalysisProgress;
}

export interface CombinedAnalysisResult {
  patterns: any;
  sentiment: any;
  topics: any;
  stats: {
    totalReviews: number;
    processingTimeMs: number;
    errors?: string[];
  };
}
