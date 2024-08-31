import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoicePaidEvent } from '../events/invoice-paid.event';

@Injectable()
@EventsHandler(InvoicePaidEvent)
export class InvoicePaidEventHandler
  implements IEventHandler<InvoicePaidEvent>
{
  private readonly logger = new Logger(InvoicePaidEventHandler.name);

  async handle(event: InvoicePaidEvent): Promise<void> {
    this.logger.log(
      `Event handling started: Processing InvoicePaidEvent for invoice #${event.invoice_number}.`,
    );

    this.logger.log(
      `Event details: Invoice #${event.invoice_number} marked as paid at ${event.timestamp}.`,
    );

    // Logic for event sourcing
  }
}
