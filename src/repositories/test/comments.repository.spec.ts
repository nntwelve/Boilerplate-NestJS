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

	describe('getCommentsWithHierarchy', () => {
		it('should return comments with n deep level', async () => {
			// Arrange
			const comment_sub = createCommentStub();
			const filter = {
				target_id: comment_sub.target_id as any,
				parent_id: null,
			};
			const limit_child = 3; // n deep level
			jest.spyOn(model, 'aggregate');
			// Act
			const result = await repository.getCommentsWithHierarchy(
				filter,
				get_all_options,
			);

			// Assert
			expect(model.aggregate).toBeCalled();
			expect(model.aggregate).toBeCalledWith([
				{
					// Lọc ra các comment thuộc target và search theo input nếu có
					$match: {
						...filter,
						target_id: new mongoose.Types.ObjectId(filter.target_id),
						deleted_at: null,
					},
				},
				{
					// Sắp xếp lại comment
					$sort: {
						created_at: get_all_options.sort_type === SORT_TYPE.DESC ? -1 : 1,
					},
				},
				{
					// Chia ra làm 2 phần: 1 phần để count tổng số comment, 1 phần để get comments
					$facet: {
						count: [
							// Đếm tổng số comment và lưu vào biến `total`
							{
								$count: 'total',
							},
						],
						items: [
							{
								// Pagination skip
								$skip: get_all_options.offset,
							},
							{
								$limit: get_all_options.limit,
							},
							// Find reply comment
							{
								// GraphLookup giúp chúng ta lấy ra tất cả các con của document
								$graphLookup: {
									from: 'comments', // Tìm trong `comments` collection
									startWith: '$_id',
									connectFromField: '_id', // Khai báo field để khi parent tìm tới sẽ lấy ra so sánh
									connectToField: 'parent_id', // Khai báo field dùng so sánh để tìm các children
									maxDepth: 0, // Độ sâu mà chúng ta cần lấy dữ liệu, ví dụ ở đây đang lấy reply comment độ sâu level 1
									as: 'replies', // Khai báo tên field để thêm vào các children
								},
							},
							{
								// Loại bỏ 1 vài field không cần thiết
								$project: {
									content: 1,
									created_by: 1,
									total_liked: 1,
									created_at: 1,
									// Ở đây logic của chúng ta là lấy ra 5 children gần nhất,
									// khi muốn lấy thêm thì sẽ gọi API tương tự như cách facebook làm.
									// `$sort` và `$slice` là sự kết hợp hiệu quả cho yêu cầu này
									replies: {
										// Sau khi có được kết quả sort từ `$sortArray` chúng ta dùng `$slice` cắt bỏ các document còn lại
										$slice: [
											{
												// Vì các children tìm được không theo thứ tự nên chúng ta cần sort trước
												$sortArray: {
													input: '$replies',
													sortBy: { created_at: -1 },
												},
											},
											// Control số lượng children hiển thị
											limit_child,
										],
									},
									// Vì đã cắt bớt children nên khi trả về FE không biết comment đó còn có các reply khác hay không
									// vì thế chúng ta sẽ tạo thêm field và dùng `$size` để đếm tổng số reply.
									total_replies: {
										$size: '$replies',
									},
								},
							},
							{
								// Vì hiện tại `created_by` chỉ là id nên chúng ta cần `$lookup` để lấy thêm thông tin
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
								// Chúng ta cũng cần thêm thông tin cho `created_by` trong reply vì thế
								// cần phải dùng `$unwind` để tách mảng `replies` ra
								$unwind: {
									path: '$replies',
									preserveNullAndEmptyArrays: true,
								},
							},
							{
								// Loại bỏ các reply bị xóa
								$match: {
									'replies.deleted_at': null,
								},
							},
							{
								// Tương tự như trên sẽ lookup theo `created_by` bên trong `replies`
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
								// Sau khi đã thêm thông tin chúng ta cần gộp lại như ban đầu
								// theo cấu trúc comment chứa mảng replies
								$group: {
									_id: '$_id',
									content: {
										$first: '$content',
									},
									created_by: {
										$first: {
											// Kết quả của quá trình lookup trước là array nên chúng ta phải đưa về dạng object
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
										// Dùng `$push` để push các children lại vào trong mảng replies
										$push: {
											// Kết quả của `$lookup` là array nên chúng ta cần đưa về object,
											// Thông thường sẽ dùng `$unwind` nhưng ở đây mình dùng `$mergeObject` và
											// `$arrayElemAt` để đỡ phải tách ra 2 stage
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
								// Quá trình unwind ở trên làm cho thứ tự bị xáo trộn nên chúng ta cần sort lại
								$sort: {
									created_at:
										get_all_options.sort_type === SORT_TYPE.DESC ? -1 : 1,
								},
							},
						],
					},
				},
				{
					// Kết quả của `$count` ở trên là array nên mình sẽ đưa về object cho dễ nhìn
					$unwind: {
						path: '$count',
					},
				},
			]);
			expect(result).toMatchObject({
				count: expect.any(Number),
				items: expect.any(Array),
			});
		});
	});
});
