import { AnalysisProgress, AnalyzerInterface, CombinedAnalysisResult } from './types';
import { PatternAnalyzer } from './PatternAnalyzer';
import { SentimentAnalyzer } from './SentimentAnalyzer';
import { TopicAnalyzer } from './TopicAnalyzer';

export class AnalysisService {
  private patternAnalyzer: AnalyzerInterface;
  private sentimentAnalyzer: AnalyzerInterface;
  private topicAnalyzer: AnalyzerInterface;
  private progress: Record<string, AnalysisProgress>;

  constructor(batchSize: number = 50) {
    // Initialize with batch size
    this.patternAnalyzer = new PatternAnalyzer(batchSize);
    this.sentimentAnalyzer = new SentimentAnalyzer(batchSize);
    this.topicAnalyzer = new TopicAnalyzer(batchSize);
    this.progress = {
      patterns: { stage: 'idle', progress: 0 },
      sentiment: { stage: 'idle', progress: 0 },
      topics: { stage: 'idle', progress: 0 }
    };
  }

  async analyzeReviews(reviews: any[]): Promise<CombinedAnalysisResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Process reviews to ensure they have required fields
      const validReviews = reviews.filter(review => 
        review && review.text && typeof review.text === 'string' &&
        review.score && typeof review.score === 'number'
      );

      if (validReviews.length === 0) {
        throw new Error('No valid reviews to analyze');
      }

      // Run analyses in parallel with proper error handling
      const [patternResults, sentimentResults, topicResults] = await Promise.all([
        this.runAnalysis('patterns', async () => {
          return this.patternAnalyzer.analyze(validReviews);
        }),
        this.runAnalysis('sentiment', async () => {
          return this.sentimentAnalyzer.analyze(validReviews);
        }),
        this.runAnalysis('topics', async () => {
          return this.topicAnalyzer.analyze(validReviews);
        })
      ]);

      // Format results with proper structure
      const results: CombinedAnalysisResult = {
        patterns: {
          frequency: Array.from(patternResults.frequencyPatterns || new Map()).slice(0, 20),
          timeBased: patternResults.timeBasedPatterns || [],
          rating: patternResults.ratingPatterns || [],
          correlations: patternResults.correlations || []
        },
        sentiment: sentimentResults,
        topics: {
          list: topicResults.topics || [],
          phrases: topicResults.phrases || [],
          frequent: topicResults.topFrequent || []
        },
        stats: {
          totalReviews: validReviews.length,
          processingTimeMs: Date.now() - startTime,
          errors: errors.length > 0 ? errors : undefined
        }
      };

      return results;

    } catch (error) {
      const errorMsg = `Analysis failed: ${error.message}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  private async runAnalysis(type: string, analyzerFn: () => Promise<any>): Promise<any> {
    this.progress[type] = { 
      stage: 'running', 
      progress: 0,
      details: `Starting ${type} analysis...`
    };

    try {
      const result = await analyzerFn();
      this.progress[type] = { 
        stage: 'completed', 
        progress: 100,
        details: `Completed ${type} analysis`
      };
      return result;
    } catch (error) {
      this.progress[type] = { 
        stage: 'error', 
        progress: 0, 
        error: error.message,
        details: `Failed to run ${type} analysis: ${error.message}`
      };
      throw error;
    }
  }

  getProgress(): Record<string, AnalysisProgress> {
    return { ...this.progress };
  }
}
