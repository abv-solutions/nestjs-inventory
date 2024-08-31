import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, DatabaseService, CacheService],
  exports: [ConfigService, DatabaseService, CacheService],
})
export class CoreModule {}
