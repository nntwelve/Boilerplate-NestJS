import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TopicDocument = HydratedDocument<Topic>;

@Schema()
export class Topic extends BaseEntity {
	@Prop({
		unique: true,
		required: true,
	})
	name: string;

	@Prop()
	description: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
