import { FlashCard } from '@modules/flash-cards/entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from '@modules/flash-cards/interfaces/flash-cards.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

@Injectable()
export class FlashCardsRepository
	extends BaseRepositoryAbstract<FlashCard>
	implements FlashCardsRepositoryInterface
{
	constructor(
		@InjectModel(FlashCard.name)
		private readonly flash_cards_repository: Model<FlashCard>,
	) {
		super(flash_cards_repository);
	}
}
