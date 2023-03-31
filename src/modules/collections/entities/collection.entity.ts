import { BaseEntity } from '@modules/shared/base/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export enum COLLECTION_LEVEL {
	EASY = 'easy',
	MEDIUM = 'medium',
	HARD = 'hard',
	CHAOS = 'chaos',
}
@Schema()
export class Collection extends BaseEntity {
	@Prop({ required: true })
	name: string;

	@Prop()
	description: string;

	@Prop({ default: COLLECTION_LEVEL.EASY, enum: COLLECTION_LEVEL })
	level: COLLECTION_LEVEL;

	@Prop()
	order: number;

	@Prop()
	image: string;

	@Prop({ default: 0, min: 0 })
	total_flash_cards: number;

	@Prop({ default: false })
	is_public: boolean;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
	user: User;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
