import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';

@Injectable()
export class FlashCardsService {
	/**
	 *
	 */
	create(createFlashCardDto: CreateFlashCardDto) {
		return 'This action adds a new flashCard';
	}

	async findAll() {
		return `This action returns all flashCards`;
	}

	findOne(id: number) {
		return `This action returns a #${id} flashCard`;
	}

	update(id: number, updateFlashCardDto: UpdateFlashCardDto) {
		return `This action updates a #${id} flashCard`;
	}

	remove(id: number) {
		return `This action removes a #${id} flashCard`;
	}
}
