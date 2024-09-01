import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { DatabaseService } from '../core/database.service';
import { CacheService } from 'src/core/cache.service';
import { EventBus } from '@nestjs/cqrs';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { InvoicePaidEvent } from './events/invoice-paid.event';
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

    // Mock databaseService query method
    (databaseService.query as jest.Mock).mockResolvedValue([updatedInvoice]);

    // Mock eventBus.publish method
    (eventBus.publish as jest.Mock).mockImplementation(() => {});

    const result = await invoiceService.markAsPaid(invoice_number, is_paid);

    expect(result).toEqual(updatedInvoice);

    // Verify databaseService.query is called only if cache miss occurs
    expect(databaseService.query).toHaveBeenCalledWith(
      expect.stringContaining(
        `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
      ),
      [is_paid, invoice_number],
    );

    // Verify eventBus.publish was called with the expected event
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(InvoicePaidEvent));
  });
});
