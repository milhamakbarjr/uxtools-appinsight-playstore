import { PlayStoreScraper } from './PlayStoreScraper';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function extractAppId(url: string): string {
  try {
    if (url.includes('play.google.com')) {
      // Extract from URL like: https://play.google.com/store/apps/details?id=com.spotify.music
      const match = url.match(/id=([\w.]+)/);
      return match ? match[1] : '';
    } else {
      // Treat as direct app ID
      return url.trim();
    }
  } catch (error) {
    return '';
  }
}

async function runTest() {
  // Test apps - you can modify this array
  const appsToTest = [
    'https://play.google.com/store/apps/details?id=com.bareksa.app'
    // 'https://play.google.com/store/apps/details?id=com.spotify.music'
    // 'https://play.google.com/store/apps/details?id=com.instagram.android',
    // 'com.facebook.katana' // Direct app ID
  ];

  for (const app of appsToTest) {
    const appId = extractAppId(app);
    if (!appId) {
      console.error(`Invalid app URL or ID: ${app}`);
      continue;
    }

    console.log('\n==============================================');
    console.log(`Testing scraper for: ${appId}`);
    console.log('==============================================\n');

    const scraper = new PlayStoreScraper({
      maxReviews: 1000, // Reduced for testing
      batchSize: 100
    });

    try {
      // Monitor progress
      const progressInterval = setInterval(() => {
        const progress = scraper.getProgress();
        console.log(`Status: ${progress.status}`);
        console.log(`Reviews fetched: ${progress.fetchedReviews}`);
        console.log(`Current batch: ${progress.currentBatch}`);
        console.log(`Retry count: ${progress.retryCount}\n`);
      }, 1000);

      const result = await scraper.scrape(appId);
      clearInterval(progressInterval);

      console.log('\nScraping Results:');
      console.log('----------------------------------------');
      console.log('Stats:', {
        totalReviews: result.reviews.length,
        successfulBatches: result.stats.successfulBatches,
        failedBatches: result.stats.failedBatches,
        timeElapsed: `${(result.stats.timeElapsed / 1000).toFixed(2)}s`
      });

      if (result.reviews.length > 0) {
        console.log('\nSample Review:');
        console.log('----------------------------------------');
        const sample = result.reviews[0];
        console.log({
          score: sample.score,
          text: sample.text?.substring(0, 100) + '...',
          date: new Date(sample.date).toLocaleDateString()
        });
      }

      // Save results to file
      const filename = join(__dirname, `test-results-${appId}-${Date.now()}.json`);
      await writeFile(filename, JSON.stringify(result, null, 2), 'utf-8');
      console.log(`\nFull results saved to: ${filename}`);

    } catch (error) {
      console.error('\nScraping failed:', error.message);
    }
  }
}

// Run the test
console.log('Starting scraper tests...\n');
runTest().then(() => console.log('\nAll tests completed!'));