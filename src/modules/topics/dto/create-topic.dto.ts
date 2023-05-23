import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTopicDto {
	@IsNotEmpty()
	name: string;

	@IsOptional()
	description: string;
}
