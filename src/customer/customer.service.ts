import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../core/database.service';
import { CacheService } from 'src/core/cache.service';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { Customer } from './customer.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  private readonly cacheKey = 'all_customers';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  /**
   * Fetch all customers from the database.
   * Checks cache first, if not found, queries the database.
   * Caches the result after fetching from the database.
   */
  async findAll(limit: number = 100): Promise<Customer[]> {
    try {
      this.logger.log(
        `Database query initiated: Fetching up to ${limit} customers.`,
      );

      // Check the cache first
      const cachedCustomers = this.cacheService.get(this.cacheKey);
      if (cachedCustomers && cachedCustomers.length <= limit) {
        return cachedCustomers.slice(0, limit); // Return only the limited number of records
      }

      // If not cached or cache exceeds the limit, fetch from database
      const result = await this.databaseService.query(
        `SELECT * FROM customers LIMIT $1;`,
        [limit],
      );

      this.logger.log(
        `Database query successful: Fetched up to ${limit} customers.`,
      );

      // Map results to Customer instances
      const customers = result.map((record) => new Customer(record));

      // Cache the result
      this.cacheService.set(this.cacheKey, customers, 300);

      return customers;
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'findAll');
    }
  }
}
