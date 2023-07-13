import { BaseEntity } from '@modules/shared/base/base.entity';
import { Topic } from '@modules/topics/entities/topic.entity';
import { User } from '@modules/users/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type FlashCardDocument = mongoose.HydratedDocument<FlashCard>;
@Schema({
	collection: 'flash-cards',
})
export class FlashCard extends BaseEntity {
	@Prop({ required: true })
	vocabulary: string;

	@Prop()
	image: string;

	@Prop({ required: true })
	definition: string;

	@Prop({ required: true })
	meaning: string;

	@Prop()
	pronunciation?: string;

	@Prop({ default: [], type: [String] })
	examples: string[];

	@Prop({ default: false })
	is_public: boolean;

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
	user: User;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }] })
	topics: Topic[];
}

const schema = SchemaFactory.createForClass(FlashCard);

// This will take no effect
// schema.index({ _id: 1, vocabulary: 1 }, { unique: true });

// This will work
schema.index({ vocabulary: 1, _id: 1 });

export const FlashCardSchema = schema;
