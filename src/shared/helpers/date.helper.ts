export function isLastDayOfMonth(date: Date) {
	const lastDayOfMonth = new Date(
		date.getFullYear(),
		date.getMonth() + 1,
		0,
	).getDate();
	return date.getDate() === lastDayOfMonth;
}
