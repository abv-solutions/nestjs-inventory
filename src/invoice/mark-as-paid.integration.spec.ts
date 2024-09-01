import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { DatabaseService } from '../core/database.service';
import { CacheService } from 'src/core/cache.service';
import { EventBus } from '@nestjs/cqrs';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { Invoice } from './invoice.entity';

describe('InvoiceService Integration Test', () => {
  let invoiceService: InvoiceService;
  let databaseService: DatabaseService;
  let cacheService: CacheService;
  let eventBus: EventBus;
  let errorHandlingService: ErrorHandlingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
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
      ],
    }).compile();

    invoiceService = module.get<InvoiceService>(InvoiceService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    eventBus = module.get<EventBus>(EventBus);
    errorHandlingService =
      module.get<ErrorHandlingService>(ErrorHandlingService);
  });

  it('should mark invoice as paid and return updated invoice', async () => {
    const invoice_number = 1355;
    const is_paid = true;

    const updatedInvoice = new Invoice({
      invoice_number: invoice_number,
      is_paid: is_paid,
      // Add other required properties here
    });

    // Mock the database service query method to return the updated invoice
    (databaseService.query as jest.Mock).mockResolvedValue([updatedInvoice]);

    const result = await invoiceService.markAsPaid(invoice_number, is_paid);

    console.log('Result from markAsPaid:', result);
    console.log(
      'databaseService.query calls:',
      (databaseService.query as jest.Mock).mock.calls,
    );

    expect(result).toEqual(updatedInvoice);

    // Verify that databaseService.query is called with the correct SQL query and parameters
    expect(databaseService.query).toHaveBeenCalledWith(
      expect.stringContaining(
        `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
      ),
      [is_paid, invoice_number],
    );
  });
});
