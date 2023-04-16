import { User, UserDocument } from '@modules/users/entities/user.entity';
import { UsersRepositoryInterface } from '@modules/users/interfaces/users.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { FindAllResponse } from 'src/types/common.type';

@Injectable()
export class UsersRepository
	extends BaseRepositoryAbstract<UserDocument>
	implements UsersRepositoryInterface
{
	constructor(
		@InjectModel(User.name)
		private readonly user_model: Model<UserDocument>,
	) {
		super(user_model);
	}

	async findAllWithSubFields(
		condition: FilterQuery<UserDocument>,
		projection?: string,
		populate?: string[] | PopulateOptions | PopulateOptions[],
	): Promise<FindAllResponse<UserDocument>> {
		const [count, items] = await Promise.all([
			this.user_model.count({ ...condition, deleted_at: null }),
			this.user_model
				.find({ ...condition, deleted_at: null }, projection)
				.populate(populate),
		]);
		return {
			count,
			items,
		};
	}
}
