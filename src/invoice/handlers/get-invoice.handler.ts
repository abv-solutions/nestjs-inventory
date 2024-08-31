import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoiceQuery } from '../queries/get-invoice.query';
import { InvoiceService } from '../invoice.service';
import { Invoice } from '../invoice.entity';
import { InvoiceFetchedEvent } from '../events/invoice-fetched.event'; // Ensure correct path
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  private readonly logger = new Logger(GetInvoiceHandler.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly eventEmitter: EventEmitter2, // Use EventEmitter2
  ) {}

  async execute(query: GetInvoiceQuery): Promise<Invoice> {
    this.logger.log(`Executing query: Get invoice #${query.invoice_number}.`);

    const invoice = await this.invoiceService.findOne(query.invoice_number);

    this.eventEmitter.emit(
      'invoice.fetched',
      new InvoiceFetchedEvent(query.invoice_number, new Date()),
    );

    this.logger.log(
      `Query execution completed: Invoice #${query.invoice_number} fetched successfully and message published.`,
    );

    return invoice;
  }
}
