import { useLoaderData, json, Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Star, BarChart2, Download, MessageSquare, PieChart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import OverviewTab from "~/components/app-analysis/overview-tab";
import ReviewsTab from "~/components/app-analysis/reviews-tab";
import TopicsTab from "~/components/app-analysis/topics-tab";

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
    },
    reviews: [
      {
        id: "1",
        author: "John D.",
        date: "2023-06-10",
        rating: 5,
        text: "This app is amazing! The sound quality is top-notch, and I love how easy it is to create playlists. The interface is intuitive and I never have issues with playback. Highly recommended for music lovers.",
        version: "8.8.10",
        device: "Pixel 6",
        likes: 42,
        sentiment: 0.9,
        topics: ["Audio Quality", "User Interface", "Playlists"]
      },
      {
        id: "2",
        author: "Sarah M.",
        date: "2023-06-05",
        rating: 4,
        text: "Pretty good overall, but the ads can get annoying if you don't have premium. The app works well otherwise and I enjoy using it daily.",
        version: "8.8.9",
        device: "iPhone 13",
        likes: 15,
        sentiment: 0.4,
        topics: ["Ads"]
      },
      {
        id: "3",
        author: "Mike T.",
        date: "2023-05-28",
        rating: 2,
        text: "After the latest update, the app keeps crashing when I try to download music for offline listening. Please fix this issue! It used to work perfectly.",
        version: "8.8.8",
        device: "Galaxy S21",
        likes: 27,
        sentiment: -0.6,
        topics: ["Offline Mode", "App Stability"]
      },
      {
        id: "4",
        author: "Lisa K.",
        date: "2023-05-22",
        rating: 5,
        text: "Love the recommendations! Spotify's algorithm really knows my taste and introduces me to new artists I enjoy. The sound quality is excellent too.",
        version: "8.8.7",
        device: "iPhone 12",
        likes: 36,
        sentiment: 0.8,
        topics: ["Recommendations", "Audio Quality"]
      },
      {
        id: "5",
        author: "Alex B.",
        date: "2023-05-15",
        rating: 3,
        text: "It's decent but uses a lot of battery power. I've also noticed it sometimes stops playing in the background. The music selection is great though.",
        version: "8.8.7",
        device: "OnePlus 9",
        likes: 9,
        sentiment: 0.1,
        topics: ["Battery Usage", "Background Playback"]
      },
      {
        id: "6",
        author: "Emma W.",
        date: "2023-05-02",
        rating: 1,
        text: "Terrible experience lately. App freezes constantly and logs me out randomly. Customer service was unhelpful when I reported these issues. Considering switching to another service.",
        version: "8.8.6",
        device: "Pixel 5",
        likes: 53,
        sentiment: -0.8,
        topics: ["App Stability", "Customer Service"]
      },
      {
        id: "7",
        author: "Robert J.",
        date: "2023-04-28",
        rating: 5,
        text: "Best music app by far! The playlist sharing feature is fantastic and I love discovering new podcasts. Worth every penny for Premium.",
        version: "8.8.5",
        device: "iPhone 13 Pro",
        likes: 21,
        sentiment: 0.9,
        topics: ["Playlists", "Podcasts", "Premium Features"]
      },
      {
        id: "8",
        author: "Maria G.",
        date: "2023-04-20",
        rating: 4,
        text: "Good app overall, but I wish they would bring back the lyric cards feature. The current lyrics display is not as nice. Sound quality is great though.",
        version: "8.8.5",
        device: "Galaxy S22",
        likes: 17,
        sentiment: 0.5,
        topics: ["Lyrics", "Audio Quality"]
      }
    ]
  });
}

export default function AppAnalysis() {
  const { app, reviewsStats, reviews } = useLoaderData<typeof loader>();
  
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
            <TopicsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
