import {
	FindAllResponse,
	PaginateParams,
	SortParams,
} from 'src/types/common.type';

export interface BaseRepositoryInterface<T> {
	create(dto: T | any): Promise<T>;

	findOneById(id: string, projection?: string): Promise<T>;

	findOneByCondition(condition?: object, projection?: string): Promise<T>;

	/**
	 *
	 * @param condition
	 * @param projection list of fields. eg. "first_name username"
	 * @param options SortParams & PaginateParams
	 * @returns Promise<FindAllResponse<T>>
	 */
	findAll(
		condition?: object,
		projection?: string,
		options?: SortParams & PaginateParams,
	): Promise<FindAllResponse<T>>;

	update(id: string, dto: Partial<T>): Promise<T>;

	softDelete(id: string): Promise<boolean>;

	permanentlyDelete(id: string): Promise<boolean>;
}
