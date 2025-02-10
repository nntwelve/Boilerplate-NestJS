import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAccessTokenGuard } from '../guards/jwt-access-token.guard';
import { execution_context } from 'src/shared/test/mocks/execution-context.mock';
import { IS_PUBLIC_KEY } from 'src/decorators/auth.decorator';

describe('JwtAccessTokenGuard', () => {
	let guard: JwtAccessTokenGuard;
	let reflector: Reflector;

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			providers: [
				JwtAccessTokenGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn(),
					},
				},
			],
		}).compile();

		guard = moduleRef.get<JwtAccessTokenGuard>(JwtAccessTokenGuard);
		reflector = moduleRef.get<Reflector>(Reflector);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return true when isPublic is true', () => {
		// Arrange
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);

		// Act & Assert
		expect(guard.canActivate(execution_context)).toBeTruthy();
		expect(reflector.getAllAndOverride).toBeCalledWith(IS_PUBLIC_KEY, [
			execution_context.getHandler(),
			execution_context.getClass(),
		]);
	});

	it('should call super.canActivate() when isPublic is false', () => {
		// Arrange
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);
		jest
			.spyOn(AuthGuard('jwt').prototype, 'canActivate')
			.mockReturnValueOnce(true);
		// Act & Assert
		expect(guard.canActivate(execution_context)).toBeTruthy();
		expect(reflector.getAllAndOverride).toBeCalledWith(IS_PUBLIC_KEY, [
			execution_context.getHandler(),
			execution_context.getClass(),
		]);
		expect(AuthGuard('jwt').prototype.canActivate).toBeCalledTimes(1);
	});
});
