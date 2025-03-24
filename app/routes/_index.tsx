import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { Search, Package, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

interface Suggestion {
  appId: string;
  developer: string;
  icon: string;
  summary: string;
  title: string;
  url: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: "AppInsight - Play Store Analytics" },
    { name: "description", content: "Extract and analyze Google Play Store reviews" },
  ];
};
// Add a server-side loader function
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const term = url.searchParams.get("term");

  if (term) {
    // Only import and use gplay on the server
    const module = await import("google-play-scraper");
    // @ts-ignore
    const gplay = module.default;
    try {
      const suggestions = await gplay.search({
        term,
        num: 5
      });
      return ({ suggestions });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return ({ suggestions: [], error: "Failed to fetch suggestions" });
    }
  }

  return ({ suggestions: [] });
};

export default function Index() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [_, setSearchParams] = useSearchParams();
  const data = useLoaderData<{ suggestions: Array<Suggestion> }>();

  // Add useEffect for debouncing search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Update the search params when debounced search changes
  useEffect(() => {
    if (debouncedSearch.length > 2) {
      setSearchParams({ term: debouncedSearch });
    }
  }, [debouncedSearch, setSearchParams]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/analysis/${debouncedSearch}`);
    }, 1000); // Simulate a search delay
  };

  const handleSuggestionClick = (appId: string) => {
    setSearch(appId);
    setDebouncedSearch(appId);
    setShowSuggestions(false);
    navigate(`/analysis/${appId}`);
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
              <div className="flex gap-2 relative">
                <Input
                  placeholder="Enter app package ID (e.g., com.spotify.music)"
                  className="h-12 bg-white dark:bg-slate-950"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                <Button
                  size="lg"
                  className="gap-2 min-w-32 h-12"
                  onClick={() => {
                    handleSearch();
                    setShowSuggestions(false);
                  }}
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

                {/* Suggestions Dropdown */}
                {showSuggestions && data.suggestions && data.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 shadow-lg rounded-md z-10 border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto">
                    <ul className="py-1">
                      {data.suggestions.map((app) => (
                        <li
                          key={app.appId}
                          className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3"
                          onClick={() => handleSuggestionClick(app.appId)}
                        >
                          <div className="w-10 h-10 flex-shrink-0">
                            <img
                              src={app.icon}
                              alt={`${app.title} icon`}
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{app.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{app.developer}</p>
                          </div>
                          <Package className="h-4 w-4 text-slate-400" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Examples:</span>
                <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.spotify.music</code>
                <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">com.netflix.mediaclient</code>
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
