# Project README

## Description

This project implements an inventory management application using NestJS, with a focus on CQRS (Command Query Responsibility Segregation), internal event sourcing and external message brokers standards. The core functionality includes handling invoices with a basic command and query:

- **Query**: Retrieve an invoice by its number.
- **Command**: Mark an invoice as paid.

The system is designed with the following components:

- **CQRS**: Separation of command and query operations.
- **Event Sourcing**: Simplified internal events sourcing to handle changes.
- **External Message Broker**: Simplified setup for event publication.
- **Caching**: Basic caching for performance optimization.
- **Error Handling**: Centralized error handling for database operations.

**Current Testing:**

- **Unit Tests**: Focused on the `InvoiceService` to verify its methods.
- **Integration Tests**: Cover the end-to-end flow of the `markAsPaid` command, including interaction with the database, command handler, event bus and message publish.

## Next Steps

1. **Generalize Implementations and Standards:**

   - Expand CQRS patterns to include more complex scenarios and additional commands/queries.
   - Enhance the event sourcing mechanism to handle a broader range of internal events and states.
   - Implement real internal event logic to replace the simplified version currently in use.
   - Integrate a real external message broker for better event distribution and handling.

2. **Enhance Testing:**

   - **Coverage Expansion**: Extend unit tests to cover more services and edge cases.
   - **Integration Tests**: Develop comprehensive tests to cover various use cases, including different scenarios and failure cases.
   - **End-to-End Tests**: Ensure complete coverage of the application's flow, from user input to database interactions and event emissions.

3. **Implement Real Internal Events Logic:**

   - Replace the simplified event sourcing implementation with a robust internal event handling system.

4. **Integrate Real External Message Brokers:**
   - Set up and configure a real message broker for external events to ensure reliable message delivery and processing.

By addressing these next steps, the application will be more robust, scalable, and maintainable, with a well-defined architecture and comprehensive test coverage.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
