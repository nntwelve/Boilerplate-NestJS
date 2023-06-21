import { MockEntity } from '@repositories/test/supports/mock.entity';
import { User } from '@modules/users/entities/user.entity';
import { createUserStub } from '@modules/users/test/stubs/user.stub';

export class UserEntity extends MockEntity<User> {
	protected entity_stub = createUserStub();
}
