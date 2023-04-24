import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle('Flash card project')
		.setDescription('## The flash card API description')
		.setVersion('1.0')
		.addSecurity('token', { type: 'http', scheme: 'bearer' })
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api-docs', app, document, {
		swaggerOptions: { persistAuthorization: true },
		customJs: '/swagger-custom.js',
	});
}
