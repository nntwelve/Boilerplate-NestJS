import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// OUTER
import { BaseEntity } from '@modules/shared/base/base.entity';
import { Collection } from '@modules/collections/entities/collection.entity';
import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';
import { User } from '@modules/users/entities/user.entity';
import { NextFunction } from 'express';

export enum COMMENT_TYPE {
	FLASH_CARD = 'FLASH_CARD',
	COLLECTION = 'COLLECTION',
}

export type CommentDocument = mongoose.HydratedDocument<Comment>;
@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
	collection: 'comments',
})
export class Comment extends BaseEntity {
	@Prop({
		type: mongoose.Types.ObjectId,
		required: true,
	})
	target_id: mongoose.Types.ObjectId | FlashCard | Collection;

	@Prop({
		enum: COMMENT_TYPE,
		required: true,
	})
	comment_type: COMMENT_TYPE;

	@Prop({
		required: true,
	})
	content: string;

	@Prop({
		type: mongoose.Types.ObjectId,
		ref: Comment.name,
	})
	parent_id: mongoose.Types.ObjectId | Comment;

	@Prop({
		type: [{ type: mongoose.Types.ObjectId, ref: Comment.name }],
	})
	children_ids: Array<mongoose.Types.ObjectId> | Array<Comment>;

	@Prop({ default: 0 })
	total_liked: number;

	@Prop({
		type: mongoose.Types.ObjectId,
		required: true,
	})
	created_by: mongoose.Types.ObjectId | User;
}

const schema = SchemaFactory.createForClass(Comment);

schema.pre('save', function (next: NextFunction) {
	if (this.parent_id) {
		this.parent_id = new mongoose.Types.ObjectId(
			this.parent_id as mongoose.Types.ObjectId,
		);
	}
	next();
});

export const CommentSchema = schema;
