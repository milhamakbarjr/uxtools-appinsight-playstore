import natural from 'natural';
import { AnalysisProgress } from './types';

export interface PatternResult {
  frequencyPatterns: Map<string, number>;
  timeBasedPatterns: TimePattern[];
  ratingPatterns: RatingPattern[];
  correlations: CorrelationPattern[];
  confidence: number;
}

interface TimePattern {
  period: string;
  frequency: number;
  avgRating: number;
  keywords: string[];
}

interface RatingPattern {
  rating: number;
  frequency: number;
  commonPhrases: string[];
}

interface CorrelationPattern {
  factor: string;
  correlation: number;
  significance: number;
}

export interface BatchProgress {
  processedReviews: number;
  totalReviews: number;
  currentBatch: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export class PatternAnalyzer {
  private batchSize: number;
  private progress: AnalysisProgress;

  constructor(batchSize: number = 50) {
    this.batchSize = batchSize;
    this.progress = {
      stage: 'idle',
      progress: 0
    };
  }

  async analyze(reviews: any[]) {
    this.progress = { 
      stage: 'running', 
      progress: 0,
      details: 'Starting pattern analysis...'
    };

    try {
      // Extract frequencies of words and phrases
      const frequencyPatterns = new Map<string, number>();
      const timeBasedPatterns = [];
      const ratingPatterns = [];
      const correlations = [];
      
      // 1. Process word frequencies
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        const text = review.text.toLowerCase();
        
        // Extract common phrases (n-grams)
        const words = text.split(/\s+/).filter(word => word.length > 3);
        
        // Count word frequencies
        words.forEach(word => {
          frequencyPatterns.set(word, (frequencyPatterns.get(word) || 0) + 1);
        });
        
        this.progress.progress = Math.round((i / reviews.length) * 33);
      }
      
      // 2. Find time-based patterns
      const dateGroups = new Map();
      reviews.forEach(review => {
        const date = new Date(review.date).toISOString().split('T')[0];
        if (!dateGroups.has(date)) {
          dateGroups.set(date, []);
        }
        dateGroups.get(date).push(review);
      });
      
      // Find dates with unusually high review counts
      const avgReviewsPerDay = reviews.length / dateGroups.size;
      dateGroups.forEach((dateReviews, date) => {
        if (dateReviews.length > avgReviewsPerDay * 1.5) {
          timeBasedPatterns.push({
            date,
            count: dateReviews.length,
            anomaly: 'high volume'
          });
        }
      });
      
      this.progress.progress = 66;
      
      // 3. Find rating patterns
      const ratingGroups = [0, 0, 0, 0, 0]; // 1-5 stars
      reviews.forEach(review => {
        if (review.score >= 1 && review.score <= 5) {
          ratingGroups[Math.floor(review.score) - 1]++;
        }
      });
      
      // Calculate rating distribution
      for (let i = 0; i < 5; i++) {
        ratingPatterns.push({
          stars: i + 1,
          count: ratingGroups[i],
          percentage: (ratingGroups[i] / reviews.length) * 100
        });
      }
      
      // 4. Find correlations between ratings and common words
      const topWords = Array.from(frequencyPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(entry => entry[0]);
      
      topWords.forEach(word => {
        const withWord = [];
        const withoutWord = [];
        
        reviews.forEach(review => {
          if (review.text.toLowerCase().includes(word)) {
            withWord.push(review.score);
          } else {
            withoutWord.push(review.score);
          }
        });
        
        const avgWithWord = withWord.length > 0 ? 
          withWord.reduce((sum, score) => sum + score, 0) / withWord.length : 0;
        const avgWithoutWord = withoutWord.length > 0 ? 
          withoutWord.reduce((sum, score) => sum + score, 0) / withoutWord.length : 0;
        
        correlations.push({
          word,
          avgRatingWithWord: avgWithWord,
          avgRatingWithoutWord: avgWithoutWord,
          difference: avgWithWord - avgWithoutWord,
          reviewCount: withWord.length
        });
      });
      
      this.progress.progress = 100;
      
      // Return structured patterns
      return {
        frequencyPatterns,
        timeBasedPatterns,
        ratingPatterns,
        correlations
      };
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
