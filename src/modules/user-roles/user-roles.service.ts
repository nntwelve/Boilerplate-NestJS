import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { UserRole } from './entities/user-role.entity';
import { UserRolesRepositoryInterface } from './interfaces/user-roles.interface';

@Injectable()
export class UserRolesService extends BaseServiceAbstract<UserRole> {
	constructor(
		@Inject('UserRolesRepositoryInterface')
		private readonly user_roles_repository: UserRolesRepositoryInterface,
	) {
		super(user_roles_repository);
	}
}
