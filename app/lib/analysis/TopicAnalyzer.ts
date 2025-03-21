import natural from 'natural';
import { franc } from 'franc';

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
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
  private progress: BatchProgress;
  private batchSize: number;
  private stopwords: Set<string>;

  constructor(batchSize = 100) {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.batchSize = batchSize;
    this.progress = {
      processedReviews: 0,
      totalReviews: 0,
      currentBatch: 0,
      status: 'idle'
    };
    
    // Initialize stopwords
    this.stopwords = new Set([
      'the', 'is', 'at', 'which', 'on', 'app', 'apps', 'good',
      'bad', 'very', 'too', 'and', 'or', 'but', 'for', 'with',
      'this', 'that', 'its', "it's", 'was', 'were', 'be', 'been'
    ]);
  }

  private processText(text: string): string[] {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    return tokens.filter(token => 
      token.length > 2 && // Ignore short tokens
      !this.stopwords.has(token) && // Remove stopwords
      /^[a-z]+$/i.test(token) // Only keep alphabetic tokens
    );
  }

  private extractNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  private async analyzeBatch(reviews: { text: string; score: number }[]): Promise<TopicResult> {
    const topics = new Map<string, number>();
    const ngrams = new Map<string, number>();
    
    // Process each review in the batch
    reviews.forEach(review => {
      const tokens = this.processText(review.text);
      
      // Add to TF-IDF
      this.tfidf.addDocument(tokens);
      
      // Process unigrams (single words)
      tokens.forEach(token => {
        topics.set(token, (topics.get(token) || 0) + 1);
      });
      
      // Process bigrams
      this.extractNGrams(tokens, 2).forEach(bigram => {
        ngrams.set(bigram, (ngrams.get(bigram) || 0) + 1);
      });
    });

    // Extract key phrases using TF-IDF scores
    const keyPhrases = this.extractKeyPhrases(topics);
    
    // Calculate TF-IDF scores for all terms
    const tfidf = this.calculateTfidfScores();

    return {
      topics,
      ngrams,
      keyPhrases,
      tfidf,
      confidence: this.calculateConfidence(topics, ngrams)
    };
  }

  private extractKeyPhrases(topics: Map<string, number>): string[] {
    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  private calculateTfidfScores(): Map<string, number> {
    const scores = new Map<string, number>();
    this.tfidf.listTerms(0).forEach(item => {
      scores.set(item.term, item.tfidf);
    });
    return scores;
  }

  private calculateConfidence(topics: Map<string, number>, ngrams: Map<string, number>): number {
    const topicCount = topics.size;
    const ngramCount = ngrams.size;
    
    // Basic confidence calculation based on topic diversity
    const diversity = (topicCount + ngramCount) / (this.batchSize * 2);
    return Math.min(diversity, 1);
  }

  async analyze(reviews: { text: string; score: number }[]): Promise<Map<number, TopicResult>> {
    const results = new Map<number, TopicResult>();
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
        
        const result = await this.analyzeBatch(batch);
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
