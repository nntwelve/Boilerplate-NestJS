import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

// INNER
import { CommentEntity } from './supports/comment.entity';
import { CommentRepository } from '@repositories/comments.repository';
import {
	Comment,
	CommentDocument,
} from '@modules/comments/entities/comment.entity';
import { createCommentStub } from '@modules/comments/test/stubs/comment.stub';

// OUTER
import { CreateCommentDto } from '@modules/comments/dto/create-comment.dto';
import { createUserStub } from '@modules/users/test/stubs/user.stub';

describe('CommentsRepository', () => {
	let repository: CommentRepository;
	let model: Model<CommentDocument>;
	const comment_stub = createCommentStub();

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

	describe('create', () => {
		it('should create current_path based on parent_path', async () => {
			// Arrange
			const create_dto: CreateCommentDto = {
				comment_type: comment_stub.comment_type,
				content: 'Comment 1.1.1',
				created_by: createUserStub()._id,
				target_id: comment_stub.target_id as unknown as string,
				parent_path: comment_stub.current_path,
			};
			jest.spyOn(model, 'create').mockResolvedValueOnce({
				save: jest.fn(),
				_id: '63822626721637cbf8efc416',
			} as any);
			// Act
			const created_comment = await repository.create(create_dto);
			// Assert
			expect(created_comment.current_path).toBe(
				`${comment_stub.current_path}63822626721637cbf8efc416,`,
			);
			expect(created_comment.save).toBeCalled();
		});
	});

	describe('getAllSubComments', () => {
		it('should be return all replies with n deep level', async () => {
			// Arrange
			const filter = {
				target_id: comment_stub.target_id as any,
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
	});

	describe('deleteCommentAndReplies', () => {
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
