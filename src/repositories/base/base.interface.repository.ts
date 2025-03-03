import { FindAllResponse } from 'src/types/common.type';

export interface BaseRepositoryInterface<T> {
	create(dto: T | any): Promise<T>;

	findOneById(id: string, projection?: string, option?: object): Promise<T>;

	findOneByCondition(condition?: object, projection?: string): Promise<T>;

	findAll(condition: object, options?: object): Promise<FindAllResponse<T>>;

	findOneAndUpdate(condition: object, dto: Partial<T>): Promise<T>;

	update(id: string, dto: Partial<T>): Promise<T>;

	softDelete(id: string): Promise<boolean>;

	permanentlyDelete(id: string): Promise<boolean>;
}
