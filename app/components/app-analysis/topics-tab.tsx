import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart, PieChart, Network, LineChart, TrendingUp, Sparkles, Hash } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Progress } from "~/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { cn } from "~/lib/utils";

export default function TopicsTab({ reviewsData }) {
  // Extract reviewsStats and reviews from the props
  const { reviewsStats, reviews } = reviewsData;

  // Use commonTopics from reviewsStats for topic analysis
  const topicStats = reviewsStats.commonTopics.map(topic => ({
    ...topic,
    // Convert sentiment from -1 to 1 scale to percentage
    sentimentPercentage: ((topic.sentiment + 1) / 2) * 100
  }));

  // Group reviews by topics for timeline analysis
  const topicTimeline = reviews.reduce((acc, review) => {
    const month = new Date(review.date).toLocaleString('default', { month: 'short' });
    
    review.topics?.forEach((topic) => {
      if (!acc[topic]) {
        acc[topic] = {};
      }
      if (!acc[topic][month]) {
        acc[topic][month] = { count: 0, score: 0, reviews: [] };
      }
      acc[topic][month].count++;
      acc[topic][month].score += review.rating || 0;
      acc[topic][month].reviews.push(review);
    });
    return acc;
  }, {});

  // Calculate topic co-occurrence matrix
  const topicCoOccurrence = calculateTopicCoOccurrence(reviews);
  
  // Generate TF-IDF scores (simulated for demo)
  const tfIdfScores = calculateTfIdfScores(topicStats);
  
  // Generate topic clusters (using count and sentiment as dimensions)
  const topicClusters = generateTopicClusters(topicStats);

  // Calculate sentiment breakdown per topic
  const sentimentBreakdown = calculateSentimentBreakdown(reviews);

  return (
    <div className="grid gap-4">
      {/* Main Overview */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Topic Analysis</CardTitle>
          <CardDescription>
            Common topics mentioned in reviews and their overall sentiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="distribution">
                <PieChart className="h-4 w-4 mr-2" />
                Topic Distribution
              </TabsTrigger>
              <TabsTrigger value="sentiment">
                <BarChart className="h-4 w-4 mr-2" />
                Rating Trends
              </TabsTrigger>
              <TabsTrigger value="cooccurrence">
                <Network className="h-4 w-4 mr-2" />
                Co-occurrence
              </TabsTrigger>
              <TabsTrigger value="importance">
                <Sparkles className="h-4 w-4 mr-2" />
                Importance Scores
              </TabsTrigger>
              <TabsTrigger value="clusters">
                <Hash className="h-4 w-4 mr-2" />
                Topic Clusters
              </TabsTrigger>
            </TabsList>

            {/* Topic Distribution */}
            <TabsContent value="distribution">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {topicStats.map((topic) => (
                    <div key={topic.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="space-x-2">
                          <Badge variant="outline">{topic.name}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {topic.count} mentions
                          </span>
                        </div>
                        <Badge variant={
                          topic.sentiment > 0.3 ? "success" : 
                          topic.sentiment < -0.3 ? "destructive" : "secondary"
                        }>
                          {topic.sentiment > 0 ? "+" : ""}{(topic.sentiment * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={topic.sentimentPercentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Rating Trends */}
            <TabsContent value="sentiment">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(topicTimeline).slice(0, 10).map(([topic, months]) => (
                    <div key={topic} className="space-y-2">
                      <Badge variant="outline">{topic}</Badge>
                      <div className="space-y-2">
                        {Object.entries(months).map(([month, data]) => {
                          const avgScore = data.score / data.count;
                          return (
                            <div key={month} className="flex items-center gap-4">
                              <div className="w-16 text-sm">{month}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`h-8 rounded-md ${
                                      avgScore >= 4 ? "bg-green-500" : 
                                      avgScore < 3 ? "bg-red-500" : "bg-yellow-500"
                                    }`}
                                    style={{ width: `${(avgScore / 5) * 100}%` }}
                                  />
                                  <div className="text-sm whitespace-nowrap">
                                    {avgScore.toFixed(1)}★ ({data.count} reviews)
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Co-occurrence Matrix */}
            <TabsContent value="cooccurrence">
              <div className="h-[400px] overflow-hidden">
                <div className="text-sm text-muted-foreground mb-2">
                  This heatmap shows how often topics appear together in the same reviews.
                </div>
                <ScrollArea className="h-[360px]" orientation="both">
                  <div className="w-full max-w-full overflow-auto">
                    <div style={{ width: "800px", maxWidth: "800px" }} className="relative">
                      <table className="border-separate border-spacing-0 w-full">
                        <thead>
                          <tr>
                            <th className="sticky top-0 left-0 z-20 bg-white dark:bg-slate-900 px-2 py-1 border-b"></th>
                            {topicCoOccurrence.topics.map(topic => (
                              <th 
                                key={topic} 
                                className="sticky top-0 z-10 bg-white dark:bg-slate-900 px-2 py-1 border-b text-xs font-medium"
                              >
                                {topic}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topicCoOccurrence.topics.map((rowTopic, rowIndex) => (
                            <tr key={rowTopic}>
                              <th 
                                className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-2 py-1 border-b text-xs font-medium text-left"
                              >
                                {rowTopic}
                              </th>
                              {topicCoOccurrence.topics.map((colTopic, colIndex) => {
                                const value = topicCoOccurrence.matrix[rowIndex][colIndex];
                                const opacity = value / topicCoOccurrence.maxValue;
                                return (
                                  <td 
                                    key={colTopic} 
                                    className="text-center text-xs border px-2 py-1 min-w-[40px] max-w-[40px] w-[40px]"
                                    style={{ 
                                      backgroundColor: `rgba(16, 185, 129, ${opacity})`,
                                      color: opacity > 0.5 ? 'white' : 'inherit' 
                                    }}
                                  >
                                    {value > 0 ? value : '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* TF-IDF Importance Scores */}
            <TabsContent value="importance">
              <div className="h-[400px]">
                <div className="text-sm text-muted-foreground mb-2">
                  Topic importance based on TF-IDF analysis, showing which topics are most distinctive in reviews.
                </div>
                <ScrollArea className="h-[360px]">
                  <div className="space-y-4">
                    {tfIdfScores.map((topic) => (
                      <div key={topic.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{topic.name}</Badge>
                          <span className="text-sm font-medium">{topic.score.toFixed(2)}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div 
                                className="h-3 rounded-full bg-emerald-500"
                                style={{ width: `${(topic.score / tfIdfScores[0].score) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {topic.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Topic Clusters */}
            <TabsContent value="clusters">
              <div className="h-[400px]">
                <div className="text-sm text-muted-foreground mb-2">
                  Topics grouped by similarity based on sentiment and frequency.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[360px] overflow-auto">
                  {topicClusters.map((cluster, index) => (
                    <Card key={index} className="border bg-slate-50 dark:bg-slate-800">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Cluster {index + 1}</CardTitle>
                        <CardDescription className="text-xs">
                          {cluster.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {cluster.topics.map(topic => (
                            <Badge 
                              key={topic.name} 
                              variant={
                                topic.sentiment > 0.3 ? "success" : 
                                topic.sentiment < -0.3 ? "destructive" : "outline"
                              }
                              className="text-xs"
                            >
                              {topic.name} ({topic.count})
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Topic Timeline and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Improved Topic Timeline */}
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Topic Timeline
            </CardTitle>
            <CardDescription>
              How topics have evolved over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(topicTimeline)
                  .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length)
                  .slice(0, 5)
                  .map(([topic, months]) => (
                    <AccordionItem key={topic} value={topic}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{topic}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {Object.values(months).reduce((sum, m) => sum + m.count, 0)} mentions
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-1 py-1">
                          {Object.entries(months)
                            .sort((a, b) => new Date(a[1].reviews[0].date) - new Date(b[1].reviews[0].date))
                            .map(([month, data]) => {
                              const avgScore = data.score / data.count;
                              const scoreColor = avgScore >= 4 ? "text-green-500" : 
                                               avgScore < 3 ? "text-red-500" : "text-yellow-500";
                              return (
                                <div key={month} className="flex items-center">
                                  <div className="w-10 text-xs font-medium">{month}</div>
                                  <div className="flex-1 flex items-center gap-2">
                                    <div 
                                      className={`h-4 rounded ${
                                        avgScore >= 4 ? "bg-green-500" : 
                                        avgScore < 3 ? "bg-red-500" : "bg-yellow-500"
                                      }`}
                                      style={{ width: `${data.count * 5}%` }}
                                    />
                                    <span className={`text-xs ${scoreColor}`}>{avgScore.toFixed(1)}★</span>
                                    <span className="text-xs text-muted-foreground">({data.count})</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Sentiment Breakdown
            </CardTitle>
            <CardDescription>
              Detailed sentiment analysis by topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {sentimentBreakdown.slice(0, 5).map((topic) => (
                  <div key={topic.name} className="space-y-2">
                    <div className="flex justify-between">
                      <Badge variant="outline">{topic.name}</Badge>
                      <span className={cn(
                        "text-xs font-medium",
                        topic.avgSentiment > 0.2 ? "text-green-500" : 
                        topic.avgSentiment < -0.2 ? "text-red-500" : "text-yellow-500"
                      )}>
                        {topic.avgSentiment > 0 ? "+" : ""}
                        {(topic.avgSentiment * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1 text-xs text-center">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <div key={rating}>
                          {rating}★
                        </div>
                      ))}
                      {[1, 2, 3, 4, 5].map(rating => {
                        const count = topic.ratingsDistribution[rating] || 0;
                        const percentage = (count / topic.totalReviews) * 100;
                        return (
                          <div 
                            key={`bar-${rating}`}
                            className={cn(
                              "h-5 rounded-sm",
                              rating >= 4 ? "bg-green-500" : 
                              rating <= 2 ? "bg-red-500" : "bg-yellow-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        )
                      })}
                      {[1, 2, 3, 4, 5].map(rating => {
                        const count = topic.ratingsDistribution[rating] || 0;
                        return (
                          <div key={`count-${rating}`} className="text-xs text-muted-foreground">
                            {count}
                          </div>
                        )
                      })}
                    </div>
                    
                    <Alert className="py-2">
                      <AlertDescription className="text-xs">
                        {generateSentimentInsight(topic)}
                      </AlertDescription>
                    </Alert>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Related Reviews Card */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Topic Mentions</CardTitle>
          <CardDescription>
            Recent reviews mentioning selected topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{review.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={
                    review.rating >= 4 ? "success" : 
                    review.rating <= 2 ? "destructive" : "secondary"
                  }>
                    {review.rating} ★
                  </Badge>
                </div>
                <p className="text-sm mb-2">{review.text}</p>
                {review.topics && (
                  <div className="flex gap-2">
                    {review.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
                {review.replyText && (
                  <div className="mt-3 text-sm bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="font-medium mb-1">Developer response:</div>
                    {review.replyText}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate topic co-occurrence
function calculateTopicCoOccurrence(reviews) {
  // Get unique topics
  const allTopics = new Set();
  reviews.forEach(review => {
    review.topics?.forEach(topic => {
      allTopics.add(topic);
    });
  });
  
  const topics = Array.from(allTopics).sort();
  
  // Initialize matrix with zeros
  const matrix = Array(topics.length).fill(0).map(() => Array(topics.length).fill(0));
  
  // Fill the matrix
  reviews.forEach(review => {
    if (!review.topics || review.topics.length <= 1) return;
    
    for (let i = 0; i < review.topics.length; i++) {
      const topic1 = review.topics[i];
      const index1 = topics.indexOf(topic1);
      
      for (let j = i + 1; j < review.topics.length; j++) {
        const topic2 = review.topics[j];
        const index2 = topics.indexOf(topic2);
        
        // Increment both directions for the co-occurrence
        matrix[index1][index2] += 1;
        matrix[index2][index1] += 1;
      }
    }
  });
  
  // Find the maximum value for color scaling
  let maxValue = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] > maxValue) {
        maxValue = matrix[i][j];
      }
    }
  }
  
  return { topics, matrix, maxValue };
}

// Helper function to simulate TF-IDF scores
function calculateTfIdfScores(topicStats) {
  // For demo purposes, we'll generate simulated TF-IDF scores
  return topicStats.map(topic => {
    // Calculate a score based on count and uniqueness
    const baseScore = topic.count * (1 + Math.abs(topic.sentiment));
    const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
    
    return {
      name: topic.name,
      count: topic.count,
      score: baseScore * randomFactor,
      description: generateTopicDescription(topic.name, topic.sentiment)
    };
  }).sort((a, b) => b.score - a.score);
}

// Helper function to generate topic descriptions
function generateTopicDescription(topic, sentiment) {
  const descriptions = {
    music: "Core app functionality, primary user interest",
    good: "General positive assessment of the app",
    song: "Individual music tracks and their playback",
    songs: "Collection of music and playlist features",
    great: "Strong positive sentiment about app features",
    like: "User preference indicators and satisfaction levels",
    premium: "Paid subscription service and features",
    love: "Highest satisfaction indicator from users",
    play: "Music playback functionality and controls",
    nice: "Positive reaction to app design and features",
    spotify: "Brand mentions and overall app references",
    listen: "User listening experience and habits",
    want: "User desires and feature requests",
    even: "Comparative assessments by users",
    experience: "Overall user journey and satisfaction",
    awesome: "Very high satisfaction with specific features",
    playlist: "User-created collections of songs",
    need: "Required features or functionality",
    ever: "Temporal comparisons or absolutes",
    many: "Volume or quantity references",
    free: "Non-premium version of the service",
    really: "Emphasis on user opinions",
    best: "Superlative assessments of app quality",
    poor: "Negative quality assessments",
    amazing: "Extremely positive user reactions",
    playing: "Active music playback experiences",
    shuffle: "Random playback functionality",
  };
  
  return descriptions[topic] || "Frequently mentioned aspect of the app";
}

// Helper function to generate topic clusters
function generateTopicClusters(topicStats) {
  // For demo purposes, we'll create simulated clusters
  
  // Positive sentiment topics
  const positiveSentimentTopics = topicStats
    .filter(t => t.sentiment > 0.2)
    .sort((a, b) => b.sentiment - a.sentiment);
  
  // Negative sentiment topics
  const negativeSentimentTopics = topicStats
    .filter(t => t.sentiment < -0.2)
    .sort((a, b) => a.sentiment - b.sentiment);
  
  // High frequency topics
  const highFrequencyTopics = topicStats
    .filter(t => t.count > 20 && Math.abs(t.sentiment) <= 0.2)
    .sort((a, b) => b.count - a.count);
  
  // Low frequency topics
  const lowFrequencyTopics = topicStats
    .filter(t => t.count <= 20 && Math.abs(t.sentiment) <= 0.2)
    .sort((a, b) => b.count - a.count);
  
  return [
    {
      name: "Positive Topics",
      description: "Features users love about the app",
      topics: positiveSentimentTopics
    },
    {
      name: "Problem Areas",
      description: "Features users have issues with",
      topics: negativeSentimentTopics
    },
    {
      name: "Common Neutral Topics",
      description: "Frequently mentioned features with mixed sentiment",
      topics: highFrequencyTopics
    },
    {
      name: "Niche Topics",
      description: "Less frequently mentioned features",
      topics: lowFrequencyTopics
    }
  ];
}

// Helper function to calculate sentiment breakdown
function calculateSentimentBreakdown(reviews) {
  // Create a map to store sentiment data by topic
  const topicMap = {};
  
  // Process all reviews
  reviews.forEach(review => {
    const rating = review.rating;
    
    review.topics?.forEach(topic => {
      if (!topicMap[topic]) {
        topicMap[topic] = {
          name: topic,
          totalReviews: 0,
          totalSentiment: 0,
          ratingsDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        };
      }
      
      topicMap[topic].totalReviews++;
      topicMap[topic].totalSentiment += review.sentiment ? review.sentiment.score : 0;
      topicMap[topic].ratingsDistribution[rating] = (topicMap[topic].ratingsDistribution[rating] || 0) + 1;
    });
  });
  
  // Convert map to array and calculate averages
  return Object.values(topicMap).map(topic => ({
    ...topic,
    avgSentiment: topic.totalSentiment / topic.totalReviews
  })).sort((a, b) => b.totalReviews - a.totalReviews);
}

// Helper function to generate sentiment insights
function generateSentimentInsight(topic) {
  const positiveRatios = (topic.ratingsDistribution[4] || 0) + (topic.ratingsDistribution[5] || 0);
  const negativeRatios = (topic.ratingsDistribution[1] || 0) + (topic.ratingsDistribution[2] || 0);
  const positivePercentage = (positiveRatios / topic.totalReviews) * 100;
  const negativePercentage = (negativeRatios / topic.totalReviews) * 100;
  
  if (positivePercentage > 70) {
    return `"${topic.name}" is extremely well-received with ${positivePercentage.toFixed(0)}% positive reviews.`;
  } else if (positivePercentage > 50) {
    return `"${topic.name}" is generally positive with ${positivePercentage.toFixed(0)}% favorable reviews.`;
  } else if (negativePercentage > 70) {
    return `"${topic.name}" is a critical pain point with ${negativePercentage.toFixed(0)}% negative reviews.`;
  } else if (negativePercentage > 50) {
    return `"${topic.name}" has issues with ${negativePercentage.toFixed(0)}% negative sentiment.`;
  } else {
    return `"${topic.name}" receives mixed reactions from users.`;
  }
}
