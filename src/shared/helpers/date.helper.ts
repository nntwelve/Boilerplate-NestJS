export function isLastDayOfMonth(date: Date) {
	const last_day_of_month = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0,
	).getDate();
	return date.getDate() === last_day_of_month;
}

export function isTheMonthOfSameYear(date_a: Date, date_b: Date) {
	return (
		date_a.getFullYear() === date_b.getFullYear() &&
		date_a.getMonth() === date_b.getMonth()
	);
}

export function isDifferentMonthOrYear(date_a: Date, date_b: Date) {
	return (
		date_a.getMonth() !== date_b.getMonth() ||
		date_a.getFullYear() !== date_b.getFullYear()
	);
}
