import { useState, useEffect, useRef } from "react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { Search, Package, Loader2, X } from "lucide-react";
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
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Suggested popular apps for quick access
  const suggestedApps = [
    { 
      name: "Spotify", 
      id: "com.spotify.music",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1DB954" className="bi bi-spotify" viewBox="0 0 16 16">
          <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
        </svg>
      )
    },
    { 
      name: "Facebook", 
      id: "com.facebook.katana",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#1877F2" className="bi bi-facebook" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>
      )
    },
    { 
      name: "Instagram", 
      id: "com.instagram.android",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#E4405F" className="bi bi-instagram" viewBox="0 0 16 16">
          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
        </svg>
      )
    },
  ];

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

  // Add click outside handler to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/analysis/${appId}`);
    }, 1000); // Simulate a search delay
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
                  placeholder="Enter app name or ID"
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
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={(e) => {
                    // Don't hide if clicking on the suggestions
                    if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                      // Add a small delay to allow for click events on suggestions
                      setTimeout(() => setShowSuggestions(false), 150);
                    }
                  }}
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
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 shadow-lg rounded-md z-10 border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto"
                  >
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

              {/* Popular app suggestions */}
              <div className="mt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Popular apps:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleSuggestionClick(app.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
                                rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {app.icon}
                      {app.name}
                    </button>
                  ))}
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
