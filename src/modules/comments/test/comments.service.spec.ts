import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

// INNER
import { CommentsService } from '../comments.service';
import { CommentsRepositoryInterface } from '../interfaces/comments.interface';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { createCommentStub } from './stubs/comment.stub';

// OUTER
import { FlashCardsService } from '@modules/flash-cards/flash-cards.service';
import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';
import { User } from '@modules/users/entities/user.entity';
import { get_all_options } from 'src/shared/test/common';

describe('CommentsService', () => {
	let comments_service: CommentsService;
	let comments_repository: CommentsRepositoryInterface;
	let flash_cards_service: FlashCardsService;
	const comment_stub = createCommentStub();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CommentsService,
				{
					provide: 'CommentsRepositoryInterface',
					useValue: createMock<CommentsRepositoryInterface>(),
				},
			],
		})
			.useMocker(createMock)
			.compile();

		comments_service = module.get<CommentsService>(CommentsService);
		comments_repository = module.get<CommentsRepositoryInterface>(
			'CommentsRepositoryInterface',
		);
		flash_cards_service = module.get<FlashCardsService>(FlashCardsService);
	});

	it('should be defined', () => {
		expect(comments_service).toBeDefined();
	});

	describe('create', () => {
		beforeEach(() => {
			jest.spyOn(flash_cards_service, 'findOne').mockResolvedValueOnce({
				_id: comment_stub.target_id,
			} as unknown as FlashCard);
		});
		it('should be thrown error if target id is not valid', async () => {
			// Arrange
			const create_comment_dto: CreateCommentDto = {
				comment_type: comment_stub.comment_type,
				content: comment_stub.content,
				target_id: 'invalid target id',
				created_by: comment_stub.created_by as User,
			};
			// We can only configured mock function once, so we need reset mocks to take effect of line 72
			jest.resetAllMocks();
			jest.spyOn(flash_cards_service, 'findOne').mockResolvedValueOnce(null);
			// Act
			try {
				await comments_service.create(create_comment_dto);
			} catch (error) {
				// Assert
				expect(error).toBeInstanceOf(BadRequestException);
			}
		});

		it('should be called repository to create comment if it is not a reply comment', async () => {
			// Arrange
			const create_comment_dto: CreateCommentDto = {
				comment_type: comment_stub.comment_type,
				content: comment_stub.content,
				target_id: comment_stub.target_id as unknown as string,
				created_by: comment_stub.created_by as User,
			};

			// Act
			await comments_service.create(create_comment_dto);
			// Assert
			expect(comments_repository.create).toBeCalledWith(create_comment_dto);
		});

		describe('if it is a reply comment', () => {
			let create_comment_dto: CreateCommentDto;
			beforeEach(() => {
				create_comment_dto = {
					comment_type: comment_stub.comment_type,
					content: comment_stub.content,
					target_id: comment_stub.target_id as unknown as string,
					created_by: comment_stub.created_by as User,
				};
			});
			it('should be thrown error if parent id is not valid', async () => {
				// Arrange
				create_comment_dto.parent_id = 'id not exist';
				jest
					.spyOn(comments_repository, 'findOneById')
					.mockResolvedValueOnce(null);
				// Act
				try {
					await comments_service.create(create_comment_dto);
				} catch (error) {
					// Assert
					expect(error).toBeInstanceOf(BadRequestException);
				}
			});
			it('should be called repository with current parent_id if it is in 1 deep level', async () => {
				// Arrange
				create_comment_dto.parent_id =
					comment_stub.parent_id as unknown as string;
				jest.spyOn(comments_repository, 'findOneById').mockResolvedValueOnce({
					...comment_stub,
					_id: comment_stub.parent_id as unknown as string,
					parent_id: null,
				});
				// Act
				await comments_service.create(create_comment_dto);
				// Assert
				expect(comments_repository.findOneById).toBeCalledWith(
					create_comment_dto.parent_id,
				);
				expect(comments_repository.create).toBeCalledWith(create_comment_dto);
			});

			it('should be called repository with parent_id of parent if it is in 2 deep level', async () => {
				// Arrange
				create_comment_dto.parent_id =
					comment_stub.parent_id as unknown as string;
				const parent_comment = {
					...comment_stub,
					_id: '63822626721637cbf8efc414',
					parent_id: '63822626721637cbf8efc413' as any,
				};
				jest
					.spyOn(comments_repository, 'findOneById')
					.mockResolvedValueOnce(parent_comment);
				// Act
				await comments_service.create(create_comment_dto);
				// Assert
				expect(comments_repository.findOneById).toBeCalledWith(
					create_comment_dto.parent_id,
				);
				expect(comments_repository.create).toBeCalledWith({
					...create_comment_dto,
					parent_id: parent_comment.parent_id,
				});
			});
		});
	});

	describe('getCommentsWithHierarchy', () => {
		it('should be called repository to get comments (not replies any comment) with options', async () => {
			// Arrange
			const filter = {
				target_id: comment_stub.target_id as any,
			};
			// Act
			await comments_service.getCommentsWithHierarchy(filter, get_all_options);
			// Assert
			expect(comments_repository.getCommentsWithHierarchy).toBeCalledWith(
				{ ...filter, parent_id: null },
				get_all_options,
			);
		});
	});
});
