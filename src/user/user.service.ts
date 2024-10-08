import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Equal, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { IAddUser, IUser, UserId } from './user.interfaces';
import { EmailFiltersArgs, UserEmail } from '../email/email.types';
import { User } from './user.types';
import { EmailEntity } from '../email/email.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
  ) {}

  /**
   * Ajoute un utilisateur
   * @param user Utilisateur à ajouter au système
   */
  async add(user: IAddUser) {
    const addedUser = await this.userRepository.insert({
      ...user,
      status: 'active',
    });
    const userId = addedUser.identifiers[0].id;

    return userId;
  }

  /**
   * Suppression d'un utilisateur (soft delete)
   *
   * @param userId Identifiant de l'utilisateur à désactiver
   * @returns L'identifiant de l'utilisateur désactivé
   */
  async deactivate(userId: UserId) {
    const userExists = await this.userRepository.exist({
      where: { id: Equal(userId) },
    });
    if (!userExists) {
      throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
    }

    await this.userRepository.update(
      { id: Equal(userId) },
      { status: 'inactive' },
    );

    return userId;
  }

  /**
   * Récupère un utilisateur par rapport à un identifiant
   * @param id Identifiant de l'utilisateur à récupérer
   * @returns L'utilisateur correspondant à l'identifiant ou undefined
   */
  get(id: UserId): Promise<IUser> {
    return this.userRepository.findOneBy({ id: Equal(id) });
  }

  getWithFilters(user: User, filters: EmailFiltersArgs): Promise<UserEmail[]> {
    const queryBuilder = this.emailRepository.createQueryBuilder('email').where('email.userId = :id', { id: user.id });

    if(filters.address) {
      queryBuilder.andWhere(new Brackets(qb => {
        if(filters.address.equal) qb.orWhere('email.address = :address', { address: filters.address.equal });
        if(filters.address.in?.length > 0) qb.orWhere('email.address IN (:...InAddress)', { InAddress: filters.address.in });
      }));    
    }

    return queryBuilder.orderBy('address', 'ASC').getMany();

  }
}
