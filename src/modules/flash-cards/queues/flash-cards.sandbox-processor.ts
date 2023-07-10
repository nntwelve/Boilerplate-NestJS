import { Logger } from '@nestjs/common';
import { SandboxedJob } from 'bullmq';

export default async function (job: SandboxedJob) {
	const logger = new Logger('Flash Card Processor');

	switch (job.name) {
		case 'optimize-size':
			const optimzied_image = await optimizeImage(job.data);
			logger.log('DONE');
			return optimzied_image;

		default:
			throw new Error('No job name match');
	}

	async function optimizeImage(image: unknown) {
		for (let index = 0; index < 10e5; index++) {
			const progress = ((index * 100) / 10e5).toFixed(2);
			logger.log(`${progress}%`);
		}
		return await new Promise((resolve) =>
			setTimeout(() => resolve(image), 1000),
		);
	}
}
