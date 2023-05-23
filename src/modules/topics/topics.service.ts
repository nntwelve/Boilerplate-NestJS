import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { Topic } from './entities/topic.entity';
import { TopicsRepositoryInterface } from './interfaces/topics.interface';

@Injectable()
export class TopicsService extends BaseServiceAbstract<Topic> {
	constructor(
		@Inject('TopicsRepositoryInterface')
		private readonly topics_repository: TopicsRepositoryInterface,
	) {
		super(topics_repository);
	}
}
