import { BadRequestException, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { execution_context } from 'src/shared/test/mocks/execution-context.mock';
import { TimeoutInterceptor } from './timeout.interceptor';

describe('ResponseInterceptor', () => {
	let interceptor: TimeoutInterceptor;
	let next: CallHandler;

	beforeEach(() => {
		interceptor = new TimeoutInterceptor();
		// create the mock CallHandler for the interceptor
		next = {
			handle: jest.fn(() => of(undefined)),
		} as CallHandler;
	});

	describe('intercept', () => {
		// we use done here to be able to tell the observable subscribe function
		// when the observable should finish. If we do not pass done
		// Jest will complain about an asynchronous task not finishing within 5000 ms.
		it('should throw RequestTimeoutException if the response takes too long', (done) => {
			// Arrange
			const timeout_interceptor: Observable<any> = interceptor.intercept(
				execution_context,
				next,
			);

			// Act & Assert
			// if your interceptor has logic that depends on the context
			// you can always pass in a mock value instead of an empty object
			// just make sure to mock the expected alls like switchToHttp
			// and getRequest
			timeout_interceptor.subscribe({
				next: (data) => {
					console.log(data);
				},
				error: (error) => {
					expect(error).toBe(BadRequestException);
					done();
				},
				complete: () => {
					done();
				},
			});
		});
	});
});
