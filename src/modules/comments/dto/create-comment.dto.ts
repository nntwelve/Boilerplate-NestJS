import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	MaxLength,
	MinLength,
} from 'class-validator';
import { COMMENT_TYPE } from '../entities/comment.entity';
import { User } from '@modules/users/entities/user.entity';
import { ObjectId } from 'mongoose';

export class CreateCommentDto {
	@IsNotEmpty()
	@IsMongoId()
	target_id: string;

	@IsEnum(COMMENT_TYPE)
	comment_type: COMMENT_TYPE;

	@IsOptional()
	parent_id?: string | null;

	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(2000)
	content: string;

	created_by: User | string | ObjectId;

	parent_path?: string;
}
