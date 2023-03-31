import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { User } from './entities/user.entity';
import { UserRepositoryInterface } from './interfaces/users.interface';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
	constructor(
		@Inject('UserRepositoryInterface')
		private readonly users_repository: UserRepositoryInterface,
	) {
		super(users_repository);
	}
}
