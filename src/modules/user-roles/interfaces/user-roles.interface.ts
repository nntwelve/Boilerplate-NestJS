import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { UserRole } from '../entities/user-role.entity';

export interface UserRolesRepositoryInterface
	extends BaseRepositoryInterface<UserRole> {}
