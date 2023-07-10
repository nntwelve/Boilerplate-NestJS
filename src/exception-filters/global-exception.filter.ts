import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly config_service: ConfigService) {}
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status =
			exception instanceof HttpException ? exception.getStatus() : 500;

		const message =
			exception instanceof HttpException
				? exception.message
				: 'Internal server error';
		response.status(status).json({
			statusCode: status,
			message,
			error:
				this.config_service.get('NODE_ENV') !== 'production'
					? {
							response: exception.response,
							stack: exception.stack,
					  }
					: null,
		});
	}
}
