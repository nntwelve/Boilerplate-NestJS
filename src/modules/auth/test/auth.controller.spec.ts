import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RequestWithUser } from 'src/types/requests.type';
import { isGuarded } from 'src/shared/test/utils';
import { LocalAuthGuard } from '../guards/local.guard';

// MOCK
import { mock_access_token, mock_refresh_token } from './mocks/tokens.mock';
import { mock_request_with_user } from './mocks/requests.mock';

jest.mock('../auth.service.ts');
describe('AuthController', () => {
	let auth_controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService],
		}).compile();

		auth_controller = module.get<AuthController>(AuthController);
	});

	it('should be defined', () => {
		expect(auth_controller).toBeDefined();
	});

	describe('signUp', () => {
		it('should create a new user and return an access token and refresh token', async () => {
			// Arrange
			const sign_up_dto = {
				first_name: 'John',
				last_name: 'Doe',
				email: 'johndoe@example.com',
				password: '1232@asdS',
			};

			// Act
			const response = await auth_controller.signUp(sign_up_dto);

			// Assert
			expect(response).toEqual({
				access_token: mock_access_token,
				refresh_token: mock_refresh_token,
			});
		});
	});

	describe('signIn', () => {
		it('should be protected with LocalAuthGuard', () => {
			expect(isGuarded(AuthController.prototype.signIn, LocalAuthGuard));
		});
		it('should sign in a user and return an access token', async () => {
			// Arrange

			// Act
			const response = await auth_controller.signIn(mock_request_with_user);

			// Assert
			expect(response).toEqual({
				access_token: mock_access_token,
				refresh_token: mock_refresh_token,
			});
		});
	});

	describe('refreshAccessToken', () => {
		// it('should be protected with JwtRefreshTokenGuard', () => {
		// 	expect(
		// 		isGuarded(
		// 			AuthController.prototype.refreshAccessToken,
		// 			JwtRefreshTokenGuard,
		// 		),
		// 	);
		// });
		it('should refresh the access token for a user and return a new access token', async () => {
			// Arrange
			const request = {
				user: {
					_id: 'user_id',
				},
			};

			// Act
			const response = await auth_controller.refreshAccessToken(
				request as RequestWithUser,
			);

			// Assert
			expect(response).toEqual({
				access_token: mock_access_token,
			});
		});
	});
});
