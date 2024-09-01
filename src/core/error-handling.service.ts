import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorHandlingService {
  private readonly logger = new Logger(ErrorHandlingService.name);

  handleDatabaseError(error: any, context: string): never {
    this.logger.error(
      `Database operation failed in ${context}: ${error.message}`,
      error.stack,
    );
    throw new Error(
      `Database operation failed in ${context}: ${error.message}`,
    );
  }

  handleNotFoundError(entity: string, identifier: string | number): never {
    this.logger.warn(`${entity} with identifier ${identifier} not found.`);
    throw new Error(`${entity} with identifier ${identifier} not found.`);
  }

  handleUnexpectedError(error: any, context: string): never {
    this.logger.error(
      `Unexpected error occurred in ${context}: ${error.message}`,
      error.stack,
    );
    throw new Error(
      `Unexpected error occurred in ${context}: ${error.message}`,
    );
  }
}
