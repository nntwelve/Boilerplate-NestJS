import { NextFunction, Request, Response } from 'express';
import { VersionMiddleware } from './version.middleware';
import { BadRequestException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('VersionMiddleware', () => {
	let middleware: VersionMiddleware;
	let next: NextFunction;
	let req: Request;
	let res: Response;

	beforeEach(() => {
		middleware = new VersionMiddleware();

		next = jest.fn();
		req = createMock<Request>();
		res = createMock<Response>();
	});

	describe('use', () => {
		it('should pass if X-App-Version header is set to 2.0.0', () => {
			// Arrange
			req.headers = {
				'x-app-version': '2.0.0',
			};

			// Act
			middleware.use(req, res, next);

			// Assert
			expect(next).toBeCalled();
		});

		it('should throw BadRequestException if X-App-Version header is not set', () => {
			// Arrange
			req.headers = {};

			/* Option 1:*/
			try {
				// Act
				middleware.use(req, res, next);
			} catch (error) {
				// Assert
				expect(error).toStrictEqual(
					new BadRequestException('Invalid App Version'),
				);
			}

			/* Option 2: */
			// Act & Assert
			// We must wrap `middleware.use` inside anonymous function because when a function is invoked directly like middleware.use(req, res, next),
			// its exceptions are propagated up the stack trace instead of being caught by Jest's expect statement.
			// expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
			// expect(() => middleware.use(req, res, next)).toThrow('Invalid App Version');
		});

		it('should throw BadRequestException if X-App-Version header is not valid', () => {
			// Arrange
			req.headers = {
				'x-app-version': '1.0.0',
			};

			/* Option 1:*/
			// try {
			// 	// Act
			// 	middleware.use(req, res, next);
			// } catch (error) {
			// 	// Assert
			// 	expect(error).toStrictEqual(
			// 		new BadRequestException('Invalid App Version'),
			// 	);
			// }

			/* Option 2: */
			// Act & Assert
			// We must wrap `middleware.use` inside anonymous function because when a function is invoked directly like middleware.use(req, res, next),
			// its exceptions are propagated up the stack trace instead of being caught by Jest's expect statement.
			expect(() => middleware.use(req, res, next)).toThrowError(
				BadRequestException,
			);
			expect(() => middleware.use(req, res, next)).toThrowError(
				'Invalid App Version',
			);
		});
	});
});
