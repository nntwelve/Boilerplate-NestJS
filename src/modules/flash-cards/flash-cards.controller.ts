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
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/requests.type';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array-conversion.interceptor';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { FlashCard } from './entities/flash-card.entity';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { generateNextKey } from 'src/shared/utils/pagination';

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
				'examples[]': {
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
	@UseInterceptors(new SwaggerArrayConversion('examples'))
	@UseInterceptors(FileInterceptor('image'))
	@UseGuards(JwtAccessTokenGuard)
	create(
		@Req() request: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
		@Body() create_flash_card_dto: CreateFlashCardDto,
	) {
		return this.flash_cards_service.createFlashCard(
			{
				...create_flash_card_dto,
				user: request.user,
			},
			image,
		);
	}

	@Get()
	@UseInterceptors(LoggingInterceptor)
	@ApiDocsPagination(FlashCard.name)
	findAll(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
	) {
		return this.flash_cards_service.findAll({}, { offset, limit });
	}

	@Get('keyset-pagination')
	@ApiQuery({ name: 'last_id', required: false })
	@ApiQuery({ name: 'last_vocabulary', required: false })
	@ApiQuery({ name: 'search', required: false })
	@ApiQuery({ name: 'offset', required: false })
	@UseInterceptors(LoggingInterceptor)
	async findAllUsingKeyset(
		@Query('search') search: string,
		@Query('last_id') last_id: string,
		@Query('last_vocabulary') last_vocabulary: string,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('offset') offset: number,
	) {
		if (offset) {
			const { count, items } = await this.flash_cards_service.findAll(
				{ search },
				{ offset, limit },
			);
			return {
				count,
				items,
				next_key: generateNextKey(items, ['vocabulary', 'meaning']),
			};
		}
		return this.flash_cards_service.findAllUsingKeysetPagination(
			{ search },
			{ last_id, last_vocabulary },
			{ limit },
		);
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

	@Patch('queue/state')
	@ApiQuery({
		name: 'state',
		enum: ['PAUSE', 'RESUME'],
	})
	pauseOrResumeQueue(@Query('state') state: string) {
		return this.flash_cards_service.pauseOrResumeQueue(state);
	}

	@Post('seed-data')
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	seedFlashCards(@Req() { user }: RequestWithUser) {
		return this.flash_cards_service.seedData(user);
	}
}
