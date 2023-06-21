import { Module } from '@nestjs/common';
import { DailyCheckInService } from './daily-check-in.service';
import { DailyCheckInRepository } from '@repositories/daily-check-in.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
	DailyCheckIn,
	DailyCheckInSchema,
} from './entities/daily-check-in.entity';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: DailyCheckIn.name, schema: DailyCheckInSchema },
		]),
	],
	providers: [
		DailyCheckInService,
		{
			provide: 'DailyCheckInRepositoryInterface',
			useClass: DailyCheckInRepository,
		},
	],
	exports: [DailyCheckInService],
})
export class DailyCheckInModule {}
