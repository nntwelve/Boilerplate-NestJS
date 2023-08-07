import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// INNER
import { UploadFileServiceAbstract } from './upload-file.abstract.service';

@Injectable()
export class UploadFileServiceS3 implements UploadFileServiceAbstract {
	private s3_client: S3Client;
	constructor(private readonly config_service: ConfigService) {
		this.s3_client = new S3Client({
			region: config_service.get('AWS_S3_REGION'),
			credentials: {
				accessKeyId: config_service.get('AWS_S3_ACCESS_KEY_ID'),
				secretAccessKey: config_service.get('AWS_S3_SECRET_ACCESS_KEY'),
			},
		});
	}
	async uploadFileToPublicBucket(
		path: string,
		{ file, file_name }: { file: Express.Multer.File; file_name: string },
	) {
		const bucket_name = this.config_service.get('AWS_S3_PUBLIC_BUCKET');
		const key = `${path}/${Date.now().toString()}-${file_name}`;

		// COUNTING TIME
		console.time('count');

		/* OPTION 1: Normal upload using PutObjectCommand
		await this.s3_client.send(
			new PutObjectCommand({
				Bucket: bucket_name,
				Key: key,
				Body: file.buffer,
				ACL: 'public-read',
				ContentType: file.mimetype,
				ContentLength: file.size, // calculate length of buffer
				// BucketKeyEnabled: true,
			}),
		);
		*/

		/* OPTION 2: Multipart upload using @aws-sdk/lib-storage lib */
		const parallel_upload_s3 = new Upload({
			client: this.s3_client,
			params: {
				Bucket: bucket_name,
				Key: key,
				Body: Buffer.from(file.buffer),
				ACL: 'public-read',
				ContentType: file.mimetype,
			},

			// tags: [
			// 	/*...*/
			// ], // optional tags
			queueSize: 4, // optional concurrency configuration
			partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
			leavePartsOnError: false, // optional manually handle dropped parts
		});

		parallel_upload_s3.on('httpUploadProgress', (progress) => {
			console.log({ progress });
		});

		await parallel_upload_s3.done();
		// END COUNTING TIME
		console.timeEnd('count');

		return {
			url: `https://${bucket_name}.s3.amazonaws.com/${key}`,
			key,
		};
	}

	async deleteFileFromPublicBucket(key: string): Promise<void> {
		await this.s3_client.send(
			new DeleteObjectCommand({
				Bucket: this.config_service.get('AWS_S3_PUBLIC_BUCKET'),
				Key: key,
			}),
		);
	}

	/* WORTH FOR THE CASE WE DONT WANT CONFIG BUCKET LIFECYCLE IN THE AWS CONSOLE
	async configBucketLifeCycle() {
		const params: PutBucketLifecycleConfigurationCommandInput = {
			Bucket: this.config_service.get('AWS_S3_PUBLIC_BUCKET'),
			LifecycleConfiguration: {
				Rules: [
					{
						Expiration: {
							Days: 30,
						},
						Filter: {
							// Prefix: 'prefix',
							// Prefix: 
						},
						Status: 'Enabled',
					},
				],
			},
		};

		const command = new PutBucketLifecycleConfigurationCommand(params);
		await this.s3_client.send(command);
	}
	*/
}
