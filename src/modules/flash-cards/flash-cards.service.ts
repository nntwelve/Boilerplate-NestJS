import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';

@Injectable()
export class FlashCardsService extends BaseServiceAbstract<FlashCard> {
	constructor(
		@Inject('FlashCardsRepositoryInterface')
		private readonly flash_cards_repository: FlashCardsRepositoryInterface,
	) {
		super(flash_cards_repository);
	}
}
