import { Test, TestingModule } from '@nestjs/testing';

// INNER
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { createUserStub } from './stubs/user.stub';
import { RequestWithUser } from 'src/types/requests.type';

// OUTER
import { PERIOD_TYPE } from '@modules/daily-check-in/dto/get-daily-check-in.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { isGuarded } from 'src/shared/test/utils';

jest.mock('../users.service.ts');
describe('UsersController', () => {
	let users_controller: UsersController;
	let users_service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersService],
		}).compile();

		users_controller = module.get<UsersController>(UsersController);
		users_service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(users_controller).toBeDefined();
	});

	describe('updateDailyCheckIn', () => {
		it('should be protected with JwtAuthGuard', () => {
			expect(
				isGuarded(
					UsersController.prototype.updateDailyCheckIn,
					JwtAccessTokenGuard,
				),
			);
		});
		it('should add check-in and return user with new check-in data', async () => {
			// Arrange
			const request = {
				user: createUserStub(),
			} as RequestWithUser;

			// Act
			await users_controller.updateDailyCheckIn(request);

			// Assert
			expect(users_service.updateDailyCheckIn).toHaveBeenCalledWith(
				request.user,
				expect.any(Date),
			);
		});
	});

	describe('getCheckInData', () => {
		it('should be protected with JwtAuthGuard', () => {
			expect(
				isGuarded(
					UsersController.prototype.getCheckInData,
					JwtAccessTokenGuard,
				),
			);
		});
		it('should return check-in data base on filter', async () => {
			// Arrange
			const request = {
				user: createUserStub(),
			} as RequestWithUser;
			const filter = {
				type: PERIOD_TYPE.YEAR,
				year: '2023',
			};

			// Act
			await users_controller.getCheckInData(request, filter.type, filter.year);

			// Assert
			expect(users_service.getCheckInData).toHaveBeenCalledWith(
				request.user._id,
				filter,
			);
		});
	});
});
