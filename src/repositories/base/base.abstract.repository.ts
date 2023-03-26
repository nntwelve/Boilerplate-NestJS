import { Model } from 'mongoose';
import { BaseRepositoryInterface } from './base.interface.repository';

export abstract class BaseRepositoryAbstract<T>
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
		return await this.model.findById(id).exec();
	}

	async findOneByCondition(condition: {}): Promise<T> {
		return await this.model.findOne(condition).exec();
	}

	async findAll(): Promise<T[]> {
		return await this.model.find();
	}

	async update(id: string, dto: Partial<T>): Promise<T> {
		return await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
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
