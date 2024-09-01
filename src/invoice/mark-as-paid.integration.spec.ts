import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { DatabaseService } from '../core/database.service';
import { CacheService } from 'src/core/cache.service';
import { EventBus } from '@nestjs/cqrs';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { InvoicePaidEvent } from './events/invoice-paid.event';
import { Invoice } from './invoice.entity';
import { MarkInvoiceAsPaidCommand } from './commands/mark-invoice-as-paid.command';
import { MarkInvoiceAsPaidHandler } from './handlers/mark-invoice-as-paid.handler';
import { CommandBus } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('InvoiceService and Command Handler Integration Test', () => {
  let invoiceService: InvoiceService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let eventBus: EventBus;
  let errorHandlingService: ErrorHandlingService;
  let commandBus: CommandBus;
  let eventEmitter: EventEmitter2;
  let markInvoiceAsPaidHandler: MarkInvoiceAsPaidHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        MarkInvoiceAsPaidHandler,
        {
          provide: DatabaseService,
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ErrorHandlingService,
          useValue: {
            handleDatabaseError: jest.fn(),
            handleNotFoundError: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    invoiceService = module.get<InvoiceService>(InvoiceService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    eventBus = module.get<EventBus>(EventBus);
    errorHandlingService =
      module.get<ErrorHandlingService>(ErrorHandlingService);
    commandBus = module.get<CommandBus>(CommandBus);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    markInvoiceAsPaidHandler = module.get<MarkInvoiceAsPaidHandler>(
      MarkInvoiceAsPaidHandler,
    );

    // Mock databaseService.query
    jest
      .spyOn(databaseService, 'query')
      .mockImplementation(async (query: string, params: any[]) => {
        if (
          query.includes('UPDATE invoices') &&
          params[0] !== undefined &&
          params[1] !== undefined
        ) {
          return [
            new Invoice({
              invoice_number: params[1],
              is_paid: params[0],
              // Add other required properties here
            }),
          ];
        }
        return [];
      });
  });

  it('should execute MarkInvoiceAsPaidCommand and handle invoice update and event emission', async () => {
    const invoice_number = 1357;
    const is_paid = true;

    const updatedInvoice = new Invoice({
      invoice_number: invoice_number,
      is_paid: is_paid,
      // Add other required properties here
    });

    // Create the command
    const command = new MarkInvoiceAsPaidCommand(invoice_number, is_paid);

    // Execute the command using the handler
    const result = await markInvoiceAsPaidHandler.execute(command);

    // Assertions
    expect(result).toEqual(updatedInvoice);

    // Ensure the database query method was called with the expected query and parameters
    expect(databaseService.query).toHaveBeenCalledWith(
      expect.stringContaining(
        `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
      ),
      [is_paid, invoice_number],
    );

    // Verify eventEmitter.emit is called with the correct event
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'invoice.paid',
      new InvoicePaidEvent(invoice_number, expect.any(Date)),
    );

    // Verify EventBus.publish is called with the correct event
    expect(eventBus.publish).toHaveBeenCalledWith({
      invoice_number,
      timestamp: expect.any(Date),
    });
  });
});
