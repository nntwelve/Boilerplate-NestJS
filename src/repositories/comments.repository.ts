import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

// INNER
import {
	Comment,
	CommentDocument,
} from '@modules/comments/entities/comment.entity';
import { CommentsRepositoryInterface } from '@modules/comments/interfaces/comments.interface';

// INNER
import { CreateCommentDto } from '@modules/comments/dto/create-comment.dto';

// OUTER
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

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

	override async create(dto: CreateCommentDto) {
		const created_comment = await this.comment_model.create(dto);
		created_comment.current_path = `${dto.parent_path || ','}${
			created_comment._id
		},`;
		return await created_comment.save();
	}

	async getAllSubComments(
		filter: {
			target_id: string;
			parent_id: string;
		},
		deep_level: number,
	): Promise<Array<Comment>> {
		return await this.comment_model.find({
			target_id: filter.target_id,
			deleted_at: null,
			current_path: {
				$regex: new RegExp(
					`${filter.parent_id}(,[^,]*){1,${deep_level ?? ''}},$`,
				),
				$options: 'i',
			},
		});
	}

	async deleteCommentAndReplies(id: string): Promise<boolean> {
		const reponse = await this.comment_model.updateMany(
			{
				current_path: {
					$regex: new RegExp(id),
					$options: 'i',
				},
			},
			{
				deleted_at: new Date(),
			},
		);
		return reponse.modifiedCount !== 0;
	}
}
