import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { CacheService } from 'src/core/cache.service';
import { ErrorHandlingService } from 'src/core/error-handling.service';
import { EventBus } from '@nestjs/cqrs';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            markAsPaid: jest.fn(),
            // Add other methods as needed
          },
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: ErrorHandlingService,
          useValue: {},
        },
        {
          provide: EventBus,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests for controller methods here
});
