import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	Req,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { COMMENT_TYPE, Comment } from './entities/comment.entity';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from 'src/types/requests.type';
import { SORT_TYPE } from 'src/types/common.type';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { ParseMongoIdPipe } from 'src/pipes/parse-mongo-id.pipe';

@Controller('comments')
@ApiTags('comments')
@ApiBearerAuth('token')
export class CommentsController {
	constructor(private readonly comments_service: CommentsService) {}

	@Post()
	@UseGuards(JwtAccessTokenGuard)
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				target_id: {
					type: 'string',
					default: '64ab87fab9e86239671aded7',
				},
				content: {
					type: 'string',
					default: 'Comment 1.1',
				},
				comment_type: {
					type: 'string',
					default: COMMENT_TYPE.FLASH_CARD,
				},
			},
			required: ['target_id', 'content', 'comment_type'],
		},
	})
	async create(
		@Req() { user }: RequestWithUser,
		@Body() create_comment_dto: CreateCommentDto,
	) {
		return await this.comments_service.create({
			...create_comment_dto,
			created_by: user._id,
		});
	}

	@Get()
	@ApiOperation({
		summary: 'Get comments of specific flash card/collection with pagination',
	})
	@ApiDocsPagination(Comment.name)
	@ApiQuery({
		name: 'sort_type',
		required: false,
		enum: SORT_TYPE,
	})
	async findAll(
		@Query('target_id') target_id: string,
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('sort_type') sort_type: SORT_TYPE,
	) {
		return this.comments_service.findAll(
			{ target_id },
			{ offset, limit, sort_type },
		);
	}

	@Get(':comment_id')
	@ApiOperation({
		summary: 'Get more sub comments of specific comments',
	})
	@ApiDocsPagination(Comment.name)
	@ApiQuery({
		name: 'sort_type',
		required: false,
		enum: SORT_TYPE,
	})
	async getMoreSubComments(
		@Param('comment_id', ParseMongoIdPipe) comment_id: string,
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('sort_type') sort_type: SORT_TYPE,
	) {
		return this.comments_service.getMoreSubComments(
			{
				parent_id: comment_id,
			},
			{
				offset,
				limit,
				sort_type,
			},
		);
	}
}
