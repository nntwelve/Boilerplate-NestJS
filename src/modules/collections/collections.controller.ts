import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('collections')
@ApiTags('collections')
export class CollectionsController {
	constructor(private readonly collections_service: CollectionsService) {}

	@Post()
	create(@Body() create_collection_dto: CreateCollectionDto) {
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
