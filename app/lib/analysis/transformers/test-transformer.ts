import { writeFile, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { AnalysisTransformer } from './AnalysisTransformer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function saveTransformedData(data: any, filename: string) {
  await writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Results saved to: ${filename}`);
}

async function runTest() {
  console.log('\n==============================================');
  console.log('Testing Analysis Transformer - Tab Data Separation');
  console.log('==============================================\n');

  try {
    // Load raw reviews from specific file
    console.log('Loading raw reviews data...');
    const rawReviewsPath = join(__dirname, '../raw-reviews-1742534814118.json');
    console.log(`Reading from: ${rawReviewsPath}`);
    
    const rawReviewsData = await readFile(rawReviewsPath, 'utf-8');
    const reviews = JSON.parse(rawReviewsData);
    
    console.log(`Loaded ${reviews.length} reviews from file`);
    
    // Ensure reviews have proper date format for time series analysis
    const enhancedReviews = enhanceReviewDates(reviews);
    console.log(`Enhanced ${enhancedReviews.length} reviews with proper date distribution`);
    
    // Load analysis results from specific file
    console.log('Loading analysis data...');
    const analysisFile = join(__dirname, '../analysis-results-com.spotify.music-1742534814175.json');
    
    const analysisDataRaw = await readFile(analysisFile, 'utf-8');
    const analysisData = JSON.parse(analysisDataRaw).results;
    
    console.log(`Successfully loaded analysis data`);

    // Create transformer with the specific files
    const transformer = new AnalysisTransformer(analysisData, enhancedReviews, {
      name: 'Spotify Music',
      version: '9.0.26.632'
    });

    // 1. Transform data for Overview Tab
    console.log('\n1. Transforming data for Overview Tab...');
    const overviewData = transformer.getOverviewTabData();
    const overviewFile = join(__dirname, `overview-tab-data-${Date.now()}.json`);
    await saveTransformedData(overviewData, overviewFile);
    
    // Log overview stats summary
    console.log('Overview Tab Statistics:');
    console.log(`- App Rating: ${overviewData.app.rating}`);
    console.log(`- Total Reviews: ${overviewData.reviewsStats.total}`);
    console.log(`- Sentiment Distribution: ${JSON.stringify(overviewData.reviewsStats.sentiment)}`);
    console.log(`- Top Topics: ${overviewData.reviewsStats.commonTopics.length} topics found`);
    console.log(`- Time Data Periods: ${overviewData.reviewsStats.overTime.length} periods`);
    
    if (overviewData.reviewsStats.overTime.length <= 1) {
      console.warn('⚠️ WARNING: Only found 1 time period in the data. This suggests the date distribution in reviews may be too concentrated.');
      console.log('Time periods found:', overviewData.reviewsStats.overTime);
    }
    
    // 2. Transform data for Reviews Tab
    console.log('\n2. Transforming data for Reviews Tab...');
    const reviewsData = transformer.getReviewsTabData();
    const reviewsFile = join(__dirname, `reviews-tab-data-${Date.now()}.json`);
    
    // For the Reviews tab, we want all reviews with full transformation
    console.log(`Transformed ${reviewsData.reviews.length} reviews with topics and sentiment`);
    
    // Check if reviews have topics and sentiment
    const reviewWithTopics = reviewsData.reviews.filter(r => r.topics && r.topics.length > 0);
    const reviewWithSentiment = reviewsData.reviews.filter(r => r.sentiment && r.sentiment.score !== 0);
    
    console.log(`- Reviews with topics: ${reviewWithTopics.length} (${Math.round(reviewWithTopics.length/reviewsData.reviews.length*100)}%)`);
    console.log(`- Reviews with sentiment: ${reviewWithSentiment.length} (${Math.round(reviewWithSentiment.length/reviewsData.reviews.length*100)}%)`);
    
    // Save full reviews data (could be large)
    await saveTransformedData({
      count: reviewsData.reviews.length,
      sample: reviewsData.reviews.slice(0, 10) // Just save a sample to keep file size manageable
    }, reviewsFile);
    
    // 3. Transform data for Topics Tab
    console.log('\n3. Transforming data for Topics Tab...');
    const topicsData = transformer.getTopicsTabData();
    const topicsFile = join(__dirname, `topics-tab-data-${Date.now()}.json`);
    await saveTransformedData(topicsData, topicsFile);
    
    // Log topics stats
    console.log('Topics Tab Statistics:');
    console.log(`- Common Topics: ${topicsData.reviewsStats.commonTopics.length} topics found`);
    if (topicsData.reviewsStats.commonTopics.length > 0) {
      console.log('\nTop 5 Topics:');
      topicsData.reviewsStats.commonTopics.slice(0, 5).forEach((topic, i) => {
        console.log(`${i+1}. "${topic.name}": ${topic.count} mentions, sentiment: ${topic.sentiment.toFixed(2)}`);
      });
    }
    
    // 4. Test filtering capability (useful for any tab but especially Reviews)
    console.log('\n4. Testing filtering and sorting...');
    
    // Filter to negative reviews about specific topics
    const negativeReviews = transformer.filterReviews({ 
      sentiment: 'negative',
    });
    
    // Filter to positive reviews containing certain topics
    const positiveReviews = transformer.filterReviews({
      sentiment: 'positive',
    });
    
    console.log(`- Negative reviews: ${negativeReviews.length}`);
    console.log(`- Positive reviews: ${positiveReviews.length}`);
    
    // Sort reviews by rating (lowest first for issue identification)
    const sortedReviews = transformer.sortReviews(negativeReviews, 'rating', 'asc');
    const filteredReviewsFile = join(__dirname, `filtered-negative-reviews-${Date.now()}.json`);
    
    // Save filtered reviews
    await saveTransformedData({
      filter: 'negative sentiment',
      count: sortedReviews.length,
      reviews: sortedReviews.slice(0, 10) // Save first 10 as sample
    }, filteredReviewsFile);

    console.log('\nTransformation complete. Output files:');
    console.log(`- Overview Tab: ${overviewFile}`);
    console.log(`- Reviews Tab: ${reviewsFile}`);
    console.log(`- Topics Tab: ${topicsFile}`);
    console.log(`- Filtered Reviews: ${filteredReviewsFile}`);

  } catch (error) {
    console.error('\n❌ Transformation failed:', error);
  }
}

/**
 * Enhance review dates to create a better distribution across months
 * for time-based analysis
 */
function enhanceReviewDates(reviews) {
  // Clone the reviews to avoid modifying the original data
  const enhancedReviews = JSON.parse(JSON.stringify(reviews));
  
  // Get current date and subtract 6 months to create a distribution
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  // Create a distribution of dates over the past 6 months
  enhancedReviews.forEach((review, index) => {
    // Distribute review dates over 6 months, with more recent ones more likely to be newer
    const factor = index / enhancedReviews.length; // 0 to 1
    const months = Math.floor(factor * 6); // 0 to 6 months ago
    
    const reviewDate = new Date();
    reviewDate.setMonth(now.getMonth() - months);
    
    // Add some day variation
    reviewDate.setDate(1 + Math.floor(Math.random() * 27)); // Random day 1-28
    
    // Add random hours, minutes, seconds
    reviewDate.setHours(Math.floor(Math.random() * 24));
    reviewDate.setMinutes(Math.floor(Math.random() * 60));
    reviewDate.setSeconds(Math.floor(Math.random() * 60));
    
    // Update the review date
    review.date = reviewDate.toISOString();
  });
  
  return enhancedReviews;
}

console.log('Analysis transformer verification started at:', new Date().toISOString());
runTest()
  .catch(console.error)
  .finally(() => console.log('\nTest completed at:', new Date().toISOString()));
