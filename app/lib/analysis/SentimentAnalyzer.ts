import natural from 'natural';
import { franc } from 'franc';
import { AnalysisProgress } from './types';

export interface SentimentResult {
  score: number;
  comparative: number;
  confidence: number;
  language: string;
  tokens: string[];
}

export interface BatchProgress {
  processedReviews: number;
  totalReviews: number;
  currentBatch: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export class SentimentAnalyzer {
  private batchSize: number;
  private progress: AnalysisProgress;
  private analyzer: any;

  constructor(batchSize: number = 50) {
    this.batchSize = batchSize;
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.progress = {
      stage: 'idle',
      progress: 0
    };
  }

  async analyze(reviews: any[]) {
    this.progress = { stage: 'running', progress: 0 };
    const results = {
      distribution: {} as Record<string, number>,
      averageScore: 0,
      positive: 0,
      negative: 0,
      neutral: 0
    };

    try {
      let totalScore = 0;
      const reviewCount = reviews.length;

      for (let i = 0; i < reviewCount; i++) {
        const review = reviews[i];
        const words = review.text.toLowerCase().split(/\s+/);
        const score = this.analyzer.getSentiment(words);

        if (score > 0) results.positive++;
        else if (score < 0) results.negative++;
        else results.neutral++;

        totalScore += score;
        this.progress.progress = Math.round((i + 1) / reviewCount * 100);
      }

      results.averageScore = totalScore / reviewCount;
      results.distribution = {
        positive: (results.positive / reviewCount) * 100,
        negative: (results.negative / reviewCount) * 100,
        neutral: (results.neutral / reviewCount) * 100
      };

      this.progress = { stage: 'completed', progress: 100 };
      return results;

    } catch (error) {
      this.progress = { 
        stage: 'error', 
        progress: 0, 
        error: error.message 
      };
      throw error;
    }
  }

  getProgress(): AnalysisProgress {
    return { ...this.progress };
  }
}
