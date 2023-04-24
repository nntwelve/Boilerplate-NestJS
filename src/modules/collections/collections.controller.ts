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
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiQuery,
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
	@ApiQuery({
		name: 'offset',
		type: Number,
		examples: {
			'0': {
				value: 0,
				description: 'Start from 0',
			},
			'10': {
				value: 10,
				description: `Skip 10 collection`,
			},
		},
	})
	@ApiQuery({
		name: 'limit',
		type: Number,
		examples: {
			'10': {
				value: 10,
				description: `Get 10 collection`,
			},
			'50': {
				value: 50,
				description: `Get 50 collection`,
			},
		},
	})
	@ApiQuery({
		name: 'level',
		type: 'array',
		examples: {
			one_level_type: {
				value: [COLLECTION_LEVEL.HARD],
			},
			two_level_type: {
				value: [COLLECTION_LEVEL.EASY, COLLECTION_LEVEL.MEDIUM],
			},
		},
		required: false,
	})
	findAll(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('level') level: string[],
	) {
		if (level && typeof level === 'string') {
			level = [level];
		}
		console.log({ level });
		return this.collections_service.findAll();
	}

	@Get(':id')
	@ApiParam({
		name: 'id',
		type: 'string',
		examples: {
			migration_id_1: {
				value: '644293b09150e9f67d9bb75d',
				description: `Collection Kitchen vocabulary`,
			},
			migration_id_2: {
				value: '6442941027467f9a755ff76d',
				description: `Collection Sport vocabulary`,
			},
		},
	})
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
