import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';

export const createFlashCardStub = (): FlashCard => {
	return {
		_id: '63822626721637cbf8efc417',
		vocabulary: 'Hello',
		definition: 'Hello',
		meaning: 'Xin chao',
		user: createUserStub(),
		examples: [],
		image: 'https://picsum.photos/id/1/200/300',
		is_public: true,
		topics: [],
	};
};
