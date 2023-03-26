export interface BaseRepositoryInterface<T> {
	create(dto: T | any): Promise<T>;

	findOneById(id: string): Promise<T>;

	findOneByCondition(condition: object): Promise<T>;

	findAll(): Promise<T[]>;

	update(id: string, dto: Partial<T>): Promise<T>;

	softDelete(id: string): Promise<boolean>;

	permanentlyDelete(id: string): Promise<boolean>;
}
