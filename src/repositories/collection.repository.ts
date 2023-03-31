import { Collection } from '@modules/collections/entities/collection.entity';
import { CollectionRepositoryInterface } from '@modules/collections/interfaces/collections.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

@Injectable()
export class CollectionRepository
	extends BaseRepositoryAbstract<Collection>
	implements CollectionRepositoryInterface
{
	constructor(
		@InjectModel(Collection.name)
		private readonly collection_repository: Model<Collection>,
	) {
		super(collection_repository);
	}
}
