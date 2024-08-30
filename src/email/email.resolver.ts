import { NotImplementedException } from '@nestjs/common';
import { InputType, Mutation } from '@nestjs/graphql';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AddEmail, EmailFiltersArgs, RemoveEmail, UserEmail } from './email.types';
import { User } from '../user/user.types';
import { EmailService } from './email.service';

@Resolver(() => UserEmail)
export class EmailResolver {

  constructor(
    private readonly _service: EmailService,
  ) {}

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this._service.get(emailId);
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    return this._service.getWithFilters(filters);
  }

  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this._service.getUserByEmailId(parent.userId);
  }

  @Mutation(() => ID)
  async addEmail(@Args() addEmail: AddEmail): Promise<string> {
    return this._service.add(addEmail);
  }

  @Mutation(() => ID)
  async removeEmail(@Args() removeEmail: RemoveEmail): Promise<string> {
    return this._service.remove(removeEmail);
  }
}
