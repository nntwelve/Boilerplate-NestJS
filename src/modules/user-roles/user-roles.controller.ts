import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('user-roles')
export class UserRolesController {
	constructor(private readonly user_roles_service: UserRolesService) {}

	@Post()
	create(@Body() create_user_role_dto: CreateUserRoleDto) {
		return this.user_roles_service.create(create_user_role_dto);
	}

	@Get()
	findAll() {
		return this.user_roles_service.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.user_roles_service.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() update_user_role_dto: UpdateUserRoleDto,
	) {
		return this.user_roles_service.update(id, update_user_role_dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.user_roles_service.remove(id);
	}
}
