import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class CreateInvoiceInput {
  @Field(() => Int)
  @Min(1337, { message: 'Invoice number must be at least 1337' })
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
}
