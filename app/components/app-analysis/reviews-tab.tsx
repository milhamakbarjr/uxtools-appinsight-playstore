import { useState, useEffect } from "react";
import { Star, Search, SlidersHorizontal, X, ArrowUpDown, MessageSquare, ChevronDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

type Review = {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  version: string;
  device: string;
  likes: number;
  sentiment: number;
  topics: string[];
};

type ReviewsTabProps = {
  reviews: Review[];
};

export default function ReviewsTab({ reviews }: ReviewsTabProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    search: "",
    rating: "all",
    sentiment: "all",
    dateRange: "all",
    sortBy: "date",
    sortOrder: "desc",
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of reviews per page

  // Handle window resize to show filters on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setFilterOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Filter reviews based on filter values
  const filteredReviews = reviews.filter((review) => {
    // Search text filter
    if (filterValues.search && !review.text.toLowerCase().includes(filterValues.search.toLowerCase()) && 
        !review.author.toLowerCase().includes(filterValues.search.toLowerCase())) {
      return false;
    }
    
    // Rating filter
    if (filterValues.rating !== "all" && review.rating !== parseInt(filterValues.rating)) {
      return false;
    }
    
    // Sentiment filter
    if (filterValues.sentiment === "positive" && review.sentiment < 0.3) return false;
    if (filterValues.sentiment === "neutral" && (review.sentiment < -0.3 || review.sentiment > 0.3)) return false;
    if (filterValues.sentiment === "negative" && review.sentiment > -0.3) return false;
    
    // Date range filter can be implemented with actual date filtering logic
    
    return true;
  }).sort((a, b) => {
    // Sort logic
    if (filterValues.sortBy === "date") {
      return filterValues.sortOrder === "desc" 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (filterValues.sortBy === "rating") {
      return filterValues.sortOrder === "desc" ? b.rating - a.rating : a.rating - b.rating;
    } else if (filterValues.sortBy === "likes") {
      return filterValues.sortOrder === "desc" ? b.likes - a.likes : a.likes - b.likes;
    }
    return 0;
  });
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterValues]);
  
  // Function to change page
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to get sentiment badge variant
  const getSentimentBadge = (sentiment: number) => {
    if (sentiment >= 0.3) return { variant: "success" as const, label: "Positive" };
    if (sentiment <= -0.3) return { variant: "destructive" as const, label: "Negative" };
    return { variant: "outline" as const, label: "Neutral" };
  };
  
  // Function to render star rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} 
      />
    ));
  };
  
  // Reset filters function
  const resetFilters = () => {
    setFilterValues({
      search: "",
      rating: "all",
      sentiment: "all",
      dateRange: "all",
      sortBy: "date",
      sortOrder: "desc"
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Filter sidebar */}
      <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm md:col-span-1 h-fit sticky top-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilterOpen(!filterOpen)}
              className="md:hidden"
            >
              {filterOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            </Button>
          </div>
          <CardDescription className="hidden md:block">
            Refine the review list
          </CardDescription>
        </CardHeader>
        
        <Collapsible open={filterOpen}>
          <CollapsibleContent className="md:block">
            <CardContent className="space-y-4">
              {/* Search filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search reviews..." 
                    className="pl-8"
                    value={filterValues.search}
                    onChange={(e) => setFilterValues({...filterValues, search: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Rating filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <Select 
                  value={filterValues.rating} 
                  onValueChange={(value) => setFilterValues({...filterValues, rating: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ratings</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="1">1 star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sentiment filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sentiment</label>
                <Select 
                  value={filterValues.sentiment} 
                  onValueChange={(value) => setFilterValues({...filterValues, sentiment: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date range filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date range</label>
                <Select 
                  value={filterValues.dateRange} 
                  onValueChange={(value) => setFilterValues({...filterValues, dateRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="lastWeek">Last week</SelectItem>
                    <SelectItem value="lastMonth">Last month</SelectItem>
                    <SelectItem value="last3Months">Last 3 months</SelectItem>
                    <SelectItem value="last6Months">Last 6 months</SelectItem>
                    <SelectItem value="lastYear">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Reviews list */}
      <div className="md:col-span-3 space-y-4">
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Reviews</CardTitle>
              <div className="flex items-center gap-2">
                <Select 
                  value={filterValues.sortBy} 
                  onValueChange={(value) => setFilterValues({...filterValues, sortBy: value})}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="likes">Likes</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setFilterValues({
                    ...filterValues, 
                    sortOrder: filterValues.sortOrder === "asc" ? "desc" : "asc"
                  })}
                  className="h-9 w-9"
                >
                  <ArrowUpDown className={`h-4 w-4 ${filterValues.sortOrder === "asc" ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>
            <CardDescription>
              Showing {indexOfFirstReview + 1}-{Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="space-y-4">
                {currentReviews.length > 0 ? (
                  currentReviews.map((review) => (
                    <Collapsible key={review.id} className="border rounded-lg p-4 bg-white dark:bg-slate-950">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <Badge variant={getSentimentBadge(review.sentiment).variant}>
                              {getSentimentBadge(review.sentiment).label}
                            </Badge>
                          </div>
                          <div className="font-medium">{review.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()} • Version {review.version} • {review.device}
                          </div>
                        </div>
                        <CollapsibleTrigger className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </CollapsibleTrigger>
                      </div>
                      
                      <div className="mt-2 line-clamp-2">
                        {review.text}
                      </div>
                      
                      <CollapsibleContent className="mt-4 space-y-4">
                        <div>
                          <div className="font-medium mb-1">Full Review:</div>
                          <div>{review.text}</div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium mb-1">Topics:</div>
                            <div className="flex flex-wrap gap-2">
                              {review.topics.map((topic, i) => (
                                <Badge key={i} variant="secondary">{topic}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-8">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.likes} users found this helpful</span>
                          </div>
                        </div>
                        
                        
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No reviews match your current filters.</p>
                    <Button 
                      variant="link" 
                      onClick={resetFilters}
                    >
                      Reset filters
                    </Button>
                  </div>
                )}
                
                {/* Pagination controls */}
                {filteredReviews.length > 0 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => paginate(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                        />
                      </PaginationItem>
                      
                      {totalPages <= 5 ? (
                        // Show all pages if 5 or fewer
                        Array.from({ length: totalPages }).map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => paginate(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))
                      ) : (
                        // Show limited pages with ellipsis for larger page counts
                        <>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => paginate(1)}
                              isActive={currentPage === 1}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          
                          {currentPage > 3 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          
                          {currentPage > 2 && (
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => paginate(currentPage - 1)}
                              >
                                {currentPage - 1}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                          
                          {currentPage !== 1 && currentPage !== totalPages && (
                            <PaginationItem>
                              <PaginationLink isActive>
                                {currentPage}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                          
                          {currentPage < totalPages - 1 && (
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => paginate(currentPage + 1)}
                              >
                                {currentPage + 1}
                              </PaginationLink>
                            </PaginationItem>
                          )}
                          
                          {currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => paginate(totalPages)}
                              isActive={currentPage === totalPages}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => paginate(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
