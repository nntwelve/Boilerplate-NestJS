import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';

// OUTER MODULE
import { UsersService } from '@modules/users/users.service';
import { SignUpDto } from '../dto/sign-up.dto';

// MOCK
import { mockConfigService } from '../__mocks__/config.service';
import { mockJwtService } from '../__mocks__/jwt.service';

// STUB
import { userStub } from '../../users/test/stubs/user.stub';
import { token_stub } from './stubs/token.stub';

jest.mock('../../users/users.service');
describe('AuthService', function () {
	let auth_service: AuthService;
	let user_service: UsersService;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				UsersService,
			],
		}).compile();
		auth_service = module_ref.get<AuthService>(AuthService);
		user_service = module_ref.get<UsersService>(UsersService);
	});
	it('should be defined', () => {
		expect(auth_service).toBeDefined();
	});

	describe('signUp', () => {
		it('should throw a ConflictException if user with email already exists', async () => {
			// Arrange
			jest
				.spyOn(user_service, 'findOneByCondition')
				.mockResolvedValueOnce(userStub());
			// Act && Assert
			await expect(auth_service.signUp(userStub())).rejects.toThrow(
				ConflictException,
			);
		});
		it('should successfully create and return a new user if email is not taken', async () => {
			// Arrange
			const mock_sign_up_dto: SignUpDto = {
				email: 'michaelsmith@example.com',
				first_name: 'Michael',
				last_name: 'Smith',
				password: '123le$$321',
			};
			jest
				.spyOn(user_service, 'findOneByCondition')
				.mockResolvedValueOnce(null);
			jest
				.spyOn(bcrypt, 'hash')
				.mockImplementationOnce(() => mock_sign_up_dto.password);

			// Act
			const result = await auth_service.signUp(mock_sign_up_dto);

			// Assert
			expect(user_service.create).toHaveBeenCalledWith({
				...mock_sign_up_dto,
				username: expect.any(String),
			});
			expect(result).toEqual({
				access_token: token_stub,
				refresh_token: expect.any(String),
			});
		});
	});
});
