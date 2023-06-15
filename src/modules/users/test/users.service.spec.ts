import { Test } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { createMock } from '@golevelup/ts-jest';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { UsersRepositoryInterface } from '../interfaces/users.interface';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '../entities/user.entity';
import { createUserStub } from './stubs/user.stub';

jest.mock('../../user-roles/user-roles.service.ts');
describe('UserService', () => {
	let users_service: UsersService;
	let users_repository: UsersRepository;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				UsersService,
				UserRolesService,
				{
					provide: 'UsersRepositoryInterface',
					useValue: createMock<UsersRepositoryInterface>(),
				},
			],
		}).compile();
		users_service = module_ref.get(UsersService);
		users_repository = module_ref.get('UsersRepositoryInterface');
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
				const testing_date = '2023-01-31';
				const check_in_time = new Date(testing_date);

				// Act
				await users_service.updateDailyCheckIn(user, testing_date);
				// Assert
				expect(users_repository.update).toBeCalledWith(user._id, {
					point: user.point + 1,
					last_check_in: check_in_time,
					last_get_check_in_rewards: check_in_time,
					daily_check_in: [
						{
							eligible_for_reward: true,
							checked_date: check_in_time,
						},
					],
				});
			});
			it('it should create check-in date record if it is not the last day of month (case 1.2)', async () => {
				// Arrange
				const testing_date = '2023-01-15:12:12:12';
				const check_in_time = new Date(testing_date);
				const user = createUserStub();

				// Act
				await users_service.updateDailyCheckIn(user, testing_date);

				// Assert
				expect(users_repository.update).toBeCalledWith(user._id, {
					last_check_in: check_in_time,
					daily_check_in: [
						{
							eligible_for_reward: false,
							checked_date: check_in_time,
						},
					],
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
					last_check_in: new Date('2023-01-31:07:00:00'),
				} as unknown as User;
				const testing_date = '2023-01-31:15:00:00';
				const check_in_date = new Date(testing_date);

				// Act
				await users_service.updateDailyCheckIn(user, testing_date);

				// Assert
				expect(users_repository.update).toBeCalledWith(user._id, {
					daily_check_in: [
						{
							...user.daily_check_in[0],
							access_amount: user.daily_check_in[0].access_amount + 1,
						},
					],
					last_check_in: check_in_date,
				});
			});
			describe('Case 2.2: The day to check-in has not checked in yet', () => {
				describe('Case 2.2.1: The day to check-in is the last day of month', () => {
					it('should receive reward for both of month if the month before has not got reward (case 2.2.1.1)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-10'),
									eligible_for_reward: false,
									access_amount: 1,
									reward_days_count: 1,
								},
								{
									checked_date: new Date('2023-01-15'),
									eligible_for_reward: false,
									access_amount: 1,
									reward_days_count: 2,
								},
							],
							last_check_in: new Date('2023-01-15:07:00:00'),
							last_get_check_in_rewards: new Date('2022-12-31:09:00:00'),
						} as unknown as User;
						const testing_date = '2023-02-28:15:00:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Assert
						expect(users_repository.update).toBeCalledWith(
							user._id.toString(),
							{
								last_check_in: check_in_date,
								last_get_check_in_rewards: check_in_date,
								point: user.point + 3,
								daily_check_in: [
									...user.daily_check_in,
									{
										checked_date: check_in_date,
										eligible_for_reward: true,
									},
								],
							},
						);
					});
					it('should receive reward for current check-in month if the month before has got the reward already (case 2.2.1.2 example 1)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-15'),
									eligible_for_reward: false,
									access_amount: 1,
									reward_days_count: 1,
								},
								{
									checked_date: new Date('2023-01-31'),
									eligible_for_reward: true,
									access_amount: 2,
									reward_days_count: 2,
								},
							],
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-01-31:13:00:00'),
						} as unknown as User;
						const testing_date = '2023-02-28:15:00:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Assert
						expect(users_repository.update).toBeCalledWith(user._id, {
							point: user.point + 1,
							daily_check_in: [
								...user.daily_check_in,
								{
									checked_date: check_in_date,
									eligible_for_reward: true,
								},
							],
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
						});
					});
					it('should receive reward for current check-in month if the month before has got the reward already (case 2.2.1.2 example 2)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-31'),
									eligible_for_reward: true,
									access_amount: 1,
									reward_days_count: 1,
								},
								{
									checked_date: new Date('2023-02-01'),
									eligible_for_reward: false,
									access_amount: 2,
									reward_days_count: 1,
								},
							],
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-02-01:13:00:00'),
						} as unknown as User;
						const testing_date = '2023-02-28:15:11:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Arrange
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: [
								...user.daily_check_in,
								{
									checked_date: check_in_date,
									eligible_for_reward: true,
								},
							],
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
							point: user.point + 2,
						});
					});
				});
				describe('Case 2.2.2: The day to check-in is not the last day of month', () => {
					it('should receive reward for previous checked month if the month before has not got the reward (case 2.2.2.1)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-15'),
									eligible_for_reward: false,
									access_amount: 1,
									reward_days_count: 1,
								},
								{
									checked_date: new Date('2023-01-22'),
									eligible_for_reward: false,
									access_amount: 2,
									reward_days_count: 2,
								},
							],
							last_get_check_in_rewards: new Date('2022-12-31:07:00:00'),
							last_check_in: new Date('2023-01-22:13:00:00'),
						} as unknown as User;
						const testing_date = '2023-02-11:15:00:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Assert
						expect(users_repository.update).toBeCalledWith(user._id, {
							last_check_in: check_in_date,
							last_get_check_in_rewards: check_in_date,
							daily_check_in: [
								...user.daily_check_in,
								{
									checked_date: check_in_date,
									eligible_for_reward: false,
								},
							],
							point: user.point + 2,
						});
					});
					it('should create new check-in and does not receive anything (case 2.2.2.2 example 1)', async () => {
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
						const testing_date = '2023-02-11:15:00:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Arrange
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: [
								...user.daily_check_in,
								{
									checked_date: check_in_date,
									eligible_for_reward: false,
								},
							],
							last_check_in: check_in_date,
						});
					});

					it('should create new check-in and does not receive anything (case 2.2.2.2 example 2)', async () => {
						// Arrange
						const user = {
							...createUserStub(),
							daily_check_in: [
								{
									checked_date: new Date('2023-01-31'),
									eligible_for_reward: true,
									access_amount: 1,
									reward_days_count: 1,
								},
								{
									checked_date: new Date('2023-02-01'),
									eligible_for_reward: false,
									access_amount: 2,
									reward_days_count: 1,
								},
							],
							last_get_check_in_rewards: new Date('2023-01-31:07:00:00'),
							last_check_in: new Date('2023-02-01:13:00:00'),
						} as unknown as User;
						const testing_date = '2023-02-11:15:00:00';
						const check_in_date = new Date(testing_date);

						// Act
						await users_service.updateDailyCheckIn(user, testing_date);

						// Arrange
						expect(users_repository.update).toBeCalledWith(user._id, {
							daily_check_in: [
								...user.daily_check_in,
								{
									checked_date: check_in_date,
									eligible_for_reward: false,
								},
							],
							last_check_in: check_in_date,
						});
					});
				});
			});
		});
	});
});
