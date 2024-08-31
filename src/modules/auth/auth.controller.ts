import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { RequestWithUser } from 'src/types/requests.type';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { jwtDecode } from 'jwt-decode';
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	oauthGoogleClient: OAuth2Client;
	constructor(
		private readonly auth_service: AuthService,
		private readonly config_service: ConfigService,
	) {
		this.oauthGoogleClient = new OAuth2Client(
			this.config_service.get('GOOGLE_CLIENT_ID'),
			this.config_service.get('GOOGLE_CLIENT_SECRET'),
			'postmessage',
		);
	}

	@Post('sign-up')
	@ApiOperation({
		summary: 'User sign up to platform',
		description: '## User sign up',
		servers: [
			{
				url: 'http://localhost:3333',
				description: 'Current server',
			},
			{
				url: 'http://localhost:9000',
				description: 'Authentication service if exist',
			},
		],
	})
	@ApiBody({
		type: SignUpDto,
		examples: {
			user_1: {
				value: {
					first_name: 'John',
					last_name: 'Doe',
					email: 'johndoe@example.com',
					password: '1232@asdS',
				} as SignUpDto,
			},
			user_2: {
				value: {
					first_name: 'Michael',
					last_name: 'Smith',
					email: 'michaelsmith@example.com',
					password: '1232@asdS',
				} as SignUpDto,
			},
		},
	})
	@ApiCreatedResponse({
		description: 'User created successfully!!',
		content: {
			'application/json': {
				examples: {
					created_user: {
						summary: 'Response after sign up',
						value: {
							access_token:
								'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjQ0MWNkNmJlMWQ0ZTBiNDRjNzA3NDk2IiwiaWF0IjoxNjgyMDM0MDI3LCJleHAiOjE2ODIwMzc2Mjd9.AH4z7uDWuEDjOs8sesB0ItxKUJ2M3rjul1D1mmjAKieOZblej5mp0JQE5IdgB9LlAOzOtKOLL5RWhxLCZ-YskvoRA7Yqza_rOjfIHeNseC3M66kKYqORN07aZDiA2OWhT3pXBqoKRCUBQCKLgMCAPT-CHryc0wUQGaKxP8YJO8dwIhGtjADchmzNJVBs4G7qYnpZAsORayd5GNfgoLpWmVFIBHSnPLNIL4dL8dLof0GBmVhdjhnHIUXYQlqL1wiwsmxmUC9TU2uiChm-TAhuiQyVwFokSySBJzBrLmEtgy89aaR0YizFK-QMg2xW3cJiiRzEBigTdsR0kvdUlk5GOg',
							refresh_token:
								'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjQ0MWNkNmJlMWQ0ZTBiNDRjNzA3NDk2IiwiaWF0IjoxNjgyMDM0MDI3LCJleHAiOjE2ODIwNTkyMjd9.aKNZymKdf3VEbPkda2cYYTS7KlpCbTqdXP30LREQ2b_fJ8q8cA0OyNEARK3Jm5yGsKoNd3txi54XmEbf19LC9CuDf9kwgLasPizEeMZsAJqSbSguzE4-9b4sSdf22GyipCcZJpkXkp01Bew04J8Y4FqhNARONsWzySXg8_VVWOGkfHGJVHFs7xYyVvmt3RErJwRM5s1Ou1ok7VW62FSTSAvXw6-qsHp5T7kXo73jECBqSuNEs5JcdluoBjdaAxggHYaDgTXoRh7y4Mn_fVKCQarAsUAxg6w0fxc8Gj0nP1ct3-GjG-Of-0O-iF7uynI2Lnq_On7WUsH7rFSysNyHUg',
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: 'Validation failed',
		content: {
			'application/json': {
				examples: {
					invalid_email_password: {
						value: {
							statusCode: 400,
							message: [
								'email must be an email',
								'password is not strong enough',
							],
							error: 'Bad Request',
						},
					},
					some_fields_missing: {
						value: {
							statusCode: 400,
							message: [
								'last_name must be shorter than or equal to 50 characters',
								'last_name should not be empty',
							],
							error: 'Bad Request',
						},
					},
				},
			},
		},
	})
	@ApiConflictResponse({
		description: 'Conflict user info',
		content: {
			'application/json': {
				examples: {
					email_duplication: {
						value: {
							statusCode: 409,
							message: 'Email already existed!!',
							error: 'Conflict',
						},
					},
					username_duplication: {
						value: {
							statusCode: 409,
							message: 'Username already existed!!',
							error: 'Conflict',
						},
					},
				},
			},
		},
	})
	async signUp(@Body() sign_up_dto: SignUpDto) {
		return await this.auth_service.signUp(sign_up_dto);
	}

	@UseGuards(LocalAuthGuard)
	@Post('sign-in')
	@ApiBody({
		type: SignUpDto,
		examples: {
			user_1: {
				value: {
					first_name: 'John',
					last_name: 'Doe',
					email: 'johndoe@example.com',
					password: '1232@asdS',
				} as SignUpDto,
			},
			user_2: {
				value: {
					first_name: 'Michael',
					last_name: 'Smith',
					email: 'michaelsmith@example.com',
					password: '1232@asdS',
				} as SignUpDto,
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request',
				},
			},
		},
	})
	async signIn(@Req() request: RequestWithUser) {
		const { user } = request;
		return await this.auth_service.signIn(user._id.toString());
	}

	@Post('google')
	async authWithGoogle(@Body() data: SignUpGoogleDto) {
		const { tokens } = await this.oauthGoogleClient.getToken(data.code); // exchange code for tokens
		// Get user info
		const tokenInfo = jwtDecode<{
			family_name: string;
			given_name: string;
			email: string;
			picture: string;
		}>(tokens.id_token);
		console.log({ tokens, tokenInfo });
		return this.auth_service.authWithGoogle({
			first_name: tokenInfo.family_name,
			last_name: tokenInfo.given_name,
			email: tokenInfo.email,
			avatar: tokenInfo.picture,
			is_registered_with_google: true,
		});
	}

	@UseGuards(JwtRefreshTokenGuard)
	@Post('refresh')
	async refreshAccessToken(@Req() request: RequestWithUser) {
		const { user } = request;
		const access_token = this.auth_service.generateAccessToken({
			user_id: user._id.toString(),
		});
		return {
			access_token,
		};
	}
}
