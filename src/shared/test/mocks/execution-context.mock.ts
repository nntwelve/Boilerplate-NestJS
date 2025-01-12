import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

// export const execution_context: ExecutionContext = {
// 	getClass: jest.fn(),
// 	getHandler: jest.fn(),
// 	getArgs: jest.fn(),
// 	getType: jest.fn(),
// 	getArgByIndex: jest.fn(),
// 	switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }),
// 	switchToRpc: jest.fn(),
// 	switchToWs: jest.fn(),
// };

export const execution_context: ExecutionContext =
	createMock<ExecutionContext>();
