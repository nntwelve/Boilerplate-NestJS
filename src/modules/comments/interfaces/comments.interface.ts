import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { Comment } from '../entities/comment.entity';
import { FindAllResponse } from 'src/types/common.type';

export interface CommentsRepositoryInterface
	extends BaseRepositoryInterface<Comment> {
	getCommentsWithHierarchy(
		filter: object,
		options: object,
	): Promise<FindAllResponse<Comment>>;
}
