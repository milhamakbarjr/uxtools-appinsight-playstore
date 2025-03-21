import { useState, useEffect } from 'react';
import { AnalysisCache, CacheStatus } from './AnalysisCache';
import { CombinedAnalysisResult } from '../types';

// Singleton instance of the cache
let cacheInstance: AnalysisCache | null = null;

export function useAnalysisCache() {
  const [status, setStatus] = useState<CacheStatus>({
    isReady: false,
    itemCount: 0,
    totalSize: 0,
    maxSize: 0,
    usagePercentage: 0
  });

  // Initialize cache if needed
  useEffect(() => {
    if (!cacheInstance) {
      cacheInstance = new AnalysisCache();
    }
    
    // Get initial status
    cacheInstance.getStatus().then(setStatus);
    
    // Cleanup on unmount
    return () => {
      // Do not close the cache as it's a singleton
    };
  }, []);

  /**
   * Get a cached analysis result
   */
  const getAnalysis = async (appId: string, configHash?: string): Promise<CombinedAnalysisResult | null> => {
    if (!cacheInstance) return null;
    const result = await cacheInstance.get(appId, configHash);
    await cacheInstance.getStatus().then(setStatus);
    return result;
  };

  /**
   * Cache an analysis result
   */
  const cacheAnalysis = async (
    appId: string, 
    result: CombinedAnalysisResult, 
    configHash?: string
  ): Promise<string> => {
    if (!cacheInstance) throw new Error('Cache not available');
    const id = await cacheInstance.set(appId, result, configHash);
    await cacheInstance.getStatus().then(setStatus);
    return id;
  };

  /**
   * Save analysis progress
   */
  const saveProgress = async (
    id: string,
    appId: string,
    progress: any,
    config: any
  ): Promise<void> => {
    if (!cacheInstance) return;
    await cacheInstance.saveProgress(id, appId, progress, config);
  };

  /**
   * Get saved analysis progress
   */
  const getProgress = async (id: string) => {
    if (!cacheInstance) return null;
    return cacheInstance.getProgress(id);
  };

  /**
   * Clear all cached data
   */
  const clearCache = async (): Promise<void> => {
    if (!cacheInstance) return;
    await cacheInstance.clearAll();
    await cacheInstance.getStatus().then(setStatus);
  };

  return {
    status,
    getAnalysis,
    cacheAnalysis,
    saveProgress,
    getProgress,
    clearCache
  };
}
