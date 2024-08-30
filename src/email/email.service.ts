import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/user.entity";
import { Brackets, Equal, Repository } from "typeorm";
import { EmailEntity } from "./email.entity";
import { AddEmail, EmailFiltersArgs, RemoveEmail } from "./email.types";

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async get(id: string) {
    return await this.emailRepository.findOneBy({ id: Equal(id) });
  }

  async getWithFilters(filters: EmailFiltersArgs) {
    const queryBuilder = this.emailRepository.createQueryBuilder('email');

    if(filters.address) {
      queryBuilder.where(new Brackets(qb => {
        if(filters.address.equal) qb.orWhere('email.address = :address', { address: filters.address.equal });
        if(filters.address.in?.length > 0) qb.orWhere('email.address IN (:...InAddress)', { InAddress: filters.address.in });
      }));    
    }

    return queryBuilder.orderBy('address', 'ASC').getMany();
  }

  async getUserByEmailId(userId: string) {
    return await this.userRepository.findOneBy({ id: Equal(userId) });
  }

  async add(addEmail: AddEmail) {
    const user = await this.userRepository.findOneBy({ id: Equal(addEmail.userId) });

    if (!user) {
      throw new Error("L'utilisateur n'existe pas");
    }

    if (user.status !== 'active') {
      throw new Error("L'utilisateur n'est pas actif");
    }

    const addedEmail = await this.emailRepository.insert({
        ...addEmail,
    });

    return addedEmail.identifiers[0].id;
  }

  async remove(removeEmail: RemoveEmail) {

    const user = await this.userRepository.findOneBy({ id: Equal(removeEmail.userId) });

    if (!user) {
        throw new Error("L'utilisateur n'existe pas");
    }

    if (user.status !== 'active') {
        throw new Error("L'utilisateur n'est pas actif");
    }

    const email = await this.emailRepository.findOneBy({ id: Equal(removeEmail.emailId) });

    if (!email) {
        throw new Error("L'email n'existe pas");
    }

    await this.emailRepository.delete({ id: Equal(removeEmail.emailId) });

    return removeEmail.emailId;
  }

}