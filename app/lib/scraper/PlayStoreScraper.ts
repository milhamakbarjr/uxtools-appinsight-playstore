import gplay from 'google-play-scraper';
import { ScraperConfig, ScrapingProgress, ScrapingResult } from './types';

export class PlayStoreScraper {
  private config: ScraperConfig;
  private progress: ScrapingProgress;

  constructor(config?: Partial<ScraperConfig>) {
    this.config = {
      batchSize: 100,
      maxRetries: 3,
      maxReviews: 1000,
      timeoutMs: 10000,
      backoffMs: 1000,
      ...config
    };

    this.progress = {
      totalReviews: 0,
      fetchedReviews: 0,
      currentBatch: 0,
      retryCount: 0,
      status: 'idle'
    };
  }

  private async fetchBatch(appId: string, offset: number): Promise<any[]> {
    try {
      this.progress.currentBatch = Math.floor(offset / this.config.batchSize) + 1;
      
      const result = await Promise.race([
        gplay.reviews({
          appId,
          sort: gplay.sort.NEWEST,
          num: this.config.batchSize,
          offset
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.config.timeoutMs)
        )
      ]);

      if (!result || !Array.isArray(result.data)) {
        throw new Error('Empty response');
      }

      this.progress.fetchedReviews += result.data.length;
      return result.data;
    } catch (error) {
      if (this.progress.retryCount < this.config.maxRetries) {
        this.progress.retryCount++;
        const backoffTime = this.config.backoffMs * Math.pow(2, this.progress.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.fetchBatch(appId, offset);
      }
      throw error;
    }
  }

  async scrape(appId: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    const stats = {
      totalReviews: 0,
      successfulBatches: 0,
      failedBatches: 0,
      retryAttempts: 0,
      timeElapsed: 0
    };

    this.progress = {
      totalReviews: 0,
      fetchedReviews: 0,
      currentBatch: 0,
      retryCount: 0,
      status: 'running'
    };

    const reviews: any[] = [];
    
    try {
      let offset = 0;
      let consecutiveEmptyResponses = 0;

      while (reviews.length < this.config.maxReviews) {
        try {
          const batch = await this.fetchBatch(appId, offset);
          
          if (batch.length === 0) {
            consecutiveEmptyResponses++;
            if (consecutiveEmptyResponses >= 3) {
              break;
            }
          } else {
            consecutiveEmptyResponses = 0;
            reviews.push(...batch);
            stats.successfulBatches++;
            this.progress.totalReviews = reviews.length;
          }
          
          offset += this.config.batchSize;
        } catch (error) {
          stats.failedBatches++;
          console.error(`Batch failed at offset ${offset}:`, error.message);
          if (error.message === 'Timeout' || error.message.includes('rate limit')) {
            break;
          }
        }
      }

      this.progress.status = 'completed';
    } catch (error) {
      this.progress.status = 'error';
      this.progress.error = error.message;
      throw error;
    } finally {
      stats.timeElapsed = Date.now() - startTime;
      stats.totalReviews = reviews.length;
      stats.retryAttempts = this.progress.retryCount;
    }

    return { appId, reviews, stats };
  }

  getProgress(): ScrapingProgress {
    return { ...this.progress };
  }
}