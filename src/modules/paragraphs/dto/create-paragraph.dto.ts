import { Type } from 'class-transformer';
import {
	Allow,
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	MaxLength,
	MinLength,
	ValidateNested,
} from 'class-validator';
import { Sentence } from '../entities/sentence.entity';
import { User } from '@modules/users/entities/user.entity';
import { CreateSentencesDto } from './create-sentence.dto';

export class CreateParagraphDto {
	@IsNotEmpty()
	@MaxLength(100)
	@MinLength(1)
	title: string;

	@IsNotEmpty()
	@MaxLength(2000)
	@MinLength(1)
	content: string;

	@Allow()
	image?: string;

	@Allow()
	sound?: string;

	@IsNotEmpty()
	@MaxLength(2000)
	@MinLength(1)
	meaning: string;

	@IsOptional()
	@MaxLength(2000)
	@MinLength(1)
	pronunciation?: string;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(100)
	// @ValidateNested({ each: true }) // <= Due to: Cannot convert undefined or null to object
	@Type(() => CreateSentencesDto)
	sentences?: CreateSentencesDto[];

	@IsOptional()
	@IsBoolean()
	is_public: boolean;

	user: User;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(100)
	topics?: string[];

	@IsOptional()
	collections?: string;
}
