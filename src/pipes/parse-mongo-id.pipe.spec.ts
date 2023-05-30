import { BadRequestException } from '@nestjs/common';
import { ParseMongoIdPipe } from './parse-mongo-id.pipe';
import * as mongoose from 'mongoose';

describe('ParseMongoIdPipe', () => {
	let pipe: ParseMongoIdPipe;
	beforeEach(() => {
		pipe = new ParseMongoIdPipe();
	});

	describe('transform', () => {
		it('should return the same value if it is a valid ObjectId', () => {
			// Arrange
			const valid_mongo_id = new mongoose.Types.ObjectId();

			// Act
			const result = pipe.transform(valid_mongo_id);

			// Assert
			expect(result).toBe(valid_mongo_id);
		});

		it('should throw a BadRequestException with "Invalid ID" error message if no value is provided', () => {
			// Arrange & Act & Assert
			expect(() => pipe.transform(undefined)).toThrowError(BadRequestException);
			expect(() => pipe.transform(undefined)).toThrowError('Invalid ID');
		});

		it('should throw a BadRequestException with "Invalid ID" error message if non-ObjectId values are provided', () => {
			// Arrange & Act & Assert
			expect(() => pipe.transform('invalid-id')).toThrowError(
				BadRequestException,
			);
			expect(() => pipe.transform('invalid-id')).toThrowError('Invalid ID');
			expect(() => pipe.transform(123)).toThrowError(BadRequestException);
			expect(() => pipe.transform(123)).toThrowError('Invalid ID');
			expect(() => pipe.transform({})).toThrowError(BadRequestException);
			expect(() => pipe.transform({})).toThrowError('Invalid ID');
		});
	});
});
