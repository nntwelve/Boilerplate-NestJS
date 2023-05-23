import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesService } from './user-roles.service';

describe('UserRolesService', () => {
	let service: UserRolesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserRolesService],
		}).compile();

		service = module.get<UserRolesService>(UserRolesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
