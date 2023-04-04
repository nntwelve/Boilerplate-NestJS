import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
export class TopicsController {
	constructor(private readonly topicsService: TopicsService) {}

	@Post()
	create(@Body() createTopicDto: CreateTopicDto) {
		return this.topicsService.create(createTopicDto);
	}

	@Get()
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
