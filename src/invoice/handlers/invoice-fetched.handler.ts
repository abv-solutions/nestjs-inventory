import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoiceFetchedEvent } from '../events/invoice-fetched.event'; // Ensure correct path

@Injectable()
@EventsHandler(InvoiceFetchedEvent)
export class InvoiceFetchedEventHandler
  implements IEventHandler<InvoiceFetchedEvent>
{
  private readonly logger = new Logger(InvoiceFetchedEventHandler.name);

  handle(event: InvoiceFetchedEvent) {
    this.logger.log(
      `Event handling started: Processing InvoiceFetchedEvent for invoice #${event.invoice_number}.`,
    );

    this.logger.log(
      `Event details: Invoice #${event.invoice_number} fetched at ${event.timestamp}.`,
    );

    // Logic for event sourcing
  }
}
