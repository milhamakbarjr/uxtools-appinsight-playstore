import { useLoaderData, json, Link } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Star, BarChart2, Download, MessageSquare, PieChart, FileJson, FileSpreadsheet, FileCode, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import OverviewTab from "~/components/app-analysis/overview-tab";
import ReviewsTab from "~/components/app-analysis/reviews-tab";
import TopicsTab from "~/components/app-analysis/topics-tab";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "~/components/ui/dropdown-menu";
import { useState } from "react";

import { PlayStoreScraper } from '~/lib/scraper/PlayStoreScraper'
import { AnalysisService } from '~/lib/analysis/AnalysisService'
import { AnalysisTransformer } from '~/lib/analysis/transformers/AnalysisTransformer'

export async function loader({ params }: LoaderFunctionArgs) {

  const scraper = new PlayStoreScraper({
    maxReviews: 1000,
    batchSize: 100
  })
  const fetchedReviews = await scraper.scrape(params.appId || 'unknown');
  const appDetails = await scraper.getDetails(params.appId || 'unknown');
  const analysisService = new AnalysisService();
  const analysisResult = await analysisService.analyzeReviews(fetchedReviews.reviews);
  const transformedData = new AnalysisTransformer(analysisResult, fetchedReviews.reviews, {
    name: appDetails.title,
    version: appDetails.version
  });
  const overviewTabData = transformedData.getOverviewTabData();
  const reviewsTabData = transformedData.getReviewsTabData();
  const topicsTabData = transformedData.getTopicsTabData();

  const appData = {
    id: params.appId || "unknown",
    icon: appDetails.icon,
    developer: appDetails.developer,
    name: overviewTabData.app.name,
    rating: overviewTabData.app.rating,
    reviews: overviewTabData.app.reviews,
    version: overviewTabData.app.version,
    installs: appDetails.installs,
    lastUpdated: new Date(appDetails.updated).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    description: appDetails.description,
    category: appDetails.categories[0].name,
  };

  return ({
    app: appData,
    reviewsStats: overviewTabData.reviewsStats,
    reviews: reviewsTabData.reviews,
    topicsData: topicsTabData,
  });
}

export default function AppAnalysis() {
  const { app, reviewsStats, reviews: rawReviews, topicsData } = useLoaderData<typeof loader>();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Transform the reviews to match the Review type
  const reviews = rawReviews.map(review => ({
    id: review.id,
    author: review.author,
    rating: review.rating,
    text: review.text,
    date: review.date,
    device: review.device || "Unknown",
    likes: review.likes,
    version: review.version,
    sentiment: review.sentiment,
    topics: review.topics
  }));

  // Export Handlers
  const handleExportJSON = async () => {
    try {
      setIsExporting('json');
      const jsonData = JSON.stringify(rawReviews, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name}-reviews.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportXML = async () => {
    try {
      setIsExporting('xml');
      
      // Convert reviews to XML format
      let xmlData = '<?xml version="1.0" encoding="UTF-8" ?>\n<reviews>\n';
      
      rawReviews.forEach(review => {
        xmlData += '  <review>\n';
        xmlData += `    <id>${review.id}</id>\n`;
        xmlData += `    <author>${review.author}</author>\n`;
        xmlData += `    <rating>${review.rating}</rating>\n`;
        xmlData += `    <text>${review.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
        xmlData += `    <date>${review.date}</date>\n`;
        xmlData += `    <device>${review.device || "Unknown"}</device>\n`;
        xmlData += `    <likes>${review.likes}</likes>\n`;
        xmlData += `    <version>${review.version}</version>\n`;
        xmlData += `    <sentiment>${review.sentiment}</sentiment>\n`;
        xmlData += '    <topics>\n';
        review.topics.forEach(topic => {
          xmlData += `      <topic>${topic}</topic>\n`;
        });
        xmlData += '    </topics>\n';
        xmlData += '  </review>\n';
      });
      
      xmlData += '</reviews>';
      
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name}-reviews.xml`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting XML:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting('excel');
      
      // Dynamically import xlsx library
      const XLSX = await import('xlsx');
      
      // Prepare data for Excel
      const excelData = rawReviews.map(review => ({
        ID: review.id,
        Author: review.author,
        Rating: review.rating,
        Review: review.text,
        Date: review.date,
        Device: review.device || "Unknown",
        Likes: review.likes,
        Version: review.version,
        Sentiment: review.sentiment,
        Topics: review.topics.join(', ')
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${app.name}-reviews.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExporting(null);
    }
  };

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
                <Badge variant="outline">{app.version}</Badge>
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" disabled={!!isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportJSON} disabled={!!isExporting}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportXML} disabled={!!isExporting}>
                    <FileCode className="h-4 w-4 mr-2" />
                    Export as XML
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} disabled={!!isExporting}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <TopicsTab reviewsData={topicsData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
