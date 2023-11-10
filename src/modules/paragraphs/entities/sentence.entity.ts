import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { BaseEntity } from '@modules/shared/base/base.entity';

export type SentenceDocument = mongoose.HydratedDocument<Sentence>;

@Schema({
	collection: 'sentence',
})
export class Sentence extends BaseEntity {
	@Prop({ required: true })
	content: string;

	@Prop()
	sound: string;

	@Prop({ required: true })
	meaning: string;

	@Prop()
	pronunciation?: string;
}

export const SentenceSchema = SchemaFactory.createForClass(Sentence);
