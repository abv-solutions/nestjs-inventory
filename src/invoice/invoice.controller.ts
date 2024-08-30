import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(@Body() invoiceData: Partial<Invoice>): Promise<Invoice> {
    return this.invoiceService.createInvoice(invoiceData);
  }

  @Get()
  async findAll(): Promise<Invoice[]> {
    return this.invoiceService.findAll();
  }

  @Get(':invoice_number')
  async findOne(
    @Param('invoice_number') invoice_number: number,
  ): Promise<Invoice> {
    return this.invoiceService.findOne(invoice_number);
  }
}
