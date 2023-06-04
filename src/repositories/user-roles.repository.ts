import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import {
	UserRole,
	UserRoleDocument,
} from '@modules/user-roles/entities/user-role.entity';
import { UserRolesRepositoryInterface } from '@modules/user-roles/interfaces/user-roles.interface';

@Injectable()
export class UserRolesRepository
	extends BaseRepositoryAbstract<UserRoleDocument>
	implements UserRolesRepositoryInterface
{
	constructor(
		@InjectModel(UserRole.name)
		private readonly user_role_model: Model<UserRoleDocument>,
	) {
		super(user_role_model);
	}
}
