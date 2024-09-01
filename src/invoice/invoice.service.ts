import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../core/database.service';
import { Invoice } from './invoice.entity';
import { EventBus } from '@nestjs/cqrs';
import { InvoicePaidEvent } from './events/invoice-paid.event';
import { CacheService } from 'src/core/cache.service';
import { InvoiceFetchedEvent } from './events/invoice-fetched.event';
import { ErrorHandlingService } from 'src/core/error-handling.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly cacheKey = 'all_invoices';

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventBus: EventBus,
    private readonly cacheService: CacheService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  async findAll(): Promise<Invoice[]> {
    try {
      this.logger.log('Database query initiated: Fetching all invoices.');

      // Check the cache first
      const cachedInvoices = this.cacheService.get(this.cacheKey);
      if (cachedInvoices) {
        return cachedInvoices;
      }

      // If not cached, fetch from database
      const result = await this.databaseService.query(
        `SELECT * FROM invoices;`,
      );

      this.logger.log('Database query successful: Fetched all invoices.');

      // Map results to Invoice instances
      const invoices = result.map((record) => new Invoice(record));

      // Cache the result
      this.cacheService.set(this.cacheKey, invoices, 300); // Cache for 5 minutes

      return invoices;
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'findAll');
    }
  }

  async findOne(invoice_number: number): Promise<Invoice> {
    try {
      this.logger.log(
        `Database query initiated: Fetching invoice #${invoice_number}.`,
      );

      // Check the cache for the entire list
      const cachedInvoices = this.cacheService.get(this.cacheKey);

      if (cachedInvoices) {
        // Find the invoice in the cached list
        const invoice = cachedInvoices.find(
          (inv: Invoice) => inv.invoice_number === invoice_number,
        );
        if (invoice) {
          return invoice;
        }
      }

      // If not cached or not found, fetch from the database
      const result = await this.databaseService.query(
        `SELECT * FROM invoices WHERE invoice_number = $1;`,
        [invoice_number],
      );

      if (result.length > 0) {
        const invoice = new Invoice(result[0]);

        // Update the cache with the new invoice list
        const updatedInvoices = cachedInvoices
          ? [...cachedInvoices, invoice]
          : [invoice];
        this.cacheService.set(this.cacheKey, updatedInvoices, 300); // Cache for 5 minutes

        this.logger.log(
          `Database query successful: Retrieved invoice #${invoice_number}.`,
        );

        this.eventBus.publish(
          new InvoiceFetchedEvent(invoice_number, new Date()),
        );

        return invoice;
      }

      this.errorHandlingService.handleNotFoundError('Invoice', invoice_number);
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'findOne');
    }
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      // Create a new invoice in the database
      const result = await this.databaseService.query(
        `INSERT INTO invoices (invoice_number, amount, currency, description, payment_term, is_storno, is_paid, customer_id, project_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *;`,
        [
          invoiceData.invoice_number,
          invoiceData.amount,
          invoiceData.currency,
          invoiceData.description,
          invoiceData.payment_term,
          invoiceData.is_storno,
          invoiceData.is_paid,
          invoiceData.customer_id,
          invoiceData.project_id,
        ],
      );

      const newInvoice = new Invoice(result[0]);

      // Retrieve the cached list of invoices
      const cachedInvoices = this.cacheService.get(this.cacheKey);

      // Update the cache with the new invoice list
      const updatedInvoices = cachedInvoices
        ? [...cachedInvoices, newInvoice]
        : [newInvoice];
      this.cacheService.set(this.cacheKey, updatedInvoices, 60); // Cache for 1 minute

      return newInvoice;
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'createInvoice');
    }
  }

  async updateInvoice(
    invoice_number: number,
    updateData: Partial<Invoice>,
  ): Promise<Invoice> {
    try {
      const columns = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');

      const values = Object.values(updateData);
      values.push(invoice_number);

      this.logger.log(
        `Database update initiated: Updating invoice #${invoice_number} with data ${JSON.stringify(updateData)}.`,
      );

      const result = await this.databaseService.query(
        `UPDATE invoices
         SET ${columns}
         WHERE invoice_number = $${values.length}
         RETURNING *;`,
        values,
      );

      if (result.length > 0) {
        const updatedInvoice = new Invoice(result[0]);

        this.logger.log(
          `Database update successful: Invoice #${invoice_number} updated.`,
        );

        // Retrieve and update the cached list
        const cachedInvoices = this.cacheService.get(this.cacheKey);

        if (cachedInvoices) {
          const updatedInvoices = cachedInvoices.map((invoice) =>
            invoice.invoice_number === updatedInvoice.invoice_number
              ? updatedInvoice
              : invoice,
          );
          this.cacheService.set(this.cacheKey, updatedInvoices, 60); // Cache for 1 minute
        }

        return updatedInvoice;
      } else {
        this.errorHandlingService.handleNotFoundError(
          'Invoice',
          invoice_number,
        );
      }
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'updateInvoice');
    }
  }

  async generateStornoInvoice(invoice_number: number): Promise<Invoice> {
    try {
      this.logger.log(
        `Database query initiated: Generating storno for invoice #${invoice_number}.`,
      );

      const result = await this.databaseService.query(
        `WITH original_invoice AS (
           SELECT * FROM invoices WHERE invoice_number = $1
         )
         INSERT INTO invoices 
           (invoice_number, amount, currency, description, payment_term, is_storno, customer_id, project_id, is_paid)
         SELECT
           invoice_number + 100000000 AS invoice_number,
           -amount,
           currency,
           CONCAT('Storno for invoice #', invoice_number, ': ', description) AS description,
           payment_term,
           TRUE AS is_storno,
           customer_id,
           project_id,
           is_paid
         FROM original_invoice
         RETURNING *;`,
        [invoice_number],
      );

      if (result.length > 0) {
        const stornoInvoice = new Invoice(result[0]);

        this.logger.log(
          `Database update successful: Generated storno invoice #${stornoInvoice.invoice_number} for invoice #${invoice_number}.`,
        );

        // Retrieve and update the cached list if it exists
        const cachedInvoices = this.cacheService.get(this.cacheKey);

        if (cachedInvoices) {
          const updatedInvoices = [...cachedInvoices, stornoInvoice];
          this.cacheService.set(this.cacheKey, updatedInvoices, 60); // Cache for 1 minute
        }

        return stornoInvoice;
      } else {
        this.errorHandlingService.handleNotFoundError(
          'Invoice',
          invoice_number,
        );
      }
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(
        error,
        'generateStornoInvoice',
      );
    }
  }

  async markAsPaid(invoice_number: number, is_paid: boolean): Promise<Invoice> {
    try {
      this.logger.log(
        `Database update initiated: Marking invoice #${invoice_number} as paid or unpaid.`,
      );

      const result = await this.databaseService.query(
        `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
        [is_paid, invoice_number],
      );

      if (result.length > 0) {
        const updatedInvoice = new Invoice(result[0]);

        this.logger.log(
          `Database update successful: Invoice #${invoice_number} marked as paid or unpaid.`,
        );

        this.eventBus.publish(new InvoicePaidEvent(invoice_number, new Date()));

        // Retrieve and update the cached list if it exists
        const cachedInvoices = this.cacheService.get(this.cacheKey);

        if (cachedInvoices) {
          const updatedInvoices = cachedInvoices.map((invoice) =>
            invoice.invoice_number === invoice_number
              ? updatedInvoice
              : invoice,
          );
          this.cacheService.set(this.cacheKey, updatedInvoices, 60); // Cache for 1 minute
        }

        return updatedInvoice;
      } else {
        this.errorHandlingService.handleNotFoundError(
          'Invoice',
          invoice_number,
        );
      }
    } catch (error) {
      this.errorHandlingService.handleDatabaseError(error, 'markAsPaid');
    }
  }
}
