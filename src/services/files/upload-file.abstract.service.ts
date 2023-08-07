export abstract class UploadFileServiceAbstract {
	abstract uploadFileToPublicBucket(
		path: string,
		{ file, file_name }: { file: Express.Multer.File; file_name: string },
	): Promise<{ url: string; key: string }>;

	abstract deleteFileFromPublicBucket(key: string): Promise<void>;
}
