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
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('collections')
@ApiTags('collections')
export class CollectionsController {
	constructor(private readonly collections_service: CollectionsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their collection',
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({})
	@UseInterceptors(FileInterceptor('image'))
	create(
		@UploadedFile() image: Express.Multer.File,
		@Body() create_collection_dto: CreateCollectionDto,
	) {
		return this.collections_service.create(create_collection_dto);
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
