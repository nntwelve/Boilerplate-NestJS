import { BadRequestException, Inject, Injectable } from '@nestjs/common';

// INNER
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsRepositoryInterface } from './interfaces/comments.interface';
import { COMMENT_TYPE, Comment } from './entities/comment.entity';

// OUTER
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { SORT_TYPE } from 'src/types/common.type';
import { Collection } from '@modules/collections/entities/collection.entity';
import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';
import { FlashCardsService } from '@modules/flash-cards/flash-cards.service';
import { CollectionsService } from '@modules/collections/collections.service';

@Injectable()
export class CommentsService extends BaseServiceAbstract<Comment> {
	constructor(
		@Inject('CommentsRepositoryInterface')
		private readonly comments_repository: CommentsRepositoryInterface,
		private readonly flash_cards_service: FlashCardsService,
		private readonly collections_service: CollectionsService,
	) {
		super(comments_repository);
	}
	override async create(create_comment_dto: CreateCommentDto) {
		const target: FlashCard | Collection =
			create_comment_dto.comment_type === COMMENT_TYPE.FLASH_CARD
				? await this.flash_cards_service.findOne(create_comment_dto.target_id)
				: await this.collections_service.findOne(create_comment_dto.target_id);

		if (create_comment_dto.parent_id) {
			const parent = await this.comments_repository.findOneById(
				create_comment_dto.parent_id,
			);
			if (!parent) {
				throw new BadRequestException();
			}
			return await this.comments_repository.create({
				...create_comment_dto,
				target_id: target._id,
				parent_id: parent._id,
				parent_path: parent.current_path,
			});
		}
		return this.comments_repository.create({
			...create_comment_dto,
			target_id: target._id,
			parent_id: null,
			parent_path: null,
		});
	}

	override async findAll(
		filter: { target_id: string },
		{ offset, limit, sort_type, including_children },
	) {
		const comments_reponse = await this.comments_repository.findAll(
			{
				...filter,
				parent_id: null,
			},
			{
				skip: offset,
				limit,
				sort: {
					created_at: sort_type,
				},
			},
		);

		if (!including_children) {
			return comments_reponse;
		}

		const comments_with_children = await Promise.all(
			comments_reponse.items.map(async (comment) => ({
				...JSON.parse(JSON.stringify(comment)),
				children: await this.getAllSubComments({
					target_id: filter.target_id,
					parent_id: comment._id.toString(),
				}),
			})),
		);
		return {
			count: comments_reponse.count,
			items: comments_with_children.flat(),
		};
	}

	async getAllSubComments(
		filter: { target_id: string; parent_id: string },
		deep_level?: number,
	) {
		return await this.comments_repository.getAllSubComments(filter, deep_level);
	}
}
