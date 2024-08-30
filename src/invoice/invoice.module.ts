import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoiceService } from './invoice.service';
import { DatabaseService } from '../database/database.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceResolver } from './invoice.resolver';
import { CqrsModule } from '@nestjs/cqrs';
import { GetInvoiceHandler } from './handlers/get-invoice.handler';
import { InvoicePaidEventHandler } from './handlers/invoice-paid.handler';
import { MarkInvoiceAsPaidHandler } from './handlers/mark-invoice-as-paid.handler';

@Module({
  imports: [ConfigModule, CqrsModule], // Ensure ConfigModule is imported to use ConfigService
  providers: [
    InvoiceService,
    InvoiceResolver,
    DatabaseService,
    InvoicePaidEventHandler,
    MarkInvoiceAsPaidHandler,
    GetInvoiceHandler,
  ],
  exports: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
