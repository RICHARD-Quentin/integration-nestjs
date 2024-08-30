import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindOptionsWhere, In, Repository } from 'typeorm';
import { EmailFiltersArgs, UserEmail } from '../email/email.types';
import { EmailEntity } from '../email/email.entity';
import { UserId } from './user.interfaces';
import { UserService } from './user.service';
import { AddUser, User, UserIdArgs } from './user.types';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly _service: UserService,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  getUser(@Args() { userId }: UserIdArgs): Promise<User> {
    return this._service.get(userId);
  }

  @Mutation(() => ID)
  addUser(@Args() user: AddUser): Promise<UserId> {
    return this._service.add(user);
  }

  @Mutation(() => ID)
  deactivateUser(@Args() { userId }: UserIdArgs): Promise<UserId> {
    return this._service.deactivate(userId);
  }

  @ResolveField(() => [UserEmail], { name: 'emails' })
  async getEmails(
    @Parent() user: User,
    @Args() filters: EmailFiltersArgs,
  ): Promise<UserEmail[]> {
    return await this._service.getWithFilters(user, filters);
  }
}
