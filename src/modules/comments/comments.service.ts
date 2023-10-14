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
	async create(create_comment_dto: CreateCommentDto) {
		const target: FlashCard | Collection =
			create_comment_dto.comment_type === COMMENT_TYPE.FLASH_CARD
				? await this.flash_cards_service.findOne(create_comment_dto.target_id)
				: await this.collections_service.findOne(create_comment_dto.target_id);

		if (create_comment_dto.parent_id) {
			const parent = await this.comments_repository.findOneById(
				create_comment_dto.parent_id,
			);
			if (parent) {
				throw new BadRequestException();
			}
			return this.comments_repository.create({
				...create_comment_dto,
				target_id: target._id,
				parent_id: parent.parent_id ? parent.parent_id : parent._id,
			});
		}
		return this.comments_repository.create({
			...create_comment_dto,
			target_id: target._id,
		});
	}

	async findAll(filter: { target_id: string }, { offset, limit, sort_type }) {
		return await this.comments_repository.getCommentsWithHierarchy(
			{
				...filter,
				parent_id: null,
			},
			{
				offset,
				limit,
				sort_type,
			},
		);
	}

	async getMoreSubComments(
		filter: { parent_id: string },
		options: { offset: number; limit: number; sort_type: SORT_TYPE },
	) {
		return await this.comments_repository.findAll(filter, {
			skip: options.offset,
			limit: options.limit,
			sort: {
				created_at: options.sort_type,
			},
		});
	}
}
