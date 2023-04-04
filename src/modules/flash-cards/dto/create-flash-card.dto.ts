import { User } from '@modules/users/entities/user.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFlashCardDto {
	@IsNotEmpty()
	vocabulary: string;

	@IsNotEmpty()
	image: string;

	@IsNotEmpty()
	definition: string;

	@IsNotEmpty()
	meaning: string;

	@IsOptional()
	pronunciation: string;

	@IsNotEmpty()
	user?: User;
}
