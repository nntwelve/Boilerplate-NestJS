import * as path from 'path';
import * as fs from 'fs/promises';
import { Injectable } from '@nestjs/common';
import { UploadFileServiceAbstract } from './upload-file.abstract.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadFileToLocalServer implements UploadFileServiceAbstract {
	constructor(private readonly config_service: ConfigService) {}
	async uploadFile(
		file_path: string,
		{ file, file_name }: { file: Express.Multer.File; file_name: string },
	) {
		await fs.writeFile(
			path.join(__dirname, `../../../../files/${file_path}/${file_name}`),
			file.buffer,
			{
				encoding: 'utf8',
				flag: 'w',
				mode: 0o666,
			},
		);

		return `${this.config_service.get('FILE_PATH')}/${file_path}/${file_name}`;
	}
}
