import { TopicAnalyzer } from './TopicAnalyzer';
import { PlayStoreScraper } from '../scraper/PlayStoreScraper';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTopicTest() {
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

    // Initialize topic analyzer
    const analyzer = new TopicAnalyzer(50);
    console.log('\nStarting topic analysis...');

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
    let totalTopics = 0;
    let totalPhrases = 0;
    let topFrequentTopics = new Map<string, number>();

    results.forEach((result) => {
      totalTopics += result.topics.size;
      totalPhrases += result.keyPhrases.length;
      
      // Merge topics for frequency analysis
      result.topics.forEach((count, topic) => {
        topFrequentTopics.set(topic, (topFrequentTopics.get(topic) || 0) + count);
      });
    });

    const stats = {
      averageTopicsPerBatch: totalTopics / results.size,
      averagePhrasesPerBatch: totalPhrases / results.size,
      topTopics: Array.from(topFrequentTopics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    };

    // Save results
    const filename = join(__dirname, `topic-results-${appId}-${Date.now()}.json`);
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

console.log('Starting topic analysis test...\n');
runTopicTest().then(() => console.log('\nTest completed!'));
