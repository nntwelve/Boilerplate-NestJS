import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UploadedFiles,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Public } from 'src/decorators/auth.decorator';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';
import { Topic } from './entities/topic.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';

@Controller('topics')
@ApiTags('topics')
// @UseGuards(JwtAccessTokenGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(Topic))
@UseInterceptors(LoggingInterceptor)
export class TopicsController {
	constructor(private readonly topicsService: TopicsService) {}

	@Post()
	@ApiOperation({
		summary: 'Admin create topic',
	})
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
				images: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
			},
			required: ['name', 'images'],
		},
	})
	@UseInterceptors(FilesInterceptor('images'))
	create(
		@UploadedFiles() images: Express.Multer.File,
		@Body() createTopicDto: CreateTopicDto,
	) {
		console.log(images);
		return this.topicsService.create(createTopicDto);
	}

	@Get()
	@Public()
	findAll() {
		return this.topicsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.topicsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
		return this.topicsService.update(id, updateTopicDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.topicsService.remove(id);
	}
}
