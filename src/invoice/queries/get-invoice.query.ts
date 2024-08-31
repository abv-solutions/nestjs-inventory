import { IQuery } from '@nestjs/cqrs';

export class GetInvoiceQuery implements IQuery {
  constructor(public readonly invoice_number: number) {}
}
