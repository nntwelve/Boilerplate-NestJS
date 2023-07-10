import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('image:optimize', {
	concurrency: 10,
	// lockDuration: 3000,
	limiter: {
		max: 2,
		duration: 60000,
	},
})
export class ImageOptimizationProcessor extends WorkerHost {
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
			case 'optimize-size':
				const optimzied_image = await this.optimizeImage(job.data.file);
				this.logger.log('DONE');
				return optimzied_image;

			default:
				throw new Error('No job name match');
		}
	}

	async optimizeImage(image: unknown) {
		return await new Promise((resolve) =>
			setTimeout(() => resolve(image), 5000),
		);
	}
}
