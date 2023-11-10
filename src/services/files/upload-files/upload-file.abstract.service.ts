export abstract class UploadFileServiceAbstract {
	abstract uploadFile(
		file_path: string,
		{ file, file_name }: { file: Express.Multer.File; file_name: string },
	);
}
