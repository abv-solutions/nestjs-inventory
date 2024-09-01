import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../core/database.service';
import { CacheService } from 'src/core/cache.service';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);
  private readonly cacheKey = 'all_projects';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  /**
   * Fetch all projects from the database.
   * Checks cache first, if not found, queries the database.
   * Caches the result after fetching from the database.
   */
  async findAll(limit: number = 100): Promise<Project[]> {
    try {
      this.logger.log(
        `Database query initiated: Fetching up to ${limit} projects.`,
      );

      // Check the cache first
      const cachedProjects = this.cacheService.get(this.cacheKey);
      if (cachedProjects && cachedProjects.length <= limit) {
        return cachedProjects.slice(0, limit); // Return only the limited number of records
      }

      // If not cached or cache exceeds the limit, fetch from database
      const result = await this.databaseService.query(
        `SELECT * FROM projects LIMIT $1;`,
        [limit],
      );

      this.logger.log(
        `Database query successful: Fetched up to ${limit} projects.`,
      );

      // Map results to Project instances
      const projects = result.map((record) => new Project(record));

      // Cache the result
      this.cacheService.set(this.cacheKey, projects, 300);

      return projects;
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'findAll');
    }
  }
}
