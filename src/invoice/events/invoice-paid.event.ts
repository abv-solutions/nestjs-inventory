import { IEvent } from '@nestjs/cqrs';

export class InvoicePaidEvent implements IEvent {
  constructor(
    public readonly invoiceNumber: number,
    public readonly timestamp: Date,
  ) {}
}
