import { PartialType } from '@nestjs/mapped-types';
import { CreateParagraphDto } from './create-paragraph.dto';
import { Allow, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from '@modules/users/entities/user.entity';

export class UpdateParagraphDto extends PartialType(CreateParagraphDto) {}

export class AddHighlightContentParagraphDto {
	@IsNotEmpty()
	content: string;

	@IsNotEmpty()
	meaning: string;

	@Allow()
	sound?: string;

	@Allow()
	image?: string;

	@IsOptional()
	pronunciation?: string;

	@IsOptional()
	example?: string;

	@IsOptional()
	@IsMongoId()
	flash_card: unknown;

	id: string;

	created_by: User;
}
