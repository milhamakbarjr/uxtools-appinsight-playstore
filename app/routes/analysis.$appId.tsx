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
        // Most mentioned features/topics based on keyword extraction
        { name: "User Interface", count: 4521, sentiment: 0.6 },
        { name: "Audio Quality", count: 3876, sentiment: 0.8 },
        { name: "App Performance", count: 3654, sentiment: -0.4 },
        { name: "Offline Mode", count: 2987, sentiment: 0.2 },
        { name: "Playlist Features", count: 2865, sentiment: 0.7 },
        { name: "Premium Features", count: 2654, sentiment: -0.2 },
        { name: "Battery Usage", count: 2432, sentiment: -0.6 },
        { name: "Search Function", count: 2211, sentiment: 0.1 },
        { name: "Music Discovery", count: 2087, sentiment: 0.9 },
        { name: "Podcast Features", count: 1876, sentiment: 0.5 },
        { name: "Customer Support", count: 1654, sentiment: -0.5 },
        { name: "Social Features", count: 1543, sentiment: 0.3 },
        { name: "Download Issues", count: 1432, sentiment: -0.7 },
        { name: "Account Issues", count: 1321, sentiment: -0.4 },
        { name: "Bluetooth Connection", count: 1234, sentiment: -0.3 }
      ],
      // Monthly sentiment trends (can be calculated from review dates)
      monthlyTrends: {
        "Jan 2023": { positive: 2345, neutral: 876, negative: 432 },
        "Feb 2023": { positive: 2543, neutral: 765, negative: 543 },
        "Mar 2023": { positive: 2123, neutral: 987, negative: 654 },
        "Apr 2023": { positive: 2765, neutral: 876, negative: 432 },
        "May 2023": { positive: 2432, neutral: 765, negative: 876 },
        "Jun 2023": { positive: 2654, neutral: 876, negative: 543 }
      }
    },
    // Sample reviews that match google-play-scraper's actual output format
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
        // These would be generated on backend
        sentiment: 0.3,
        topics: ["User Interface", "Audio Quality", "Playlist Features", "Battery Usage"]
      },
      {
        id: "gp:AOqpTOE23fkc7W3lpe4YQ1LZQN_123PKmA4O76JQDmrPlsARt2Pf",
        userName: "Mike Chen",
        userImage: "https://play-lh.googleusercontent.com/a/BCg8ocM2",
        date: "2023-06-14",
        score: 2,
        text: "The app keeps crashing when trying to download songs for offline listening. Customer support hasn't been helpful at all. The search function also needs improvement - can't find songs unless the title is exact.",
        replyDate: "2023-06-15",
        replyText: "Hi Mike, we're sorry to hear about these issues. We've released a fix for the download problems in version 8.8.21. Please update and let us know if you still experience any issues.",
        version: "8.8.19",
        thumbsUp: 89,
        criteria: null,
        sentiment: -0.7,
        topics: ["App Performance", "Customer Support", "Search Function", "Download Issues"]
      },
      {
        id: "gp:AOqpTOE4kL8mN9pQ2rS3tU5vW6xY7zA8bC9dE0fF1gH2iJ3k",
        userName: "Emma Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL3",
        date: "2023-06-13",
        score: 5,
        text: "The music discovery algorithm is fantastic! I've found so many new artists through my Daily Mix and Release Radar. The audio quality on Premium is exceptional, especially with the new HiFi option.",
        replyDate: null,
        replyText: null,
        version: "8.8.20",
        thumbsUp: 156,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Discovery", "Audio Quality", "Premium Features"]
      },
      {
        id: "gp:AOqpTOE5lM9nO0pP3qR4tU6vW7xY8zA9bC0dE1fF2gH3iJ4k",
        userName: "James Rodriguez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL4",
        date: "2023-06-12",
        score: 2,
        text: "Latest update drains battery like crazy. Used to love this app but now it's using 20% of my battery daily. Also, the widget keeps disappearing from my home screen.",
        replyDate: "2023-06-13",
        replyText: "Hi James, thanks for reporting this issue. We're investigating the battery drain problem and working on a fix. Could you please update to the latest version (8.8.21) and let us know if the issue persists?",
        version: "8.8.19",
        thumbsUp: 234,
        criteria: null,
        sentiment: -0.6,
        topics: ["Battery Usage", "App Performance", "Widget Issues"]
      },
      {
        id: "gp:AOqpTOE6mN0oP1qR4tU7vW8xY9zA0bC1dE2fF3gH4iJ5k",
        userName: "Linda Chen",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL5",
        date: "2023-06-11",
        score: 4,
        text: "Love the podcast features and how seamlessly it integrates with music playback. The sleep timer is super useful for bedtime listening. Only complaint is occasional bluetooth connectivity issues.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.7,
        topics: ["Podcast Features", "Sleep Timer", "Bluetooth Connection"]
      },
      {
        id: "gp:AOqpTOE7nO1pP2qR5tU8vW9xY0zA1bC2dE3fF4gH5iJ6k",
        userName: "Alex Thompson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL6",
        date: "2023-06-10",
        score: 3,
        text: "The social features need work. Can't easily share playlists with friends, and the activity feed is often delayed. Otherwise, good for music streaming.",
        version: "8.8.20",
        thumbsUp: 43,
        criteria: null,
        sentiment: 0.1,
        topics: ["Social Features", "Playlist Features", "App Performance"]
      },
      {
        id: "gp:AOqpTOE8oP2qR3tU9vW0xY1zA2bC3dE4fF5gH6iJ7k",
        userName: "David Kim",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL7",
        date: "2023-06-09",
        score: 1,
        text: "Can't login after the recent update. Keeps saying 'connection error' even though my internet is fine. Tried reinstalling but no luck. Very frustrating!",
        replyDate: "2023-06-10",
        replyText: "Hi David, we apologize for the login issues. Please try clearing the app cache and data. If the problem persists, contact our support team with your device details.",
        version: "8.8.19",
        thumbsUp: 189,
        criteria: null,
        sentiment: -0.8,
        topics: ["Login Issues", "App Performance", "Customer Support"]
      },
      {
        id: "gp:AOqpTOE9pP3qR4tU0vW1xY2zA3bC4dE5fF6gH7iJ8k",
        userName: "Sophia Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL8",
        date: "2023-06-08",
        score: 5,
        text: "Spotify is my go-to app for music. The playlist recommendations are spot on, and I love the new crossfade feature. The app runs smoothly on my device.",
        version: "8.8.20",
        thumbsUp: 98,
        criteria: null,
        sentiment: 0.8,
        topics: ["Playlist Features", "Crossfade", "App Performance"]
      },
      {
        id: "gp:AOqpTOE10qR5tU1vW2xY3zA4bC5dE6fF7gH8iJ9k",
        userName: "Daniel Lee",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL9",
        date: "2023-06-07",
        score: 3,
        text: "The app is good, but the search function needs improvement. It's hard to find songs unless you know the exact title. Also, the download speed for offline mode is slow.",
        version: "8.8.20",
        thumbsUp: 56,
        criteria: null,
        sentiment: 0.2,
        topics: ["Search Function", "Offline Mode", "Download Speed"]
      },
      {
        id: "gp:AOqpTOE11rS6tU2vW3xY4zA5bC6dE7fF8gH9iJ0k",
        userName: "Olivia Brown",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL10",
        date: "2023-06-06",
        score: 4,
        text: "Great app for music and podcasts. The user interface is clean and easy to navigate. However, the app sometimes crashes when switching between playlists.",
        version: "8.8.20",
        thumbsUp: 72,
        criteria: null,
        sentiment: 0.5,
        topics: ["User Interface", "Podcasts", "App Performance"]
      },
      {
        id: "gp:AOqpTOE12sT7tU3vW4xY5zA6bC7dE8fF9gH0iJ1k",
        userName: "Michael Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL11",
        date: "2023-06-05",
        score: 2,
        text: "The app used to be great, but now it crashes frequently. The battery usage is also very high. Please fix these issues.",
        replyDate: "2023-06-06",
        replyText: "Hi Michael, we're sorry to hear about the crashes and battery usage. We're working on a fix for these issues. Please update to the latest version (8.8.21) and let us know if the problems persist.",
        version: "8.8.19",
        thumbsUp: 123,
        criteria: null,
        sentiment: -0.5,
        topics: ["App Performance", "Battery Usage", "Crashes"]
      },
      {
        id: "gp:AOqpTOE13tU4vW5xY6zA7bC8dE9fF0gH1iJ2k",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL12",
        date: "2023-06-04",
        score: 5,
        text: "I love Spotify! The music recommendations are always on point, and the app is very user-friendly. The new features are great.",
        version: "8.8.20",
        thumbsUp: 145,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Recommendations", "User Interface", "New Features"]
      },
      {
        id: "gp:AOqpTOE14uV5wX6yZ7aB8cD9eF0gH1iJ2k",
        userName: "Chris Evans",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL13",
        date: "2023-06-03",
        score: 3,
        text: "The app is good, but the download issues are frustrating. It takes too long to download songs for offline listening.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.1,
        topics: ["Download Issues", "Offline Mode", "App Performance"]
      },
      {
        id: "gp:AOqpTOE15vW6xY7zA8bC9dE0fF1gH2iJ3k",
        userName: "Jessica Taylor",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL14",
        date: "2023-06-02",
        score: 4,
        text: "Great app for music streaming. The audio quality is excellent, and the playlist features are very useful. However, the app sometimes crashes when playing podcasts.",
        version: "8.8.20",
        thumbsUp: 89,
        criteria: null,
        sentiment: 0.6,
        topics: ["Audio Quality", "Playlist Features", "Podcasts"]
      },
      {
        id: "gp:AOqpTOE16wX7yZ8aB9cD0eF1gH2iJ3k",
        userName: "Robert Miller",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL15",
        date: "2023-06-01",
        score: 2,
        text: "The app keeps crashing when trying to download songs for offline listening. Customer support hasn't been helpful at all.",
        replyDate: "2023-06-02",
        replyText: "Hi Robert, we're sorry to hear about these issues. We've released a fix for the download problems in version 8.8.21. Please update and let us know if you still experience any issues.",
        version: "8.8.19",
        thumbsUp: 78,
        criteria: null,
        sentiment: -0.7,
        topics: ["App Performance", "Customer Support", "Download Issues"]
      },
      {
        id: "gp:AOqpTOE17xY8zA9bC0dE1fF2gH3iJ4k",
        userName: "William Anderson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL16",
        date: "2023-05-31",
        score: 5,
        text: "Spotify is amazing! The music discovery feature is fantastic, and the audio quality is top-notch. The app runs smoothly on my device.",
        version: "8.8.20",
        thumbsUp: 134,
        criteria: null,
        sentiment: 0.8,
        topics: ["Music Discovery", "Audio Quality", "App Performance"]
      },
      {
        id: "gp:AOqpTOE18yZ9aB0cD1eF2gH3iJ4k",
        userName: "Elizabeth Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL17",
        date: "2023-05-30",
        score: 3,
        text: "The app is good, but the search function needs improvement. It's hard to find songs unless you know the exact title.",
        version: "8.8.20",
        thumbsUp: 56,
        criteria: null,
        sentiment: 0.2,
        topics: ["Search Function", "App Performance"]
      },
      {
        id: "gp:AOqpTOE19aB0cD1eF2gH3iJ4k",
        userName: "David Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL18",
        date: "2023-05-29",
        score: 4,
        text: "Great app for music and podcasts. The user interface is clean and easy to navigate. However, the app sometimes crashes when switching between playlists.",
        version: "8.8.20",
        thumbsUp: 72,
        criteria: null,
        sentiment: 0.5,
        topics: ["User Interface", "Podcasts", "App Performance"]
      },
      {
        id: "gp:AOqpTOE20bC1dE2fF3gH4iJ5k",
        userName: "Sarah Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL19",
        date: "2023-05-28",
        score: 2,
        text: "The app used to be great, but now it crashes frequently. The battery usage is also very high. Please fix these issues.",
        replyDate: "2023-05-29",
        replyText: "Hi Sarah, we're sorry to hear about the crashes and battery usage. We're working on a fix for these issues. Please update to the latest version (8.8.21) and let us know if the problems persist.",
        version: "8.8.19",
        thumbsUp: 123,
        criteria: null,
        sentiment: -0.5,
        topics: ["App Performance", "Battery Usage", "Crashes"]
      },
      {
        id: "gp:AOqpTOE21cD2eF3gH4iJ5k",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL20",
        date: "2023-05-27",
        score: 5,
        text: "I love Spotify! The music recommendations are always on point, and the app is very user-friendly. The new features are great.",
        version: "8.8.20",
        thumbsUp: 145,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Recommendations", "User Interface", "New Features"]
      },
      {
        id: "gp:AOqpTOE22dE3fF4gH5iJ6k",
        userName: "Chris Evans",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL21",
        date: "2023-05-26",
        score: 3,
        text: "The app is good, but the download issues are frustrating. It takes too long to download songs for offline listening.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.1,
        topics: ["Download Issues", "Offline Mode", "App Performance"]
      },
      {
        id: "gp:AOqpTOE23eF4gH5iJ6k",
        userName: "Jessica Taylor",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL22",
        date: "2023-05-25",
        score: 4,
        text: "Great app for music streaming. The audio quality is excellent, and the playlist features are very useful. However, the app sometimes crashes when playing podcasts.",
        version: "8.8.20",
        thumbsUp: 89,
        criteria: null,
        sentiment: 0.6,
        topics: ["Audio Quality", "Playlist Features", "Podcasts"]
      },
      {
        id: "gp:AOqpTOE24fG5hI6jK",
        userName: "Robert Miller",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL23",
        date: "2023-05-24",
        score: 2,
        text: "The app keeps crashing when trying to download songs for offline listening. Customer support hasn't been helpful at all.",
        replyDate: "2023-05-25",
        replyText: "Hi Robert, we're sorry to hear about these issues. We've released a fix for the download problems in version 8.8.21. Please update and let us know if you still experience any issues.",
        version: "8.8.19",
        thumbsUp: 78,
        criteria: null,
        sentiment: -0.7,
        topics: ["App Performance", "Customer Support", "Download Issues"]
      },
      {
        id: "gp:AOqpTOE25gH6iJ7k",
        userName: "William Anderson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL24",
        date: "2023-05-23",
        score: 5,
        text: "Spotify is amazing! The music discovery feature is fantastic, and the audio quality is top-notch. The app runs smoothly on my device.",
        version: "8.8.20",
        thumbsUp: 134,
        criteria: null,
        sentiment: 0.8,
        topics: ["Music Discovery", "Audio Quality", "App Performance"]
      },
      {
        id: "gp:AOqpTOE26hI7jK",
        userName: "Elizabeth Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL25",
        date: "2023-05-22",
        score: 3,
        text: "The app is good, but the search function needs improvement. It's hard to find songs unless you know the exact title.",
        version: "8.8.20",
        thumbsUp: 56,
        criteria: null,
        sentiment: 0.2,
        topics: ["Search Function", "App Performance"]
      },
      {
        id: "gp:AOqpTOE27iJ8k",
        userName: "David Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL26",
        date: "2023-05-21",
        score: 4,
        text: "Great app for music and podcasts. The user interface is clean and easy to navigate. However, the app sometimes crashes when switching between playlists.",
        version: "8.8.20",
        thumbsUp: 72,
        criteria: null,
        sentiment: 0.5,
        topics: ["User Interface", "Podcasts", "App Performance"]
      },
      {
        id: "gp:AOqpTOE28jK",
        userName: "Sarah Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL27",
        date: "2023-05-20",
        score: 2,
        text: "The app used to be great, but now it crashes frequently. The battery usage is also very high. Please fix these issues.",
        replyDate: "2023-05-21",
        replyText: "Hi Sarah, we're sorry to hear about the crashes and battery usage. We're working on a fix for these issues. Please update to the latest version (8.8.21) and let us know if the problems persist.",
        version: "8.8.19",
        thumbsUp: 123,
        criteria: null,
        sentiment: -0.5,
        topics: ["App Performance", "Battery Usage", "Crashes"]
      },
      {
        id: "gp:AOqpTOE29k",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL28",
        date: "2023-05-19",
        score: 5,
        text: "I love Spotify! The music recommendations are always on point, and the app is very user-friendly. The new features are great.",
        version: "8.8.20",
        thumbsUp: 145,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Recommendations", "User Interface", "New Features"]
      },
      {
        id: "gp:AOqpTOE30l",
        userName: "Chris Evans",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL29",
        date: "2023-05-18",
        score: 3,
        text: "The app is good, but the download issues are frustrating. It takes too long to download songs for offline listening.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.1,
        topics: ["Download Issues", "Offline Mode", "App Performance"]
      },
      {
        id: "gp:AOqpTOE31m",
        userName: "Jessica Taylor",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL30",
        date: "2023-05-17",
        score: 4,
        text: "Great app for music streaming. The audio quality is excellent, and the playlist features are very useful. However, the app sometimes crashes when playing podcasts.",
        version: "8.8.20",
        thumbsUp: 89,
        criteria: null,
        sentiment: 0.6,
        topics: ["Audio Quality", "Playlist Features", "Podcasts"]
      },
      {
        id: "gp:AOqpTOE32n",
        userName: "Robert Miller",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL31",
        date: "2023-05-16",
        score: 2,
        text: "The app keeps crashing when trying to download songs for offline listening. Customer support hasn't been helpful at all.",
        replyDate: "2023-05-17",
        replyText: "Hi Robert, we're sorry to hear about these issues. We've released a fix for the download problems in version 8.8.21. Please update and let us know if you still experience any issues.",
        version: "8.8.19",
        thumbsUp: 78,
        criteria: null,
        sentiment: -0.7,
        topics: ["App Performance", "Customer Support", "Download Issues"]
      },
      {
        id: "gp:AOqpTOE33o",
        userName: "William Anderson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL32",
        date: "2023-05-15",
        score: 5,
        text: "Spotify is amazing! The music discovery feature is fantastic, and the audio quality is top-notch. The app runs smoothly on my device.",
        version: "8.8.20",
        thumbsUp: 134,
        criteria: null,
        sentiment: 0.8,
        topics: ["Music Discovery", "Audio Quality", "App Performance"]
      },
      {
        id: "gp:AOqpTOE34p",
        userName: "Elizabeth Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL33",
        date: "2023-05-14",
        score: 3,
        text: "The app is good, but the search function needs improvement. It's hard to find songs unless you know the exact title.",
        version: "8.8.20",
        thumbsUp: 56,
        criteria: null,
        sentiment: 0.2,
        topics: ["Search Function", "App Performance"]
      },
      {
        id: "gp:AOqpTOE35q",
        userName: "David Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL34",
        date: "2023-05-13",
        score: 4,
        text: "Great app for music and podcasts. The user interface is clean and easy to navigate. However, the app sometimes crashes when switching between playlists.",
        version: "8.8.20",
        thumbsUp: 72,
        criteria: null,
        sentiment: 0.5,
        topics: ["User Interface", "Podcasts", "App Performance"]
      },
      {
        id: "gp:AOqpTOE36r",
        userName: "Sarah Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL35",
        date: "2023-05-12",
        score: 2,
        text: "The app used to be great, but now it crashes frequently. The battery usage is also very high. Please fix these issues.",
        replyDate: "2023-05-13",
        replyText: "Hi Sarah, we're sorry to hear about the crashes and battery usage. We're working on a fix for these issues. Please update to the latest version (8.8.21) and let us know if the problems persist.",
        version: "8.8.19",
        thumbsUp: 123,
        criteria: null,
        sentiment: -0.5,
        topics: ["App Performance", "Battery Usage", "Crashes"]
      },
      {
        id: "gp:AOqpTOE37s",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL36",
        date: "2023-05-11",
        score: 5,
        text: "I love Spotify! The music recommendations are always on point, and the app is very user-friendly. The new features are great.",
        version: "8.8.20",
        thumbsUp: 145,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Recommendations", "User Interface", "New Features"]
      },
      {
        id: "gp:AOqpTOE38t",
        userName: "Chris Evans",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL37",
        date: "2023-05-10",
        score: 3,
        text: "The app is good, but the download issues are frustrating. It takes too long to download songs for offline listening.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.1,
        topics: ["Download Issues", "Offline Mode", "App Performance"]
      },
      {
        id: "gp:AOqpTOE39u",
        userName: "Jessica Taylor",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL38",
        date: "2023-05-09",
        score: 4,
        text: "Great app for music streaming. The audio quality is excellent, and the playlist features are very useful. However, the app sometimes crashes when playing podcasts.",
        version: "8.8.20",
        thumbsUp: 89,
        criteria: null,
        sentiment: 0.6,
        topics: ["Audio Quality", "Playlist Features", "Podcasts"]
      },
      {
        id: "gp:AOqpTOE40v",
        userName: "Robert Miller",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL39",
        date: "2023-05-08",
        score: 2,
        text: "The app keeps crashing when trying to download songs for offline listening. Customer support hasn't been helpful at all.",
        replyDate: "2023-05-09",
        replyText: "Hi Robert, we're sorry to hear about these issues. We've released a fix for the download problems in version 8.8.21. Please update and let us know if you still experience any issues.",
        version: "8.8.19",
        thumbsUp: 78,
        criteria: null,
        sentiment: -0.7,
        topics: ["App Performance", "Customer Support", "Download Issues"]
      },
      {
        id: "gp:AOqpTOE41w",
        userName: "William Anderson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL40",
        date: "2023-05-07",
        score: 5,
        text: "Spotify is amazing! The music discovery feature is fantastic, and the audio quality is top-notch. The app runs smoothly on my device.",
        version: "8.8.20",
        thumbsUp: 134,
        criteria: null,
        sentiment: 0.8,
        topics: ["Music Discovery", "Audio Quality", "App Performance"]
      },
      {
        id: "gp:AOqpTOE42x",
        userName: "Elizabeth Martinez",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL41",
        date: "2023-05-06",
        score: 3,
        text: "The app is good, but the search function needs improvement. It's hard to find songs unless you know the exact title.",
        version: "8.8.20",
        thumbsUp: 56,
        criteria: null,
        sentiment: 0.2,
        topics: ["Search Function", "App Performance"]
      },
      {
        id: "gp:AOqpTOE43y",
        userName: "David Wilson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL42",
        date: "2023-05-05",
        score: 4,
        text: "Great app for music and podcasts. The user interface is clean and easy to navigate. However, the app sometimes crashes when switching between playlists.",
        version: "8.8.20",
        thumbsUp: 72,
        criteria: null,
        sentiment: 0.5,
        topics: ["User Interface", "Podcasts", "App Performance"]
      },
      {
        id: "gp:AOqpTOE44z",
        userName: "Sarah Johnson",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL43",
        date: "2023-05-04",
        score: 2,
        text: "The app used to be great, but now it crashes frequently. The battery usage is also very high. Please fix these issues.",
        replyDate: "2023-05-05",
        replyText: "Hi Sarah, we're sorry to hear about the crashes and battery usage. We're working on a fix for these issues. Please update to the latest version (8.8.21) and let us know if the problems persist.",
        version: "8.8.19",
        thumbsUp: 123,
        criteria: null,
        sentiment: -0.5,
        topics: ["App Performance", "Battery Usage", "Crashes"]
      },
      {
        id: "gp:AOqpTOE45a",
        userName: "Emily Davis",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL44",
        date: "2023-05-03",
        score: 5,
        text: "I love Spotify! The music recommendations are always on point, and the app is very user-friendly. The new features are great.",
        version: "8.8.20",
        thumbsUp: 145,
        criteria: null,
        sentiment: 0.9,
        topics: ["Music Recommendations", "User Interface", "New Features"]
      },
      {
        id: "gp:AOqpTOE46b",
        userName: "Chris Evans",
        userImage: "https://play-lh.googleusercontent.com/a/ACg8ocL45",
        date: "2023-05-02",
        score: 3,
        text: "The app is good, but the download issues are frustrating. It takes too long to download songs for offline listening.",
        version: "8.8.20",
        thumbsUp: 67,
        criteria: null,
        sentiment: 0.1,
        topics: ["Download Issues", "Offline Mode", "App Performance"]
      },
      {
        id: "gp:AOqpTOE47c",
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
