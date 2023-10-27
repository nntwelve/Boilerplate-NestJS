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

		it('should call repository to create comment if it is not a reply comment', async () => {
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
			expect(comments_repository.create).toBeCalledWith({
				...create_comment_dto,
				parent_path: null,
				parent_id: null,
			});
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
			it('should call repository with parent path', async () => {
				// Arrange
				create_comment_dto.parent_id =
					comment_stub.parent_id as unknown as string;
				jest.spyOn(comments_repository, 'findOneById').mockResolvedValueOnce({
					...comment_stub,
					_id: comment_stub.parent_id as unknown as string,
					current_path: `,${comment_stub.parent_id},`,
				});
				// Act
				await comments_service.create(create_comment_dto);
				// Assert
				expect(comments_repository.findOneById).toBeCalledWith(
					create_comment_dto.parent_id,
				);
				expect(comments_repository.create).toBeCalledWith({
					...create_comment_dto,
					parent_path: `,${comment_stub.parent_id},`,
				});
			});
		});
	});

	describe('findAll', () => {
		const filter = {
			target_id: comment_stub.target_id as unknown as string,
		};
		it('should call repository to return only comments with 0 deep level if including_children=false', async () => {
			// Arrange
			const including_children = false;

			// Act
			await comments_service.findAll(filter, {
				...get_all_options,
				including_children,
			});

			// Assert
			expect(comments_repository.findAll).toBeCalledWith(
				{ ...filter, parent_id: null },
				{
					limit: get_all_options.limit,
					skip: get_all_options.offset,
					sort: {
						created_at: get_all_options.sort_type,
					},
				},
			);
		});
		it('should call repository to return comments with all hierachy if including_children=true', async () => {
			// Arrange
			const including_children = true;
			jest.spyOn(comments_repository, 'findAll').mockResolvedValueOnce({
				items: [comment_stub],
				count: 1,
			});
			jest.spyOn(comments_service, 'getAllSubComments');

			// Act
			await comments_service.findAll(filter, {
				...get_all_options,
				including_children,
			});
			// Assert
			expect(comments_repository.findAll).toBeCalledWith(
				{ ...filter, parent_id: null },
				{
					limit: get_all_options.limit,
					skip: get_all_options.offset,
					sort: {
						created_at: get_all_options.sort_type,
					},
				},
			);
			expect(comments_service.getAllSubComments).toBeCalledTimes(1);
			expect(comments_service.getAllSubComments).toBeCalledWith({
				...filter,
				parent_id: comment_stub._id,
			});
		});
	});

	describe('getAllSubComments', () => {
		it('should call repository to get all comments with all deep level', async () => {
			// Arrange
			const filter = {
				target_id: comment_stub.target_id as unknown as string,
				parent_id: comment_stub._id as unknown as string,
			};
			const deep_level = 3;
			// Act
			await comments_service.getAllSubComments(filter, deep_level);
			// Assert
			expect(comments_repository.getAllSubComments).toBeCalledWith(
				filter,
				deep_level,
			);
		});
	});

	describe('remove', () => {
		it('should call repository to remove comment and all replies', async () => {
			// Arrange

			// Act
			await comments_service.remove(comment_stub._id.toString());

			// Assert
			expect(comments_repository.deleteCommentAndReplies).toHaveBeenCalledWith(
				comment_stub._id.toString(),
			);
		});
	});
});
