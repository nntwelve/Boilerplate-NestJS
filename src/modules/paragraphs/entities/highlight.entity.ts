import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';
import { User } from '@modules/users/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type HighLightDocument = mongoose.HydratedDocument<HighLight>;

export enum HIGHLIGHT_TYPE {
	NEW_VOCABULARY = 'new_vocabulary',
	NEW_SENTENCE = 'new_sentence',
	NEED_HIGHLIGHT = 'need_highlight',
}
@Schema()
export class HighLight {
	@Prop({ required: true })
	content: string;

	@Prop()
	sound?: string;

	@Prop()
	pronunciation?: string;

	@Prop({ required: true })
	meaning: string;

	@Prop({ default: HIGHLIGHT_TYPE.NEW_VOCABULARY })
	type: HIGHLIGHT_TYPE;

	@Prop()
	example?: string;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: User.name,
		required: true,
	})
	created_by: User;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: FlashCard.name,
		required: false,
	})
	flash_card?: FlashCard;
}

export const HighLightSchema = SchemaFactory.createForClass(HighLight);
