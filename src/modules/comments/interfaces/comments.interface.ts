import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { Comment } from '../entities/comment.entity';
import { FindAllResponse } from 'src/types/common.type';

export interface CommentsRepositoryInterface
	extends BaseRepositoryInterface<Comment> {
	getAllSubComments(
		filter: {
			target_id: string;
			parent_id: string;
		},
		deep_level?: number,
	): Promise<Array<Comment>>;

	deleteCommentAndReplies(id: string): Promise<boolean>;
}
