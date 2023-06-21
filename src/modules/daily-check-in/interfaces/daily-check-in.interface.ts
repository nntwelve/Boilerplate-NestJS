import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { DailyCheckIn } from '../entities/daily-check-in.entity';

export interface DailyCheckInRepositoryInterface
	extends BaseRepositoryInterface<DailyCheckIn> {
	increaseAccessAmount(
		user_id: string,
		check_in_date: Date,
	): Promise<DailyCheckIn>;

	addCheckInData(user_id: string, check_in_date: Date): Promise<DailyCheckIn>;
}
