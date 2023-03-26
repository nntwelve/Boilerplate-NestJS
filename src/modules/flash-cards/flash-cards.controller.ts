import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';

@Controller('flash-cards')
export class FlashCardsController {
	constructor(private readonly flashCardsService: FlashCardsService) {}

	@Post()
	create(@Body() createFlashCardDto: CreateFlashCardDto) {
		return this.flashCardsService.create(createFlashCardDto);
	}

	@Get()
	findAll() {
		return this.flashCardsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.flashCardsService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateFlashCardDto: UpdateFlashCardDto,
	) {
		return this.flashCardsService.update(+id, updateFlashCardDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.flashCardsService.remove(+id);
	}
}
