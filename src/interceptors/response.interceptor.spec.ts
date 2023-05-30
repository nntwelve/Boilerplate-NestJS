import { CallHandler } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import { execution_context } from 'src/shared/test/mocks/execution-context.mock';

const return_data = { foo: 'bar' };

describe('ResponseInterceptor', () => {
	let interceptor: ResponseInterceptor;
	let next: CallHandler;

	beforeEach(() => {
		interceptor = new ResponseInterceptor();
		// create the mock CallHandler for the interceptor
		next = {
			handle: jest.fn(() => of(return_data)),
		} as CallHandler;
	});

	describe('intercept', () => {
		// we use done here to be able to tell the observable subscribe function
		// when the observable should finish. If we do not pass done
		// Jest will complain about an asynchronous task not finishing within 5000 ms.
		it('should transform the response data', (done) => {
			// Arrange
			const expected_data = {
				code: 200,
				message: 'Success',
				data: return_data,
			};

			// Act & Assert
			// if your interceptor has logic that depends on the context
			// you can always pass in a mock value instead of an empty object
			// just make sure to mock the expected alls like switchToHttp
			// and getRequest
			const response_interceptor: Observable<any> = interceptor.intercept(
				execution_context,
				next,
			);
			response_interceptor.subscribe({
				next: (data) => {
					expect(data).toEqual(expected_data);
				},
				error: (error) => {
					console.log(error);
				},
				complete: () => {
					done();
				},
			});
		});
		it('should handle errors thrown by the handler', (done) => {
			// Arrange
			const error = new Error('Something went wrong');
			(next.handle as jest.Mock).mockImplementationOnce(() => {
				return throwError(() => error);
			});

			// Act
			const response_interceptor: Observable<any> = interceptor.intercept(
				execution_context,
				next,
			);

			// Assert
			response_interceptor.subscribe({
				next: () => console.log, // Do nothing
				error: (err) => {
					expect(err).toBe(error);
					done();
				},
				complete: () => {
					done();
				},
			});
		});
	});
});
