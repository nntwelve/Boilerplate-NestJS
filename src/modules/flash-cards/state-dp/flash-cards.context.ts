import { User } from '@modules/users/entities/user.entity';
import { FlashCard, FlashCardState } from '../entities/flash-card.entity';
import { FlashCardStateAbstract } from './flash-cards.state';
import {
	FlashCardApprovedOneState,
	FlashCardApprovedTwoState,
	FlashCardDraftState,
	FlashCardInReviewState,
	FlashCardPublishState,
	FlashCardRejectedOneState,
	FlashCardRejectedTwoState,
} from './flash-cards.concrete';
import { FlashCardsRepositoryInterface } from '../interfaces/flash-cards.interface';

export class FlashCardContext {
	state: FlashCardStateAbstract;

	constructor(
		flash_card: FlashCard,
		private readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		this.setState(flash_card);
	}

	private setState(flash_card: FlashCard): void {
		switch (flash_card.state) {
			case FlashCardState.Draft:
				this.state = new FlashCardDraftState(
					flash_card,
					this.flash_cards_repository,
				);
				break;
			case FlashCardState.InReview:
				this.state = new FlashCardInReviewState(
					flash_card,
					this.flash_cards_repository,
				);
				break;
			case FlashCardState.ApprovedOne:
				this.state = new FlashCardApprovedOneState(
					flash_card,
					this.flash_cards_repository,
				);
				break;
			case FlashCardState.RejectedOne:
				this.state = new FlashCardRejectedOneState(this.flash_cards_repository);
				break;
			case FlashCardState.ApprovedTwo:
				this.state = new FlashCardApprovedTwoState(this.flash_cards_repository);
				break;
			case FlashCardState.RejectedTwo:
				this.state = new FlashCardRejectedTwoState(this.flash_cards_repository);
				break;
			case FlashCardState.Publish:
				this.state = new FlashCardPublishState(this.flash_cards_repository);
				break;
		}
	}

	changeState(state: FlashCardStateAbstract) {
		this.state = state;
	}

	sendReview(user: User) {
		return this.state.sendReview(user);
	}

	review(user: User, status: 'approve' | 'reject') {
		return this.state.review(user, status);
	}
}
