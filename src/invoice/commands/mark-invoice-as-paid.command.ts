import { ICommand } from '@nestjs/cqrs';

export class MarkInvoiceAsPaidCommand implements ICommand {
  constructor(
    public readonly invoice_number: number,
    public readonly is_paid: boolean,
  ) {}
}
