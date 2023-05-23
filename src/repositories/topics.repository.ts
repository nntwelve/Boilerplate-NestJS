import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { Topic, TopicDocument } from '@modules/topics/entities/topic.entity';
import { TopicsRepositoryInterface } from '@modules/topics/interfaces/topics.interface';

@Injectable()
export class TopicsRepository
	extends BaseRepositoryAbstract<TopicDocument>
	implements TopicsRepositoryInterface
{
	constructor(
		@InjectModel(Topic.name)
		private readonly topic_model: Model<TopicDocument>,
	) {
		super(topic_model);
	}
}
