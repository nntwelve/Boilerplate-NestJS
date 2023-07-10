import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('image:check-valid', {
	concurrency: 10,
	// lockDuration: 3000,
	limiter: {
		max: 2,
		duration: 60000,
	},
})
export class ImageVerificationProcessor extends WorkerHost {
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
		console.log('Comminggg');
		switch (job.name) {
			case 'check-term':
				return await this.checkTerm(job.data);
			case 'check-policy':
				return await this.checkPolicy(job.data);

			default:
				throw new Error('No job name match');
		}
	}

	async checkTerm(image: unknown) {
		// Do something with the job here
		this.logger.log('Start checking term...');
		return await new Promise((resolve) =>
			setTimeout(() => resolve(true), 5000),
		);
	}

	async checkPolicy(image: unknown) {
		this.logger.log('Start checking policy...');
		return await new Promise((resolve) =>
			setTimeout(() => resolve(true), 8000),
		);
	}
}
