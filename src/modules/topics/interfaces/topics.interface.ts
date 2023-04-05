import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { Topic } from '../entities/topic.entity';

export interface TopicsRepositoryInterface
	extends BaseRepositoryInterface<Topic> {}
