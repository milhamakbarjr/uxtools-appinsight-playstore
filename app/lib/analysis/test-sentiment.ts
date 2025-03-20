import { SentimentAnalyzer } from './SentimentAnalyzer';
import { PlayStoreScraper } from '../scraper/PlayStoreScraper';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSentimentTest() {
  // First get some reviews using the scraper
  const scraper = new PlayStoreScraper({
    maxReviews: 200,
    batchSize: 100
  });

  const appId = 'com.spotify.music';
  console.log('Fetching reviews for:', appId);

  try {
    const { reviews } = await scraper.scrape(appId);
    console.log(`Fetched ${reviews.length} reviews`);

    // Initialize sentiment analyzer
    const analyzer = new SentimentAnalyzer(50);
    console.log('\nStarting sentiment analysis...');

    // Monitor progress
    const progressInterval = setInterval(() => {
      const progress = analyzer.getProgress();
      console.log(`Status: ${progress.status}`);
      console.log(`Processed: ${progress.processedReviews}/${progress.totalReviews}`);
      console.log(`Current batch: ${progress.currentBatch}\n`);
    }, 1000);

    // Analyze reviews
    const results = await analyzer.analyze(reviews);
    clearInterval(progressInterval);

    // Calculate some statistics
    let totalConfidence = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    results.forEach((result) => {
      totalConfidence += result.confidence;
      if (result.score > 0) positiveCount++;
      else if (result.score < 0) negativeCount++;
      else neutralCount++;
    });

    const stats = {
      averageConfidence: totalConfidence / results.size,
      sentimentDistribution: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      }
    };

    // Save results
    const filename = join(__dirname, `sentiment-results-${appId}-${Date.now()}.json`);
    await writeFile(
      filename, 
      JSON.stringify({
        stats,
        results: Array.from(results.entries())
      }, null, 2),
      'utf-8'
    );

    console.log('\nAnalysis completed!');
    console.log('Statistics:', stats);
    console.log(`Full results saved to: ${filename}`);

  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

console.log('Starting sentiment analysis test...\n');
runSentimentTest().then(() => console.log('\nTest completed!'));
