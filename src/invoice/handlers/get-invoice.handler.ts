import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoiceQuery } from '../queries/get-invoice.query';
import { InvoiceService } from '../invoice.service';
import { Invoice } from '../invoice.entity';

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  constructor(private readonly invoiceService: InvoiceService) {}

  async execute(query: GetInvoiceQuery): Promise<Invoice> {
    return this.invoiceService.findOne(query.invoiceNumber);
  }
}
