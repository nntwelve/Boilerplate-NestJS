import { Module } from '@nestjs/common';
import { UploadFileServiceAbstract } from './upload-file.abstract.service';
import { UploadFileToLocalServer } from './upload-file.service';

@Module({
	providers: [
		{
			provide: UploadFileServiceAbstract,
			useClass: UploadFileToLocalServer,
		},
	],
	exports: [UploadFileServiceAbstract],
})
export class UploadFileModule {}
