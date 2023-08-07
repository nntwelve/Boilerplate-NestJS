import { PublicFile } from '@modules/shared/upload-files/public-files.entity';
import { User } from '@modules/users/entities/user.entity';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFlashCardDto {
	@IsNotEmpty()
	vocabulary: string;

	image: PublicFile;

	@IsNotEmpty()
	definition: string;

	@IsNotEmpty()
	meaning: string;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	examples?: string[];

	@IsOptional()
	pronunciation: string;

	// @IsNotEmpty()
	user?: User;
}
