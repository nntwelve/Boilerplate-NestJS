import { MockEntity } from '@repositories/test/supports/mock.entity';
import { DailyCheckIn } from '@modules/daily-check-in/entities/daily-check-in.entity';
import { createDailyCheckInStub } from '@modules/daily-check-in/test/stubs/daily-check-in.stub';

export class DailyCheckInEntity extends MockEntity<DailyCheckIn> {
	protected entity_stub = createDailyCheckInStub();
}
