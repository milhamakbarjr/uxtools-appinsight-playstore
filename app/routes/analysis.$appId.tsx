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

import { PlayStoreScraper } from '~/lib/scraper/PlayStoreScraper'
import { AnalysisService } from '~/lib/analysis/AnalysisService'
import { AnalysisTransformer } from '~/lib/analysis/transformers/AnalysisTransformer'

export async function loader({ params }: LoaderFunctionArgs) {

  const scraper = new PlayStoreScraper({
    maxReviews: 1000,
    batchSize: 100
  })
  const fetchedReviews = await scraper.scrape(params.appId || 'unknown');
  const appDetails = await scraper.getDetails(params.appId || 'unknown');
  const analysisService = new AnalysisService();
  const analysisResult = await analysisService.analyzeReviews(fetchedReviews.reviews);
  const transformedData = new AnalysisTransformer(analysisResult, fetchedReviews.reviews, {
    name: appDetails.title,
    version: appDetails.version
  });
  const overviewTabData = transformedData.getOverviewTabData();
  const reviewsTabData = transformedData.getReviewsTabData();
  const topicsTabData = transformedData.getTopicsTabData();

  const appData = {
    id: params.appId || "unknown",
    icon: appDetails.icon,
    developer: appDetails.developer,
    name: overviewTabData.app.name,
    rating: overviewTabData.app.rating,
    reviews: overviewTabData.app.reviews,
    version: overviewTabData.app.version,
    installs: appDetails.installs,
    lastUpdated: new Date(appDetails.updated).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    description: appDetails.description,
    category: appDetails.categories[0].name,
  };

  return ({
    app: appData,
    reviewsStats: overviewTabData.reviewsStats,
    reviews: reviewsTabData.reviews,
    topicsData: topicsTabData,
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
                <Badge variant="outline">{app.version}</Badge>
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
