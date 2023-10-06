import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose, { isObjectIdOrHexString } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe
	implements PipeTransform<any, mongoose.Types.ObjectId>
{
	transform(value: any): mongoose.Types.ObjectId {
		if (!value) {
			throw new BadRequestException('Invalid ID');
		}

		if (isObjectIdOrHexString(value)) {
			return new mongoose.Types.ObjectId(value);
		}
		throw new BadRequestException('Invalid ID');
	}
}
