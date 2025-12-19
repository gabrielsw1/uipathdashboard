import NodeCache from 'node-cache';

export class CacheService {
  private cache: NodeCache;
  private defaultTTL: number;

  constructor(ttlSeconds: number = 300) {
    this.defaultTTL = ttlSeconds;
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.defaultTTL);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  // Métodos específicos para diferentes tipos de dados
  getFolders<T>(): T | undefined {
    return this.get<T>('folders');
  }

  setFolders<T>(data: T): boolean {
    return this.set<T>('folders', data, 3600); // Cache de 1 hora para folders
  }

  getProcesses<T>(folderId?: number): T | undefined {
    const key = folderId ? `processes_${folderId}` : 'processes_all';
    return this.get<T>(key);
  }

  setProcesses<T>(data: T, folderId?: number): boolean {
    const key = folderId ? `processes_${folderId}` : 'processes_all';
    return this.set<T>(key, data, 1800); // Cache de 30 minutos para processos
  }

  getStats<T>(key: string): T | undefined {
    return this.get<T>(`stats_${key}`);
  }

  setStats<T>(key: string, data: T): boolean {
    return this.set<T>(`stats_${key}`, data, 300); // Cache de 5 minutos para stats
  }

  invalidateStats(): void {
    const keys = this.cache.keys();
    keys.filter(k => k.startsWith('stats_')).forEach(k => this.del(k));
  }
}

export const cacheService = new CacheService(
  parseInt(process.env.CACHE_TTL || '300', 10)
);

