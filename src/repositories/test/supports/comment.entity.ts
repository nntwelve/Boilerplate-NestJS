import { MockEntity } from '@repositories/test/supports/mock.entity';
import { Comment } from '@modules/comments/entities/comment.entity';
import { createCommentStub } from '@modules/comments/test/stubs/comment.stub';

export class CommentEntity extends MockEntity<Comment> {
	protected entity_stub = createCommentStub();

	async aggregate() {
		return [
			{
				count: 10,
				items: [this.entity_stub],
			},
		];
	}
}
