import { mock_token } from './tokens.mock';

export const mockJwtService = {
	sign: jest.fn().mockReturnValue(mock_token),
};
