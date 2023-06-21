import { User } from '@modules/users/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { CheckInData, CheckInDataSchema } from './check-in-data.entity';
import { BaseEntity } from '@modules/shared/base/base.entity';

export type DailyCheckInDocument = HydratedDocument<DailyCheckIn>;
@Schema({
	collection: 'daily-check-in',
})
export class DailyCheckIn extends BaseEntity {
	@Prop({
		required: true,
		ref: User.name,
		type: mongoose.Schema.Types.ObjectId,
	})
	user: User | ObjectId | string;

	@Prop({
		required: true,
	})
	month_year?: string;

	@Prop({
		type: [CheckInDataSchema],
		required: true,
	})
	check_in_data: CheckInData[];
}

export const DailyCheckInSchema = SchemaFactory.createForClass(DailyCheckIn);
