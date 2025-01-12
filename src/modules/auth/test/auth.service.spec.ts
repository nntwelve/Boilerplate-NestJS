import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
	BadRequestException,
	ConflictException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

// OUTER MODULE
import { UsersService } from '@modules/users/users.service';
import { SignUpDto } from '../dto/sign-up.dto';

// MOCK
import { mock_access_token, mock_refresh_token } from './mocks/tokens.mock';

// STUB
import { createUserStub } from '../../users/test/stubs/user.stub';

jest.mock('../../users/users.service');
describe('AuthService', function () {
	let auth_service: AuthService;
	let users_service: UsersService;
	let jwt_service: JwtService;
	let config_service: DeepMocked<ConfigService>;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [AuthService, UsersService],
		})
			.useMocker(createMock)
			.compile();
		auth_service = module_ref.get<AuthService>(AuthService);
		users_service = module_ref.get<UsersService>(UsersService);
		jwt_service = module_ref.get(JwtService);
		config_service = module_ref.get(ConfigService);
	});
	it('should be defined', () => {
		expect(auth_service).toBeDefined();
	});

	describe('signUp', () => {
		it('should throw a ConflictException if user with email already exists', async () => {
			// Arrange
			jest
				.spyOn(users_service, 'findOneByCondition')
				.mockResolvedValueOnce(createUserStub());
			// Act && Assert
			await expect(auth_service.signUp(createUserStub())).rejects.toThrow(
				ConflictException,
			);
		});
		it('should successfully create and return a new user if email is not taken', async () => {
			// Arrange
			const user_stub = createUserStub();
			const mock_sign_up_dto: SignUpDto = {
				email: 'michaelsmith@example.com',
				first_name: 'Michael',
				last_name: 'Smith',
				password: '123le$$321',
			};
			jest
				.spyOn(users_service, 'findOneByCondition')
				.mockResolvedValueOnce(null);
			jest
				.spyOn(auth_service, 'generateAccessToken')
				.mockReturnValue(mock_access_token);
			jest
				.spyOn(auth_service, 'generateRefreshToken')
				.mockReturnValue(mock_refresh_token);
			jest
				.spyOn(bcrypt, 'hash')
				.mockImplementationOnce(() => mock_sign_up_dto.password);
			jest.spyOn(auth_service, 'storeRefreshToken');

			// Act
			const result = await auth_service.signUp(mock_sign_up_dto);

			// Assert
			expect(users_service.create).toHaveBeenCalledWith({
				...mock_sign_up_dto,
				username: expect.any(String),
			});
			expect(auth_service.generateAccessToken).toHaveBeenCalledWith({
				user_id: user_stub._id,
			});
			expect(auth_service.generateRefreshToken).toHaveBeenCalledWith({
				user_id: user_stub._id,
			});
			expect(auth_service.storeRefreshToken).toBeCalledWith(
				user_stub._id,
				mock_refresh_token,
			);
			expect(result).toEqual({
				access_token: mock_access_token,
				refresh_token: mock_refresh_token,
			});
		});
	});

	describe('signIn', () => {
		it('should return access token and refresh token when given correct email and password', async () => {
			// Arrange
			const user_stub = createUserStub();
			jest
				.spyOn(auth_service, 'generateAccessToken')
				.mockReturnValue(mock_access_token);
			jest
				.spyOn(auth_service, 'generateRefreshToken')
				.mockReturnValue(mock_refresh_token);
			jest
				.spyOn(bcrypt, 'hash')
				.mockImplementationOnce(() => mock_refresh_token);
			jest.spyOn(auth_service, 'storeRefreshToken');

			// Act
			const result = await auth_service.signIn(user_stub._id as string);

			// Assert
			expect(auth_service.storeRefreshToken).toBeCalledWith(
				user_stub._id,
				mock_refresh_token,
			);
			expect(result).toEqual({
				access_token: mock_access_token,
				refresh_token: mock_refresh_token,
			});
		});
	});

	describe('generateAccessToken', () => {
		it('should call jwtService.sign with the provided payload and configuration options', () => {
			// Arrange
			const user_stub = createUserStub();
			config_service.get.mockReturnValueOnce('3600');
			// Act
			auth_service.generateAccessToken({
				user_id: user_stub._id as string,
			});

			// Assert
			expect(jwt_service.sign).toHaveBeenCalledWith(
				{ user_id: user_stub._id },
				expect.objectContaining({
					algorithm: 'RS256',
					privateKey: expect.any(String),
					expiresIn: expect.any(String),
				}),
			);
		});
	});

	describe('generateRefreshToken', () => {
		it('should call jwtService.sign with the provided payload and configuration options', () => {
			// Arrange
			const user_stub = createUserStub();
			config_service.get.mockReturnValueOnce('3600');
			// Act
			auth_service.generateRefreshToken({
				user_id: user_stub._id as string,
			});

			// Assert
			expect(jwt_service.sign).toBeCalledWith(
				{ user_id: user_stub._id },
				expect.objectContaining({
					algorithm: 'RS256',
					privateKey: expect.any(String),
					expiresIn: expect.any(String),
				}),
			);
		});
	});

	describe('storeRefreshToken', () => {
		it('should call user_service.setCurrentRefreshToken to store refresh token into user database', async () => {
			// Arrange
			const user_stub = createUserStub();
			jest.spyOn(bcrypt, 'hash').mockImplementation(() => mock_refresh_token);
			// Act
			await auth_service.storeRefreshToken(
				user_stub._id as string,
				mock_refresh_token,
			);
			// Assert
			expect(bcrypt.hash).toBeCalledWith(
				mock_refresh_token,
				auth_service['SALT_ROUND'],
			);
			expect(users_service.setCurrentRefreshToken).toBeCalledWith(
				user_stub._id,
				mock_refresh_token,
			);
		});
	});

	describe('getAuthenticatedUser', () => {
		it('should throw a bad request exception if email or password do not match', async () => {
			// Arange
			const user_stub = createUserStub();
			jest.spyOn(users_service, 'getUserByEmail').mockResolvedValueOnce(null);

			// Act & Assert
			// Learn more about asynchronous task https://jestjs.io/docs/expect#rejects
			await expect(
				auth_service.getAuthenticatedUser(user_stub.email, user_stub.password),
			).rejects.toThrow(BadRequestException);
		});
		it('should return user if email and password are valid', async () => {
			// Arange
			const user_stub = {
				...createUserStub(),
				password: 'hashed_password',
			};
			const mock_raw_password = 'raw_password';
			jest
				.spyOn(users_service, 'getUserByEmail')
				// @ts-ignore
				.mockResolvedValueOnce(user_stub);
			jest
				.spyOn(auth_service as any, 'verifyPlainContentWithHashedContent')
				.mockResolvedValueOnce(true);
			// Act
			const result = await auth_service.getAuthenticatedUser(
				user_stub.email,
				mock_raw_password,
			);

			// Assert
			expect(result).toEqual(user_stub);
			expect(
				auth_service['verifyPlainContentWithHashedContent'],
			).toHaveBeenCalledWith(mock_raw_password, user_stub.password);
		});
	});

	describe('getUserIfRefreshTokenMatched', () => {
		it('should throw a not found exception if user id do not match', async () => {
			// Arrange
			const user_stub = createUserStub();
			jest
				.spyOn(users_service, 'findOneByCondition')
				.mockResolvedValueOnce(null);

			// Act & Assert
			await expect(
				auth_service.getUserIfRefreshTokenMatched(
					user_stub._id as string,
					mock_refresh_token,
				),
			).rejects.toThrow(UnauthorizedException);
		});
		it('should throw a bad request exception if the refresh token does not match', async () => {
			// Arange
			const user_stub = {
				...createUserStub(),
				current_refresh_token: 'hashed_refresh_token',
			};
			jest
				.spyOn(users_service, 'findOneByCondition')
				// @ts-ignore
				.mockResolvedValueOnce(user_stub);

			// Act & Assert
			await expect(
				auth_service.getUserIfRefreshTokenMatched(
					user_stub._id as string,
					mock_refresh_token,
				),
			).rejects.toThrow(BadRequestException);
		});
		it('should return a user if the refresh token matches', async () => {
			// Arange
			const user_stub = {
				...createUserStub(),
				current_refresh_token: 'hashed_refresh_token',
			};
			jest
				.spyOn(users_service, 'findOneByCondition')
				// @ts-ignore
				.mockResolvedValueOnce(user_stub);

			jest
				.spyOn(auth_service as any, 'verifyPlainContentWithHashedContent')
				.mockResolvedValueOnce(true);

			// Act & Assert
			await expect(
				auth_service.getUserIfRefreshTokenMatched(
					user_stub._id as string,
					mock_refresh_token,
				),
			).resolves.toEqual(user_stub);
			expect(
				auth_service['verifyPlainContentWithHashedContent'],
			).toHaveBeenCalledWith(
				mock_refresh_token,
				user_stub.current_refresh_token,
			);
		});
	});
});
