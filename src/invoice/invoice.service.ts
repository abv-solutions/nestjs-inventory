import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Invoice } from './invoice.entity';
import { EventBus } from '@nestjs/cqrs';
import { InvoicePaidEvent } from './events/invoice-paid.event';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventBus: EventBus,
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

  // Mark an invoice as paid or unpaid
  async markAsPaid(invoice_number: number, is_paid: boolean): Promise<Invoice> {
    this.logger.log(`Marking invoice ${invoice_number} as paid: ${is_paid}`);

    await this.databaseService.query(
      `UPDATE invoices 
       SET is_paid = $1 
       WHERE invoice_number = $2;`,
      [is_paid, invoice_number],
    );

    this.logger.log(`Invoice ${invoice_number} updated successfully.`);

    // Retrieve and return the updated invoice
    const result = await this.databaseService.query(
      `SELECT * FROM invoices WHERE invoice_number = $1;`,
      [invoice_number],
    );

    // Check if invoice exists and return it
    if (result.length > 0) {
      this.logger.log(`Invoice ${invoice_number} fetched successfully.`);

      this.eventBus.publish(new InvoicePaidEvent(invoice_number, new Date()));

      return result[0]; // Adjust this according to how Invoice is structured
    } else {
      // Handle the case where the invoice was not found
      this.logger.error(`Invoice with number ${invoice_number} not found`);
      throw new Error(`Invoice with number ${invoice_number} not found`);
    }
  }

  async findAll(): Promise<Invoice[]> {
    const result = await this.databaseService.query(`SELECT * FROM invoices;`);
    return result.map((record) => new Invoice(record));
  }

  async findOne(invoice_number: number): Promise<Invoice> {
    const result = await this.databaseService.query(
      `SELECT * FROM invoices WHERE invoice_number = $1;`,
      [invoice_number],
    );
    return result.length > 0 ? new Invoice(result[0]) : null;
  }

  // Additional methods as needed
}
