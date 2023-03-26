import { User } from '@modules/users/entities/user.entity';
import { UserRepositoryInterface } from '@modules/users/interfaces/users.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

@Injectable()
export class UsersRepository
	extends BaseRepositoryAbstract<User>
	implements UserRepositoryInterface
{
	constructor(
		@InjectModel(User.name)
		private readonly users_repository: Model<User>,
	) {
		super(users_repository);
	}
}
