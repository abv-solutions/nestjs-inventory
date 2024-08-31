import { IEvent } from '@nestjs/cqrs';

export class InvoiceFetchedEvent implements IEvent {
  constructor(
    public readonly invoice_number: number,
    public readonly timestamp: Date,
  ) {}
}
