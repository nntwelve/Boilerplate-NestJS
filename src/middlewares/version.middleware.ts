import {
	BadRequestException,
	Injectable,
	NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class VersionMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const app_version = req.headers['x-app-version'];
		if (!app_version || app_version !== '2.0.0')
			throw new BadRequestException('Invalid App Version');
		next();
	}
}
