import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private readonly users_service: UsersService) {}

	@Post()
	create(@Body() create_user_dto: CreateUserDto) {
		console.log(create_user_dto);
		return this.users_service.create(create_user_dto);
	}

	@Get()
	findAll() {
		return this.users_service.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.users_service.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() update_user_dto: UpdateUserDto) {
		return this.users_service.update(id, update_user_dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.users_service.remove(id);
	}
}
