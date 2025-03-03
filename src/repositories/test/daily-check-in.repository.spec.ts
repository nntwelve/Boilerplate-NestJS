import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

// INNER
import {
	DailyCheckIn,
	DailyCheckInDocument,
} from '@modules/daily-check-in/entities/daily-check-in.entity';
import { DailyCheckInEntity } from './supports/daily-check-in.entity';
import { DailyCheckInRepository } from '@repositories/daily-check-in.repository';

// OUTER
import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { PERIOD_TYPE } from '@modules/daily-check-in/dto/get-daily-check-in.dto';

describe('DailyCheckInRepository', () => {
	let daily_check_in_model: Model<DailyCheckInDocument>;
	let daily_check_in_repository: DailyCheckInRepository;

	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				DailyCheckInRepository,
				{
					provide: getModelToken(DailyCheckIn.name),
					useClass: DailyCheckInEntity,
				},
			],
		}).compile();
		daily_check_in_repository = module_ref.get(DailyCheckInRepository);
		daily_check_in_model = module_ref.get(getModelToken(DailyCheckIn.name));
	});

	afterEach(() => jest.clearAllMocks());

	describe('increaseAccessAmount', () => {
		it('should be call to model to increase access amount of given date', async () => {
			// Arrange
			const user = createUserStub();
			const check_in_date = new Date('2023-01-05');
			jest.spyOn(daily_check_in_model, 'findOneAndUpdate');
			// Act
			await daily_check_in_repository.increaseAccessAmount(
				user._id.toString(),
				check_in_date,
			);

			// Assert
			expect(daily_check_in_model.findOneAndUpdate).toBeCalledWith(
				{
					user: user._id,
					'check_in_data.checked_date': check_in_date.toDateString(),
				},
				{
					$inc: {
						'check_in_data.$.access_amount': 1,
					},
				},
				{
					new: true,
				},
			);
		});
	});

	describe('addCheckInData', () => {
		it('should be call to model to add check in data for given date', async () => {
			// Arrange
			const user = createUserStub();
			const check_in_date = new Date('2023-02-28');
			jest.spyOn(daily_check_in_model, 'findOneAndUpdate');

			// Act
			await daily_check_in_repository.addCheckInData(
				user._id.toString(),
				check_in_date,
			);

			// Assert
			expect(daily_check_in_model.findOneAndUpdate).toBeCalledWith(
				{
					user: user._id,
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
				},
				{
					$push: {
						check_in_data: {
							eligible_for_reward: true,
							checked_date: check_in_date.toDateString(),
							reward_days_count: 1,
						},
					},
				},
				{
					new: true,
					upsert: true,
				},
			);
		});
	});

	describe('findAllByPeriod', () => {
		describe('Year', () => {
			it('should be call to model to return entire check in data of given year', async () => {
				// Arrange
				const filter = {
					year: '2023',
					type: PERIOD_TYPE.YEAR,
					user_id: createUserStub()._id as string,
				};
				jest.spyOn(daily_check_in_model, 'find');
				// Act
				await daily_check_in_repository.findAllByPeriod(filter);

				// Assert
				expect(daily_check_in_model.find).toBeCalledWith({
					user: filter.user_id,
					month_year: {
						$regex: filter.year,
						$options: 'i',
					},
				});
			});
		});
		describe('Month', () => {
			it('should be call to model to return check in data of given month', async () => {
				// Arrange
				const filter = {
					month: '7',
					year: '2023',
					type: PERIOD_TYPE.MONTH,
					user_id: createUserStub()._id as string,
				};
				jest.spyOn(daily_check_in_model, 'findOne');
				// Act
				await daily_check_in_repository.findAllByPeriod(filter);

				// Assert
				expect(daily_check_in_model.findOne).toBeCalledWith({
					user: filter.user_id,
					month_year: `${+filter.month}-${filter.year}`,
				});
			});
		});
	});
});
