import { ArgsType, Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Maybe } from 'graphql/jsutils/Maybe';
import { IAddEmail, IEmail, IEmailFilters } from './email.interfaces';
import { In } from 'typeorm';

@ObjectType()
export class UserEmail implements IEmail {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  address: string;

  userId: string;
}

@InputType()
export class StringFilters {
  @IsOptional()
  @Field(() => String, { nullable: true })
  equal: Maybe<string>;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  in: Maybe<string[]>;
}

@ArgsType()
export class EmailFiltersArgs implements IEmailFilters {
  @IsOptional()
  @Field(() => StringFilters, { nullable: true })
  address?: Maybe<StringFilters>;
}

@InputType()
@ArgsType()
export class AddEmail implements IAddEmail {
  @IsUUID('all', {
    message: `L'identifiant de l'utilisateur doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'utilisateur doit être défini` })
  @Field(() => ID)
  userId: string;

  @IsEmail({}, { message: 'L\'adresse email doit être valide' })
  @IsNotEmpty({ message: `L'adresse email doit être définie` })
  @Field(() => String)
  address: string;
}

@InputType()
@ArgsType()
export class RemoveEmail {
  @IsUUID('all', {
    message: `L'identifiant de l'utilisateur doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'utilisateur doit être défini` })
  @Field(() => ID)
  userId: string;

  @IsUUID('all', {
    message: `L'identifiant de l'email doit être un UUID`,
  })
  @IsNotEmpty({ message: `L'identifiant de l'email doit être défini` })
  @Field(() => ID)
  emailId: string;
}