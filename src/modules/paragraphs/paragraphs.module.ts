import { Module } from '@nestjs/common';
import { ParagraphsService } from './paragraphs.service';
import { ParagraphsController } from './paragraphs.controller';
import { ParagraphsRepository } from '@repositories/paragraphs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Paragraph, ParagraphSchema } from './entities/paragraph.entity';
import { UploadFileModule } from 'src/services/files/upload-files/upload-file.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Paragraph.name, schema: ParagraphSchema },
		]),
		UploadFileModule,
	],
	controllers: [ParagraphsController],
	providers: [
		ParagraphsService,
		{
			provide: 'ParagraphsRepositoryInterface',
			useClass: ParagraphsRepository,
		},
	],
})
export class ParagraphsModule {}
