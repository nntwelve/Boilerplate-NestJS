import { BadRequestException } from '@nestjs/common';
import { FlashCard, FlashCardState } from '../entities/flash-card.entity';
import { FlashCardStateAbstract } from './flash-cards.state';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { User } from '@modules/users/entities/user.entity';
import { FlashCardsRepositoryInterface } from '../interfaces/flash-cards.interface';

export class FlashCardDraftState extends FlashCardStateAbstract {
	constructor(
		protected readonly flash_card: FlashCard,
		protected readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		super(flash_cards_repository);
		if (flash_card.state !== FlashCardState.Draft) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_NOT_DRAFT,
				details: 'Flash card wrong status',
			});
		}
	}
	sendReview(user: User) {
		if (this.flash_card.user.toString() !== user._id.toString()) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_NOT_OWNED,
				details: 'Flash card not owned',
			});
		}
		return this.flash_cards_repository.update(this.flash_card._id.toString(), {
			state: FlashCardState.InReview,
		});
	}
}

export class FlashCardInReviewState extends FlashCardStateAbstract {
	constructor(
		protected readonly flash_card: FlashCard,
		protected readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		super(flash_cards_repository);
		if (flash_card.state !== FlashCardState.InReview) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_WRONG_STATUS,
				details: 'Flash card wrong status',
			});
		}
	}
	review(user: User, status: 'approve' | 'reject') {
		let state = this.flash_card.state;
		if (user.role !== 'Team_Leader')
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_PERMISSION_DENIED,
				details: 'You do not have permission to review this flash card',
			});
		if (status === 'approve') {
			state = FlashCardState.ApprovedOne;
		}
		state = FlashCardState.RejectedOne;
		return this.flash_cards_repository.update(this.flash_card._id.toString(), {
			state,
		});
	}
}

export class FlashCardApprovedOneState extends FlashCardStateAbstract {
	constructor(
		protected readonly flash_card: FlashCard,
		protected readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		super(flash_cards_repository);
		if (flash_card.state !== FlashCardState.InReview) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_WRONG_STATUS,
				details: 'Flash card wrong status',
			});
		}
	}
	review(user: User, status: 'approve' | 'reject') {
		let state = this.flash_card.state;
		if (user.role !== 'Admin')
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.FLASH_CARD_PERMISSION_DENIED,
				details: 'You do not have permission to review this flash card',
			});
		if (status === 'approve') {
			state = FlashCardState.ApprovedTwo;
		}
		state = FlashCardState.RejectedTwo;
		return this.flash_cards_repository.update(this.flash_card._id.toString(), {
			state,
		});
	}
}

export class FlashCardApprovedTwoState extends FlashCardStateAbstract {}
export class FlashCardRejectedOneState extends FlashCardStateAbstract {}
export class FlashCardRejectedTwoState extends FlashCardStateAbstract {}
export class FlashCardPublishState extends FlashCardStateAbstract {}
