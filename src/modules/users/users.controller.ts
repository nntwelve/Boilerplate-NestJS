import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	SerializeOptions,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
	constructor(private readonly users_service: UsersService) {}

	@Post()
	@ApiOperation({
		summary: 'Admin create new user',
		description: `
* Only admin can use this API

* Admin create user and give some specific information`,
	})
	create(@Body() create_user_dto: CreateUserDto) {
		return this.users_service.create(create_user_dto);
	}

	@SerializeOptions({
		excludePrefixes: ['first', 'last'],
	})
	@Get()
	@Roles(USER_ROLE.USER)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	findAll() {
		return this.users_service.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return await this.users_service.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() update_user_dto: UpdateUserDto) {
		return this.users_service.update(id, update_user_dto);
	}

	@Delete(':id')
	@Roles(USER_ROLE.ADMIN)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	remove(@Param('id') id: string) {
		return this.users_service.remove(id);
	}
}
