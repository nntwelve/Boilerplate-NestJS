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
	Req,
	UseGuards,
} from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/requests.type';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';

@Controller('flash-cards')
@ApiTags('flash-cards')
export class FlashCardsController {
	constructor(private readonly flash_cards_service: FlashCardsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their new flash card',
	})
	@ApiBearerAuth('token')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				vocabulary: {
					type: 'string',
					default: 'provision',
				},
				definition: {
					type: 'string',
					default: 'the action of providing or supplying something for use.',
				},
				meaning: {
					type: 'string',
					default: 'sự cung cấp',
				},
				pronunciation: {
					type: 'string',
					default: 'prəˈviZHən',
				},
				examples: {
					type: 'array',
					items: {
						type: 'string',
						default: '',
					},
					default: [
						'new contracts for the provision of services',
						'low levels of social provision',
						'civilian contractors were responsible for provisioning these armies',
					],
				},
				image: {
					type: 'string',
					format: 'binary',
				},
			},
			required: ['vocabulary', 'definition', 'meaning', 'image'],
		},
	})
	@UseInterceptors(FileInterceptor('image'))
	@UseGuards(JwtAccessTokenGuard)
	create(
		@Req() request: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
		@Body() create_flash_card_dto: CreateFlashCardDto,
	) {
		console.log(create_flash_card_dto.examples);
		return this.flash_cards_service.create({
			...create_flash_card_dto,
			user: request.user,
			image: image.originalname,
		});
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
