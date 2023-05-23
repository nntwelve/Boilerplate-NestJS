import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './entities/topic.entity';
import { TopicsRepository } from '@repositories/topics.repository';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
	],
	controllers: [TopicsController],
	providers: [
		TopicsService,
		{
			provide: 'TopicsRepositoryInterface',
			useClass: TopicsRepository,
		},
	],
	exports: [TopicsService],
})
export class TopicsModule {}
