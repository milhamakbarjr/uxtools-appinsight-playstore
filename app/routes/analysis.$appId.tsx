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
      total: 200,
      distribution: [80, 65, 30, 15, 10],
      sentiment: {
        positive: 73, // 146/200 * 100 from sentiment results
        neutral: 12, // 24/200 * 100 from sentiment results
        negative: 15, // 30/200 * 100 from sentiment results
        averageConfidence: 0.51 // From sentiment results
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
        id: "0",
        userName: "Spotify User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "Spotify is best for listening musics",
        version: "8.8.20",
        thumbsUp: 12,
        replyDate: null,
        replyText: null,
        sentiment: {
          score: 0.5,
          comparative: 0.08333333333333333,
          confidence: 0.4072,
          language: "nob"
        },
        topics: ["Music Quality"]
      },
      {
        id: "1",
        userName: "Music Fan",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "Good music bad app. If i'm not getting 30 second unskippable ads reminding me what app i'm using i'm being forced to listen to random music that spotify thinks I like. How greedy for money can you be",
        version: "8.8.20",
        thumbsUp: 156,
        replyDate: null,
        replyText: null,
        sentiment: {
          score: -0.024390243902439025,
          comparative: -0.000594883997620464,
          confidence: 0.6479073170731706,
          language: "eng"
        },
        topics: ["Ads", "Music Recommendations", "Monetization"]
      },
      {
        id: "2",
        userName: "Regular Listener",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "great to listen to",
        version: "8.8.20",
        thumbsUp: 8,
        replyDate: null,
        replyText: null,
        sentiment: {
          score: 0.75,
          comparative: 0.1875,
          confidence: 0.41329999999999995,
          language: "nds"
        },
        topics: ["User Experience"]
      },
      {
        id: "3",
        userName: "Happy User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "Good",
        version: "8.8.20",
        thumbsUp: 2,
        sentiment: {
          score: 3,
          comparative: 3,
          confidence: 0.5623999999999999,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "4",
        userName: "Concerned User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "forces you to get premium no option to choose specific songs and forces you to shuffle songs lame app do better",
        version: "8.8.20",
        thumbsUp: 89,
        sentiment: {
          score: 0,
          comparative: 0,
          confidence: 0.4184,
          language: "eng"
        },
        topics: ["Premium Features", "Music Control"]
      },
      {
        id: "5",
        userName: "New User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "Easy to use",
        version: "8.8.20",
        thumbsUp: 15,
        sentiment: {
          score: 1,
          comparative: 0.3333333333333333,
          confidence: 0.42719999999999997,
          language: "plt"
        },
        topics: ["Usability"]
      },
      {
        id: "6",
        userName: "Music Lover",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "very nice experience",
        version: "8.8.20",
        thumbsUp: 34,
        sentiment: {
          score: 1,
          comparative: 0.3333333333333333,
          confidence: 0.432,
          language: "eng"
        },
        topics: ["User Experience"]
      },
      {
        id: "7",
        userName: "Premium User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "excellent",
        version: "8.8.20",
        thumbsUp: 67,
        sentiment: {
          score: 3,
          comparative: 3,
          confidence: 0.5653999999999999,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "8",
        userName: "Daily Listener",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "the best app",
        version: "8.8.20",
        thumbsUp: 45,
        sentiment: {
          score: 1,
          comparative: 0.3333333333333333,
          confidence: 0.42719999999999997,
          language: "eng"
        },
        topics: ["App Quality"]
      },
      {
        id: "9",
        userName: "Music Enthusiast",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "The best app ever for music",
        version: "8.8.20",
        thumbsUp: 78,
        sentiment: {
          score: 0.5,
          comparative: 0.08333333333333333,
          confidence: 0.4018,
          language: "eng"
        },
        topics: ["App Quality", "Music Experience"]
      },
      {
        id: "10",
        userName: "Daily User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "Great app I always listen to songs in the eavning Most of them are j pop and anime intros and phonk And today when i opened spotify I WAS AMAZED Tgey made a specific playlist for me and they had a discription saying You listen to j pop and phonk every eavning so we made a playlist just for you according to tye vibe and the songs you listen to D This is a great playlist that i played today Thank you spotify team fir creating such a app i font even have to open the tab for music play",
        version: "8.8.20",
        thumbsUp: 234,
        sentiment: {
          score: 0.14,
          comparative: 0.0014000000000000002,
          confidence: 0.6574,
          language: "eng"
        },
        topics: ["Playlist Features", "Music Recommendations", "User Experience"]
      },
      {
        id: "11",
        userName: "Premium Member",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "9 months for Spotify to give me back my goddamn lyrics I could ve gave birth in that time frame Customer service failed me EIGHT TIMES I m a premium user of almost 3 years stop raising the price and lowering your quality Update it s the big 25 now late March might I add still no lyrics STOP HOLDING THEM HOSTAGE",
        version: "8.8.20",
        thumbsUp: 567,
        sentiment: {
          score: -0.016129032258064516,
          comparative: -0.0002601456815816857,
          confidence: 0.5437290322580646,
          language: "eng"
        },
        topics: ["Lyrics Feature", "Customer Service", "Premium Features"]
      },
      {
        id: "12",
        userName: "Music Enthusiast",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "it s the best music app out there",
        version: "8.8.20",
        thumbsUp: 89,
        sentiment: {
          score: 0.375,
          comparative: 0.046875,
          confidence: 0.39604999999999996,
          language: "sco"
        },
        topics: ["App Quality"]
      },
      {
        id: "13",
        userName: "Casual Listener",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "good",
        version: "8.8.20",
        thumbsUp: 12,
        sentiment: {
          score: 3,
          comparative: 3,
          confidence: 0.5623999999999999,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "14",
        userName: "Happy Customer",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "perfect",
        version: "8.8.20",
        thumbsUp: 45,
        sentiment: {
          score: 2,
          comparative: 2,
          confidence: 0.4941999999999999,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "15",
        userName: "UI Critic",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "the new queue sucks instead of clicking twice to bring a song to the top of the queue I have to drag them each bring back the old one",
        version: "8.8.20",
        thumbsUp: 345,
        sentiment: {
          score: -0.034482758620689655,
          comparative: -0.0011890606420927466,
          confidence: 0.7797862068965518,
          language: "eng"
        },
        topics: ["Queue Feature", "UI Changes"]
      },
      {
        id: "16",
        userName: "Regular User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "awesome",
        version: "8.8.20",
        thumbsUp: 67,
        sentiment: {
          score: 4,
          comparative: 4,
          confidence: 0.6342,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "17",
        userName: "Music Lover",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 5,
        text: "superb",
        version: "8.8.20",
        thumbsUp: 89,
        sentiment: {
          score: 5,
          comparative: 5,
          confidence: 0.7036,
          language: "und"
        },
        topics: ["General Experience"]
      },
      {
        id: "18",
        userName: "Frustrated User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 1,
        text: "very bad app because jab bhi aap jo song play kroge vo play hoga hi nahi koi or song ho Play hoga bacvas app hai 1 ratii",
        version: "8.8.20",
        thumbsUp: 234,
        sentiment: {
          score: 0.1111111111111111,
          comparative: 0.004115226337448559,
          confidence: 0.4172222222222222,
          language: "war"
        },
        topics: ["Playback Issues"]
      },
      {
        id: "19",
        userName: "Music Fan",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "nice music",
        version: "8.8.20",
        thumbsUp: 56,
        sentiment: {
          score: 1.5,
          comparative: 0.75,
          confidence: 0.46099999999999997,
          language: "yao"
        },
        topics: ["Music Quality"]
      },
      {
        id: "20",
        userName: "Queue User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "you can t remove songs from the queue now",
        version: "8.8.20",
        thumbsUp: 123,
        sentiment: {
          score: 0,
          comparative: 0,
          confidence: 0.3746,
          language: "eng"
        },
        topics: ["Queue Feature"]
      },
      {
        id: "21",
        userName: "Bug Reporter",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 3,
        text: "it s nice app but it s getting hang when I play one song like if I play dandelions it started to play another song",
        version: "8.8.20",
        thumbsUp: 78,
        sentiment: {
          score: 0.44,
          comparative: 0.0176,
          confidence: 0.39119999999999994,
          language: "eng"
        },
        topics: ["App Performance", "Playback Issues"]
      },
      {
        id: "22",
        userName: "Disappointed User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 1,
        text: "It is one of the worst app for listening songs Even with the premium subscription I literally hatee this app Not at all recommend",
        version: "8.8.20",
        thumbsUp: 445,
        sentiment: {
          score: -0.3333333333333333,
          comparative: -0.013888888888888888,
          confidence: 0.4531333333333333,
          language: "eng"
        },
        topics: ["Premium Features", "App Quality"]
      },
      {
        id: "23",
        userName: "Collection Fan",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "wao experience excellent songs collections",
        version: "8.8.20",
        thumbsUp: 67,
        sentiment: {
          score: 0.6,
          comparative: 0.12,
          confidence: 0.41779999999999995,
          language: "fra"
        },
        topics: ["Music Collection", "User Experience"]
      },
      {
        id: "24",
        userName: "Ad Hater",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 1,
        text: "Worst App install if you wanna listen to ads not songs they will even play ads in between ads but never songs",
        version: "8.8.20",
        thumbsUp: 789,
        sentiment: {
          score: -0.22727272727272727,
          comparative: -0.010330578512396695,
          confidence: 0.43250909090909084,
          language: "eng"
        },
        topics: ["Ads", "Music Playback"]
      },
      {
        id: "25",
        userName: "Satisfied User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "very good experience",
        version: "8.8.20",
        thumbsUp: 45,
        sentiment: {
          score: 1,
          comparative: 0.3333333333333333,
          confidence: 0.432,
          language: "eng"
        },
        topics: ["User Experience"]
      },
      {
        id: "26",
        userName: "Podcast Listener",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 2,
        text: "podcast still playing after the end of the queue while i have the option no auto play on its quite annoying whzn you listen to news podcast and all of a sudden a podcast from months ago just start for no reason",
        version: "8.8.20",
        thumbsUp: 234,
        sentiment: {
          score: 0,
          comparative: 0,
          confidence: 0.6533999999999999,
          language: "eng"
        },
        topics: ["Podcasts", "Auto-play Feature"]
      },
      {
        id: "27",
        userName: "Stats Enthusiast",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "very very good to have a app like this wrapped is the best one I am very curious to see how much time I spent with Spotify because I see listen song for more that 1 and half per day",
        version: "8.8.20",
        thumbsUp: 123,
        sentiment: {
          score: 0.225,
          comparative: 0.005625,
          confidence: 0.47795,
          language: "eng"
        },
        topics: ["Wrapped Feature", "Usage Statistics"]
      },
      {
        id: "28",
        userName: "Free User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 1,
        text: "over ads over rules maintained very very worst song skips also limited per day waste music app do not instal anyone",
        version: "8.8.20",
        thumbsUp: 567,
        sentiment: {
          score: -0.2857142857142857,
          comparative: -0.013605442176870748,
          confidence: 0.4456,
          language: "eng"
        },
        topics: ["Ads", "Skip Limits", "Free Tier Restrictions"]
      },
      {
        id: "29",
        userName: "New User",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocLK",
        date: "2024-01-16",
        score: 4,
        text: "awesome experience so far for me",
        version: "8.8.20",
        thumbsUp: 34,
        sentiment: {
          score: 0.6666666666666666,
          comparative: 0.1111111111111111,
          confidence: 0.4158666666666666,
          language: "nob"
        },
        topics: ["User Experience"]
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
