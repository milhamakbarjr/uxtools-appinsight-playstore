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
  return json({
    app: {
      id: params.appId || "unknown",
      name: "Spotify: Music and Podcasts",
      icon: "https://play-lh.googleusercontent.com/7ynvVIRdhJNAngCg_GI7i8TtH8BqkJYmffeUHsG-mJOdzt1XLvGmbsKuc5Q1SInBjDKN=w480-h960-rw",
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
        { name: "User Interface", count: 4521, sentiment: 0.6 },
        { name: "Audio Quality", count: 3876, sentiment: 0.8 },
        { name: "App Performance", count: 3654, sentiment: -0.4 },
        { name: "Offline Mode", count: 2987, sentiment: 0.2 },
        { name: "Playlist Features", count: 2865, sentiment: 0.7 }
      ],
      monthlyTrends: {
        "Jan 2023": { positive: 2345, neutral: 876, negative: 432 },
        "Feb 2023": { positive: 2543, neutral: 765, negative: 543 },
        "Mar 2023": { positive: 2123, neutral: 987, negative: 654 }
      }
    },
    reviews: [
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Sarah Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but the recent update has made the UI a bit confusing. The audio quality is still excellent and I love the playlist features. Battery drain is noticeable though.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "John Doe",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Jane Smith",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Michael Brown",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "David Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Sophia Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "James Anderson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Olivia Thomas",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Daniel Lee",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Isabella White",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Matthew Harris",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Ava Clark",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Lucas Rodriguez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Mia Lewis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Ethan Walker",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Emma Hall",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Alexander Young",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Aiden King",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Lucas Scott",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Mason Green",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2023-06-15",
        score: 4,
        text: "Great app overall, but could use some improvements in the offline mode.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 45,
        criteria: null,
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOFEPokc2W3lqt6YQ1LZQN_o14PKmA4OXFJQDmrPliIWh5Pf",
        userName: "Jessica Taylor",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL46",
        date: "2023-05-01",
        score: 4,
        text: "Great app for music streaming. The audio quality is excellent, and the playlist features are very useful. However, the app sometimes crashes when playing podcasts.",
        version: "8.8.20",
        thumbsUp: 89,
        criteria: null,
        sentiment: 0.6,
        topics: ["Audio Quality", "Playlist Features", "Podcasts"]
      }
    ]
  });
}

export default function AppAnalysis() {
  const { app, reviewsStats, reviews: rawReviews } = useLoaderData<typeof loader>();
  
  // Transform the reviews to match the Review type
  const reviews = rawReviews.map(review => ({
    id: review.id,
    author: review.userName,
    rating: review.score,
    text: review.text,
    date: review.date,
    device: "Unknown", // Add default value
    likes: review.thumbsUp,
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
            <TopicsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
