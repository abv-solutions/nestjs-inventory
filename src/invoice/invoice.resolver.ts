import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice.entity';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MarkInvoiceAsPaidCommand } from './commands/mark-invoice-as-paid.command';
import { GetInvoiceQuery } from './queries/get-invoice.query';
import { UpdateInvoiceInput } from './dto/update-invoice.input';

@Resolver(() => Invoice)
export class InvoiceResolver {
  private readonly logger = new Logger(InvoiceResolver.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [Invoice], { name: 'invoices' })
  async findAll() {
    this.logger.log('GraphQL query received: Retrieve all invoices.');
    return this.invoiceService.findAll();
  }

  @Query(() => Invoice, { name: 'invoice' })
  async findOne(@Args('invoice_number') invoice_number: number) {
    this.logger.log(`GraphQL query received: Get invoice #${invoice_number}.`);
    const invoice = await this.queryBus.execute(
      new GetInvoiceQuery(invoice_number),
    );
    if (!invoice) {
      this.logger.warn(
        `GraphQL query result: Invoice #${invoice_number} not found.`,
      );
    } else {
      this.logger.log(
        `GraphQL query completed: Invoice #${invoice_number} fetched and returned`,
      );
    }
    return invoice;
  }

  @Mutation(() => Invoice)
  async createInvoice(
    @Args('createInvoiceInput') createInvoiceInput: CreateInvoiceInput,
  ) {
    this.logger.log(
      `GraphQL mutation received: Create invoice with input ${JSON.stringify(createInvoiceInput)}.`,
    );
    return this.invoiceService.createInvoice(createInvoiceInput);
  }

  @Mutation(() => Invoice)
  async updateInvoice(
    @Args('invoice_number') invoice_number: number,
    @Args('updates') updates: UpdateInvoiceInput,
  ): Promise<Invoice> {
    this.logger.log(
      `GraphQL mutation received: Update invoice #${invoice_number} with new details.`,
    );
    const updatedInvoice = await this.invoiceService.updateInvoice(
      invoice_number,
      updates,
    );

    this.logger.log(
      `GraphQL mutation completed: Invoice #${invoice_number} updated with new details.`,
    );

    return updatedInvoice;
  }

  @Mutation(() => Invoice)
  async generateStornoInvoice(
    @Args('invoice_number') invoice_number: number,
  ): Promise<Invoice> {
    this.logger.log(
      `GraphQL mutation received: Generate storno for invoice #${invoice_number}.`,
    );

    const updatedInvoice =
      await this.invoiceService.generateStornoInvoice(invoice_number);

    this.logger.log(
      `GraphQL mutation completed: Generated storno for invoice #${invoice_number}.`,
    );

    return updatedInvoice;
  }

  @Mutation(() => Invoice)
  async markInvoiceAsPaid(
    @Args('invoice_number') invoice_number: number,
    @Args('is_paid') is_paid: boolean,
  ): Promise<Invoice> {
    this.logger.log(
      `GraphQL mutation received: Mark invoice #${invoice_number} as paid or unpaid (is_paid: ${is_paid}).`,
    );

    const updatedInvoice = await this.commandBus.execute(
      new MarkInvoiceAsPaidCommand(invoice_number, is_paid),
    );

    this.logger.log(
      `GraphQL mutation completed: Invoice #${invoice_number} marked as paid or unpaid (is_paid: ${is_paid}) and updated invoice details returned.`,
    );

    return updatedInvoice;
  }
}
