export enum SORT_TYPE {
	'DESC' = 'desc',
	'ASC' = 'asc',
}

export type FindAllResponse<T> = {
	count: number;
	items: T[];
	next_key?: object;
};

export type SortParams = { sort_by: string; sort_type: SORT_TYPE };

export type SearchParams = { keywork: string; field: string };

export type PaginateParams = { offset: number; limit: number };
