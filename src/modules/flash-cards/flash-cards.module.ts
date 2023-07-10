import { Module } from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { FlashCardsController } from './flash-cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashCard, FlashCardSchema } from './entities/flash-card.entity';
import { FlashCardsRepository } from '@repositories/flash-cards.repository';
import { BullModule } from '@nestjs/bullmq';
import { ImageOptimizationProcessor } from './queues/image-optimization.processor';
import { join } from 'path';
import { ImageVerificationProcessor } from './queues/image-verification.processtor';
import { ImageUploadingProcessor } from './queues/image-uploading.processor';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: FlashCard.name, schema: FlashCardSchema },
		]),
		BullModule.registerQueue({
			name: 'image:optimize',
			prefix: 'flash-cards',
			// processors: [ // Chúng ta vẫn có thể dùng sandboxed processor
			// 	{
			// 		concurrency: 1,
			// 		path: join(__dirname, 'flash-cards.sandbox-processor.js'),
			// 	},
			// ],
		}),
		BullModule.registerQueue({
			name: 'image:check-valid',
			prefix: 'flash-cards',
			// processors: [
			// 	{
			// 		concurrency: 1,
			// 		path: join(__dirname, 'flash-cards.sandbox-processor.js'),
			// 	},
			// ],
		}),
		BullModule.registerQueue({
			name: 'image:upload',
			prefix: 'flash-cards',
			// processors: [
			// 	{
			// 		concurrency: 1,
			// 		path: join(__dirname, 'flash-cards.sandbox-processor.js'),
			// 	},
			// ],
		}),
		BullModule.registerFlowProducer({
			name: 'image:upload',
			prefix: 'flash-cards',
		}),
	],
	controllers: [FlashCardsController],
	providers: [
		FlashCardsService,
		{
			provide: 'FlashCardsRepositoryInterface',
			useClass: FlashCardsRepository,
		},
		ImageOptimizationProcessor,
		ImageVerificationProcessor,
		ImageUploadingProcessor,
	],
})
export class FlashCardsModule {}
