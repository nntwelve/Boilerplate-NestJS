import { BaseEntity } from '@modules/shared/base/base.entity';

export function generateNextKey<T extends BaseEntity>(
	items: T[],
	sort_fields: any[],
) {
	if (items.length === 0) {
		return null;
	}

	const item = items[items.length - 1];

	if (sort_fields.length === 0) {
		return { _id: item._id };
	} else if (sort_fields.length === 1) {
		return { _id: item._id, [sort_fields[0]]: item[sort_fields[0]] };
	}

	return {
		_id: item._id,
		...sort_fields.reduce((result, sort_field) => {
			return (result[sort_field] = item[sort_field]), result;
		}, {}),
	};
}
