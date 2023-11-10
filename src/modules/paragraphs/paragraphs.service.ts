import { Inject, Injectable } from '@nestjs/common';
import { CreateParagraphDto } from './dto/create-paragraph.dto';
import { UpdateParagraphDto } from './dto/update-paragraph.dto';
import { User } from '@modules/users/entities/user.entity';
import { ParagraphsRepositoryInterface } from './interfaces/paragraphs.interface';
import { UploadFileServiceAbstract } from 'src/services/files/upload-files/upload-file.abstract.service';

@Injectable()
export class ParagraphsService {
	constructor(
		@Inject('ParagraphsRepositoryInterface')
		private readonly paragraphs_repository: ParagraphsRepositoryInterface,
		private readonly upload_files_service: UploadFileServiceAbstract,
	) {}
	async create(
		user: User,
		files: Array<Express.Multer.File>,
		create_paragraph_dto: CreateParagraphDto,
	) {
		const detach_files = files.reduce((result, curr) => {
			if (curr.fieldname === 'sound')
				return {
					...result,
					sound_file: curr,
				};
			else if (curr.fieldname === 'image')
				return {
					...result,
					image_file: curr,
				};
			return result;
		}, {} as { sound_file: Express.Multer.File; image_file?: Express.Multer.File });
		const sound_url = await this.upload_files_service.uploadFile('sound', {
			file: detach_files.sound_file,
			file_name: `${create_paragraph_dto.title}.${
				detach_files.sound_file.originalname.split('.')[1]
			}`,
		});
		// Path where upload file service stored
		if (detach_files.image_file) {
			const image_url = await this.upload_files_service.uploadFile('image', {
				file: detach_files.image_file,
				file_name: `${create_paragraph_dto.title}.${
					detach_files.image_file.originalname.split('.')[1]
				}`,
			});
			return await this.paragraphs_repository.create({
				...create_paragraph_dto,
				user,
				sound: sound_url,
				image: image_url,
			});
		}
		return await this.paragraphs_repository.create({
			...create_paragraph_dto,
			user,
			sound: sound_url,
		});
	}

	async findAll() {
		return await this.paragraphs_repository.findAll({});
	}

	findOne(id: number) {
		return `This action returns a #${id} paragraph`;
	}

	update(id: number, updateParagraphDto: UpdateParagraphDto) {
		return `This action updates a #${id} paragraph`;
	}

	remove(id: number) {
		return `This action removes a #${id} paragraph`;
	}
}
