import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('users', {
	limiter: {
		max: 1,
		duration: 25000,
	},
	concurrency: 2,
})
export class UsersProcessor extends WorkerHost {
	@OnWorkerEvent('active')
	onQueueActive(job: Job) {
		console.log(`Job has been started: ${job.id}`);
		console.log({ data: job.data });
	}

	@OnWorkerEvent('completed')
	onQueueComplete(job: Job, result: any) {
		console.log(`Job has been finished: ${job.data}`);
		console.log({ result });
	}

	@OnWorkerEvent('failed')
	onQueueFailed(job: Job, err: any) {
		console.log(`Job has been failed: ${job.data}`);
		console.log({ err });
	}

	@OnWorkerEvent('error')
	onQueueError(err: any) {
		console.log(`Job has got error: `);
		console.log({ err });
	}

	async process(job: Job<any, any, string>, token?: string): Promise<unknown> {
		for (let index = 0; index < 10; index++) {
			console.log({ index });
			await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
		}
		return job.data;
	}
}
