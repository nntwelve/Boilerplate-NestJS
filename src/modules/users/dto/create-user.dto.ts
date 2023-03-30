import { Type } from 'class-transformer';
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsStrongPassword,
	MaxLength,
	ValidateNested,
} from 'class-validator';
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
	@ValidateNested()
	@Type(() => CreateAddressDto)
	address?: CreateAddressDto;
}
