import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceService } from './invoice.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

describe('InvoiceResolver', () => {
  let resolver: InvoiceResolver;
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceResolver,
        {
          provide: InvoiceService,
          useValue: {
            // Mock methods if needed
          },
        },
        {
          provide: CommandBus,
          useValue: {},
        },
        {
          provide: QueryBus,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<InvoiceResolver>(InvoiceResolver);
    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  // Add more tests for resolver methods here
});
