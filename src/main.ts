import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create(AppModule);
	const config_service = app.get(ConfigService);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);
	await app.listen(config_service.get('PORT'), () =>
		logger.log(`Application running on port ${config_service.get('PORT')}`),
	);
}
bootstrap();
