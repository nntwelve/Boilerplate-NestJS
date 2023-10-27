import { FilterQuery, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as mongoose from 'mongoose';

// INNER
import { CommentEntity } from './supports/comment.entity';
import { CommentRepository } from '@repositories/comments.repository';
import {
	Comment,
	CommentDocument,
} from '@modules/comments/entities/comment.entity';
import { createCommentStub } from '@modules/comments/test/stubs/comment.stub';

// OUTER
import { SORT_TYPE } from 'src/types/common.type';
import { get_all_options } from 'src/shared/test/common';

describe('CommentsRepository', () => {
	let repository: CommentRepository;
	let model: Model<CommentDocument>;

	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				CommentRepository,
				{
					provide: getModelToken(Comment.name),
					useClass: CommentEntity,
				},
			],
		}).compile();
		repository = module_ref.get<CommentRepository>(CommentRepository);
		model = module_ref.get(getModelToken(Comment.name));
	});

	afterEach(() => jest.clearAllMocks());

	describe('getAllSubComments', () => {
		it('should be return all replies with n deep level', async () => {
			// Arrange
			const comment_sub = createCommentStub();
			const filter = {
				target_id: comment_sub.target_id as any,
				parent_id: null,
			};
			const deep_level = 3; // n deep level
			jest.spyOn(model, 'find');
			// Act
			await repository.getAllSubComments(filter, deep_level);

			// Assert
			expect(model.find).toBeCalledWith({
				target_id: filter.target_id,
				deleted_at: null,
				current_path: {
					$regex: new RegExp(
						`${filter.parent_id}(,[^,]*){1,${deep_level ?? ''}},$`,
					),
					$options: 'i',
				},
			});
		});

		it('should be remove current comment and all replies', async () => {
			// Arrange
			const comment_stub = createCommentStub();
			jest.spyOn(model, 'updateMany');
			// Act
			await repository.deleteCommentAndReplies(comment_stub._id.toString());

			// Assert
			expect(model.updateMany).toBeCalledWith(
				{
					current_path: {
						$regex: new RegExp(comment_stub._id.toString()),
						$options: 'i',
					},
				},
				{
					deleted_at: new Date(),
				},
			);
		});
	});
});
