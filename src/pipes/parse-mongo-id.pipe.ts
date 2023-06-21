import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isObjectIdOrHexString, ObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<any, ObjectId[]> {
	transform(value: any): ObjectId[] {
		if (!value) {
			throw new BadRequestException('Invalid ID');
		}

		if (isObjectIdOrHexString(value)) {
			return value;
		}
		throw new BadRequestException('Invalid ID');
	}
}
