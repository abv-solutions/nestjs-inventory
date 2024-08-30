import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InvoiceService } from '../invoice.service'; // Adjust import path
import { MarkInvoiceAsPaidCommand } from '../commands/mark-invoice-as-paid.command'; // Adjust import path
import { Logger } from '@nestjs/common';
import { Invoice } from '../invoice.entity';

@CommandHandler(MarkInvoiceAsPaidCommand)
export class MarkInvoiceAsPaidHandler
  implements ICommandHandler<MarkInvoiceAsPaidCommand>
{
  private readonly logger = new Logger(MarkInvoiceAsPaidHandler.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  async execute(command: MarkInvoiceAsPaidCommand): Promise<Invoice> {
    this.logger.log(
      `Handling MarkInvoiceAsPaidCommand for invoice number: ${command.invoice_number}`,
    );
    this.logger.log(`Mark as paid: ${command.is_paid}`);

    const updatedInvoice = await this.invoiceService.markAsPaid(
      command.invoice_number,
      command.is_paid,
    );

    // Log the result and return it
    this.logger.log(`Invoice ${command.invoice_number} updated successfully.`);
    return updatedInvoice;
  }
}
