import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { CommentRepository } from '@repositories/comments.repository';
import { FlashCardsModule } from '@modules/flash-cards/flash-cards.module';
import { CollectionsModule } from '@modules/collections/collections.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
		FlashCardsModule,
		CollectionsModule,
	],
	controllers: [CommentsController],
	providers: [
		CommentsService,
		{
			provide: 'CommentsRepositoryInterface',
			useClass: CommentRepository,
		},
	],
})
export class CommentsModule {}
