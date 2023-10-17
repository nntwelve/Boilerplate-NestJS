import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

// INNER
import {
	Comment,
	CommentDocument,
} from '@modules/comments/entities/comment.entity';
import { CommentsRepositoryInterface } from '@modules/comments/interfaces/comments.interface';

// OUTER
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { FindAllResponse, SORT_TYPE } from 'src/types/common.type';

@Injectable()
export class CommentRepository
	extends BaseRepositoryAbstract<CommentDocument>
	implements CommentsRepositoryInterface
{
	constructor(
		@InjectModel(Comment.name)
		private readonly comment_model: Model<CommentDocument>,
	) {
		super(comment_model);
	}

	async addReplyComment(parent_id: string, reply_id: string) {
		return await this.comment_model.findByIdAndUpdate(parent_id, {
			$push: {
				children_ids: reply_id,
			},
		});
	}

	async removeReplyComment(parent_id: string, reply_id: string) {
		return await this.comment_model.findByIdAndUpdate(parent_id, {
			$pull: {
				children_ids: reply_id,
			},
		});
	}

	async softDeleteMany(ids: Array<string>): Promise<boolean> {
		const response = await this.comment_model.updateMany(
			{
				_id: {
					$in: ids,
				},
			},
			{
				deleted_at: new Date(),
			},
		);

		return response.modifiedCount !== 0;
	}
}
