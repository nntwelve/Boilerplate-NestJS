import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard, FlashCardState } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';
import { User } from '@modules/users/entities/user.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class FlashCardsService extends BaseServiceAbstract<FlashCard> {
	constructor(
		@Inject('FlashCardsRepositoryInterface')
		private readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		super(flash_cards_repository);
	}

	sendReview(flash_card: FlashCard) {
		if (flash_card.state !== FlashCardState.Draft) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_NOT_DRAFT,
				details: 'Flash card wrong status',
			});
		}
		return this.flash_cards_repository.update(flash_card._id.toString(), {
			state: FlashCardState.InReview,
		});
	}

	review(user: User, flash_card: FlashCard, status: 'approve' | 'reject') {
		let state = flash_card.state;
		switch (flash_card.state) {
			case FlashCardState.InReview:
				if (user.role !== 'Team_Leader')
					throw new BadRequestException({
						message: ERRORS_DICTIONARY.FLASH_CARD_NOT_REVIEWED,
						details: 'You do not have permission to review this flash card',
					});
				if (status === 'approve') {
					state = FlashCardState.ApprovedOne;
					break;
				}
				state = FlashCardState.RejectedOne;
				break;
			case FlashCardState.ApprovedOne:
				if (user.role !== 'Admin')
					throw new BadRequestException({
						message: ERRORS_DICTIONARY.FLASH_CARD_NOT_REVIEWED,
						details: 'You do not have permission to review this flash card',
					});
				if (status === 'approve') {
					state = FlashCardState.ApprovedTwo;
					break;
				}
				state = FlashCardState.RejectedTwo;
				break;
			case FlashCardState.Draft:
			case FlashCardState.RejectedOne:
			case FlashCardState.ApprovedTwo:
			case FlashCardState.RejectedTwo:
			case FlashCardState.Publish:
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.FLASH_CARD_NOT_REVIEWED,
					details: 'Flash card wrong status',
				});
		}
		return this.flash_cards_repository.update(flash_card._id.toString(), {
			state,
		});
	}
}
