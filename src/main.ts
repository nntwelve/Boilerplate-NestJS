import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from '@configs/api-docs.config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationError } from 'class-validator';
import { ERRORS_DICTIONARY } from './constraints/error-dictionary.constraint';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	configSwagger(app);
	const config_service = app.get(ConfigService);
	app.useStaticAssets(join(__dirname, './served'));
	app.enableCors({ origin: '*' });
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			exceptionFactory: (errors: ValidationError[]) =>
				new BadRequestException({
					message: ERRORS_DICTIONARY.VALIDATION_ERROR,
					details: errors
						.map((error) => Object.values(error.constraints))
						.flat(),
				}),
		}),
	);
	await app.listen(config_service.get('PORT'), () =>
		logger.log(`Application running on port ${config_service.get('PORT')}`),
	);
}
bootstrap();
