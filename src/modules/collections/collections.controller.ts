import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { COLLECTION_LEVEL } from './entities/collection.entity';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RequestWithUser } from 'src/types/requests.type';

@Controller('collections')
@ApiTags('collections')
export class CollectionsController {
	constructor(private readonly collections_service: CollectionsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their collection',
	})
	@ApiBearerAuth('token')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				name: {
					type: 'string',
					default: 'Learn Kitchen Vocabulary',
				},
				description: { type: 'string', default: 'Some description' },
				level: {
					type: 'string',
					enum: Object.values(COLLECTION_LEVEL),
					default: COLLECTION_LEVEL.CHAOS,
				},
				is_public: {
					type: 'boolean',
					default: true,
				},
				image: {
					type: 'string',
					format: 'binary',
				},
			},
			required: ['name', 'level', 'is_public', 'image'],
		},
	})
	@UseInterceptors(FileInterceptor('image'))
	@UseGuards(JwtAccessTokenGuard)
	create(
		@Req() request: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
		@Body() create_collection_dto: CreateCollectionDto,
	) {
		console.log(image);
		return this.collections_service.create({
			...create_collection_dto,
			user: request.user,
			image: image.originalname,
		});
	}

	@Get()
	findAll() {
		return this.collections_service.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.collections_service.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() update_collection_dto: UpdateCollectionDto,
	) {
		return this.collections_service.update(id, update_collection_dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.collections_service.remove(id);
	}
}
