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
	async getCommentsWithHierarchy(
		filter: { target_id: string; parent_id: null | string },
		{
			offset,
			limit,
			sort_type,
		}: { offset: number; limit: number; sort_type: SORT_TYPE },
		limit_child = 3,
	): Promise<FindAllResponse<Comment>> {
		console.log(sort_type);
		const response = await this.comment_model.aggregate<{
			items: object;
			count: { total: number };
		}>([
			{
				$match: {
					...filter,
					target_id: new mongoose.Types.ObjectId(filter.target_id),
				},
			},
			{
				$sort: {
					created_at: sort_type === SORT_TYPE.DESC ? -1 : 1,
				},
			},
			{
				$facet: {
					count: [
						{
							$count: 'total',
						},
					],
					items: [
						{
							$skip: offset,
						},
						{
							$limit: limit,
						},
						// Find reply comment
						{
							$graphLookup: {
								from: 'comments_2',
								startWith: '$_id',
								connectFromField: '_id',
								connectToField: 'parent_id',
								maxDepth: 0,
								as: 'replies',
							},
						},
						{
							$project: {
								content: 1,
								created_by: 1,
								total_liked: 1,
								created_at: 1,
								replies: {
									$slice: [
										{
											$sortArray: {
												input: '$replies',
												sortBy: { created_at: -1 },
											},
										},
										limit_child,
									],
								},
								total_replies: {
									$size: '$replies',
								},
							},
						},
						{
							$lookup: {
								from: 'users',
								localField: 'created_by',
								foreignField: '_id',
								pipeline: [
									{
										$project: {
											first_name: 1,
											last_name: 1,
											email: 1,
											avatar: 1,
										},
									},
								],
								as: 'created_by',
							},
						},
						{
							$unwind: {
								path: '$replies',
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$lookup: {
								from: 'users',
								localField: 'replies.created_by',
								foreignField: '_id',
								pipeline: [
									{
										$project: {
											first_name: 1,
											last_name: 1,
											email: 1,
											avatar: 1,
										},
									},
								],
								as: 'replies.created_by',
							},
						},
						{
							$group: {
								_id: '$_id',
								content: {
									$first: '$content',
								},
								created_by: {
									$first: {
										$arrayElemAt: ['$created_by', 0],
									},
								},
								created_at: {
									$first: '$created_at',
								},
								total_replies: {
									$first: '$total_replies',
								},
								total_liked: {
									$first: '$total_liked',
								},
								replies: {
									$push: {
										$mergeObjects: [
											'$replies',
											{
												created_by: {
													$arrayElemAt: ['$replies.created_by', 0],
												},
											},
										],
									},
								},
							},
						},
						{
							$sort: {
								created_at: sort_type === SORT_TYPE.DESC ? -1 : 1,
							},
						},
					],
				},
			},
			{
				$unwind: {
					path: '$count',
				},
			},
		]);

		return {
			items: (response[0]?.items as Array<Comment>) || [],
			count: response[0]?.count.total || 0,
		};
	}
}
