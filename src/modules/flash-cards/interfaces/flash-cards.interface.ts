import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FlashCard } from '../entities/flash-card.entity';

export interface FlashCardsRepositoryInterface
	extends BaseRepositoryInterface<FlashCard> {}
