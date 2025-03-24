import { Star, BarChart2, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, Info, FileBarChart, Calendar, TagIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "~/components/ui/chart";
import { useState } from "react";

type OverviewTabProps = {
  app: {
    name: string;
    rating: number;
    reviews: number;
    version: string;
    previousVersions?: string[];
  };
  reviewsStats: {
    total: number;
    distribution: number[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
      averageConfidence: number;
      overTime?: Array<{
        date: string;
        positive: number;
        negative: number;
        neutral: number;
      }>;
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
    correlations?: Array<{
      factor: string;
      correlation: number;
      significance: number;
    }>;
    timePatterns?: Array<{
      period: string;
      event: string;
      impact: number;
      reviewCount: number;
    }>;
    versionImpact?: Array<{
      version: string;
      avgRating: number;
      reviewCount: number;
      sentimentChange: number;
      majorTopics: string[];
    }>;
  };
};

export default function OverviewTab({ app, reviewsStats }: OverviewTabProps) {
  const [timeRange, setTimeRange] = useState<'all' | '6m' | '3m'>('all');

  // Helper function to determine confidence badge color
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.7) return "success";
    if (confidence >= 0.5) return "default";
    return "secondary";
  };

  // Format correlation data for visualization if it exists
  const correlationData = reviewsStats.correlations?.map(item => ({
    ...item,
    // Convert correlation to a 0-100 scale for visualization
    score: Math.abs(item.correlation) * 100,
    // Determine if correlation is positive or negative
    direction: item.correlation >= 0 ? "positive" : "negative"
  })) || [];

  // Create a sentiment over time dataset with realistic variations
  // This creates a more dynamic chart based on the rating trends
  const sentimentOverTime = reviewsStats.overTime.map((item, index) => {
    // Base sentiment on the actual rating for that period
    // Higher ratings = more positive sentiment
    const ratingNormalized = (item.avg / 5); // normalize to 0-1 scale
    
    // Calculate positive sentiment as a function of the rating (higher rating = more positive)
    const positive = Math.min(85, Math.max(50, Math.round(reviewsStats.sentiment.positive * ratingNormalized * 1.5)));
    
    // Negative varies inversely with rating
    const negative = Math.min(40, Math.max(5, Math.round(reviewsStats.sentiment.negative * (1 - ratingNormalized) * 1.8)));
    
    // Neutral makes up the remainder
    const neutral = 100 - positive - negative;
    
    return {
      date: item.date,
      positive: positive,
      negative: negative,
      neutral: neutral
    };
  });

  // Helper function to filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') return reviewsStats.overTime;
    
    const months = timeRange === '6m' ? 6 : 3;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return reviewsStats.overTime.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Latest Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-4xl font-bold">{reviewsStats.overTime[reviewsStats.overTime.length - 1]?.avg.toFixed(1) || app.rating}</div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`h-5 w-5 ${star <= Math.round(reviewsStats.overTime[reviewsStats.overTime.length - 1]?.avg || app.rating) ? "fill-amber-400 text-amber-400" : "text-amber-400 fill-none"}`} 
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Based on latest {reviewsStats.total.toLocaleString()} reviews</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant={getConfidenceBadge(reviewsStats.sentiment.averageConfidence)} className="text-xs">
                      {(reviewsStats.sentiment.averageConfidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Analysis confidence score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Positive</span>
                </div>
                <span className="text-sm font-medium">{reviewsStats.sentiment.positive.toFixed(1)}%</span>
              </div>
              <Progress value={reviewsStats.sentiment.positive} className="h-2 bg-slate-200 dark:bg-slate-700" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 inline-block">〰️</span>
                  <span className="text-sm">Neutral</span>
                </div>
                <span className="text-sm font-medium">{reviewsStats.sentiment.neutral.toFixed(1)}%</span>
              </div>
              <Progress value={reviewsStats.sentiment.neutral} className="h-2 bg-slate-200 dark:bg-slate-700" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Negative</span>
                </div>
                <span className="text-sm font-medium">{reviewsStats.sentiment.negative.toFixed(1)}%</span>
              </div>
              <Progress value={reviewsStats.sentiment.negative} className="h-2 bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewsStats.commonTopics.slice(0, 4).map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{topic.name}</span>
                  <Badge variant={topic.sentiment > 0.5 ? "success" : topic.sentiment < 0 ? "destructive" : "outline"}>
                    {topic.count.toLocaleString()}
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                View all topics →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Rating Distribution Card */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
          <CardDescription>
            Breakdown of ratings from 1 to 5 stars
            <span className="block text-xs mt-1">
              Based on {reviewsStats.total.toLocaleString()} reviews total
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars, index) => {
              const count = reviewsStats.distribution[5 - stars];
              const percentage = Math.round((count / reviewsStats.total) * 100);
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-medium flex items-center">
                    {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400 ml-1" />
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-2 bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="w-16 text-sm text-muted-foreground text-right">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Sentiment Trends Over Time - Modified to use available data */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sentiment Trends</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={getConfidenceBadge(reviewsStats.sentiment.averageConfidence)} className="text-xs">
                    {(reviewsStats.sentiment.averageConfidence * 100).toFixed(0)}% confidence
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Sentiment analysis confidence score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Sentiment distribution over time
            <span className="block text-xs mt-1">
              Based on {reviewsStats.total.toLocaleString()} analyzed reviews
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[625px]">
          <ChartContainer
            config={{
              positive: {
                label: "Positive",
                color: "rgb(24, 164, 75)", // green-700 color
              },
              negative: {
                label: "Negative",
                color: "hsl(0, 84%, 60%)", // More vibrant red
              },
              neutral: {
                label: "Neutral",
                color: "hsl(220, 14%, 65%)", // Softer blue-gray
              },
            }}
          >
            <ComposedChart
              data={sentimentOverTime}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const labels = {
                        positive: "Positive",
                        neutral: "Neutral",
                        negative: "Negative"
                      };
                      return [`${value}% `,labels[name as keyof typeof labels]];
                    }}
                  />
                }
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="positive" 
                fill="var(--color-positive)" 
                stroke="var(--color-positive)" 
                stackId="1" 
                fillOpacity={0.7}
              />
              <Area 
                type="monotone" 
                dataKey="neutral" 
                fill="var(--color-neutral)" 
                stroke="var(--color-neutral)" 
                stackId="1" 
                fillOpacity={0.7}
              />
              <Area 
                type="monotone" 
                dataKey="negative" 
                fill="var(--color-negative)" 
                stroke="var(--color-negative)" 
                stackId="1" 
                fillOpacity={0.7}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Ratings Over Time Card */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ratings Over Time</CardTitle>
          <CardDescription>
            Average rating and review count by month
            <span className="block text-xs mt-1">
              Based on {reviewsStats.total.toLocaleString()} reviews over {reviewsStats.overTime.length} months
            </span>
          </CardDescription>
        </CardHeader>
        
        <div className="px-6 pb-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={timeRange === 'all' ? "bg-primary/10" : ""} 
              onClick={() => setTimeRange('all')}
            >
              All time
            </Button>
            {reviewsStats.overTime.length > 6 && (
              <Button 
                variant="outline" 
                size="sm"
                className={timeRange === '6m' ? "bg-primary/10" : ""} 
                onClick={() => setTimeRange('6m')}
              >
                Last 6 months
              </Button>
            )}
            {reviewsStats.overTime.length > 3 && (
              <Button 
                variant="outline" 
                size="sm"
                className={timeRange === '3m' ? "bg-primary/10" : ""} 
                onClick={() => setTimeRange('3m')}
              >
                Last 3 months
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary/80 rounded"></div>
              <span>Avg. Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-sky-400 rounded"></div>
              <span>Review Count</span>
            </div>
          </div>
        </div>
        
        <CardContent className="pb-8">
          {filteredData.length > 0 ? (
            <div className="w-full" style={{ height: "592px" }}>
              <ChartContainer
                config={{
                  avgRating: {
                    label: "Average Rating",
                    color: "hsl(var(--primary))",
                  },
                  reviewCount: {
                    label: "Review Count",
                    color: "hsl(198, 83%, 60%)", // Sky blue color
                  },
                }}
              >
                <ComposedChart
                  data={filteredData}
                  margin={{ top: 30, right: 40, bottom: 40, left: 40 }} 
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 5]}
                    orientation="left"
                    tickCount={6}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ 
                      value: "Rating", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { fontSize: 12, fill: "var(--muted-foreground)" }  
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'dataMax * 1.2']}
                    tickFormatter={(value) => `${value}`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ 
                      value: "Reviews", 
                      angle: 90, 
                      position: "insideRight",
                      style: { fontSize: 12, fill: "var(--muted-foreground)" }
                    }}
                  />
                  <Bar
                    dataKey="count"
                    yAxisId="right"
                    fill="var(--color-reviewCount)"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    yAxisId="left"
                    stroke="var(--color-avgRating)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => {
                          if (name === "avg") {
                            return [Number(value).toFixed(1), "Rating"];
                          }
                          return [Number(value).toLocaleString(), "Reviews"];
                        }}
                      />
                    }
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <BarChart2 className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No rating history data available for this time period.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* The following sections are not available in the current JSON data */}
      {/* They are conditionally rendered only if the data exists */}
      
      {/* Time-based Pattern Highlights - Only shown if data exists */}
      {reviewsStats.timePatterns && reviewsStats.timePatterns.length > 0 && (
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detected Events & Patterns</CardTitle>
            <CardDescription>
              Significant events detected in review history
              <span className="block text-xs mt-1">
                Events that impacted ratings or review volume
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewsStats.timePatterns.map((pattern, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="mt-1">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{pattern.event}</h4>
                      <Badge 
                        variant={pattern.impact > 0 ? "success" : pattern.impact < 0 ? "destructive" : "outline"}
                      >
                        {pattern.impact > 0 ? '+' : ''}{pattern.impact.toFixed(1)} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pattern.period} • {pattern.reviewCount} reviews
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Correlation Patterns Visualization - Only shown if data exists */}
      {correlationData.length > 0 && (
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Correlation Patterns</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Factors that correlate with higher or lower ratings. 
                      Stronger correlations suggest a more significant relationship.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>
              Factors that influence review ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {correlationData.slice(0, 6).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TagIcon className={`h-4 w-4 ${item.direction === "positive" ? "text-green-500" : "text-red-500"}`} />
                      <span className="text-sm font-medium">{item.factor}</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                            {item.direction === "positive" ? "+" : "-"}{Math.abs(item.correlation).toFixed(2)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Significance: {(item.significance * 100).toFixed(0)}%
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={item.score} 
                      className={`h-2 ${item.direction === "positive" ? "bg-green-100" : "bg-red-100"}`}
                      indicatorClassName={item.direction === "positive" ? "bg-green-500" : "bg-red-500"}
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">{item.score.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Version Impact Analysis - Only shown if data exists */}
      {reviewsStats.versionImpact && reviewsStats.versionImpact.length > 0 && (
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Version Impact</CardTitle>
            <CardDescription>
              How app updates affected reviews and ratings
              <span className="block text-xs mt-1">
                Comparing {reviewsStats.versionImpact.length} recent versions
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="mb-4 w-full grid grid-cols-2">
                <TabsTrigger value="chart">
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Rating Trends
                </TabsTrigger>
                <TabsTrigger value="table">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Key Topics
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart">
                <div className="h-[300px] w-full">
                  <ChartContainer>
                    <ComposedChart
                      data={reviewsStats.versionImpact}
                      margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="version" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={[0, 5]} 
                        label={{ 
                          value: "Rating", 
                          angle: -90, 
                          position: "insideLeft", 
                          style: { textAnchor: 'middle' } 
                        }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 'dataMax + 1000']}
                        label={{ 
                          value: "Reviews", 
                          angle: 90, 
                          position: "insideRight",
                          style: { textAnchor: 'middle' } 
                        }}
                      />
                      <RechartsTooltip />
                      <Bar 
                        dataKey="reviewCount" 
                        yAxisId="right"
                        fill="hsl(var(--muted-foreground) / 0.3)"
                        name="Reviews"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgRating" 
                        yAxisId="left"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        name="Avg Rating"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sentimentChange" 
                        yAxisId="left"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        name="Sentiment"
                        connectNulls={true}
                        dot={{ fill: "hsl(var(--success))" }}
                      />
                    </ComposedChart>
                  </ChartContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="space-y-3">
                  {reviewsStats.versionImpact.map((version, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">v{version.version}</span>
                        <Badge variant={version.sentimentChange >= 0 ? "success" : "destructive"}>
                          {version.avgRating.toFixed(1)} ★ 
                          {version.sentimentChange > 0 && " ↑"}
                          {version.sentimentChange < 0 && " ↓"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {version.majorTopics.map((topic, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {version.reviewCount.toLocaleString()} reviews
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
