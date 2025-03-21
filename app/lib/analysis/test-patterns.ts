import { PatternAnalyzer } from './PatternAnalyzer';
import { PlayStoreScraper } from '../scraper/PlayStoreScraper';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runPatternTest() {
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

    // Initialize pattern analyzer
    const analyzer = new PatternAnalyzer(50);
    console.log('\nStarting pattern analysis...');

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

    // Calculate aggregate statistics
    const stats = {
      totalPatterns: 0,
      avgConfidence: 0,
      topTimePatterns: [],
      topRatingPatterns: [],
      strongestCorrelations: []
    };

    results.forEach((result) => {
      stats.totalPatterns += result.frequencyPatterns.size;
      stats.avgConfidence += result.confidence;
      
      // Collect top patterns
      stats.topTimePatterns.push(...result.timeBasedPatterns);
      stats.topRatingPatterns.push(...result.ratingPatterns);
      stats.strongestCorrelations.push(...result.correlations);
    });

    stats.avgConfidence /= results.size;

    // Save results
    const filename = join(__dirname, `pattern-results-${appId}-${Date.now()}.json`);
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

console.log('Starting pattern analysis test...\n');
runPatternTest().then(() => console.log('\nTest completed!'));
