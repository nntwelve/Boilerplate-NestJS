import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { RequestWithUser } from 'src/types/requests.type';

export const mock_request_with_user = {
	user: createUserStub(),
} as RequestWithUser;
