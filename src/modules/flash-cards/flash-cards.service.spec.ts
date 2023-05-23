import { Test, TestingModule } from '@nestjs/testing';
import { FlashCardsService } from './flash-cards.service';

describe('FlashCardsService', () => {
	let service: FlashCardsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FlashCardsService],
		}).compile();

		service = module.get<FlashCardsService>(FlashCardsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
