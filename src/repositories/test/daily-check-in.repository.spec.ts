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
					month_year: `${
						check_in_date.getMonth() + 1
					}-${check_in_date.getFullYear()}`,
					'check_in_data.checked_date': check_in_date,
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
							checked_date: check_in_date,
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
});
