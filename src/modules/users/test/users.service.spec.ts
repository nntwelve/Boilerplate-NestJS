import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';

// INNER
import { UsersService } from '../users.service';
import { UsersRepositoryInterface } from '../interfaces/users.interface';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '../entities/user.entity';
import { createUserStub } from './stubs/user.stub';

// OUTER
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { DailyCheckInService } from '@modules/daily-check-in/daily-check-in.service';
import { DailyCheckIn } from '@modules/daily-check-in/entities/daily-check-in.entity';
import { CheckInData } from '@modules/daily-check-in/entities/check-in-data.entity';
import { PERIOD_TYPE } from '@modules/daily-check-in/dto/get-daily-check-in.dto';
import { BadRequestException } from '@nestjs/common';

jest.mock('../../user-roles/user-roles.service.ts');
describe('UserService', () => {
	let users_service: UsersService;
	let users_repository: UsersRepository;
	let daily_check_in_service: DailyCheckInService;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				UsersService,
				UserRolesService,
				{
					provide: 'UsersRepositoryInterface',
					useValue: createMock<UsersRepositoryInterface>(),
				},
				{
					provide: ConfigService,
					useValue: createMock<ConfigService>(),
				},
				{
					provide: DailyCheckInService,
					useValue: createMock<DailyCheckInService>(),
				},
			],
		})
			// .useMocker(createMock)
			.compile();
		users_service = module_ref.get(UsersService);
		users_repository = module_ref.get('UsersRepositoryInterface');
		daily_check_in_service = module_ref.get(DailyCheckInService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(users_service).toBeDefined();
	});
	describe('Daily Check-in', () => {
		describe('Case 1: User never check-in before', () => {
			it('should receive reward if it is the last day of month (case 1.1)', async () => {
				// Arrange
				const user = createUserStub();
				const check_in_date = new Date('2023-01-31 11:11:11');
				const check_in_data = [
					{
						eligible_for_reward: true,
						checked_date: check_in_date.toDateString(),
					},
				];

				// Act
				await users_service.updateDailyCheckIn(user, check_in_date);

				// Assert
				expect(daily_check_in_service.create).toBeCalledWith({
					user,
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
					check_in_data,
				});
				expect(users_repository.update).toBeCalledWith(user._id, {
					point: user.point + 1,
					last_check_in: check_in_date,
					last_get_check_in_rewards: check_in_date,
					daily_check_in: check_in_data,
				});
			});
			it('it should create check-in date record if it is not the last day of month (case 1.2)', async () => {
				// Arrange
				const check_in_date = new Date('2023-01-15 12:12:12');
				const user = createUserStub();
				const check_in_data = [
					{
						eligible_for_reward: false,
						checked_date: check_in_date.toDateString(),
					},
				];

				// Act
				await users_service.updateDailyCheckIn(user, check_in_date);

				// Assert
				expect(users_repository.update).toBeCalledWith(user._id, {
					last_check_in: check_in_date,
					daily_check_in: check_in_data,
				});
				expect(daily_check_in_service.create).toBeCalledWith({
					user,
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
					check_in_data,
				});
			});
		});

		describe('Case 2: User has checked in before', () => {
			it('should increase amount access time and last check-in if the day to check-in has already checked in  (case 2.1)', async () => {
				// Arrange
				const user = {
					...createUserStub(),
					daily_check_in: [
						{
							checked_date: new Date('2023-01-31'),
							eligible_for_reward: true,
							access_amount: 1,
						},
					],
					last_check_in: new Date('2023-01-31 07:00:00'),
				} as unknown as User;
				const daily_check_in = {
					user,
					month_year: `1-2023`,
					check_in_data: [
						{
							eligible_for_reward: true,
							access_amount: 2,
							reward_days_count: 2,
							checked_date: new Date('2023-01-31'),
						},
					],
				} as DailyCheckIn;
				const check_in_date = new Date('2023-01-31 15:00:00');
				jest
					.spyOn(daily_check_in_service, 'increaseAccessAmount')
					.mockResolvedValueOnce(daily_check_in);

				// Act
				await users_service.updateDailyCheckIn(user, check_in_date);

				// Assert
				expect(daily_check_in_service.increaseAccessAmount).toBeCalledWith(
					user._id,
					check_in_date,
				);
				expect(users_repository.update).toBeCalledWith(user._id, {
					daily_check_in: daily_check_in.check_in_data,
					last_check_in: check_in_date,
				});
			});
			describe('Case 2.2: The day to check-in has not checked in yet', () => {
				describe('Case 2.2.1: The day to check-in is the last day of month', () => {
					it('should receive reward for both months if the previous month has not got reward yet (case 2.2.1.1)', async () => {
						// Arrange
						const previous_month_check_in_data: CheckInData[] = [
							{
								checked_date: new Date('2023-01-10'),
								eligible_for_reward: false,
								access_amount: 1,
								reward_days_count: 1,
							},
						];

						const user = {
							...createUserStub(),
							daily_check_in: previous_month_check_in_data,
							last_check_in: new Date('2023-01-10 07:00:00'),
							last_get_check_in_rewards: new Date('2022-12-31 09:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-28 15:00:00');
						const check_in_data = [
							{
								checked_date: check_in_date,
								eligible_for_reward: true,
								access_amount: 1,
								reward_days_count: 1,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: `2-2023`,
								check_in_data,
							});

						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(daily_check_in_service.addCheckInData).toBeCalledWith(
							user._id,
							check_in_date,
						);
						expect(users_repository.update).toBeCalledWith(
							user._id.toString(),
							{
								last_check_in: check_in_date,
								last_get_check_in_rewards: check_in_date,
								point: user.point + user.daily_check_in.length + 1,
								daily_check_in: check_in_data,
							},
						);
					});
					it('should get reward for the current check-in month if the previous month has already received the reward (case 2.2.1.2 example 1)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-31'),
									eligible_for_reward: true,
									access_amount: 2,
									reward_days_count: 1,
								},
							],
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-01-31:13:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-28:15:00:00');
						const check_in_data = [
							{
								checked_date: check_in_date,
								eligible_for_reward: true,
								access_amount: 1,
								reward_days_count: 1,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: `2-2023`,
								check_in_data,
							});

						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(daily_check_in_service.addCheckInData).toBeCalledWith(
							user._id,
							check_in_date,
						);
						expect(users_repository.update).toBeCalledWith(user._id, {
							point: user.point + 1,
							daily_check_in: check_in_data,
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
						});
					});
					it('should get reward for the current check-in month if the previous month has already received the reward (case 2.2.1.2 example 2)', async () => {
						// Arrange
						const current_month_check_in_data = [
							{
								checked_date: new Date('2023-02-01'),
								eligible_for_reward: false,
								access_amount: 2,
								reward_days_count: 1,
							},
						];
						const user = {
							...createUserStub(),
							daily_check_in: current_month_check_in_data,
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-02-01:13:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-28:15:11:00');
						const check_in_data = [
							...current_month_check_in_data,
							{
								checked_date: check_in_date,
								eligible_for_reward: true,
								access_amount: 1,
								reward_days_count: 2,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: `2-2023`,
								check_in_data,
							});

						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: check_in_data,
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
							point: user.point + 2,
						});
					});
				});
				describe('Case 2.2.2: The day to check-in is not the last day of month', () => {
					it('should get reward for the previous checked month if the previous month has not got the reward (case 2.2.2.1)', async () => {
						// Arrange
						const previous_month_check_in_data = [
							{
								checked_date: new Date('2023-01-22'),
								eligible_for_reward: false,
								access_amount: 2,
								reward_days_count: 1,
							},
						];
						const user = {
							...createUserStub(),
							daily_check_in: previous_month_check_in_data,
							last_get_check_in_rewards: new Date('2022-12-31:07:00:00'),
							last_check_in: new Date('2023-01-22:13:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-11:15:00:00');
						const check_in_data = [
							{
								checked_date: check_in_date,
								eligible_for_reward: false,
								access_amount: 1,
								reward_days_count: 1,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: '2-2023',
								check_in_data,
							});

						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(daily_check_in_service.addCheckInData).toBeCalledWith(
							user._id,
							check_in_date,
						);
						expect(users_repository.update).toBeCalledWith(user._id, {
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
							daily_check_in: check_in_data,
							point: user.point + 1,
						});
					});
					it('should create new check-in and does not receive anything (case 2.2.2.2 example 1)', async () => {
						// Arrange
						const previous_month_check_in_data = [
							{
								checked_date: new Date('2023-01-31'),
								eligible_for_reward: true,
								access_amount: 2,
								reward_days_count: 1,
							},
						];
						const user = {
							...createUserStub(),
							daily_check_in: previous_month_check_in_data,
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-01-31:13:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-11:15:00:00');
						const check_in_data = [
							{
								checked_date: check_in_date,
								eligible_for_reward: false,
								access_amount: 1,
								reward_days_count: 1,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: '2-2023',
								check_in_data,
							});

						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(daily_check_in_service.addCheckInData).toBeCalledWith(
							user._id,
							check_in_date,
						);
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: check_in_data,
							last_check_in: check_in_date,
						});
					});

					it('should create new check-in and does not receive anything (case 2.2.2.2 example 2)', async () => {
						// Arrange
						const current_month_check_in_data = [
							{
								checked_date: new Date('2023-02-01'),
								eligible_for_reward: false,
								access_amount: 2,
								reward_days_count: 1,
							},
						];
						const user = {
							...createUserStub(),
							daily_check_in: current_month_check_in_data,
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-02-01:13:00:00'),
						} as unknown as User;
						const check_in_date = new Date('2023-02-11:15:00:00');
						const check_in_data = [
							...current_month_check_in_data,
							{
								checked_date: check_in_date,
								eligible_for_reward: false,
								access_amount: 1,
								reward_days_count: 2,
							},
						];
						jest
							.spyOn(daily_check_in_service, 'addCheckInData')
							.mockResolvedValueOnce({
								user,
								month_year: '2-2023',
								check_in_data,
							});
						// Act
						await users_service.updateDailyCheckIn(user, check_in_date);

						// Assert
						expect(daily_check_in_service.addCheckInData).toBeCalledWith(
							user._id,
							check_in_date,
						);
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: check_in_data,
							last_check_in: check_in_date,
						});
					});
				});
			});
		});
	});

	describe('Get check-in data by', () => {
		it('should return check-in data base on given filter', async () => {
			// Arrange
			const user = createUserStub();
			const check_in_data = [
				{
					_id: '64b17877dae2badc43e47366',
					user: user._id,
					month_year: '5-2023',
					check_in_data: [
						{
							checked_date: new Date('2023-05-20'),
							access_amount: 4,
							eligible_for_reward: false,
							reward_days_count: 1,
							_id: '64b17877dae2badc43e47367',
						},
					],
				},
				{
					_id: '64b17877dae2badc43e47369',
					user: user._id,
					month_year: '6-2023',
					check_in_data: [
						{
							checked_date: new Date('2023-06-07'),
							access_amount: 2,
							eligible_for_reward: false,
							reward_days_count: 1,
							_id: '64b17877dae2badc43e47370',
						},
						{
							checked_date: new Date('2023-06-14'),
							access_amount: 2,
							eligible_for_reward: false,
							reward_days_count: 2,
							_id: '64b17877dae2badc43e47371',
						},
					],
				},
			];
			(
				daily_check_in_service.findAllByPeriod as jest.Mock
			).mockResolvedValueOnce({
				count: check_in_data.length,
				items: check_in_data,
			});

			// Act
			const result = await users_service.getCheckInData(user._id.toString(), {
				type: PERIOD_TYPE.YEAR,
				year: '2023',
			});

			// Assert
			expect(daily_check_in_service.findAllByPeriod).toBeCalledWith({
				user_id: user._id,
				year: '2023',
				type: PERIOD_TYPE.YEAR,
			});
			expect(result).toEqual({
				count: check_in_data.length,
				items: check_in_data,
			});
		});
		it('should throw error if type month but month does not given', async () => {
			// Arrange
			const user = createUserStub();
			const filter = {
				type: PERIOD_TYPE.MONTH,
				year: '2023',
			};
			// Act & Assert
			await expect(
				users_service.getCheckInData(user._id.toString(), filter),
			).rejects.toThrow(BadRequestException);
		});
	});
});
