import { useState, useEffect } from 'react';
import { AnalysisService } from '~/lib/analysis/AnalysisService';
import { useAnalysisCache } from '~/lib/analysis/cache/useAnalysisCache';
import { Button } from '~/components/ui/button';
import { Progress } from '~/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { AlertCircle, CheckCircle2, Database, RefreshCw, XCircle } from 'lucide-react';

interface AnalysisManagerProps {
  appId: string;
  reviews: any[];
  onAnalysisComplete: (results: any) => void;
}

export function AnalysisManager({ appId, reviews, onAnalysisComplete }: AnalysisManagerProps) {
  const [analysisService] = useState(() => new AnalysisService(50, true));
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    status: cacheStatus, 
    getAnalysis, 
    clearCache 
  } = useAnalysisCache();
  
  // Overall progress calculation
  const overallProgress = isAnalyzing ? 
    Object.values(progress).reduce((sum, p) => sum + (p.progress || 0), 0) / 
    Math.max(1, Object.keys(progress).length) : 0;
  
  useEffect(() => {
    // Check for cached results first
    if (appId) {
      getAnalysis(appId)
        .then(result => {
          if (result) {
            onAnalysisComplete(result);
          }
        })
        .catch(err => {
          console.error('Error checking cache:', err);
        });
    }
    
    // Set up progress tracking
    const progressInterval = setInterval(() => {
      if (isAnalyzing) {
        setProgress(analysisService.getProgress());
      }
    }, 500);
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [appId, isAnalyzing]);

  const startAnalysis = async () => {
    if (!reviews.length) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const results = await analysisService.analyzeReviews(reviews, { appId });
      setIsAnalyzing(false);
      onAnalysisComplete(results);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      setIsAnalyzing(false);
    }
  };
  
  const cancelAnalysis = async () => {
    await analysisService.cancelAnalysis();
    setIsAnalyzing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analysis Status</span>
          <div className="text-sm font-normal flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache: {cacheStatus.usagePercentage.toFixed(1)}% used
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            <Progress value={overallProgress} className="h-2" />
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(progress).map(([type, data]) => (
                <div key={type} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                  <div className="text-sm font-medium mb-1 capitalize">{type}</div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{data.stage}</span>
                    <span>{data.progress}%</span>
                  </div>
                  <Progress value={data.progress} className="h-1 mt-1" />
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={cancelAnalysis}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={startAnalysis} disabled={!reviews.length}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {cacheStatus.itemCount > 0 ? 'Re-analyze' : 'Start Analysis'}
              </Button>
              
              {cacheStatus.itemCount > 0 && (
                <Button variant="outline" onClick={() => clearCache()}>
                  Clear Cache
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
