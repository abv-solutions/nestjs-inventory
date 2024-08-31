import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvoicePaidEvent } from './invoice-paid.event';
import { InvoiceFetchedEvent } from './invoice-fetched.event';

@Injectable()
export class InvoiceEventsListener {
  private readonly logger = new Logger(InvoiceEventsListener.name);

  @OnEvent('invoice.paid')
  handleInvoicePaidEvent(event: InvoicePaidEvent) {
    this.logger.log(
      `Message broker listener triggered: InvoicePaidEvent received for invoice #${event.invoice_number} at ${event.timestamp}.`,
    );

    // Logic for message brokers
  }

  @OnEvent('invoice.fetched')
  handleInvoiceFetchedEvent(event: InvoiceFetchedEvent) {
    this.logger.log(
      `Message broker listener triggered: InvoiceFetchedEvent received for invoice #${event.invoice_number} at ${event.timestamp}.`,
    );

    // Logic for message brokers
  }
}
