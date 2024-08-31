import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceResolver } from './invoice.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { GetInvoiceHandler } from './handlers/get-invoice.handler';
import { InvoicePaidEventHandler } from './handlers/invoice-paid.handler';
import { MarkInvoiceAsPaidHandler } from './handlers/mark-invoice-as-paid.handler';
import { InvoiceFetchedEventHandler } from './handlers/invoice-fetched.handler';
import { InvoiceEventsListener } from './events/invoice-events.listener';

@Module({
  imports: [CqrsModule],
  providers: [
    InvoiceService,
    InvoiceResolver,
    InvoicePaidEventHandler,
    InvoiceFetchedEventHandler,
    MarkInvoiceAsPaidHandler,
    InvoiceEventsListener,
    GetInvoiceHandler,
  ],
  exports: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
