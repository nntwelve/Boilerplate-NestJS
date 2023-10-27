import {
	COMMENT_TYPE,
	Comment,
} from '@modules/comments/entities/comment.entity';

import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { User } from '@modules/users/entities/user.entity';
import { createFlashCardStub } from '@modules/flash-cards/tests/stubs/flash-card.stub';
import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';

export const createCommentStub = (): Comment => {
	return {
		_id: '63822626721637cbf8efc415',
		comment_type: COMMENT_TYPE.FLASH_CARD,
		content: 'Comment 1',
		current_path: ',63822626721637cbf8efc415,',
		created_by: createUserStub()._id as unknown as User,
		parent_id: '63822626721637cbf8efc414' as unknown as Comment,
		target_id: createFlashCardStub()._id as unknown as FlashCard,
		total_liked: 0,
	};
};
