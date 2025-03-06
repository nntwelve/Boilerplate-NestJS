import { User } from '@modules/users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { FlashCardsRepositoryInterface } from '../interfaces/flash-cards.interface';

export abstract class FlashCardStateAbstract {
	constructor(
		protected readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {}
	sendReview(user: User) {
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.FLASH_CARD_NOT_DRAFT,
			details: 'Flash card wrong status',
		});
	}
	review(user: User, status: 'approve' | 'reject') {
		throw new BadRequestException({
			message: ERRORS_DICTIONARY.FLASH_CARD_NOT_REVIEWED,
			details: 'Flash card wrong status',
		});
	}
}
