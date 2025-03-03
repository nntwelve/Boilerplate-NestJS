import { Inject } from '@nestjs/common';

// INNER
import { DailyCheckIn } from './entities/daily-check-in.entity';
import { DailyCheckInRepositoryInterface } from './interfaces/daily-check-in.interface';
import { findAllByPeriodDto } from './dto/get-daily-check-in.dto';

// OUTER
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';

export class DailyCheckInService extends BaseServiceAbstract<DailyCheckIn> {
	constructor(
		@Inject('DailyCheckInRepositoryInterface')
		private readonly daily_check_in_repository: DailyCheckInRepositoryInterface,
	) {
		super(daily_check_in_repository);
	}

	async increaseAccessAmount(
		user_id: string,
		check_in_date: Date,
	): Promise<DailyCheckIn> {
		try {
			return await this.daily_check_in_repository.increaseAccessAmount(
				user_id,
				check_in_date,
			);
		} catch (error) {
			throw error;
		}
	}

	async addCheckInData(
		user_id: string,
		check_in_date: Date,
	): Promise<DailyCheckIn> {
		try {
			return await this.daily_check_in_repository.addCheckInData(
				user_id,
				check_in_date,
			);
		} catch (error) {
			throw error;
		}
	}

	async findAllByPeriod(
		filter: findAllByPeriodDto,
	): Promise<DailyCheckIn[] | DailyCheckIn> {
		try {
			return await this.daily_check_in_repository.findAllByPeriod(filter);
		} catch (error) {
			throw error;
		}
	}
}
