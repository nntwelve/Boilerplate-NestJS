import { createUserStub } from '@modules/users/test/stubs/user.stub';
import {
	mock_access_token,
	mock_refresh_token,
} from '../test/mocks/tokens.mock';

export const AuthService = jest.fn().mockReturnValue({
	signUp: jest.fn().mockResolvedValue({
		access_token: mock_access_token,
		refresh_token: mock_refresh_token,
	}),
	signIn: jest.fn().mockResolvedValue({
		access_token: mock_access_token,
		refresh_token: mock_refresh_token,
	}),
	getAuthenticatedUser: jest.fn().mockResolvedValue(createUserStub()),
	getUserIfRefreshTokenMatched: jest.fn().mockRejectedValue(createUserStub()),
	generateAccessToken: jest.fn().mockReturnValue(mock_access_token),
	generateRefreshToken: jest.fn().mockReturnValue(mock_refresh_token),
});
