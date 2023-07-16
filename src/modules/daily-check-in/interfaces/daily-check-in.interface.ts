import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { DailyCheckIn } from '../entities/daily-check-in.entity';
import { findAllByPeriodDto } from '../dto/get-daily-check-in.dto';

export interface DailyCheckInRepositoryInterface
	extends BaseRepositoryInterface<DailyCheckIn> {
	increaseAccessAmount(
		user_id: string,
		check_in_date: Date,
	): Promise<DailyCheckIn>;

	addCheckInData(user_id: string, check_in_date: Date): Promise<DailyCheckIn>;

	findAllByPeriod(
		filter: findAllByPeriodDto,
	): Promise<DailyCheckIn[] | DailyCheckIn>;
}
