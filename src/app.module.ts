import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { database_config } from '@configs/configuration.config';
import { UsersModule } from '@modules/users/users.module';
import { FlashCardsModule } from '@modules/flash-cards/flash-cards.module';
import { CollectionsModule } from '@modules/collections/collections.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { TopicsModule } from '@modules/topics/topics.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './exception-filters/global-exception.filter';
import { BullModule } from '@nestjs/bullmq';
import { ParagraphsModule } from '@modules/paragraphs/paragraphs.module';
@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision')
					.default('development'),
				PORT: Joi.number().port().required(),
				DATABASE_PORT: Joi.number().port().required(),
				DATABASE_USERNAME: Joi.string().min(4).required(),
				DATABASE_PASSWORD: Joi.string().min(4).required(),
				DATABASE_HOST: Joi.string().required(),
				DATABASE_URI: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: false,
			},
			load: [database_config],
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URI'),
				dbName: configService.get<string>('DATABASE_NAME'),
			}),
			inject: [ConfigService],
		}),
		UserRolesModule,
		UsersModule,
		TopicsModule,
		FlashCardsModule,
		CollectionsModule,
		AuthModule,
		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				connection: {
					host: configService.get('REDIS_HOST'),
					port: configService.get('REDIS_PORT'),
				},
			}),
		}),
		ParagraphsModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],
})
export class AppModule {}
