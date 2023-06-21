import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		if (context.getType() === 'http') {
			return this.logHttpCall(context, next);
		}
	}

	private logHttpCall(context: ExecutionContext, next: CallHandler) {
		const request = context.switchToHttp().getRequest();
		const user_agent = request.get('user-agent') || '';
		const { ip, method, path: url } = request;
		const correlation_key = uuidv4();
		const user_id = request.user?.user_id;

		this.logger.log(
			`[${correlation_key}] ${method} ${url} ${user_id} ${user_agent} ${ip}: ${
				context.getClass().name
			} ${context.getHandler().name}`,
		);

		const now = Date.now();
		return next.handle().pipe(
			tap(() => {
				const response = context.switchToHttp().getResponse();
				const { statusCode } = response;
				const content_length = response.get('content-length');

				this.logger.log(
					`[${correlation_key}] ${method} ${url} ${statusCode} ${content_length}: ${
						Date.now() - now
					}ms`,
				);
			}),
		);
	}
}
