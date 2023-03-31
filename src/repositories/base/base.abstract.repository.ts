import { BaseEntity } from '@modules/shared/base/base.entity';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { FindAllResponse } from 'src/types/common.type';
import { BaseRepositoryInterface } from './base.interface.repository';

export abstract class BaseRepositoryAbstract<T extends BaseEntity>
	implements BaseRepositoryInterface<T>
{
	protected constructor(private readonly model: Model<T>) {
		this.model = model;
	}

	async create(dto: T | any): Promise<T> {
		const created_data = await this.model.create(dto);
		return created_data.save();
	}

	async findOneById(id: string): Promise<T> {
		const item = await this.model.findById(id);
		return item.deleted_at ? null : item;
	}

	async findOneByCondition(condition = {}): Promise<T> {
		return await this.model
			.findOne({
				...condition,
				deleted_at: null,
			})
			.exec();
	}

	async findAll(
		condition: FilterQuery<T>,
		projection?: string,
		options?: QueryOptions<T>,
	): Promise<FindAllResponse<T>> {
		const [count, items] = await Promise.all([
			this.model.count({ ...condition, deleted_at: null }),
			this.model.find({ ...condition, deleted_at: null }, projection, options),
		]);
		return {
			count,
			items,
		};
	}

	async update(id: string, dto: Partial<T>): Promise<T> {
		await this.model
			.updateOne({ _id: id, deleted_at: null }, dto, { new: true })
			.exec();
		return await this.model.findById(id).exec();
	}

	async softDelete(id: string): Promise<boolean> {
		const delete_item = await this.model.findById(id);
		if (!delete_item) {
			return false;
		}

		return !!(await this.model
			.findByIdAndUpdate<T>(id, { deleted_at: new Date() })
			.exec());
	}

	async permanentlyDelete(id: string): Promise<boolean> {
		const delete_item = await this.model.findById(id);
		if (!delete_item) {
			return false;
		}
		return !!(await this.model.findByIdAndDelete(id));
	}
}
