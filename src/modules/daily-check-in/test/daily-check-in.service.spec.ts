import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';

// INNER
import { DailyCheckInRepository } from '@repositories/daily-check-in.repository';
import { DailyCheckInService } from '../daily-check-in.service';
import { DailyCheckInRepositoryInterface } from '../interfaces/daily-check-in.interface';
import { PERIOD_TYPE } from '../dto/get-daily-check-in.dto';

// OUTER
import { createUserStub } from '@modules/users/test/stubs/user.stub';

describe('DailyCheckInService', () => {
	let daily_check_in_service: DailyCheckInService;
	let daily_check_in_repository: DailyCheckInRepository;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				DailyCheckInService,
				{
					provide: 'DailyCheckInRepositoryInterface',
					useValue: createMock<DailyCheckInRepositoryInterface>(),
				},
			],
		})
			// .useMocker(createMock)
			.compile();
		daily_check_in_repository = module_ref.get(
			'DailyCheckInRepositoryInterface',
		);
		daily_check_in_service = module_ref.get(DailyCheckInService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => expect(daily_check_in_service).toBeDefined());

	describe('increaseAccessAmount', () => {
		it('should update check in data by call repository to apply', async () => {
			// Arrange
			const check_in_date = new Date('2023-01-05');
			const user = createUserStub();

			// Act
			await daily_check_in_service.increaseAccessAmount(
				user._id.toString(),
				check_in_date,
			);

			// Assert
			expect(daily_check_in_repository.increaseAccessAmount).toBeCalledWith(
				user._id,
				check_in_date,
			);
		});
	});

	describe('addCheckInData', () => {
		it('should add check in data by call repository to apply', async () => {
			// Arrange
			const check_in_date = new Date('2023-02-28');
			const user = createUserStub();

			// Act
			await daily_check_in_service.addCheckInData(
				user._id.toString(),
				check_in_date,
			);

			// Assert
			expect(daily_check_in_repository.addCheckInData).toBeCalledWith(
				user._id,
				check_in_date,
			);
		});
	});

	describe('findAllByPeriod', () => {
		it('should get check in data by call to repository', async () => {
			// Arrange
			const filter = {
				year: '2023',
				type: PERIOD_TYPE.YEAR,
			};
			const user = createUserStub();

			// Act
			await daily_check_in_service.findAllByPeriod({
				user_id: user._id.toString(),
				...filter,
			});

			// Assert
			expect(daily_check_in_repository.findAllByPeriod).toBeCalledWith({
				user_id: user._id,
				...filter,
			});
		});
	});
});
