import { IsEnum, IsOptional, MinLength } from 'class-validator';
import { USER_ROLE } from '../entities/user-role.entity';

export class CreateUserRoleDto {
	@IsEnum(USER_ROLE)
	name: USER_ROLE;

	@IsOptional()
	@MinLength(1)
	description: string;
}
