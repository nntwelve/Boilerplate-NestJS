import { token_stub } from '../test/stubs/token.stub';

export const mockJwtService = {
	sign: jest.fn().mockReturnValue(token_stub),
};
