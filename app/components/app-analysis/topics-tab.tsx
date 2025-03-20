import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart, PieChart } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Progress } from "~/components/ui/progress";

export default function TopicsTab() {
  const { reviewsStats, reviews } = useLoaderData();

  // Use commonTopics from reviewsStats which would be generated on the server
  // from the review text analysis
  const topicStats = reviewsStats.commonTopics.map(topic => ({
    ...topic,
    // Convert sentiment from -1 to 1 scale to percentage
    sentimentPercentage: ((topic.sentiment + 1) / 2) * 100
  }));

  // Group reviews by topics, using the server-generated topics
  const topicTimeline = reviews.reduce((acc: any, review: any) => {
    // Extract month from the review date (which exists in actual API data)
    const month = new Date(review.date).toLocaleString('default', { month: 'short' });
    
    // Use server-generated topics
    review.topics?.forEach((topic: string) => {
      if (!acc[topic]) {
        acc[topic] = {};
      }
      if (!acc[topic][month]) {
        acc[topic][month] = { count: 0, score: 0 };
      }
      acc[topic][month].count++;
      // Use the actual review score (1-5) from the API
      acc[topic][month].score += review.score || 0;
    });
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      {/* Topics Overview Card */}
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
            </TabsList>

            <TabsContent value="distribution">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {topicStats.map((topic) => (
                    <div key={topic.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="space-x-2">
                          <Badge variant="secondary">{topic.name}</Badge>
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

            <TabsContent value="sentiment">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(topicTimeline).map(([topic, months]: [string, any]) => (
                    <div key={topic} className="space-y-2">
                      <Badge variant="outline">{topic}</Badge>
                      <div className="space-y-2">
                        {Object.entries(months).map(([month, data]: [string, any]) => {
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
          </Tabs>
        </CardContent>
      </Card>

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
            {reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{review.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={
                    review.score >= 4 ? "success" : 
                    review.score <= 2 ? "destructive" : "secondary"
                  }>
                    {review.score} ★
                  </Badge>
                </div>
                <p className="text-sm mb-2">{review.text}</p>
                {review.topics && (
                  <div className="flex gap-2">
                    {review.topics.map((topic: string) => (
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
