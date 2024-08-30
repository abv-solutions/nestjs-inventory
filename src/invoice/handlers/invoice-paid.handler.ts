import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvoicePaidEvent } from '../events/invoice-paid.event'; // Update import path as needed

@Injectable()
@EventsHandler(InvoicePaidEvent)
export class InvoicePaidEventHandler
  implements IEventHandler<InvoicePaidEvent>
{
  private readonly logger = new Logger(InvoicePaidEventHandler.name);

  async handle(event: InvoicePaidEvent): Promise<void> {
    this.logger.log(
      `Handling InvoicePaidEvent for invoice number: ${event.invoiceNumber}`,
    );
    this.logger.log(`Event timestamp: ${event.timestamp}`);

    // Add your handling logic here
  }
}
