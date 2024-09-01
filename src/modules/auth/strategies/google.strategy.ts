import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly auth_service: AuthService,
		private readonly config_service: ConfigService,
	) {
		super({
			clientID: config_service.get('GOOGLE_CLIENT_ID'),
			clientSecret: config_service.get('GOOGLE_CLIENT_SECRET'),
			callbackURL: `${config_service.get('API_URL')}/auth/google/callback`,
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const { name, emails, photos } = profile;
		return await this.auth_service.authInWithGoogle({
			email: emails[0].value,
			first_name: name.givenName,
			last_name: name.familyName,
			avatar: photos[0].value,
		});
	}
}
