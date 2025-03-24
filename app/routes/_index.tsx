import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Search, Package, Smartphone, BarChart2, Loader2, AlertCircle } from "lucide-react";
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
  const [error, setError] = useState(false);

  const handleSearch = () => {
    if (!search.trim()) {
      setError(true);
      return;
    }
    setError(false);
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
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter package ID (e.g., com.spotify.music)"
                    className={`h-12 bg-white dark:bg-slate-950 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      if (error) setError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                  {error && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please enter a package ID</span>
                    </div>
                  )}
                </div>
                <Button
                  size="lg"
                  className="gap-2 min-w-32 h-12"
                  onClick={() => handleSearch()}
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Examples:</span>
                <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.spotify.music</code>
                <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.netflix.mediaclient</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Analyze app reviews and gain valuable user insights in seconds
        </p>
      </div>
    </div>
  );
}
