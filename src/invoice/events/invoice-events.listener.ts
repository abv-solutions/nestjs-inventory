import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvoicePaidEvent } from './invoice-paid.event';

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
}
