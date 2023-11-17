import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { Paragraph } from '../entities/paragraph.entity';
import { AddHighlightContentParagraphDto } from '../dto/update-paragraph.dto';

export interface ParagraphsRepositoryInterface
	extends BaseRepositoryInterface<Paragraph> {
	addHighlight(id: string, dto: AddHighlightContentParagraphDto);
}
