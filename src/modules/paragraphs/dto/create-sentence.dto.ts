import {
	Allow,
	IsNotEmpty,
	IsOptional,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateSentencesDto {
	@IsNotEmpty()
	@MaxLength(2000)
	@MinLength(1)
	content: string;

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
}
