import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { CacheService } from './cache.service';
import { ErrorHandlingService } from './error-handling.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    ConfigService,
    DatabaseService,
    CacheService,
    ErrorHandlingService,
  ],
  exports: [ConfigService, DatabaseService, CacheService, ErrorHandlingService],
})
export class CoreModule {}
