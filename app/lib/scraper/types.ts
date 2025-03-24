export interface ScraperConfig {
  batchSize: number;
  maxRetries: number;
  maxReviews: number;
  timeoutMs: number;
  backoffMs: number;
}

export interface ScrapingProgress {
  totalReviews: number;
  fetchedReviews: number;
  currentBatch: number;
  retryCount: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
  nextPaginationToken?: string | null;
}

export interface ScrapingResult {
  appId: string;
  reviews: any[];
  stats: {
    totalReviews: number;
    successfulBatches: number;
    failedBatches: number;
    retryAttempts: number;
    timeElapsed: number;
  };
}
