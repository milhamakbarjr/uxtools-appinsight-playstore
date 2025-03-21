import { CombinedAnalysisResult } from '../types';

// Interfaces matching UI component props
export interface AppData {
  name: string;
  rating: number;
  reviews: number;
  version: string;
}

export interface ReviewsStats {
  total: number;
  distribution: number[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    averageConfidence: number;
  };
  overTime: Array<{
    date: string;
    avg: number;
    count: number;
  }>;
  commonTopics: Array<{
    name: string;
    count: number;
    sentiment: number;
  }>;
}

export interface TransformedReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  version: string;
  device: string;
  likes: number;
  sentiment: {
    score: number;
    comparative: number;
    confidence: number;
    language: string;
  };
  topics: string[];
}

export interface OverviewTabData {
  app: AppData;
  reviewsStats: ReviewsStats;
}

export interface ReviewsTabData {
  reviews: TransformedReview[];
}

export interface TopicsTabData {
  reviewsStats: ReviewsStats;
  reviews: TransformedReview[];
}

export class AnalysisTransformer {
  private rawData: CombinedAnalysisResult;
  private rawReviews: any[];
  private appData: AppData;

  constructor(analysisResult: CombinedAnalysisResult, reviews: any[], appInfo?: Partial<AppData>) {
    this.rawData = analysisResult;
    this.rawReviews = reviews;
    
    // Default app data that can be overridden
    this.appData = {
      name: 'Spotify',
      rating: this.calculateAverageRating(),
      reviews: reviews.length,
      version: 'Latest',
      ...appInfo
    };
  }

  /**
   * Calculate average rating from reviews
   */
  private calculateAverageRating(): number {
    if (!this.rawReviews.length) return 0;
    const sum = this.rawReviews.reduce((acc, review) => acc + (review.score || 0), 0);
    return parseFloat((sum / this.rawReviews.length).toFixed(1));
  }

  /**
   * Transform data for Overview tab
   */
  getOverviewTabData(): OverviewTabData {
    // For overview tab, we need time-based data and statistics
    const reviewsStats = this.getReviewsStats();
    
    // Ensure we have proper overTime data for the overview tab
    if (!reviewsStats.overTime || reviewsStats.overTime.length === 0) {
      reviewsStats.overTime = this.generateTimeBasedData();
    }
    
    return {
      app: this.appData,
      reviewsStats: reviewsStats
    };
  }

  /**
   * Transform data for Reviews tab
   */
  getReviewsTabData(): ReviewsTabData {
    // For reviews tab, we just need the transformed reviews
    const transformedReviews = this.transformReviews();
    
    return {
      reviews: transformedReviews
    };
  }

  /**
   * Transform data for Topics tab
   */
  getTopicsTabData(): TopicsTabData {
    // For topics tab, we need both reviews and stats with emphasis on topics
    const reviewsStats = this.getReviewsStats();
    
    // For topics tab, we might want to highlight reviews mentioning top topics
    const allReviews = this.transformReviews();
    const topTopics = reviewsStats.commonTopics.map(t => t.name);
    
    // Filter reviews to prioritize those mentioning top topics
    const reviewsWithTopics = allReviews
      .filter(review => {
        // Reviews with at least one of the top topics
        return review.topics.some(topic => topTopics.includes(topic));
      })
      .sort((a, b) => {
        // Sort by number of top topics mentioned (descending)
        const aTopicCount = a.topics.filter(t => topTopics.includes(t)).length;
        const bTopicCount = b.topics.filter(t => topTopics.includes(t)).length;
        return bTopicCount - aTopicCount;
      });
    
    // Combine topic-relevant reviews with some general reviews
    const topicTabReviews = [
      ...reviewsWithTopics,
      ...allReviews.filter(r => !reviewsWithTopics.includes(r))
    ].slice(0, allReviews.length); // Ensure we don't duplicate
    
    return {
      reviewsStats: reviewsStats,
      reviews: topicTabReviews
    };
  }

  /**
   * Get transformed reviews stats needed by multiple tabs
   */
  private getReviewsStats(): ReviewsStats {
    // Calculate rating distribution
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    this.rawReviews.forEach(review => {
      const rating = Math.floor(review.score);
      if (rating >= 1 && rating <= 5) {
        distribution[rating - 1]++;
      }
    });

    // Extract sentiment data
    const sentiment = this.rawData.sentiment;
    const sentimentStats = {
      positive: parseFloat((sentiment.distribution?.positive || 0).toFixed(1)),
      negative: parseFloat((sentiment.distribution?.negative || 0).toFixed(1)),
      neutral: parseFloat((sentiment.distribution?.neutral || 0).toFixed(1)),
      averageConfidence: 0.85 // Mock value, could be calculated from the data
    };

    // Generate time-based data from raw reviews
    const overTime = this.generateTimeBasedData();

    // Extract top topics with sentiment
    let topTopics = [];
    try {
      // Use topics from analysis results if available
      if (this.rawData.topics && this.rawData.topics.frequent) {
        topTopics = this.rawData.topics.frequent.map(topic => ({
          name: topic.topic || topic.name,
          count: topic.count || 0,
          sentiment: this.normalizeRatingToSentiment(topic.avgRating || 3)
        }));
      } else if (this.rawData.topics && this.rawData.topics.list) {
        // Fallback to list if frequent isn't available
        topTopics = this.rawData.topics.list.map(topic => ({
          name: topic.topic || topic.name,
          count: topic.count || 0,
          sentiment: this.normalizeRatingToSentiment(topic.avgRating || 3)
        }));
      }
    } catch (error) {
      console.error('Error processing topics:', error);
      topTopics = [];
    }

    return {
      total: this.rawReviews.length,
      distribution,
      sentiment: sentimentStats,
      overTime,
      commonTopics: topTopics.slice(0, 10) // Limit to top 10 topics
    };
  }

  /**
   * Generate time-based data for charts
   */
  private generateTimeBasedData(): Array<{ date: string; avg: number; count: number }> {
    // Group reviews by month
    const monthData = new Map<string, { total: number; count: number }>();
    
    // Process each review to extract time data
    this.rawReviews.forEach(review => {
      try {
        const date = new Date(review.date);
        
        // Skip invalid dates
        if (isNaN(date.getTime())) return;
        
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthData.has(monthKey)) {
          monthData.set(monthKey, { total: 0, count: 0 });
        }
        
        const data = monthData.get(monthKey)!;
        data.total += review.score;
        data.count += 1;
      } catch (error) {
        // Skip reviews with date processing errors
        console.error('Error processing review date:', error);
      }
    });
    
    // If no valid time data was found, create a mock entry
    if (monthData.size === 0) {
      const currentDate = new Date();
      const monthKey = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      monthData.set(monthKey, { 
        total: this.rawReviews.reduce((sum, r) => sum + r.score, 0),
        count: this.rawReviews.length
      });
    }
    
    // Sort by date and format for chart
    return Array.from(monthData.entries())
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          date: `${this.getMonthName(parseInt(month))} ${year}`,
          avg: parseFloat((data.total / data.count).toFixed(1)),
          count: data.count
        };
      });
  }

  /**
   * Get month name from month number
   */
  private getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  /**
   * Get sentiment score for a review
   */
  private getSentimentScoreForReview(review: any): number {
    // Try to derive sentiment from the rating
    // Normalize from 1-5 scale to -5 to 5 scale
    return (review.score - 3) * 2;
  }

  /**
   * Normalize a 1-5 rating to a -1 to 1 sentiment score
   */
  private normalizeRatingToSentiment(rating: number): number {
    return (rating - 3) / 2; // Convert 1-5 to -1 to 1
  }

  /**
   * Transform raw reviews to format needed by UI
   */
  private transformReviews(): TransformedReview[] {
    return this.rawReviews.map((review, index) => {
      // Find topics mentioned in this review
      const reviewText = (review.text || "").toLowerCase();
      let mentionedTopics: string[] = [];
      
      try {
        // Extract topics from analysis data
        if (this.rawData.topics && this.rawData.topics.list) {
          mentionedTopics = this.rawData.topics.list
            .filter(topic => {
              const topicName = (topic.topic || topic.name || "").toLowerCase();
              return topicName && reviewText.includes(topicName);
            })
            .map(topic => topic.topic || topic.name)
            .slice(0, 5);
        }
      } catch (error) {
        console.error('Error extracting topics for review:', error);
        mentionedTopics = [];
      }

      // Calculate sentiment score for this review
      const sentimentScore = this.getSentimentScoreForReview(review);

      return {
        id: review.id || `review-${index}`,
        author: review.userName || 'Anonymous User',
        date: review.date || new Date().toISOString(),
        rating: review.score,
        text: review.text || "",
        version: review.version || 'Unknown',
        device: review.device || 'Android Device',
        likes: review.thumbsUp || Math.floor(Math.random() * 10),
        sentiment: {
          score: sentimentScore,
          comparative: sentimentScore / 5, // Normalize to -1 to 1 range
          confidence: 0.8 + (Math.random() * 0.15), // Mock confidence
          language: 'en'
        },
        topics: mentionedTopics
      };
    });
  }

  /**
   * Filter reviews by criteria
   */
  filterReviews(criteria: {
    search?: string;
    rating?: number;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'all';
    dateRange?: string;
  }): TransformedReview[] {
    let filtered = this.transformReviews();
    
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(review => 
        review.text.toLowerCase().includes(searchTerm) || 
        review.author.toLowerCase().includes(searchTerm)
      );
    }
    
    if (criteria.rating && criteria.rating > 0) {
      filtered = filtered.filter(review => Math.floor(review.rating) === criteria.rating);
    }
    
    if (criteria.sentiment && criteria.sentiment !== 'all') {
      filtered = filtered.filter(review => {
        const normalizedScore = review.sentiment.score / 5;
        if (criteria.sentiment === 'positive') return normalizedScore > 0.3;
        if (criteria.sentiment === 'negative') return normalizedScore < -0.3;
        if (criteria.sentiment === 'neutral') {
          return normalizedScore >= -0.3 && normalizedScore <= 0.3;
        }
        return true;
      });
    }
    
    if (criteria.dateRange && criteria.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      if (criteria.dateRange === 'lastWeek') {
        startDate.setDate(now.getDate() - 7);
      } else if (criteria.dateRange === 'lastMonth') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (criteria.dateRange === 'last3Months') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (criteria.dateRange === 'last6Months') {
        startDate.setMonth(now.getMonth() - 6);
      } else if (criteria.dateRange === 'lastYear') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(review => new Date(review.date) >= startDate);
    }
    
    return filtered;
  }

  /**
   * Sort reviews by criteria
   */
  sortReviews(
    reviews: TransformedReview[], 
    sortBy: 'date' | 'rating' | 'likes' = 'date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): TransformedReview[] {
    return [...reviews].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      } else if (sortBy === 'likes') {
        comparison = a.likes - b.likes;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }
}
