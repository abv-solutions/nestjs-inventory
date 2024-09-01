import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Customer {
  @Field()
  name: string;

  @Field()
  email: string;

  constructor(partial: Partial<Customer>) {
    Object.assign(this, partial);
  }
}
