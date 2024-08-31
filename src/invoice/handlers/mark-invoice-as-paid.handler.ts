import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InvoiceService } from '../invoice.service';
import { MarkInvoiceAsPaidCommand } from '../commands/mark-invoice-as-paid.command';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice } from '../invoice.entity';
import { InvoicePaidEvent } from '../events/invoice-paid.event';

@CommandHandler(MarkInvoiceAsPaidCommand)
export class MarkInvoiceAsPaidHandler
  implements ICommandHandler<MarkInvoiceAsPaidCommand>
{
  private readonly logger = new Logger(MarkInvoiceAsPaidHandler.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: MarkInvoiceAsPaidCommand): Promise<Invoice> {
    this.logger.log(
      `Executing command: Mark invoice #${command.invoice_number} as paid or unpaid (is_paid: ${command.is_paid}).`,
    );

    const updatedInvoice = await this.invoiceService.markAsPaid(
      command.invoice_number,
      command.is_paid,
    );

    // Emit an event after marking as paid
    this.eventEmitter.emit(
      'invoice.paid',
      new InvoicePaidEvent(command.invoice_number, new Date()),
    );

    this.logger.log(
      `Command execution completed: Invoice #${command.invoice_number} marked as paid or unpaid (is_paid: ${command.is_paid}) and message published.`,
    );
    return updatedInvoice;
  }
}
