import { createCommentStub } from '../test/stubs/comment.stub';

export const CommentsService = jest.fn().mockReturnValue({
	findOneByCondition: jest.fn().mockResolvedValue(createCommentStub()),
	findAll: jest
		.fn()
		.mockResolvedValue({ items: [createCommentStub()], count: 1 }),
	getCommentsWithHierarchy: jest
		.fn()
		.mockResolvedValue({ items: [createCommentStub()], count: 1 }),
	create: jest.fn().mockResolvedValue(createCommentStub()),
	update: jest.fn().mockResolvedValue(createCommentStub()),
	remove: jest.fn().mockResolvedValue(true),
});
