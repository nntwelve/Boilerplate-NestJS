import { Test, TestingModule } from '@nestjs/testing';
import { ParagraphsService } from './paragraphs.service';

describe('ParagraphsService', () => {
	let service: ParagraphsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ParagraphsService],
		}).compile();

		service = module.get<ParagraphsService>(ParagraphsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
