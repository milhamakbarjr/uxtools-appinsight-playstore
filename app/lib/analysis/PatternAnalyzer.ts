import natural from 'natural';

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
  private tokenizer: natural.WordTokenizer;
  private progress: BatchProgress;
  private batchSize: number;

  constructor(batchSize = 100) {
    this.tokenizer = new natural.WordTokenizer();
    this.batchSize = batchSize;
    this.progress = {
      processedReviews: 0,
      totalReviews: 0,
      currentBatch: 0,
      status: 'idle'
    };
  }

  private findFrequencyPatterns(reviews: any[]): Map<string, number> {
    const patterns = new Map<string, number>();
    const tokenFreq = new Map<string, number>();

    reviews.forEach(review => {
      const tokens = this.tokenizer.tokenize(review.text?.toLowerCase() || '');
      if (tokens) {
        tokens.forEach(token => {
          tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1);
        });
      }
    });

    // Filter significant patterns
    tokenFreq.forEach((freq, token) => {
      if (freq > reviews.length * 0.1) { // 10% threshold
        patterns.set(token, freq);
      }
    });

    return patterns;
  }

  private analyzeTimePatterns(reviews: any[]): TimePattern[] {
    const patterns: TimePattern[] = [];
    const timeGroups = new Map<string, any[]>();

    // Group reviews by month
    reviews.forEach(review => {
      const date = new Date(review.date);
      const period = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!timeGroups.has(period)) {
        timeGroups.set(period, []);
      }
      timeGroups.get(period)?.push(review);
    });

    timeGroups.forEach((groupReviews, period) => {
      const avgRating = groupReviews.reduce((sum, r) => sum + r.score, 0) / groupReviews.length;
      const keywords = this.extractCommonKeywords(groupReviews);

      patterns.push({
        period,
        frequency: groupReviews.length,
        avgRating,
        keywords
      });
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  private analyzeRatingPatterns(reviews: any[]): RatingPattern[] {
    const patterns: RatingPattern[] = [];
    const ratingGroups = new Map<number, any[]>();

    reviews.forEach(review => {
      if (!ratingGroups.has(review.score)) {
        ratingGroups.set(review.score, []);
      }
      ratingGroups.get(review.score)?.push(review);
    });

    ratingGroups.forEach((groupReviews, rating) => {
      patterns.push({
        rating,
        frequency: groupReviews.length,
        commonPhrases: this.extractCommonKeywords(groupReviews)
      });
    });

    return patterns;
  }

  private findCorrelations(reviews: any[]): CorrelationPattern[] {
    const correlations: CorrelationPattern[] = [];
    
    // Analyze length vs rating correlation
    const lengthVsRating = this.calculateCorrelation(
      reviews.map(r => r.text?.length || 0),
      reviews.map(r => r.score)
    );

    correlations.push({
      factor: 'review_length',
      correlation: lengthVsRating,
      significance: Math.abs(lengthVsRating)
    });

    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((a, b, i) => a + b * y[i], 0);
    const sum_x2 = x.reduce((a, b) => a + b * b, 0);
    const sum_y2 = y.reduce((a, b) => a + b * b, 0);

    const correlation = (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

    return isNaN(correlation) ? 0 : correlation;
  }

  private extractCommonKeywords(reviews: any[]): string[] {
    const wordFreq = new Map<string, number>();
    
    reviews.forEach(review => {
      const tokens = this.tokenizer.tokenize(review.text?.toLowerCase() || '');
      if (tokens) {
        new Set(tokens).forEach(token => {
          wordFreq.set(token, (wordFreq.get(token) || 0) + 1);
        });
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private calculateConfidence(reviews: any[]): number {
    const sampleSize = reviews.length;
    const textQuality = reviews.filter(r => r.text?.length > 10).length / sampleSize;
    const ratingDistribution = new Set(reviews.map(r => r.score)).size / 5;
    
    return (textQuality * 0.6 + ratingDistribution * 0.4);
  }

  async analyze(reviews: any[]): Promise<Map<number, PatternResult>> {
    const results = new Map<number, PatternResult>();
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

        const result: PatternResult = {
          frequencyPatterns: this.findFrequencyPatterns(batch),
          timeBasedPatterns: this.analyzeTimePatterns(batch),
          ratingPatterns: this.analyzeRatingPatterns(batch),
          correlations: this.findCorrelations(batch),
          confidence: this.calculateConfidence(batch)
        };

        results.set(i, result);
        this.progress.processedReviews += batch.length;
        
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
