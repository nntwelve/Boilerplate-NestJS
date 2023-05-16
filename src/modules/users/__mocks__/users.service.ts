import { userStub } from '../test/stubs/user.stub';

export const UsersService = jest.fn().mockReturnValue({
	getUserByEmail: jest.fn().mockResolvedValue(userStub()),
	getUserWithRole: jest.fn().mockResolvedValue(userStub()),
	findOneByCondition: jest.fn().mockResolvedValue(userStub()),
	setCurrentRefreshToken: jest.fn().mockResolvedValue(true),
	findAll: jest.fn().mockResolvedValue([userStub()]),
	create: jest.fn().mockResolvedValue(userStub()),
	update: jest.fn().mockResolvedValue(userStub()),
	remove: jest.fn().mockResolvedValue(true),
});
