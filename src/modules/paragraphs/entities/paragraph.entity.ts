import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Type } from 'class-transformer';

// INNER
import { Sentence, SentenceSchema } from './sentence.entity';
import { HighLight, HighLightSchema } from './highlight.entity';

// OUTER
import { Collection } from '@modules/collections/entities/collection.entity';
import { BaseEntity } from '@modules/shared/base/base.entity';
import { Topic } from '@modules/topics/entities/topic.entity';
import { User } from '@modules/users/entities/user.entity';

export type ParagraphDocument = mongoose.HydratedDocument<Paragraph>;

@Schema({
	collection: 'paragraph',
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class Paragraph extends BaseEntity {
	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	content: string;

	@Prop()
	image: string;

	@Prop()
	sound: string;

	@Prop({ required: true })
	meaning: string;

	@Prop()
	pronunciation?: string;

	@Prop({ type: [{ type: SentenceSchema }] })
	@Type(() => Sentence)
	sentences: Sentence[];

	@Prop({ type: [{ type: HighLightSchema }] })
	@Type(() => HighLight)
	highlight: HighLight[];

	@Prop({ default: false })
	is_public: boolean;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: User.name,
		required: true,
	})
	user: User;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Topic.name }] })
	topics?: Topic[];

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: Collection.name,
	})
	collections?: Collection;
}

const schema = SchemaFactory.createForClass(Paragraph);

export const ParagraphSchema = schema;
