import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MarkInvoiceAsPaidCommand } from './commands/mark-invoice-as-paid.command';

@Resolver(() => Invoice)
export class InvoiceResolver {
  private readonly logger = new Logger(InvoiceResolver.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly commandBus: CommandBus,
  ) {}

  @Query(() => [Invoice], { name: 'invoices' })
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Query(() => Invoice, { name: 'invoice' })
  async findOne(@Args('invoice_number') invoice_number: number) {
    return this.invoiceService.findOne(invoice_number);
  }

  @Mutation(() => Invoice)
  async createInvoice(
    @Args('createInvoiceInput') createInvoiceInput: CreateInvoiceInput,
  ) {
    return this.invoiceService.createInvoice(createInvoiceInput);
  }

  @Mutation(() => Invoice)
  async markInvoiceAsPaid(
    @Args('invoice_number') invoice_number: number,
    @Args('is_paid') is_paid: boolean,
  ): Promise<Invoice> {
    this.logger.log(
      `GraphQL request received: Mark invoice #${invoice_number} as paid (is_paid: ${is_paid}).`,
    );

    const updatedInvoice = await this.commandBus.execute(
      new MarkInvoiceAsPaidCommand(invoice_number, is_paid),
    );

    this.logger.log(
      `GraphQL mutation completed: Invoice #${invoice_number} marked as paid (is_paid: ${is_paid}) and updated invoice details returned.`,
    );

    return updatedInvoice;
  }
}
