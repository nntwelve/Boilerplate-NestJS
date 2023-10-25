import { Test, TestingModule } from '@nestjs/testing';

// INNER
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { COMMENT_TYPE } from '../entities/comment.entity';
import { createCommentStub } from './stubs/comment.stub';

// OUTER
import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { get_all_options } from 'src/shared/test/common';
import { RequestWithUser } from 'src/types/requests.type';
import { isGuarded } from 'src/shared/test/utils';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';

jest.mock('../comments.service.ts');
describe('CommentsController', () => {
	let comments_controller: CommentsController;
	let comments_service: CommentsService;
	const comment_stub = createCommentStub();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CommentsController],
			providers: [CommentsService],
		}).compile();

		comments_controller = module.get<CommentsController>(CommentsController);
		comments_service = module.get<CommentsService>(CommentsService);
	});

	it('should be defined', () => {
		expect(comments_controller).toBeDefined();
	});

	describe('createComment', () => {
		it('should be protected with JwtAuthGuard', () => {
			expect(
				isGuarded(CommentsController.prototype.create, JwtAccessTokenGuard),
			);
		});

		it('should call create comment method and return comment data', async () => {
			// Arrange
			const user_stub = createUserStub();
			const request = { user: user_stub } as RequestWithUser;
			const comment_dto = {
				comment_type: COMMENT_TYPE.FLASH_CARD,
				content: comment_stub.content,
				target_id: comment_stub.target_id as unknown as string,
				parent_id: null,
			} as CreateCommentDto;
			// Act
			await comments_controller.create(request, comment_dto);
			// Assert
			expect(comments_service.create).toHaveBeenCalledWith({
				...comment_dto,
				created_by: user_stub._id,
			});
		});
	});

	describe('getCommentsWithHierarchy', () => {
		it('should be return comments data based on filter', async () => {
			// Arrange
			const filter = {
				target_id: comment_stub.target_id as any,
			};
			// Act
			await comments_controller.getCommentsWithHierarchy(
				filter.target_id,
				get_all_options.offset,
				get_all_options.limit,
				get_all_options.sort_type,
			);
			// Assert
			expect(comments_service.getCommentsWithHierarchy).toBeCalledWith(
				filter,
				get_all_options,
			);
		});
	});

	describe('getMoreSubComments', () => {
		it('should be return reply of specific comment', async () => {
			// Arrange
			const filter = {
				comment_id: comment_stub._id as string,
			};
			// Act
			await comments_controller.getMoreSubComments(
				filter.comment_id,
				get_all_options.offset,
				get_all_options.limit,
				get_all_options.sort_type,
			);
			// Assert
			expect(comments_service.findAll).toBeCalledWith(
				{ parent_id: filter.comment_id },
				get_all_options,
			);
		});
	});
});
