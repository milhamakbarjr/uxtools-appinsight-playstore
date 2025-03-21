import { PlayStoreScraper } from '../scraper/PlayStoreScraper';
import { AnalysisService } from './AnalysisService';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function saveResults(data: any, filename: string) {
  await writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Results saved to: ${filename}`);
}

async function runTest() {
  console.log('\n==============================================');
  console.log('Starting Combined Analysis Test');
  console.log('==============================================\n');

  // Get reviews
  const appId = 'com.spotify.music';
  const scraper = new PlayStoreScraper({ maxReviews: 200, batchSize: 100 });
  
  console.log('1. Fetching reviews for:', appId);
  const { reviews } = await scraper.scrape(appId);
  console.log(`✓ Fetched ${reviews.length} reviews\n`);

  // Save raw reviews
  const reviewsFile = join(__dirname, `raw-reviews-${Date.now()}.json`);
  await saveResults(reviews, reviewsFile);

  // Run analysis
  console.log('2. Starting combined analysis...');
  const analysisService = new AnalysisService();
  
  let lastProgress = {};
  const progressInterval = setInterval(() => {
    const progress = analysisService.getProgress();
    if (JSON.stringify(progress) !== JSON.stringify(lastProgress)) {
      console.log('\nAnalysis Progress:');
      console.log('----------------------------------------');
      Object.entries(progress).forEach(([analyzer, status]) => {
        console.log(`${analyzer.padEnd(12)}: ${status.stage.padEnd(10)} (${status.progress}%)`);
        if (status.details) console.log(`              ${status.details}`);
      });
      lastProgress = progress;
    }
  }, 1000);

  try {
    const startTime = Date.now();
    
    // Add debug logging for reviews
    console.log('\nDebug: Sample review:', reviews[0]);
    
    const results = await analysisService.analyzeReviews(reviews);
    const endTime = Date.now();
    clearInterval(progressInterval);

    // Add debug logging for results
    console.log('\nDebug: Raw analysis results:');
    console.log('Patterns:', typeof results.patterns, Object.keys(results.patterns).length);
    console.log('Sentiment:', typeof results.sentiment, Object.keys(results.sentiment).length);
    console.log('Topics:', typeof results.topics, Object.keys(results.topics).length);

    // Calculate detailed statistics
    const stats = {
      timing: {
        total: endTime - startTime,
        averagePerReview: (endTime - startTime) / reviews.length
      },
      patterns: {
        count: Object.keys(results.patterns).length,
        types: Object.keys(results.patterns)
      },
      sentiment: {
        distribution: results.sentiment,
        averageScore: typeof results.sentiment === 'object' ? 
          Object.values(results.sentiment).reduce((a: any, b: any) => a + b, 0) / reviews.length : 
          'N/A'
      },
      topics: {
        count: Array.isArray(results.topics) ? 
          results.topics.length : 
          Object.keys(results.topics).length,
        topItems: Array.isArray(results.topics) ? 
          results.topics.slice(0, 5) : 
          Object.entries(results.topics).slice(0, 5)
      }
    };

    // Save results
    const resultsFile = join(__dirname, `analysis-results-${appId}-${Date.now()}.json`);
    await saveResults({ stats, results }, resultsFile);

    // Print summary
    console.log('\n3. Analysis Results:');
    console.log('----------------------------------------');
    console.log('Processing time:', `${stats.timing.total}ms (${stats.timing.averagePerReview.toFixed(2)}ms per review)`);
    console.log('\nPatterns found:', stats.patterns.count);
    console.log('Sentiment score:', stats.sentiment.averageScore);
    console.log('Topics identified:', stats.topics.count);
    
    if (results.stats.errors?.length) {
      console.log('\nErrors encountered:', results.stats.errors.length);
      console.log(results.stats.errors);
    }

  } catch (error) {
    clearInterval(progressInterval);
    console.error('\n❌ Analysis failed:', error.message);
    const errorFile = join(__dirname, `analysis-error-${Date.now()}.json`);
    await saveResults({ error: error.message, timestamp: new Date() }, errorFile);
  }
}

console.log('Analysis test started at:', new Date().toISOString());
runTest()
  .catch(console.error)
  .finally(() => console.log('\nTest completed at:', new Date().toISOString()));
