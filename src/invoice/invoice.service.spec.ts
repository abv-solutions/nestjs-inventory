import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { DatabaseService } from '../core/database.service';
import { CacheService } from '../core/cache.service';
import { EventBus } from '@nestjs/cqrs';
import { ErrorHandlingService } from '../core/error-handling.service';
import { Invoice } from './invoice.entity';
import { InvoicePaidEvent } from './events/invoice-paid.event';

describe('InvoiceService', () => {
  let service: InvoiceService;
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
          useValue: { query: jest.fn() },
        },
        {
          provide: CacheService,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
        {
          provide: EventBus,
          useValue: { publish: jest.fn() },
        },
        {
          provide: ErrorHandlingService,
          useValue: {
            handleNotFoundError: jest.fn(),
            handleDatabaseError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    cacheService = module.get<CacheService>(CacheService);
    eventBus = module.get<EventBus>(EventBus);
    errorHandlingService =
      module.get<ErrorHandlingService>(ErrorHandlingService);
  });

  it('should successfully mark an invoice as paid and update the cache', async () => {
    const invoiceNumber = 12345;
    const isPaid = true;
    const mockInvoiceData = { invoice_number: invoiceNumber, is_paid: isPaid };
    const mockInvoice = new Invoice(mockInvoiceData);

    // Mock database query result
    (databaseService.query as jest.Mock).mockResolvedValue([mockInvoiceData]);

    // Mock cache retrieval
    (cacheService.get as jest.Mock).mockReturnValue([mockInvoice]);

    const result = await service.markAsPaid(invoiceNumber, isPaid);

    expect(databaseService.query).toHaveBeenCalledWith(
      `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
      [isPaid, invoiceNumber],
    );

    expect(eventBus.publish).toHaveBeenCalledWith(
      new InvoicePaidEvent(invoiceNumber, expect.any(Date)),
    );

    expect(cacheService.get).toHaveBeenCalledWith(service['cacheKey']);
    expect(result).toEqual(mockInvoice);
  });

  it('should handle case where invoice is not found', async () => {
    const invoiceNumber = 12345;
    const isPaid = true;

    // Mock database query result with empty array (invoice not found)
    (databaseService.query as jest.Mock).mockResolvedValue([]);

    const result = await service.markAsPaid(invoiceNumber, isPaid);

    expect(databaseService.query).toHaveBeenCalledWith(
      `UPDATE invoices
         SET is_paid = $1
         WHERE invoice_number = $2
         RETURNING *;`,
      [isPaid, invoiceNumber],
    );

    expect(errorHandlingService.handleNotFoundError).toHaveBeenCalledWith(
      'Invoice',
      invoiceNumber,
    );
    expect(result).toBeUndefined();
  });

  it('should handle database error', async () => {
    const invoiceNumber = 12345;
    const isPaid = true;
    const mockError = new Error('Database error');

    // Mock database query to throw an error
    (databaseService.query as jest.Mock).mockRejectedValue(mockError);

    await service.markAsPaid(invoiceNumber, isPaid);

    expect(errorHandlingService.handleDatabaseError).toHaveBeenCalledWith(
      mockError,
      'markAsPaid',
    );
  });
});
