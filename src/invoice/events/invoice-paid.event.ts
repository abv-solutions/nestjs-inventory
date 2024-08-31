import { IEvent } from '@nestjs/cqrs';

export class InvoicePaidEvent implements IEvent {
  constructor(
    public readonly invoice_number: number,
    public readonly timestamp: Date,
  ) {}
}
