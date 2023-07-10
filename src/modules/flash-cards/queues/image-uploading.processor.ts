import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FlashCardsService } from '../flash-cards.service';

@Processor('image:upload', {
	concurrency: 10,
	// lockDuration: 3000,
	limiter: {
		max: 2,
		duration: 60000,
	},
})
export class ImageUploadingProcessor extends WorkerHost {
	constructor(private readonly flash_cards_service: FlashCardsService) {
		super();
	}
	private logger = new Logger();
	@OnWorkerEvent('active')
	onQueueActive(job: Job) {
		this.logger.log(`Job has been started: ${job.id}!`);
	}

	@OnWorkerEvent('completed')
	onQueueComplete(job: Job, result: any) {
		this.logger.log(`Job has been finished: ${job.id}`);
	}

	@OnWorkerEvent('failed')
	onQueueFailed(job: Job, err: any) {
		this.logger.log(`Job has been failed: ${job.id}`);
		this.logger.error(err);
	}

	@OnWorkerEvent('error')
	onQueueError(err: any) {
		this.logger.log(`Job has got error: `);
		this.logger.error(err);
	}

	@OnWorkerEvent('stalled')
	onQueueStalled(job: Job) {
		this.logger.log(`Job has been stalled: ${job.id}`);
	}

	async process(job: Job<any, any, string>, token?: string): Promise<any> {
		switch (job.name) {
			case 'uploading-image':
				const children_results = await job.getChildrenValues();
				let optimzied_image;

				for (const property in children_results) {
					if (property.includes('image:optimize')) {
						optimzied_image = children_results[property];
						break;
					}
				}

				const uploaded_image = await this.uploadingImageToS3(optimzied_image);
				const uploaded = await this.flash_cards_service.update(job.data.id, {
					image: `image_url_from_s3_${uploaded_image.originalname}`,
				});
				return uploaded;
			default:
				throw new Error('No job name match');
		}
	}

	async uploadingImageToS3(
		image: Express.Multer.File,
	): Promise<Express.Multer.File> {
		this.logger.log('Start uploading image to S3...');
		return await new Promise((resolve) =>
			setTimeout(() => resolve(image), 5000),
		);
	}
}
