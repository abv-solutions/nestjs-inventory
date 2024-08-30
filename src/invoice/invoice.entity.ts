import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Invoice {
  @Field(() => Int)
  invoice_number: number;

  @Field(() => Float)
  amount: number;

  @Field()
  currency: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  payment_term: string;

  @Field(() => Boolean)
  is_storno: boolean;

  @Field(() => Boolean)
  is_paid: boolean;

  @Field(() => Int)
  customer_id: number;

  @Field(() => Int)
  project_id: number;

  constructor(partial: Partial<Invoice>) {
    Object.assign(this, partial);
  }
}
