import natural from 'natural';
import { franc } from 'franc';

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
  private analyzer: natural.SentimentAnalyzer;
  private progress: BatchProgress;
  private batchSize: number;

  constructor(batchSize = 100) {
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.batchSize = batchSize;
    this.progress = {
      processedReviews: 0,
      totalReviews: 0,
      currentBatch: 0,
      status: 'idle'
    };
  }

  private calculateConfidence(text: string, rating: number, sentimentScore: number): number {
    // Weight factors
    const lengthWeight = 0.3;
    const ratingCorrelationWeight = 0.7;

    // Text length confidence (longer text = higher confidence)
    const textLength = text.length;
    const lengthConfidence = Math.min(textLength / 500, 1); // Max length considered is 500 chars

    // Rating correlation confidence
    const normalizedRating = (rating - 1) / 4; // Convert 1-5 to 0-1
    const normalizedSentiment = (sentimentScore + 5) / 10; // Convert -5 to 5 into 0-1
    const ratingCorrelation = 1 - Math.abs(normalizedRating - normalizedSentiment);

    return (lengthConfidence * lengthWeight) + (ratingCorrelation * ratingCorrelationWeight);
  }

  private analyzeSingle(review: { text: string; score: number }): SentimentResult {
    const text = review.text || '';
    // Fix: Add 'new' keyword when creating WordTokenizer instance
    const tokens = new natural.WordTokenizer().tokenize(text) || [];
    const language = franc(text);
    
    const sentimentScore = this.analyzer.getSentiment(tokens);
    const comparative = tokens.length > 0 ? sentimentScore / tokens.length : 0;
    const confidence = this.calculateConfidence(text, review.score, sentimentScore);

    return {
      score: sentimentScore,
      comparative,
      confidence,
      language,
      tokens
    };
  }

  async analyze(reviews: { text: string; score: number }[]): Promise<Map<number, SentimentResult>> {
    const results = new Map<number, SentimentResult>();
    this.progress = {
      processedReviews: 0,
      totalReviews: reviews.length,
      currentBatch: 0,
      status: 'processing'
    };

    try {
      for (let i = 0; i < reviews.length; i += this.batchSize) {
        this.progress.currentBatch = Math.floor(i / this.batchSize) + 1;
        const batch = reviews.slice(i, i + this.batchSize);

        for (let j = 0; j < batch.length; j++) {
          const result = this.analyzeSingle(batch[j]);
          results.set(i + j, result);
          this.progress.processedReviews++;
        }

        // Allow other operations between batches
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      this.progress.status = 'completed';
    } catch (error) {
      this.progress.status = 'error';
      this.progress.error = error.message;
      throw error;
    }

    return results;
  }

  getProgress(): BatchProgress {
    return { ...this.progress };
  }
}
