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
	constructor(private readonly flash_cards_service: FlashCardsService) {}

	@Post()
	create(@Body() create_flash_card_dto: CreateFlashCardDto) {
		return this.flash_cards_service.create(create_flash_card_dto);
	}

	@Get()
	findAll() {
		return this.flash_cards_service.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.flash_cards_service.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() update_flash_card_dto: UpdateFlashCardDto,
	) {
		return this.flash_cards_service.update(id, update_flash_card_dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.flash_cards_service.remove(id);
	}
}
