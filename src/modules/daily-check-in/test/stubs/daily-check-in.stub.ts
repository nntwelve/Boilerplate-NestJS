import { DailyCheckIn } from '@modules/daily-check-in/entities/daily-check-in.entity';
import { User } from '@modules/users/entities/user.entity';

export const createDailyCheckInStub = (): DailyCheckIn => {
	return {
		_id: '643d0fb80a2f99f4151176c5',
		month_year: '1-2023',
		user: '643d0fb80a2f99f4151176c4' as unknown as User,
		check_in_data: [],
	};
};
