import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CheckInData {
	@Prop({
		default: new Date(),
		required: true,
	})
	checked_date?: Date; // Ngày check in

	@Prop({
		min: 1,
		required: true,
		default: 1,
	})
	access_amount?: number; // Số lượng truy cập trong ngày

	@Prop({
		required: true,
	})
	eligible_for_reward: boolean; // Nếu là true thì là ngày nhận thưởng

	@Prop({
		min: 1,
		required: true,
		default: 1,
	})
	reward_days_count?: number; // Số ngày đã check, dùng để tính phần thưởng
}

export const CheckInDataSchema = SchemaFactory.createForClass(CheckInData);
