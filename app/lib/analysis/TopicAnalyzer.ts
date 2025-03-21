import { AnalysisProgress } from './types';
import natural from 'natural';

export interface TopicResult {
  topics: Map<string, number>;
  ngrams: Map<string, number>;
  keyPhrases: string[];
  tfidf: Map<string, number>;
  confidence: number;
}

export interface BatchProgress {
  processedReviews: number;
  totalReviews: number;
  currentBatch: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
}

export class TopicAnalyzer {
  private batchSize: number;
  private progress: AnalysisProgress;
  private tokenizer: any;
  private stopwords: Set<string>;
  
  constructor(batchSize: number = 50) {
    this.batchSize = batchSize;
    this.tokenizer = new natural.WordTokenizer();
    this.stopwords = new Set([
      'the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'it', 'for', 
      'with', 'as', 'was', 'on', 'are', 'at', 'be', 'this', 'have', 'from',
      'or', 'had', 'by', 'but', 'not', 'what', 'all', 'were', 'when', 'we',
      'there', 'been', 'you', 'would', 'your', 'they', 'their', 'has', 'can',
      'an', 'said', 'which', 'its', 'some', 'if', 'who', 'will', 'more',
      'about', 'very', 'much', 'only', 'how', 'them', 'than', 'just'
    ]);
    this.progress = {
      stage: 'idle',
      progress: 0
    };
  }

  async analyze(reviews: any[]) {
    this.progress = { 
      stage: 'running', 
      progress: 0,
      details: 'Extracting topics from reviews...'
    };
    
    try {
      // Storage for analysis
      const topicFrequency = new Map<string, number>();
      const phraseFrequency = new Map<string, number>();
      const tfidf = new natural.TfIdf();
      
      // Step 1: Process each review and extract tokens
      reviews.forEach((review, i) => {
        const tokens = this.tokenizer.tokenize(review.text.toLowerCase())
          .filter(token => token.length > 3 && !this.stopwords.has(token));
        
        // Add to TF-IDF
        tfidf.addDocument(tokens);
        
        // Count token frequencies
        tokens.forEach(token => {
          topicFrequency.set(token, (topicFrequency.get(token) || 0) + 1);
        });
        
        // Extract n-grams (phrases)
        for (let n = 2; n <= 4; n++) {
          if (tokens.length >= n) {
            for (let j = 0; j <= tokens.length - n; j++) {
              const phrase = tokens.slice(j, j + n).join(' ');
              if (phrase.length >= 8) { // Minimum length for a meaningful phrase
                phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
              }
            }
          }
        }
        
        this.progress.progress = Math.round((i + 1) / reviews.length * 70);
      });
      
      // Step 2: Find key terms using TF-IDF
      const keyTerms = [];
      const documentsCount = tfidf.documents.length;
      
      for (let i = 0; i < documentsCount; i++) {
        const items = tfidf.listTerms(i).slice(0, 5);
        items.forEach(item => {
          keyTerms.push({
            term: item.term,
            tfidf: item.tfidf,
            documentIndex: i
          });
        });
        
        if (i % 10 === 0) {
          this.progress.progress = 70 + Math.round((i / documentsCount) * 20);
        }
      }
      
      // Step 3: Sort and prepare results
      const sortedTopics = Array.from(topicFrequency.entries())
        .filter(([topic, count]) => count > 1) // Must appear more than once
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
      
      const sortedPhrases = Array.from(phraseFrequency.entries())
        .filter(([phrase, count]) => count > 1) // Must appear more than once
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([phrase, count]) => ({ phrase, count }));
      
      // Group topics by rating
      const topicsByRating = new Map<string, number[]>();
      sortedTopics.forEach(([topic]) => {
        topicsByRating.set(topic, []);
      });
      
      reviews.forEach(review => {
        const text = review.text.toLowerCase();
        sortedTopics.forEach(([topic]) => {
          if (text.includes(topic)) {
            topicsByRating.get(topic)?.push(review.score);
          }
        });
      });
      
      // Calculate average rating for each topic
      const topicsWithRating = sortedTopics.map(([topic, count]) => {
        const ratings = topicsByRating.get(topic) || [];
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, score) => sum + score, 0) / ratings.length
          : 0;
        
        return {
          topic,
          count,
          avgRating,
          ratingsCount: ratings.length
        };
      });
      
      this.progress.progress = 100;
      
      return {
        topics: topicsWithRating,
        phrases: sortedPhrases,
        keyTerms: keyTerms.slice(0, 20),
        topFrequent: topicsWithRating.slice(0, 10)
      };
    } catch (error) {
      this.progress = { 
        stage: 'error', 
        progress: 0, 
        error: error.message,
        details: `Topic analysis failed: ${error.message}`
      };
      throw error;
    }
  }

  getProgress(): AnalysisProgress {
    return { ...this.progress };
  }
}
