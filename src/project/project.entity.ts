import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field()
  name: string;

  constructor(partial: Partial<Project>) {
    Object.assign(this, partial);
  }
}
