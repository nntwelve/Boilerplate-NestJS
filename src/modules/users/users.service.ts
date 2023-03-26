import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepositoryInterface } from './interfaces/users.interface';

@Injectable()
export class UsersService {
	constructor(
		@Inject('UserRepositoryInterface')
		private readonly users_repository: UserRepositoryInterface,
	) {}
	async create(createUserDto: CreateUserDto) {
		return await this.users_repository.create(createUserDto);
	}

	async findAll() {
		return await this.users_repository.findAll();
	}

	async findOne(id: string) {
		return await this.users_repository.findOneById(id);
	}

	async update(id: string, update_user_dto: UpdateUserDto) {
		return await this.users_repository.update(id, update_user_dto);
	}

	async remove(id: string) {
		return await this.users_repository.softDelete(id);
	}
}
