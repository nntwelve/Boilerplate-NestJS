import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { User } from './entities/user.entity';
import { UsersRepositoryInterface } from './interfaces/users.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { FindAllResponse } from 'src/types/common.type';
import { isLastDayOfMonth } from 'src/shared/helpers/date.helper';

@Injectable()
export class UsersService extends BaseServiceAbstract<User> {
	constructor(
		@Inject('UsersRepositoryInterface')
		private readonly users_repository: UsersRepositoryInterface,
		private readonly user_roles_service: UserRolesService,
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
		date_for_testing: string,
	): Promise<User> {
		try {
			// Assume for all reward of this API: corresponding one check-in day will get one point
			const check_in_time = date_for_testing
				? new Date(date_for_testing)
				: new Date();
			const { daily_check_in } = user;
			// TH1
			if (!daily_check_in?.length) {
				// TH1.1:
				if (isLastDayOfMonth(check_in_time)) {
					return await this.users_repository.update(user._id.toString(), {
						point: user.point + 1,
						daily_check_in: [
							{ eligible_for_reward: true, checked_date: check_in_time },
						],
						last_check_in: check_in_time,
						last_get_check_in_rewards: check_in_time,
					});
				}
				// TH1.2:
				return await this.users_repository.update(user._id.toString(), {
					daily_check_in: [
						{ eligible_for_reward: false, checked_date: check_in_time },
					],
					last_check_in: check_in_time,
				});
			} else {
				const already_check_in_index = daily_check_in.findIndex(
					(check_in_data) =>
						check_in_data.checked_date.toDateString() ===
						check_in_time.toDateString(),
				);
				// TH2.1:
				if (already_check_in_index !== -1) {
					return await this.users_repository.update(user._id.toString(), {
						daily_check_in: [
							...daily_check_in.slice(0, already_check_in_index),
							{
								...user.daily_check_in[already_check_in_index],
								access_amount:
									daily_check_in[already_check_in_index].access_amount + 1,
							},
							...daily_check_in.slice(already_check_in_index + 1),
						],
						last_check_in: check_in_time,
					});
				}
				// TH 2.2
				// TH 2.2.1
				if (isLastDayOfMonth(check_in_time)) {
					//TH 2.2.1.1
					if (
						(user.last_get_check_in_rewards.getMonth() !==
							user.last_check_in.getMonth() ||
							user.last_get_check_in_rewards.getFullYear() !==
								user.last_check_in.getFullYear()) &&
						(user.last_check_in.getFullYear() !== check_in_time.getFullYear() ||
							user.last_check_in.getMonth() !== check_in_time.getMonth())
					) {
						const { previous_month_data, current_month_data } =
							daily_check_in.reduce(
								(result, check_in_data) => {
									if (
										check_in_data.checked_date.getFullYear() ===
											user.last_check_in.getFullYear() &&
										check_in_data.checked_date.getMonth() ===
											user.last_check_in.getMonth()
									) {
										return {
											...result,
											previous_month_data: [
												...result.previous_month_data,
												check_in_data,
											],
										};
									}
									if (
										check_in_data.checked_date.getFullYear() ===
											check_in_time.getFullYear() &&
										check_in_data.checked_date.getMonth() ===
											check_in_time.getMonth()
									) {
										return {
											...result,
											current_month_data: [
												...result.current_month_data,
												check_in_data,
											],
										};
									}
								},
								{
									previous_month_data: [],
									current_month_data: [],
								},
							);
						const previous_month_point = previous_month_data.length;
						const current_month_point = current_month_data.length + 1; // One more point for the day has just checked-in
						return await this.users_repository.update(user._id.toString(), {
							last_check_in: check_in_time,
							last_get_check_in_rewards: check_in_time,
							daily_check_in: [
								...daily_check_in,
								{
									eligible_for_reward: true,
									checked_date: check_in_time,
								},
							],
							point: user.point + previous_month_point + current_month_point,
						});
					}
					// TH 2.2.1.2
					const current_month_point =
						1 +
						daily_check_in.filter(
							(check_in_data) =>
								check_in_data.checked_date.getFullYear() ===
									check_in_time.getFullYear() &&
								check_in_data.checked_date.getMonth() ===
									check_in_time.getMonth(),
						).length;
					return await this.users_repository.update(user._id.toString(), {
						last_check_in: check_in_time,
						last_get_check_in_rewards: check_in_time,
						daily_check_in: [
							...daily_check_in,
							{
								eligible_for_reward: true,
								checked_date: check_in_time,
							},
						],
						point: user.point + current_month_point,
					});
				}
				// TH 2.2.2.1
				if (
					(user.last_get_check_in_rewards.getMonth() !==
						user.last_check_in.getMonth() ||
						user.last_get_check_in_rewards.getFullYear() !==
							user.last_check_in.getFullYear()) &&
					(user.last_check_in.getFullYear() !== check_in_time.getFullYear() ||
						user.last_check_in.getMonth() !== check_in_time.getMonth())
				) {
					const previous_month_point =
						daily_check_in.filter(
							(check_in_data) =>
								check_in_data.checked_date.getFullYear() ===
									user.last_check_in.getFullYear() &&
								check_in_data.checked_date.getMonth() ===
									user.last_check_in.getMonth(),
						) || [];
					return await this.users_repository.update(user._id.toString(), {
						last_check_in: check_in_time,
						last_get_check_in_rewards: check_in_time,
						daily_check_in: [
							...daily_check_in,
							{
								eligible_for_reward: false,
								checked_date: check_in_time,
							},
						],
						point: user.point + previous_month_point.length,
					});
				}
				// TH 2.2.2.2
				return await this.users_repository.update(user._id.toString(), {
					last_check_in: check_in_time,
					daily_check_in: [
						...daily_check_in,
						{
							eligible_for_reward: false,
							checked_date: check_in_time,
						},
					],
				});
			}
		} catch (error) {
			throw error;
		}
	}
}
