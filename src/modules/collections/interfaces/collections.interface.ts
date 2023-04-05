import { Collection } from '@modules/collections/entities/collection.entity';
import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';

export interface CollectionRepositoryInterface
	extends BaseRepositoryInterface<Collection> {}
