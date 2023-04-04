import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
	let service: TopicsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TopicsService],
		}).compile();

		service = module.get<TopicsService>(TopicsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
