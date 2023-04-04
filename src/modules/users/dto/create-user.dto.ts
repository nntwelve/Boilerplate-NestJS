import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsStrongPassword,
	MaxLength,
	ValidateNested,
} from 'class-validator';
import { TOPIC } from '../entities/user.entity';
import { CreateAddressDto } from './create-address.dto';

export class CreateUserDto {
	@IsNotEmpty()
	@MaxLength(50)
	first_name: string;

	@IsNotEmpty()
	@MaxLength(50)
	last_name: string;

	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MaxLength(50)
	username: string;

	@IsNotEmpty()
	@IsStrongPassword()
	password: string;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateAddressDto)
	address?: CreateAddressDto[];

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@IsEnum(TOPIC, { each: true })
	interested_topics: TOPIC[];
}