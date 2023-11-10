import { Test, TestingModule } from '@nestjs/testing';
import { ParagraphsController } from './paragraphs.controller';
import { ParagraphsService } from './paragraphs.service';

describe('ParagraphsController', () => {
	let controller: ParagraphsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ParagraphsController],
			providers: [ParagraphsService],
		}).compile();

		controller = module.get<ParagraphsController>(ParagraphsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
