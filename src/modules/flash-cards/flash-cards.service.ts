import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';

@Injectable()
export class FlashCardsService extends BaseServiceAbstract<FlashCard> {
	constructor(
		@Inject('FlashCardsRepositoryInterface')
		private readonly flash_cards_repository: FlashCardsRepositoryInterface,
		@InjectQueue('image:optimize')
		private readonly image_optimize_queue: Queue,
		@InjectFlowProducer('image:upload')
		private readonly image_upload_flow: FlowProducer,
	) {
		super(flash_cards_repository);
	}

	async createFlashCard(
		create_dto: CreateFlashCardDto,
		file: Express.Multer.File,
	): Promise<FlashCard> {
		const flash_card = await this.flash_cards_repository.create(create_dto);

		/* Logic with basic queue
		await this.image_optimize_queue.add( 
			'optimize-size',
			{
				file,
				id: flash_card._id,
			},
			{
				attempts: 2,
			},
		); */

		// Logic with flow
		await this.image_upload_flow.add({
			name: 'uploading-image',
			queueName: 'image:upload',
			data: { id: flash_card._id },
			children: [
				{
					name: 'optimize-size',
					data: { file },
					queueName: 'image:optimize',
					opts: {
						delay: 2000,
					},
				},
				{
					name: 'check-term',
					data: { file },
					queueName: 'image:check-valid',
				},
				{
					name: 'check-policy',
					data: { file },
					queueName: 'image:check-valid',
				},
			],
		});
		return flash_card;
	}

	async pauseOrResumeQueue(state: string) {
		if (state !== 'RESUME') {
			return await this.image_optimize_queue.pause();
		}
		return await this.image_optimize_queue.resume();
	}
}
