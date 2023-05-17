import { token_stub } from '../test/mocks/tokens.stub';

export const mockJwtService = {
	sign: jest.fn().mockReturnValue(token_stub),
};
