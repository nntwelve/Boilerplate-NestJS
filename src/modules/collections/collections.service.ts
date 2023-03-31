import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { Collection } from './entities/collection.entity';
import { CollectionRepositoryInterface } from './interfaces/collections.interface';

@Injectable()
export class CollectionsService extends BaseServiceAbstract<Collection> {
	/**
	 *
	 */
	constructor(
		@Inject('CollectionRepositoryInterface')
		private readonly collection_repository: CollectionRepositoryInterface,
	) {
		super(collection_repository);
	}
}
