import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateInvoiceInput {
  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  currency?: string;
}
