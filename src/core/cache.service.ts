import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly cache = new Map<string, any>();
  private readonly logger = new Logger(CacheService.name);

  set(key: string, value: any, ttl: number = 60): void {
    this.logger.log(`Setting cache for key: ${key} with TTL: ${ttl}s.`);
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  get(key: string): any {
    const cached = this.cache.get(key);
    if (cached) {
      if (Date.now() > cached.expiresAt) {
        this.logger.log(`Cache expired for key: ${key}.`);
        this.cache.delete(key);
        return null;
      }
      this.logger.log(`Cache hit for key: ${key}.`);
      return cached.value;
    }
    this.logger.log(`Cache miss for key: ${key}.`);
    return null;
  }

  invalidate(key: string): void {
    this.logger.log(`Invalidating cache for key: ${key}.`);
    this.cache.delete(key);
  }
}
