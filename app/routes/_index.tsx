import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Search, Package, Smartphone, BarChart2, Loader2, AlertCircle, ChevronDown, Copy, Check } from "lucide-react";
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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!search.trim()) {
      setError(true);
      return;
    }
    
    setError(false);
    setIsSearching(true);
    
    // Add a small delay to ensure the loading state is visible
    setTimeout(() => {
      navigate(`/analysis/${search}`);
    }, 300);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedExample(text);
      setSearch(text);
      setTimeout(() => setCopiedExample(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative">
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
                      if (e.key === "Enter" && !isSearching) {
                        handleSearch();
                      }
                    }}
                    disabled={isSearching}
                    value={search}
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
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">Examples:</span>
                  <div className="flex flex-wrap gap-2">
                    {["com.spotify.music", "com.netflix.mediaclient"].map((example) => (
                      <button
                        key={example}
                        onClick={() => copyToClipboard(example)}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1 group"
                      >
                        <code>{example}</code>
                        <span className="text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300">
                          {copiedExample === example ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                  <button 
                    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    className="w-full px-3 py-2 text-xs flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="font-medium flex items-center gap-1.5 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      How to find a package ID?
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAccordionOpen && (
                    <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                      <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                        <li>Go to the app's Google Play Store page</li>
                        <li>Look at the URL in your browser address bar</li>
                        <li>Find the <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">id=</code> parameter in the URL</li>
                      </ol>
                      <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-2 overflow-hidden">
                        <p className="text-muted-foreground mb-1">Example URL:</p>
                        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-1">
                          <span className="text-slate-500">https://play.google.com/store/apps/details?</span>
                          <button 
                            onClick={() => copyToClipboard("com.spotify.music")}
                            className="font-semibold bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors inline-flex items-center gap-1"
                          >
                            id=com.spotify.music
                            <span className="text-slate-500">
                              {copiedExample === "com.spotify.music" ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      
      {/* Sticky Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-2 z-10">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 text-center">
            <strong>Disclaimer:</strong> AppInsight is designed for educational and research purposes only. 
            No data is stored on our servers—all processing happens in your browser session. 
            Users are responsible for ensuring compliance with Google Play Store's Terms of Service. 
            This tool should not be used for commercial scraping operations.
          </p>
        </div>
      </div>
    </div>
  );
}
