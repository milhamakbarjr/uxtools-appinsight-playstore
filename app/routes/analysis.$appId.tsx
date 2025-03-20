import { useLoaderData, json, Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Star, BarChart2, ListFilter, Download, MessageSquare, PieChart, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { useState } from "react";
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

export function loader({ params }: LoaderFunctionArgs) {
  // In a real app, we would fetch the app data using the appId
  // For now, we'll return mock data
  return json({
    app: {
      id: params.appId || "unknown",
      name: "Spotify: Music and Podcasts",
      icon: "https://play-lh.googleusercontent.com/UrY7BAZ-XfXGpfkeWg0zCCeo-7ras4DCoRalC_WXXWTK9q5b0Iw7B0YQMsVxZaNB7DM=s180",
      developer: "Spotify AB",
      rating: 4.3,
      reviews: 14583219,
      installs: "1B+",
      lastUpdated: "Sep 25, 2023",
      version: "8.8.12.573",
      description: "With Spotify, you can listen to music and play millions of songs and podcasts for free.",
      category: "Music & Audio",
    },
    reviewsStats: {
      total: 14583219,
      distribution: [9273547, 3063476, 1166658, 437497, 642041], // 5 to 1 stars
      sentiment: {
        positive: 65,
        neutral: 20,
        negative: 15
      },
      overTime: [
        { date: "Jan", avg: 4.4, count: 120000 },
        { date: "Feb", avg: 4.3, count: 110000 },
        { date: "Mar", avg: 4.2, count: 130000 },
        { date: "Apr", avg: 4.3, count: 125000 },
        { date: "May", avg: 4.4, count: 140000 },
        { date: "Jun", avg: 4.3, count: 130000 },
      ],
      commonTopics: [
        { name: "Audio Quality", count: 3245, sentiment: 0.8 },
        { name: "User Interface", count: 2876, sentiment: 0.6 },
        { name: "Playlists", count: 2543, sentiment: 0.9 },
        { name: "Offline Mode", count: 1987, sentiment: 0.2 },
        { name: "Ads", count: 1856, sentiment: -0.7 },
      ]
    }
  });
}

export default function AppAnalysis() {
  const { app, reviewsStats } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button and App Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
          </Link>
          
          <div className="flex items-start gap-4">
            <img 
              src={app.icon} 
              alt={app.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{app.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{app.developer}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                  <span>{app.rating} ({(app.reviews / 1000000).toFixed(1)}M reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">{app.category}</Badge>
                <Badge variant="outline">{app.installs} installs</Badge>
                <Badge variant="outline">v{app.version}</Badge>
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger value="overview" className="gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                <BarChart2 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                <MessageSquare className="h-4 w-4" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="topics" className="gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                <PieChart className="h-4 w-4" />
                Topic Analysis
              </TabsTrigger>
            </TabsList>
            
            
          </div>
          
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Positive</span>
                      </div>
                      <span className="text-sm font-medium">{reviewsStats.sentiment.positive}%</span>
                    </div>
                    <Progress value={reviewsStats.sentiment.positive} className="h-2 bg-slate-200 dark:bg-slate-700" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 inline-block">〰️</span>
                        <span className="text-sm">Neutral</span>
                      </div>
                      <span className="text-sm font-medium">{reviewsStats.sentiment.neutral}%</span>
                    </div>
                    <Progress value={reviewsStats.sentiment.neutral} className="h-2 bg-slate-200 dark:bg-slate-700" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Negative</span>
                      </div>
                      <span className="text-sm font-medium">{reviewsStats.sentiment.negative}%</span>
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
                  <div className="w-full" style={{ height: "592px" }}> {/* Use explicit height with style */}
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
          </TabsContent>
          
          {/* Reviews Tab Content - Will be developed later */}
          <TabsContent value="reviews">
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  This tab will be developed in the next phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Reviews tab content will be added soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Topic Analysis Tab Content - Will be developed later */}
          <TabsContent value="topics">
            <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
                <CardDescription>
                  This tab will be developed in the next phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Topic Analysis tab content will be added soon.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
