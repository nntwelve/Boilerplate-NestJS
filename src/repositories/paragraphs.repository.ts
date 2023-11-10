import {
	Paragraph,
	ParagraphDocument,
} from '@modules/paragraphs/entities/paragraph.entity';
import { ParagraphsRepositoryInterface } from '@modules/paragraphs/interfaces/paragraphs.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';

@Injectable()
export class ParagraphsRepository
	extends BaseRepositoryAbstract<ParagraphDocument>
	implements ParagraphsRepositoryInterface
{
	constructor(
		@InjectModel(Paragraph.name)
		private readonly paragraph_model: Model<ParagraphDocument>,
	) {
		super(paragraph_model);
	}
}
