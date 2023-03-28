import { OmitType, PartialType } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsOptional,
	IsPhoneNumber,
	MaxDate,
	MaxLength,
} from 'class-validator';
import { GENDER } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';
// import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(
	OmitType(CreateUserDto, ['email', 'password', 'username'] as const),
) {
	// export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsOptional()
	@IsPhoneNumber()
	phone_number?: string;

	@IsOptional()
	@IsDateString()
	date_of_birth?: Date;

	@IsOptional()
	@IsEnum(GENDER)
	gender?: string;

	@IsOptional()
	@MaxLength(200)
	headline?: string;
}
