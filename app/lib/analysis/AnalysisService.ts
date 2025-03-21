import { AnalysisProgress, AnalyzerInterface, CombinedAnalysisResult } from './types';
import { PatternAnalyzer } from './PatternAnalyzer';
import { SentimentAnalyzer } from './SentimentAnalyzer';
import { TopicAnalyzer } from './TopicAnalyzer';
import { AnalysisCache } from './cache';
import { createHash } from 'crypto';

export class AnalysisService {
  private patternAnalyzer: AnalyzerInterface;
  private sentimentAnalyzer: AnalyzerInterface;
  private topicAnalyzer: AnalyzerInterface;
  private progress: Record<string, AnalysisProgress>;
  private cache: AnalysisCache | null = null;
  private analysisId: string | null = null;

  constructor(batchSize: number = 50, useCache: boolean = true) {
    // Initialize with batch size
    this.patternAnalyzer = new PatternAnalyzer(batchSize);
    this.sentimentAnalyzer = new SentimentAnalyzer(batchSize);
    this.topicAnalyzer = new TopicAnalyzer(batchSize);
    this.progress = {
      patterns: { stage: 'idle', progress: 0 },
      sentiment: { stage: 'idle', progress: 0 },
      topics: { stage: 'idle', progress: 0 }
    };

    // Initialize cache if available and requested
    if (useCache && typeof window !== 'undefined') {
      try {
        this.cache = new AnalysisCache();
      } catch (error) {
        console.warn('Failed to initialize cache:', error);
      }
    }
  }

  /**
   * Generate a config hash for cache identification
   */
  private generateConfigHash(config: any): string {
    try {
      const configStr = JSON.stringify({
        batchSize: config.batchSize,
        // Add other relevant config properties
      });
      
      // In a browser environment, use a simple hash
      if (typeof window !== 'undefined') {
        return btoa(configStr).slice(0, 10);
      }
      
      // In Node.js, use crypto
      return createHash('md5').update(configStr).digest('hex').slice(0, 10);
    } catch {
      return 'default';
    }
  }

  async analyzeReviews(reviews: any[], config?: any): Promise<CombinedAnalysisResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    this.analysisId = `analysis_${Date.now()}`;
    
    // Generate a config hash for the cache
    const configHash = this.generateConfigHash(config || {});
    
    try {
      // Process reviews to ensure they have required fields
      const validReviews = reviews.filter(review => 
        review && review.text && typeof review.text === 'string' &&
        review.score && typeof review.score === 'number'
      );

      if (validReviews.length === 0) {
        throw new Error('No valid reviews to analyze');
      }
      
      const appId = validReviews[0].appId || 'unknown';
      
      // Try to get from cache first
      if (this.cache) {
        const cachedResult = await this.cache.get(appId, configHash);
        if (cachedResult) {
          console.log('Using cached analysis result');
          return cachedResult;
        }
      }
      
      // Check for saved progress
      if (this.cache) {
        const savedProgress = await this.cache.getProgress(this.analysisId);
        if (savedProgress) {
          this.progress = savedProgress.progress;
        }
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
      
      // Cache the results
      if (this.cache) {
        try {
          await this.cache.set(appId, results, configHash);
          // Clear progress now that we have a complete result
          if (this.analysisId) {
            await this.cache.clearProgress(this.analysisId);
          }
        } catch (error) {
          console.warn('Failed to cache results:', error);
        }
      }

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
    
    // Save progress if we have cache and an analysis ID
    if (this.cache && this.analysisId) {
      await this.cache.saveProgress(
        this.analysisId, 
        'in_progress', 
        this.progress, 
        {}
      );
    }

    try {
      const result = await analyzerFn();
      this.progress[type] = { 
        stage: 'completed', 
        progress: 100,
        details: `Completed ${type} analysis`
      };
      
      // Save updated progress
      if (this.cache && this.analysisId) {
        await this.cache.saveProgress(
          this.analysisId, 
          'in_progress', 
          this.progress, 
          {}
        );
      }
      
      return result;
    } catch (error) {
      this.progress[type] = { 
        stage: 'error', 
        progress: 0, 
        error: error.message,
        details: `Failed to run ${type} analysis: ${error.message}`
      };
      
      // Save error progress
      if (this.cache && this.analysisId) {
        await this.cache.saveProgress(
          this.analysisId, 
          'in_progress', 
          this.progress, 
          {}
        );
      }
      
      throw error;
    }
  }

  getProgress(): Record<string, AnalysisProgress> {
    return { ...this.progress };
  }
  
  /**
   * Cancel the current analysis and clear progress
   */
  async cancelAnalysis(): Promise<void> {
    if (this.cache && this.analysisId) {
      await this.cache.clearProgress(this.analysisId);
      this.analysisId = null;
    }
    
    // Reset progress
    this.progress = {
      patterns: { stage: 'idle', progress: 0 },
      sentiment: { stage: 'idle', progress: 0 },
      topics: { stage: 'idle', progress: 0 }
    };
  }
}
