import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token.interface';
import { rt_private_key } from 'src/constraints/jwt.constraint';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'refresh_token',
) {
	constructor(
		private readonly config_service: ConfigService,
		private readonly auth_service: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: 'refresh_token_secret',
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: TokenPayload) {
		return await this.auth_service.getUserIfRefreshTokenMatched(
			payload.user_id,
			request.headers.authorization.split('Bearer ')[1],
		);
	}
}
