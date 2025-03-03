import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';

// INNER
import { SignUpDto } from './dto/sign-up.dto';

// OUTER
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,
		private readonly users_service: UsersService,
		private readonly jwt_service: JwtService,
	) {}

	async signUp(sign_up_dto: SignUpDto) {
		try {
			const existed_user = await this.users_service.findOneByCondition({
				email: sign_up_dto.email,
			});
			if (existed_user) {
				throw new ConflictException({
					message: ERRORS_DICTIONARY.EMAIL_EXISTED,
					details: 'Email already existed!!',
				});
			}
			const hashed_password = await bcrypt.hash(
				sign_up_dto.password,
				this.SALT_ROUND,
			);
			const user = await this.users_service.create({
				...sign_up_dto,
				username: `${sign_up_dto.email.split('@')[0]}${Math.floor(
					10 + Math.random() * (999 - 10),
				)}`, // Random username
				password: hashed_password,
			});
			const refresh_token = this.generateRefreshToken({
				user_id: user._id.toString(),
			});
			await this.storeRefreshToken(user._id.toString(), refresh_token);
			return {
				access_token: this.generateAccessToken({
					user_id: user._id.toString(),
				}),
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

	async signIn(user_id: string) {
		try {
			const access_token = this.generateAccessToken({
				user_id,
			});
			const refresh_token = this.generateRefreshToken({
				user_id,
			});
			await this.storeRefreshToken(user_id, refresh_token);
			return {
				access_token,
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

	async getAuthenticatedUser(email: string, password: string): Promise<User> {
		try {
			const user = await this.users_service.getUserByEmail(email);
			await this.verifyPlainContentWithHashedContent(password, user.password);
			return user;
		} catch (error) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
				details: 'Wrong credentials!!',
			});
		}
	}

	private async verifyPlainContentWithHashedContent(
		plain_text: string,
		hashed_text: string,
	) {
		const is_matching = await bcrypt.compare(plain_text, hashed_text);
		if (!is_matching) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CONTENT_NOT_MATCH,
				details: 'Content not match!!',
			});
		}
	}

	async getUserIfRefreshTokenMatched(
		user_id: string,
		refresh_token: string,
	): Promise<User> {
		try {
			const user = await this.users_service.findOneByCondition({
				_id: user_id,
			});
			if (!user) {
				throw new UnauthorizedException({
					message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
					details: 'Unauthorized',
				});
			}
			await this.verifyPlainContentWithHashedContent(
				refresh_token,
				user.current_refresh_token,
			);
			return user;
		} catch (error) {
			throw error;
		}
	}

	generateAccessToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: access_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: refresh_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	async storeRefreshToken(user_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.users_service.setCurrentRefreshToken(user_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}
}
