import type { MetaFunction } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";
import { Search, Star, History, Package, Smartphone, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";

export const meta: MetaFunction = () => {
  return [
    { title: "UXTools Play Store Scraper" },
    { name: "description", content: "Extract and analyze Google Play Store reviews" },
  ];
};

export default function Index() {
  const [recentSearches] = useState([
    {
      id: "com.spotify.music",
      name: "Spotify",
      icon: "https://play-lh.googleusercontent.com/P2VMEenhpIsubG2oWbvuLGrs0GyyzLiDosGTg8bi8htRXg9Uf0eUtHiUjC28p1jgHzo=s48-rw",
      rating: 4.3,
      reviews: "35M+",
      category: "Music & Audio",
      lastAnalyzed: "2 hours ago"
    },
    {
      id: "com.netflix.mediaclient",
      name: "Netflix",
      icon: "https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI=s48-rw",
      rating: 4.2,
      reviews: "15M+",
      category: "Entertainment",
      lastAnalyzed: "1 day ago"
    }
  ]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">UXTools Play Store Scraper</h1>
          <p className="text-lg text-muted-foreground">
            Extract and analyze user reviews from Google Play Store apps
          </p>
        </header>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Search App</CardTitle>
            <CardDescription>
              Enter an app name or package ID to start analyzing reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="name" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="name">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Search by Name
                </TabsTrigger>
                <TabsTrigger value="package">
                  <Package className="h-4 w-4 mr-2" />
                  Package ID
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="name" className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter app name (e.g., Spotify, Netflix)" 
                      className="h-11"
                    />
                    <Button size="lg" className="gap-2 min-w-32">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Popular searches: 
                    <Button variant="link" className="px-1.5 h-auto">Spotify</Button>
                    <Button variant="link" className="px-1.5 h-auto">Netflix</Button>
                    <Button variant="link" className="px-1.5 h-auto">Instagram</Button>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="package" className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter package ID (e.g., com.spotify.music)" 
                      className="h-11 font-mono"
                    />
                    <Button size="lg" className="gap-2 min-w-32">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Example IDs: 
                    <code className="mx-1.5 px-1.5 py-0.5 rounded bg-muted">com.spotify.music</code>
                    <code className="mx-1.5 px-1.5 py-0.5 rounded bg-muted">com.netflix.mediaclient</code>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {recentSearches.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Analyses
                </CardTitle>
                <CardDescription>
                  Quick access to your recently analyzed apps
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {recentSearches.map((app) => (
                    <Card key={app.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="h-12 w-12 rounded-xl"
                        />
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {app.name}
                            <Badge variant="secondary" className="ml-2">
                              {app.category}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {app.id}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-current text-yellow-400 stroke-yellow-400" />
                            <span>{app.rating}</span>
                            <span className="mx-1">•</span>
                            <span>{app.reviews} reviews</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Last analyzed {app.lastAnalyzed}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="grid grid-cols-2 gap-2">
                        <Button variant="secondary">View Report</Button>
                        <Button>
                          New Analysis
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
