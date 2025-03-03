import { createUserRoleStub } from '../test/stubs/user-role.stub';

export const UserRolesService = jest.fn().mockReturnValue({
	findOneByCondition: jest.fn().mockResolvedValue(createUserRoleStub()),
	findAll: jest.fn().mockResolvedValue([createUserRoleStub()]),
	create: jest.fn().mockResolvedValue(createUserRoleStub()),
	update: jest.fn().mockResolvedValue(createUserRoleStub()),
	remove: jest.fn().mockResolvedValue(true),
});
