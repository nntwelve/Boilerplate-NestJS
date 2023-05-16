import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
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
import {
	access_token_stub,
	refresh_token_stub,
	token_stub,
} from './stubs/token.stub';

jest.mock('../../users/users.service');
describe('AuthService', function () {
	let auth_service: AuthService;
	let users_service: UsersService;
	let jwt_service: JwtService;
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
		users_service = module_ref.get<UsersService>(UsersService);
		jwt_service = module_ref.get<JwtService>(JwtService);
	});
	it('should be defined', () => {
		expect(auth_service).toBeDefined();
	});

	describe('signUp', () => {
		it('should throw a ConflictException if user with email already exists', async () => {
			// Arrange
			jest
				.spyOn(users_service, 'findOneByCondition')
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
				.spyOn(users_service, 'findOneByCondition')
				.mockResolvedValueOnce(null);
			jest
				.spyOn(auth_service, 'generateAccessToken')
				.mockReturnValue(access_token_stub);
			jest
				.spyOn(auth_service, 'generateRefreshToken')
				.mockReturnValue(refresh_token_stub);
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
				user_id: userStub()._id,
			});
			expect(auth_service.generateRefreshToken).toHaveBeenCalledWith({
				user_id: userStub()._id,
			});
			expect(auth_service.storeRefreshToken).toBeCalledWith(
				userStub()._id,
				refresh_token_stub,
			);
			expect(result).toEqual({
				access_token: access_token_stub,
				refresh_token: refresh_token_stub,
			});
		});
	});

	describe('signIn', () => {
		it('should return access token and refresh token when given correct email and password', async () => {
			// Arrange
			jest
				.spyOn(auth_service, 'generateAccessToken')
				.mockReturnValue(access_token_stub);
			jest
				.spyOn(auth_service, 'generateRefreshToken')
				.mockReturnValue(refresh_token_stub);
			jest
				.spyOn(bcrypt, 'hash')
				.mockImplementationOnce(() => refresh_token_stub);
			jest.spyOn(auth_service, 'storeRefreshToken');

			// Act
			const result = await auth_service.signIn(userStub()._id as string);

			// Assert
			expect(auth_service.storeRefreshToken).toBeCalledWith(
				userStub()._id,
				refresh_token_stub,
			);
			expect(result).toEqual({
				access_token: access_token_stub,
				refresh_token: refresh_token_stub,
			});
		});
	});

	describe('generateAccessToken', () => {
		it('should call jwtService.sign with the provided payload and configuration options', () => {
			// Arrange
			// Act
			const result = auth_service.generateAccessToken({
				user_id: userStub()._id as string,
			});

			// Assert
			expect(jwt_service.sign).toHaveBeenCalledWith(
				{ user_id: userStub()._id },
				expect.objectContaining({
					algorithm: 'RS256',
					privateKey: expect.any(String),
					expiresIn: expect.any(String),
				}),
			);
			expect(result).toBe(token_stub);
		});
	});

	describe('generateRefreshToken', () => {
		it('should call jwtService.sign with the provided payload and configuration options', () => {
			// Arrange
			// Act
			const result = auth_service.generateRefreshToken({
				user_id: userStub()._id as string,
			});

			// Assert
			expect(jwt_service.sign).toBeCalledWith(
				{ user_id: userStub()._id },
				expect.objectContaining({
					algorithm: 'RS256',
					privateKey: expect.any(String),
					expiresIn: expect.any(String),
				}),
			);
			expect(result).toBe(token_stub);
		});
	});

	describe('storeRefreshToken', () => {
		it('should call user_service.setCurrentRefreshToken to store refresh token into user database', async () => {
			// Arrange
			jest.spyOn(bcrypt, 'hash').mockImplementation(() => refresh_token_stub);
			// Act
			await auth_service.storeRefreshToken(
				userStub()._id as string,
				refresh_token_stub,
			);
			// Assert
			expect(bcrypt.hash).toBeCalledWith(
				refresh_token_stub,
				auth_service['SALT_ROUND'],
			);
			expect(users_service.setCurrentRefreshToken).toBeCalledWith(
				userStub()._id,
				refresh_token_stub,
			);
		});
	});

	describe('getAuthenticatedUser', () => {
		it('should throw a bad request exception if email or password do not match', async () => {
			// Arange
			const user_stub = userStub();
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
				...userStub(),
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
			const user_stub = userStub();
			jest
				.spyOn(users_service, 'findOneByCondition')
				.mockResolvedValueOnce(null);

			// Act & Assert
			await expect(
				auth_service.getUserIfRefreshTokenMatched(
					user_stub._id as string,
					refresh_token_stub,
				),
			).rejects.toThrow(UnauthorizedException);
		});
		it('should throw a bad request exception if the refresh token does not match', async () => {
			// Arange
			const user_stub = {
				...userStub(),
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
					refresh_token_stub,
				),
			).rejects.toThrow(BadRequestException);
		});
		it('should return a user if the refresh token matches', async () => {
			// Arange
			const user_stub = {
				...userStub(),
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
					refresh_token_stub,
				),
			).resolves.toEqual(user_stub);
			expect(
				auth_service['verifyPlainContentWithHashedContent'],
			).toHaveBeenCalledWith(
				refresh_token_stub,
				user_stub.current_refresh_token,
			);
		});
	});
});
