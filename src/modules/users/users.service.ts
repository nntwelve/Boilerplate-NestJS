import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// INNER
import { User } from './entities/user.entity';
import { UsersRepositoryInterface } from './interfaces/users.interface';
import { CreateUserDto } from './dto/create-user.dto';

// OUTER
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { FindAllResponse } from 'src/types/common.type';
import {
	isDifferentMonthOrYear,
	isLastDayOfMonth,
} from 'src/shared/helpers/date.helper';

import { DailyCheckInService } from '@modules/daily-check-in/daily-check-in.service';
import { DailyCheckIn } from '@modules/daily-check-in/entities/daily-check-in.entity';
import {
	PERIOD_TYPE,
	findAllByPeriodDto,
} from '@modules/daily-check-in/dto/get-daily-check-in.dto';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
	constructor(
		@Inject('UsersRepositoryInterface')
		private readonly users_repository: UsersRepositoryInterface,
		private readonly user_roles_service: UserRolesService,
		private readonly daily_check_in_service: DailyCheckInService,
		private readonly config_service: ConfigService,
	) {
		super(users_repository);
	}

	async create(create_dto: CreateUserDto): Promise<User> {
		let user_role = await this.user_roles_service.findOneByCondition({
			name: USER_ROLE.USER,
		});
		if (!user_role) {
			user_role = await this.user_roles_service.create({
				name: USER_ROLE.USER,
			});
		}
		const user = await this.users_repository.create({
			...create_dto,
			role: user_role,
		});
		return user;
	}

	async findAll(
		filter?: object,
		options?: object,
	): Promise<FindAllResponse<User>> {
		return await this.users_repository.findAllWithSubFields(filter, {
			...options,
			populate: 'role',
		});
	}

	async getUserByEmail(email: string): Promise<User> {
		try {
			const user = await this.users_repository.findOneByCondition({ email });
			if (!user) {
				throw new NotFoundException();
			}
			return user;
		} catch (error) {
			throw error;
		}
	}

	async getUserWithRole(user_id: string): Promise<User> {
		try {
			return await this.users_repository.getUserWithRole(user_id);
		} catch (error) {
			throw error;
		}
	}

	async setCurrentRefreshToken(
		id: string,
		hashed_token: string,
	): Promise<void> {
		try {
			await this.users_repository.update(id, {
				current_refresh_token: hashed_token,
			});
		} catch (error) {
			throw error;
		}
	}

	async updateDailyCheckIn(
		user: User,
		date_for_testing = new Date(),
	): Promise<User> {
		try {
			// Assume for all reward of this API: corresponding one check-in day will get one point
			const check_in_time =
				this.config_service.get('NODE_ENV') === 'production'
					? new Date()
					: new Date(date_for_testing);
			const { daily_check_in } = user;

			// Case 1
			if (!daily_check_in?.length) {
				// Case 1.1: PASS
				if (isLastDayOfMonth(check_in_time)) {
					const check_in_data = [
						{
							eligible_for_reward: true,
							checked_date: check_in_time.toDateString() as unknown as Date,
						},
					];
					const [updated_user] = await Promise.all([
						this.users_repository.update(user._id.toString(), {
							point: user.point + 1,
							daily_check_in: check_in_data,
							last_check_in: check_in_time,
							last_get_check_in_rewards: check_in_time,
						}),
						this.daily_check_in_service.create({
							user,
							month_year: `${
								check_in_time.getMonth() + 1
							}-${check_in_time.getFullYear()}`,
							check_in_data,
						}),
					]);
					return updated_user;
				}
				// Case 1.2: PASS
				const check_in_data = [
					{
						eligible_for_reward: false,
						checked_date: check_in_time.toDateString() as unknown as Date,
					},
				];
				const [updated_user] = await Promise.all([
					this.users_repository.update(user._id.toString(), {
						daily_check_in: check_in_data,
						last_check_in: check_in_time,
					}),
					this.daily_check_in_service.create({
						user,
						month_year: `${
							check_in_time.getMonth() + 1
						}-${check_in_time.getFullYear()}`,
						check_in_data,
					}),
				]);
				return updated_user;
			} else {
				// Case 2.1: PASS
				if (
					user.last_check_in.toDateString() === check_in_time.toDateString()
				) {
					// Spread operator will lead to error with mongoose document, please careful
					const current_daily_check_in =
						await this.daily_check_in_service.increaseAccessAmount(
							user._id.toString(),
							check_in_time,
						);
					return await this.users_repository.update(user._id.toString(), {
						daily_check_in: current_daily_check_in.check_in_data,
						last_check_in: check_in_time,
					});
				}
				// Case 2.2
				// Case 2.2.1
				if (isLastDayOfMonth(check_in_time)) {
					// Case 2.2.1.1: PASS
					if (
						!user.last_get_check_in_rewards ||
						(isDifferentMonthOrYear(
							user.last_get_check_in_rewards,
							user.last_check_in,
						) &&
							isDifferentMonthOrYear(user.last_check_in, check_in_time))
					) {
						const previous_month_point = user.daily_check_in.length;
						const current_daily_check_in =
							await this.daily_check_in_service.addCheckInData(
								user._id.toString(),
								check_in_time,
							);
						return await this.users_repository.update(user._id.toString(), {
							last_check_in: check_in_time,
							last_get_check_in_rewards: check_in_time,
							daily_check_in: current_daily_check_in.check_in_data,
							point:
								user.point +
								previous_month_point +
								current_daily_check_in.check_in_data.length,
						});
					}
					// Case 2.2.1.2: PASS
					const current_daily_check_in =
						await this.daily_check_in_service.addCheckInData(
							user._id.toString(),
							check_in_time,
						);
					return await this.users_repository.update(user._id.toString(), {
						last_check_in: check_in_time,
						last_get_check_in_rewards: check_in_time,
						daily_check_in: current_daily_check_in.check_in_data,
						point: user.point + current_daily_check_in.check_in_data.length,
					});
				}
				// Case 2.2.2.1: PASS
				if (
					!user.last_get_check_in_rewards ||
					(isDifferentMonthOrYear(
						user.last_get_check_in_rewards,
						user.last_check_in,
					) &&
						isDifferentMonthOrYear(user.last_check_in, check_in_time))
				) {
					const previous_month_point = user.daily_check_in.length;
					const current_daily_check_in =
						await this.daily_check_in_service.addCheckInData(
							user._id.toString(),
							check_in_time,
						);
					return await this.users_repository.update(user._id.toString(), {
						last_check_in: check_in_time,
						last_get_check_in_rewards: check_in_time,
						daily_check_in: current_daily_check_in.check_in_data,
						point: user.point + previous_month_point,
					});
				}
				// Case 2.2.2.2: PASS
				const current_daily_check_in =
					await this.daily_check_in_service.addCheckInData(
						user._id.toString(),
						check_in_time,
					);
				return await this.users_repository.update(user._id.toString(), {
					last_check_in: check_in_time,
					daily_check_in: current_daily_check_in.check_in_data,
				});
			}
		} catch (error) {
			throw error;
		}
	}

	async getCheckInData(
		id: string,
		filter: findAllByPeriodDto,
	): Promise<DailyCheckIn[] | DailyCheckIn> {
		try {
			if (
				filter.type === PERIOD_TYPE.MONTH &&
				(!filter.month || !filter.year)
			) {
				throw new BadRequestException();
			}
			return await this.daily_check_in_service.findAllByPeriod({
				user_id: id,
				...filter,
			});
		} catch (error) {
			throw error;
		}
	}
}
