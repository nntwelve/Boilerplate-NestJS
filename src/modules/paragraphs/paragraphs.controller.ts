import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	UploadedFiles,
	Req,
	ParseFilePipe,
	FileTypeValidator,
	MaxFileSizeValidator,
} from '@nestjs/common';
import { ParagraphsService } from './paragraphs.service';
import { CreateParagraphDto } from './dto/create-paragraph.dto';
import {
	AddHighlightContentParagraphDto,
	UpdateParagraphDto,
} from './dto/update-paragraph.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { CreateSentencesDto } from './dto/create-sentence.dto';
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array-conversion.interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/requests.type';
import { ParseMongoIdPipe } from 'src/pipes/parse-mongo-id.pipe';

@Controller('paragraphs')
@ApiTags('paragraphs')
export class ParagraphsController {
	constructor(private readonly paragraphs_service: ParagraphsService) {}

	@Post()
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@ApiConsumes('multipart/form-data')
	// @UseInterceptors(new SwaggerArrayConversion('sentences'))
	@UseInterceptors(AnyFilesInterceptor())
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				title: {
					type: 'string',
					default: 'Clothes',
				},
				content: {
					type: 'string',
					default:
						"I love clothes! I think people buy them for different reasons, like to look good, feel confident, or express their style. Wearing certain clothes can make us feel like a different person or give us confidence. I think clothes can also help define who we are. Some people like wearing brands because it makes them feel like they're part of a certain group or lifestyle.",
				},
				meaning: {
					type: 'string',
					default:
						'Tôi yêu quần áo! Tôi nghĩ mọi người mua chúng vì những lý do khác nhau, thích trông đẹp hơn, cảm thấy tự tin hoặc thể hiện phong cách của họ. Mặc một số quần áo nhất định có thể khiến chúng ta cảm thấy như một người khác hoặc cho chúng ta sự tự tin. Tôi nghĩ rằng quần áo cũng có thể giúp xác định chúng ta là ai. Một số người thích mặc thương hiệu vì nó khiến họ cảm thấy như họ là một phần của một nhóm người nào đó hoặc lối sống nhất định.',
				},
				pronunciation: {
					type: 'string',
					default:
						'aɪ lʌv kloʊðz aɪ θɪŋk ˈpiː.pəl baɪ ðem fɔːr ˈdɪf.ɚ.ənt ˈriːzənz laɪk tə lʊk ɡʊd fiːl ˈkɑːn.fə.dənt ɔːr ɪkˈspres ðer staɪl. ˈwer.ɪŋ ˈsɝː.t(ə)n kloʊðz kæn meɪk ʌs fiːl laɪk ə ˈdɪf.ɚ.ənt ˈpɝː.sən ɔːr ɡɪv ʌs ˈkɑːn.fə.dəns. aɪ θɪŋk kloʊðz kæn ˈɑːl.soʊ help dɪˈfaɪn huː wiː ɑːr. sʌm ˈpiː.pəl laɪk ˈwer.ɪŋ --- bɪˈkəz ɪt meɪks ðem fiːl laɪk ðer pɑːrt əv ə ˈsɝː.t(ə)n ɡruːp ɔːr ˈlaɪf.staɪl',
				},
				// 'sentences[]': {
				// 	type: 'array',
				// 	items: {
				// 		type: 'object',
				// 		default: '',
				// 	},
				// 	default: [
				// 		{
				// 			content:
				// 				'I love clothes! I think people buy them for different reasons, like to look good, feel confident, or express their style.',
				// 			meaning:
				// 				'Tôi yêu quần áo! Tôi nghĩ mọi người mua chúng vì những lý do khác nhau, thích trông đẹp hơn, cảm thấy tự tin hoặc thể hiện phong cách của họ.',
				// 			pronunciation:
				// 				'aɪ lʌv kloʊðz aɪ θɪŋk ˈpiː.pəl baɪ ðem fɔːr ˈdɪf.ɚ.ənt ˈriːzənz laɪk tə lʊk ɡʊd fiːl ˈkɑːn.fə.dənt ɔːr ɪkˈspres ðer staɪl',
				// 		} as CreateSentencesDto,
				// 	],
				// },
				reference_link: {
					type: 'string',
					default:
						'https://www.youtube.com/watch?v=RZQKle7mpu4&list=PLaG_Jgg6K_D4JZ1x20CC3o3uumValouIG&index=25',
				},
				image: {
					type: 'string',
					format: 'binary',
				},
				sound: {
					type: 'string',
					format: 'binary',
				},
			},
			required: ['title', 'content', 'meaning', 'sound'],
		},
	})
	create(
		@Req() req: RequestWithUser,
		@Body() create_paragraph_dto: CreateParagraphDto,
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 8 * 1048576 }), // 30MB (measured in bytes)
					new FileTypeValidator({
						fileType: /(image\/(jpg|jpeg|png|heic))|(audio\/(mp3|mpeg))$/,
					}),
				],
			}),
		)
		files: Array<Express.Multer.File>,
	) {
		return this.paragraphs_service.create(
			req.user,
			files,
			create_paragraph_dto,
		);
	}

	@Get()
	findAll() {
		return this.paragraphs_service.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.paragraphs_service.findOne(+id);
	}

	@Post(':id/highlight')
	@ApiOperation({
		summary: 'Add highlight content to paragraph',
	})
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	@ApiConsumes('multipart/form-data')
	@UseInterceptors(AnyFilesInterceptor())
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				content: {
					type: 'string',
					default: 'Define who we are',
				},
				meaning: {
					type: 'string',
					default: 'Khẳng định bản thân',
				},
				pronunciation: {
					type: 'string',
					default: 'dɪˈfaɪn huː wiː ɑː',
				},
				image: {
					type: 'string',
					format: 'binary',
				},
				sound: {
					type: 'string',
					format: 'binary',
				},
				flash_card: {
					type: 'string',
				},
			},
			required: ['content', 'meaning'],
		},
	})
	update(
		@Req() req: RequestWithUser,
		@Param('id', ParseMongoIdPipe) id: string,
		@Body() add_highlight_dto: AddHighlightContentParagraphDto,
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 8 * 1048576 }), // 30MB (measured in bytes)
					new FileTypeValidator({
						fileType: /(image\/(jpg|jpeg|png|heic))|(audio\/(mp3|mpeg))$/,
					}),
				],
				fileIsRequired: false,
			}),
		)
		files: Array<Express.Multer.File>,
	) {
		return this.paragraphs_service.update(
			req.user,
			{ ...add_highlight_dto, id },
			files,
		);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.paragraphs_service.remove(+id);
	}
}
