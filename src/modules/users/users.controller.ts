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
	UploadedFiles,
	Query,
	ParseIntPipe,
	Req,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

// INNER
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';

// OUTER
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { RequestWithUser } from 'src/types/requests.type';
import { PERIOD_TYPE } from '@modules/daily-check-in/dto/get-daily-check-in.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth('token')
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
	@ApiDocsPagination(User.name)
	@Roles(USER_ROLE.USER)
	@UseGuards(RolesGuard)
	@UseGuards(JwtAccessTokenGuard)
	findAll(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
	) {
		return this.users_service.findAll({}, { offset, limit });
	}

	@Get('daily-check-in')
	@UseGuards(JwtAccessTokenGuard)
	async getCheckInData(
		@Req() request: RequestWithUser,
		@Query('type') type: PERIOD_TYPE,
		@Query('year') year: string,
	) {
		return await this.users_service.getCheckInData(
			request.user._id.toString(),
			{ type, year },
		);
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return await this.users_service.findOne(id);
	}

	@Post('student-cards')
	@ApiOperation({
		summary: 'Admin create topic',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				student_card_front: {
					type: 'string',
					format: 'binary',
				},
				student_card_back: {
					type: 'string',
					format: 'binary',
				},
				live_photos: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
			},
			required: ['student_card_front', 'student_card_back', 'live_photos'],
		},
	})
	@UseInterceptors(AnyFilesInterceptor())
	updateStudentCard(@UploadedFiles() files: Array<Express.Multer.File>) {
		console.log(files);
		return files.map((file) => file.originalname);
	}

	@Post('daily-check-in')
	@UseGuards(JwtAccessTokenGuard)
	updateDailyCheckIn(@Req() { user }: RequestWithUser) {
		return this.users_service.updateDailyCheckIn(user, new Date());
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
