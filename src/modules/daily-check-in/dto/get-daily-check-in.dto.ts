export enum PERIOD_TYPE {
	MONTH = 'month',
	YEAR = 'year',
}

export class findAllByPeriodDto {
	user_id?: string;

	type: PERIOD_TYPE;

	month?: string;

	year: string;
}
