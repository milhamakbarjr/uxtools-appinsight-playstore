import { CombinedAnalysisResult, AnalysisProgress } from '../types';

/**
 * Configuration for the analysis cache
 */
export interface AnalysisCacheConfig {
  /** Maximum size of the cache in bytes */
  maxCacheSize: number;
  /** Time to live for cached items in milliseconds */
  ttl: number;
  /** Database name */
  dbName: string;
  /** Whether to persist analysis progress */
  persistProgress: boolean;
  /** Version of the database schema */
  dbVersion: number;
}

/**
 * Information about a cached analysis result
 */
export interface CachedAnalysisInfo {
  /** Unique identifier for the cached analysis */
  id: string;
  /** App ID the analysis is for */
  appId: string;
  /** Timestamp when the analysis was cached */
  timestamp: number;
  /** Size of the cached data in bytes */
  size: number;
  /** Number of reviews analyzed */
  reviewCount: number;
  /** Hash of the configuration used for analysis */
  configHash: string;
  /** When this cache entry expires */
  expiresAt: number;
  /** Last accessed timestamp */
  lastAccessed: number;
}

/**
 * Cached analysis data
 */
export interface CachedAnalysis extends CachedAnalysisInfo {
  /** The cached analysis result */
  result: CombinedAnalysisResult;
}

/**
 * Progress state for an ongoing analysis
 */
export interface CachedProgress {
  /** Unique identifier for the progress */
  id: string;
  /** App ID the analysis is for */
  appId: string;
  /** Timestamp when the progress was last updated */
  updatedAt: number;
  /** Progress state for each analyzer */
  progress: Record<string, AnalysisProgress>;
  /** Analysis configuration */
  config: any;
}

/**
 * Status of the cache
 */
export interface CacheStatus {
  /** Whether the cache is ready */
  isReady: boolean;
  /** Total number of cached analyses */
  itemCount: number;
  /** Total size of cached data in bytes */
  totalSize: number;
  /** Maximum size allowed for the cache */
  maxSize: number;
  /** Percentage of cache space used */
  usagePercentage: number;
}

/**
 * Class for caching analysis results and progress in IndexedDB
 */
export class AnalysisCache {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<boolean>;
  private config: AnalysisCacheConfig;
  private status: CacheStatus;

  /**
   * Create a new AnalysisCache
   */
  constructor(config?: Partial<AnalysisCacheConfig>) {
    // Default configuration
    this.config = {
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      dbName: 'analysis-cache',
      persistProgress: true,
      dbVersion: 1,
      ...config
    };

    this.status = {
      isReady: false,
      itemCount: 0,
      totalSize: 0,
      maxSize: this.config.maxCacheSize,
      usagePercentage: 0
    };

    // Initialize the database
    this.dbReady = this.initDatabase();
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initDatabase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB is not supported in this browser');
        resolve(false);
        return;
      }

      const request = window.indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = (event) => {
        console.error('Failed to open IndexedDB:', (event.target as IDBRequest).error);
        resolve(false);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.status.isReady = true;
        this.updateCacheStatus().then(() => resolve(true));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('analyses')) {
          const analysesStore = db.createObjectStore('analyses', { keyPath: 'id' });
          analysesStore.createIndex('appId', 'appId', { unique: false });
          analysesStore.createIndex('timestamp', 'timestamp', { unique: false });
          analysesStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          analysesStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('appId', 'appId', { unique: false });
          progressStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Update the cache status with current usage information
   */
  private async updateCacheStatus(): Promise<void> {
    if (!this.db) {
      await this.dbReady;
      if (!this.db) return;
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['analyses', 'metadata'], 'readonly');
      const analysesStore = transaction.objectStore('analyses');
      const metadataStore = transaction.objectStore('metadata');

      const countRequest = analysesStore.count();
      countRequest.onsuccess = () => {
        this.status.itemCount = countRequest.result;
      };

      const sizeRequest = metadataStore.get('totalSize');
      sizeRequest.onsuccess = () => {
        this.status.totalSize = sizeRequest.result?.value || 0;
        this.status.usagePercentage = (this.status.totalSize / this.config.maxCacheSize) * 100;
      };

      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Get the current status of the cache
   */
  public async getStatus(): Promise<CacheStatus> {
    await this.dbReady;
    await this.updateCacheStatus();
    return { ...this.status };
  }

  /**
   * Store an analysis result in the cache
   */
  public async set(
    appId: string, 
    result: CombinedAnalysisResult, 
    configHash: string = 'default'
  ): Promise<string> {
    await this.dbReady;
    if (!this.db) throw new Error('Cache database not available');

    // Generate a cache ID
    const id = `${appId}_${configHash}_${Date.now()}`;
    
    // Calculate the size of the data (approximate)
    const dataStr = JSON.stringify(result);
    const size = new Blob([dataStr]).size;

    // Check if we need to clean up before adding
    if (this.status.totalSize + size > this.config.maxCacheSize) {
      await this.cleanup(size);
    }

    const timestamp = Date.now();
    const expiresAt = timestamp + this.config.ttl;

    const cachedAnalysis: CachedAnalysis = {
      id,
      appId,
      timestamp,
      size,
      reviewCount: result.stats.totalReviews,
      configHash,
      expiresAt,
      lastAccessed: timestamp,
      result
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analyses', 'metadata'], 'readwrite');
      
      // Update the analyses store
      const analysesStore = transaction.objectStore('analyses');
      const addRequest = analysesStore.add(cachedAnalysis);
      
      addRequest.onerror = () => {
        reject(new Error(`Failed to cache analysis: ${addRequest.error}`));
      };
      
      // Update the total size in metadata
      const metadataStore = transaction.objectStore('metadata');
      const getSizeRequest = metadataStore.get('totalSize');
      
      getSizeRequest.onsuccess = () => {
        const currentSize = getSizeRequest.result?.value || 0;
        const newSize = currentSize + size;
        
        metadataStore.put({ key: 'totalSize', value: newSize });
      };
      
      transaction.oncomplete = () => {
        this.status.totalSize += size;
        this.status.itemCount++;
        this.status.usagePercentage = (this.status.totalSize / this.config.maxCacheSize) * 100;
        resolve(id);
      };
    });
  }

  /**
   * Get an analysis result from the cache
   */
  public async get(appId: string, configHash: string = 'default'): Promise<CombinedAnalysisResult | null> {
    await this.dbReady;
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction('analyses', 'readwrite');
      const store = transaction.objectStore('analyses');
      const index = store.index('appId');
      
      const request = index.openCursor(IDBKeyRange.only(appId));
      let result: CachedAnalysis | null = null;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          const analysis = cursor.value as CachedAnalysis;
          
          // Check if this matches our config and isn't expired
          if (analysis.configHash === configHash && analysis.expiresAt > Date.now()) {
            if (!result || analysis.timestamp > result.timestamp) {
              result = analysis;
            }
          }
          
          cursor.continue();
        } else if (result) {
          // Update last accessed time
          result.lastAccessed = Date.now();
          store.put(result);
          resolve(result.result);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.error('Error retrieving from cache:', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Remove expired and least recently used items to free up space
   */
  private async cleanup(requiredSpace: number = 0): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['analyses', 'metadata'], 'readwrite');
      const store = transaction.objectStore('analyses');
      const metadataStore = transaction.objectStore('metadata');
      
      // First, remove expired items
      const now = Date.now();
      const expiryIndex = store.index('expiresAt');
      const expiredRange = IDBKeyRange.upperBound(now);
      
      const expiredRequest = expiryIndex.openCursor(expiredRange);
      let freedSpace = 0;
      let removedCount = 0;
      
      expiredRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          const analysis = cursor.value as CachedAnalysis;
          freedSpace += analysis.size;
          removedCount++;
          cursor.delete();
          cursor.continue();
        } else {
          // If we still need more space, remove by LRU
          if (freedSpace < requiredSpace) {
            this.removeLRUItems(store, requiredSpace - freedSpace).then((additionalSpace) => {
              freedSpace += additionalSpace.freed;
              removedCount += additionalSpace.count;
              
              // Update metadata
              const getSizeRequest = metadataStore.get('totalSize');
              getSizeRequest.onsuccess = () => {
                const currentSize = getSizeRequest.result?.value || 0;
                metadataStore.put({ key: 'totalSize', value: currentSize - freedSpace });
              };
            });
          } else {
            // Update metadata
            const getSizeRequest = metadataStore.get('totalSize');
            getSizeRequest.onsuccess = () => {
              const currentSize = getSizeRequest.result?.value || 0;
              metadataStore.put({ key: 'totalSize', value: currentSize - freedSpace });
            };
          }
        }
      };
      
      transaction.oncomplete = () => {
        this.status.totalSize -= freedSpace;
        this.status.itemCount -= removedCount;
        this.status.usagePercentage = (this.status.totalSize / this.config.maxCacheSize) * 100;
        resolve();
      };
    });
  }

  /**
   * Remove least recently used items to free up the specified amount of space
   */
  private async removeLRUItems(
    store: IDBObjectStore, 
    requiredSpace: number
  ): Promise<{ freed: number, count: number }> {
    return new Promise((resolve) => {
      const lastAccessedIndex = store.index('lastAccessed');
      const request = lastAccessedIndex.openCursor();
      
      let freedSpace = 0;
      let removedCount = 0;
      const itemsToRemove: string[] = [];
      const itemSizes: Record<string, number> = {};
      
      // First pass: collect items ordered by last accessed
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        
        if (cursor) {
          const analysis = cursor.value as CachedAnalysis;
          itemsToRemove.push(analysis.id);
          itemSizes[analysis.id] = analysis.size;
          cursor.continue();
        } else {
          // Second pass: remove items until we have enough space
          let i = 0;
          while (freedSpace < requiredSpace && i < itemsToRemove.length) {
            const id = itemsToRemove[i];
            store.delete(id);
            freedSpace += itemSizes[id];
            removedCount++;
            i++;
          }
          
          resolve({ freed: freedSpace, count: removedCount });
        }
      };
    });
  }

  /**
   * Save analysis progress to be resumed later
   */
  public async saveProgress(
    id: string,
    appId: string,
    progress: Record<string, AnalysisProgress>,
    config: any
  ): Promise<void> {
    if (!this.config.persistProgress || !this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('progress', 'readwrite');
      const store = transaction.objectStore('progress');
      
      const progressData: CachedProgress = {
        id,
        appId,
        updatedAt: Date.now(),
        progress,
        config
      };
      
      const request = store.put(progressData);
      
      request.onerror = () => {
        reject(new Error(`Failed to save progress: ${request.error}`));
      };
      
      transaction.oncomplete = () => {
        resolve();
      };
    });
  }

  /**
   * Get saved analysis progress
   */
  public async getProgress(id: string): Promise<CachedProgress | null> {
    if (!this.config.persistProgress || !this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction('progress', 'readonly');
      const store = transaction.objectStore('progress');
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        console.error('Error retrieving progress:', request.error);
        resolve(null);
      };
    });
  }

  /**
   * Clear progress for a specific analysis
   */
  public async clearProgress(id: string): Promise<void> {
    if (!this.config.persistProgress || !this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction('progress', 'readwrite');
      const store = transaction.objectStore('progress');
      
      store.delete(id);
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Clear all progress data
   */
  public async clearAllProgress(): Promise<void> {
    if (!this.config.persistProgress || !this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction('progress', 'readwrite');
      const store = transaction.objectStore('progress');
      
      store.clear();
      transaction.oncomplete = () => resolve();
    });
  }

  /**
   * Clear all cached analyses
   */
  public async clearAll(): Promise<void> {
    await this.dbReady;
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['analyses', 'metadata'], 'readwrite');
      
      transaction.objectStore('analyses').clear();
      transaction.objectStore('metadata').put({ key: 'totalSize', value: 0 });
      
      transaction.oncomplete = () => {
        this.status.itemCount = 0;
        this.status.totalSize = 0;
        this.status.usagePercentage = 0;
        resolve();
      };
    });
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.status.isReady = false;
    }
  }
}
