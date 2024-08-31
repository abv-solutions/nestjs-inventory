import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../core/database.service';
import { Invoice } from './invoice.entity';
import { EventBus } from '@nestjs/cqrs';
import { InvoicePaidEvent } from './events/invoice-paid.event';
import { CacheService } from 'src/core/cache.service';
import { InvoiceFetchedEvent } from './events/invoice-fetched.event';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventBus: EventBus,
    private readonly cacheService: CacheService,
  ) {}

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const result = await this.databaseService.query(
      `INSERT INTO invoices (invoice_number, amount, currency, description, payment_term, is_storno, customer_id, project_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        invoiceData.invoice_number,
        invoiceData.amount,
        invoiceData.currency,
        invoiceData.description,
        invoiceData.payment_term,
        invoiceData.is_storno,
        invoiceData.customer_id,
        invoiceData.project_id,
      ],
    );
    return new Invoice(result[0]);
  }

  async markAsPaid(invoice_number: number, is_paid: boolean): Promise<Invoice> {
    this.logger.log(
      `Database update initiated: Marking invoice #${invoice_number} as paid (is_paid: ${is_paid}).`,
    );

    await this.databaseService.query(
      `UPDATE invoices 
       SET is_paid = $1 
       WHERE invoice_number = $2;`,
      [is_paid, invoice_number],
    );

    this.logger.log(
      `Database update successful: Invoice #${invoice_number} marked as paid.`,
    );

    this.logger.log(
      `Database query initiated: Fetching invoice #${invoice_number}.`,
    );

    const result = await this.databaseService.query(
      `SELECT * FROM invoices WHERE invoice_number = $1;`,
      [invoice_number],
    );

    if (result.length > 0) {
      const updatedInvoice = new Invoice(result[0]);

      this.logger.log(
        `Database query successful: Fetched updated details for invoice #${invoice_number}.`,
      );

      this.eventBus.publish(new InvoicePaidEvent(invoice_number, new Date()));

      // Invalidate cache for the updated invoice
      this.cacheService.invalidate(`invoice_${invoice_number}`);

      return updatedInvoice;
    } else {
      this.logger.error(
        `Database query failed: Invoice with number ${invoice_number} not found.`,
      );
    }
  }

  async findAll(): Promise<Invoice[]> {
    this.logger.log('Fetching all invoices from database.');
    const result = await this.databaseService.query(`SELECT * FROM invoices;`);
    return result.map((record) => new Invoice(record));
  }

  async findOne(invoice_number: number): Promise<Invoice> {
    const cacheKey = `invoice_${invoice_number}`;

    // Check if the invoice is cached
    const cachedInvoice = this.cacheService.get(cacheKey);
    if (cachedInvoice) {
      return cachedInvoice;
    }

    this.logger.log(
      `Database query initiated: Fetching invoice #${invoice_number}.`,
    );

    const result = await this.databaseService.query(
      `SELECT * FROM invoices WHERE invoice_number = $1;`,
      [invoice_number],
    );

    if (result.length > 0) {
      const invoice = new Invoice(result[0]);

      // Cache the result
      this.cacheService.set(cacheKey, invoice, 60);

      this.logger.log(
        `Database query successful: Retrieved invoice #${invoice_number}.`,
      );

      // Emit the event
      this.eventBus.publish(
        new InvoiceFetchedEvent(invoice_number, new Date()),
      );

      return invoice;
    }

    this.logger.error(
      `Database query failed: Invoice with number #${invoice_number} not found.`,
    );
    return null;
  }
}
