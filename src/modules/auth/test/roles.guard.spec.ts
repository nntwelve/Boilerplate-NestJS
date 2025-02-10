import { Test } from '@nestjs/testing';
import { RolesGuard } from '../guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { execution_context } from 'src/shared/test/mocks/execution-context.mock';
import { mock_request_with_user } from './mocks/requests.mock';
import { ROLES } from 'src/decorators/roles.decorator';

describe('RolesGuard', () => {
	let roles_guard: RolesGuard;
	let reflector: Reflector;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				RolesGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn(),
					},
				},
			],
		}).compile();

		roles_guard = module_ref.get<RolesGuard>(RolesGuard);
		reflector = module_ref.get<Reflector>(Reflector);
	});

	afterEach(() => jest.clearAllMocks());

	it('should return true if the user has a required role', () => {
		// Arrange
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(['admin']);
		(
			execution_context.switchToHttp().getRequest as jest.Mock
		).mockReturnValueOnce(mock_request_with_user);

		// Act & Assert
		expect(roles_guard.canActivate(execution_context)).toBeTruthy();
		expect(reflector.getAllAndOverride).toBeCalledWith(ROLES, [
			execution_context.getHandler(),
			execution_context.getClass(),
		]);
	});

	it('should return false if the user does not have a required role', () => {
		// Arrange
		jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(['admin']);
		(
			execution_context.switchToHttp().getRequest as jest.Mock
		).mockReturnValueOnce({
			user: {
				role: 'user',
			},
		});

		// Act & Assert
		expect(roles_guard.canActivate(execution_context)).toBeFalsy();
		expect(reflector.getAllAndOverride).toBeCalledWith(ROLES, [
			execution_context.getHandler(),
			execution_context.getClass(),
		]);
	});
});
