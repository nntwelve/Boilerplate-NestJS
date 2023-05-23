import { User } from '@modules/users/entities/user.entity';
import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FindAllResponse } from 'src/types/common.type';

export interface UsersRepositoryInterface
	extends BaseRepositoryInterface<User> {
	findAllWithSubFields(
		condition: object,
		projection?: string,
		populate?: string[] | any,
	): Promise<FindAllResponse<User>>;
	getUserWithRole(user_id: string): Promise<User>;
}
