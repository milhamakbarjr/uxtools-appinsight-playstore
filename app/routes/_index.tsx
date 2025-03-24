import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Search, Package, Smartphone, BarChart2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "AppInsight - Play Store Analytics" },
    { name: "description", content: "Extract and analyze Google Play Store reviews" },
  ];
};

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    navigate(`/analysis/${search}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-12">
            <img
              src="/icons/logo-light.png"
              alt="AppInsight Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="ml-3 text-2xl font-bold tracking-tight">AppInsight</h1>
        </div>

        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Find an app to analyze</CardTitle>
            <CardDescription>
              Discover insights from user reviews and ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="name" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1">
                {/* <TabsTrigger value="name" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                  <Smartphone className="h-4 w-4 mr-2" />
                  App Name
                </TabsTrigger> */}
                <TabsTrigger value="package" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950">
                  <Package className="h-4 w-4 mr-2" />
                  Package ID
                </TabsTrigger>
              </TabsList>

              <div className="min-h-[100px]">
                <TabsContent value="name" className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter app name (e.g., Spotify, Netflix)"
                        className="h-12 bg-white dark:bg-slate-950"
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                      />
                      <Button
                        size="lg"
                        className="gap-2 min-w-32 h-12"
                        onClick={() => handleSearch()}
                      >
                        Search
                      </Button>
                    </div>

                    {/* Loading Progress */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Popular:</span>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-8 rounded-full">Spotify</Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-full">Netflix</Button>
                        <Button variant="outline" size="sm" className="h-8 rounded-full">Instagram</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="package" className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter package ID (e.g., com.spotify.music)"
                        className="h-12 bg-white dark:bg-slate-950"
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
                      />
                      <Button
                        size="lg"
                        className="gap-2 min-w-32 h-12"
                        onClick={() => handleSearch()}
                      >
                        Search
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>Examples:</span>
                      <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.spotify.music</code>
                      <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.netflix.mediaclient</code>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Analyze app reviews and gain valuable user insights in seconds
        </p>
      </div>
    </div>
  );
}
