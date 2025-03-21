import { useLoaderData, json, Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Star, BarChart2, Download, MessageSquare, PieChart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import OverviewTab from "~/components/app-analysis/overview-tab";
import ReviewsTab from "~/components/app-analysis/reviews-tab";
import TopicsTab from "~/components/app-analysis/topics-tab";

// Import all the JSON data files
import overviewTabData from "~/lib/analysis/transformers/overview-tab-data-1742536732989.json";
import reviewsTabData from "~/lib/analysis/transformers/reviews-tab-data-1742536732991.json";
import topicsTabData from "~/lib/analysis/transformers/topics-tab-data-1742536732992.json";

export function loader({ params }: LoaderFunctionArgs) {
  // Sample app data
  const appData = {
    id: params.appId || "unknown",
    name: overviewTabData.app.name,
    icon: "https://play-lh.googleusercontent.com/7ynvVIRdhJNAngCg_GI7i8TtH8BqkJYmffeUHsG-mJOdzt1XLvGmbsKuc5Q1SInBjDKN=w480-h960-rw",
    developer: "Spotify AB",
    rating: overviewTabData.app.rating,
    reviews: overviewTabData.app.reviews,
    installs: "1B+",
    lastUpdated: "Sep 25, 2023",
    version: overviewTabData.app.version,
    description: "With Spotify, you can listen to music and play millions of songs and podcasts for free.",
    category: "Music & Audio",
  };

  return json({
    app: appData,
    reviewsStats: overviewTabData.reviewsStats,
    reviews: reviewsTabData.sample,
    topicsData: topicsTabData
  });
}

export default function AppAnalysis() {
  const { app, reviewsStats, reviews: rawReviews, topicsData } = useLoaderData<typeof loader>();
  
  // Transform the reviews to match the Review type
  const reviews = rawReviews.map(review => ({
    id: review.id,
    author: review.author,
    rating: review.rating,
    text: review.text,
    date: review.date,
    device: review.device || "Unknown", 
    likes: review.likes,
    replyDate: review.replyDate,
    replyText: review.replyText,
    version: review.version,
    sentiment: review.sentiment,
    topics: review.topics
  }));

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
          
          {/* Tab Contents using the extracted components */}
          <TabsContent value="overview">
            <OverviewTab app={app} reviewsStats={reviewsStats} />
          </TabsContent>
          
          <TabsContent value="reviews">
            <ReviewsTab reviews={reviews} />
          </TabsContent>
          
          <TabsContent value="topics">
            <TopicsTab reviewsData={topicsData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
