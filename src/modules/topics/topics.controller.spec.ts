import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

describe('TopicsController', () => {
	let controller: TopicsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TopicsController],
			providers: [TopicsService],
		}).compile();

		controller = module.get<TopicsController>(TopicsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
