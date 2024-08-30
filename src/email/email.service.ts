import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/user.entity";
import { Brackets, Equal, Repository } from "typeorm";
import { EmailEntity } from "./email.entity";
import { EmailFiltersArgs } from "./email.types";

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
}