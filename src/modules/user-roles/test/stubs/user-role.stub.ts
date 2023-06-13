import { UserRole } from '@modules/user-roles/entities/user-role.entity';

export const createUserRoleStub = (): UserRole => ({
	name: 'Admin',
	_description: 'Admin',
});
