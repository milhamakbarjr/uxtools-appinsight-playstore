import { Star, BarChart2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "~/components/ui/chart";

type OverviewTabProps = {
  app: {
    name: string;
    rating: number;
    reviews: number;
    version: string;
  };
  reviewsStats: {
    total: number;
    distribution: number[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
      averageConfidence: number;
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
  };
};

export default function OverviewTab({ app, reviewsStats }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-4xl font-bold">{app.rating}</div>
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <Star className="h-5 w-5 text-amber-400 fill-none" />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Based on {(app.reviews / 1000000).toFixed(1)}M reviews</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Analysis confidence: {(reviewsStats.sentiment.averageConfidence * 100).toFixed(1)}%
            </CardDescription>
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
      
      {/* Ratings Over Time Card */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ratings Over Time</CardTitle>
          <CardDescription>
            Average rating and review count by month
            <span className="block text-xs mt-1">
              Based on 1,452 reviews from Jan 2023 - Jun 2023
            </span>
          </CardDescription>
        </CardHeader>
        
        <div className="px-6 pb-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-primary/10">
              All time
            </Button>
            <Button variant="outline" size="sm">
              Last 6 months
            </Button>
            <Button variant="outline" size="sm">
              Last 3 months
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary/80 rounded"></div>
              <span>Avg. Rating</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
              <span>Review Count</span>
            </div>
          </div>
        </div>
        
        <CardContent className="pb-8">
          {reviewsStats.overTime.length > 0 ? (
            <div className="w-full" style={{ height: "592px" }}>
              <ChartContainer
                config={{
                  avgRating: {
                    label: "Average Rating",
                    color: "hsl(var(--primary))",
                  },
                  reviewCount: {
                    label: "Review Count",
                    color: "hsl(var(--muted-foreground) / 0.2)",
                  },
                }}
              >
                <ComposedChart
                  data={reviewsStats.overTime}
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
                    domain={[0, 150000]}
                    tickFormatter={(value) => `${value / 1000}k`}
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
    </div>
  );
}
