import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import * as fs from 'fs';
import { join } from 'path';
import { User } from '@modules/users/entities/user.entity';
import { FindAllResponse } from 'src/types/common.type';
import { Types } from 'mongoose';
import { generateNextKey } from 'src/shared/utils/pagination';

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

	async findAll(
		filter?: object,
		options?: { offset: number; limit: number },
	): Promise<FindAllResponse<FlashCard>> {
		return await this.flash_cards_repository.findAll(filter, {
			skip: options.offset,
			limit: options.limit,
			sort: { vocabulary: 1, _id: 1 },
		});
	}

	async findAllUsingKeysetPagination(
		filter: { search: string },
		{ last_id, last_vocabulary }: { last_vocabulary: string; last_id: string },
		options: { limit: number },
	): Promise<FindAllResponse<FlashCard>> {
		const pagination_query = {},
			api_query = {};
		let final_query = {};
		if (last_id && last_vocabulary) {
			pagination_query['$or'] = [
				{
					vocabulary: {
						$gt: last_vocabulary,
					},
				},
				{
					vocabulary: last_vocabulary,
					_id: {
						$gt: new Types.ObjectId(last_id),
					},
				},
			];
		}
		if (filter.search) {
			api_query['vocabulary'] = {
				$regex: filter.search,
			};
			final_query['$and'] = [api_query, pagination_query];
		} else {
			final_query = pagination_query;
		}
		const { count, items } = await this.flash_cards_repository.findAll(
			final_query,
			{
				limit: options.limit,
				sort: { vocabulary: 1, _id: 1 },
			},
		);
		return {
			count,
			items,
			next_key: generateNextKey(items, ['vocabulary', 'meaning']),
		};
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

	async seedData(user: User): Promise<{ message: string }> {
		const insert_data: FlashCard[] = [];
		try {
			const file_content = fs.readFileSync(
				join(__dirname, '../../../words_dictionary.json'),
				{
					encoding: 'utf-8',
					flag: 'r',
				},
			);

			Object.keys(JSON.parse(file_content)).map((keyword) =>
				insert_data.push({
					vocabulary: keyword,
					definition: keyword,
					meaning: keyword,
					pronunciation: keyword,
					image: keyword,
					is_public: true,
					user,
					examples: [keyword],
					// @ts-ignore
					topics: ['643f9df2f5c7e42acc686974'],
				}),
			);
			await this.flash_cards_repository.insertMany(insert_data);
			return { message: 'done' };
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}
