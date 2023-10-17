import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { Comment } from '../entities/comment.entity';

export interface CommentsRepositoryInterface
	extends BaseRepositoryInterface<Comment> {
	addReplyComment(parent_id: string, reply_id: string): Promise<Comment>;
	removeReplyComment(parent_id: string, reply_id: string): Promise<Comment>;
	softDeleteMany(ids: Array<string>): Promise<boolean>;
}
