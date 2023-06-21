import { User, UserDocument, UserSchema } from '../entities/user.entity';
import { createUserStub } from './stubs/user.stub';
import { Test } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import {
	closeInMongodConnection,
	rootMongooseTestModule,
} from 'src/shared/test/db/setup';

describe('UserModel', () => {
	let model: Model<UserDocument>;

	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			imports: [
				rootMongooseTestModule(),
				MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
			],
			providers: [],
		}).compile();
		model = module_ref.get<Model<UserDocument>>(getModelToken(User.name));
	});

	afterEach(async () => {
		await model.deleteMany({});
	});

	afterAll(async () => {
		await closeInMongodConnection();
	});

	describe('create', () => {
		it('should create & save user successfully', async () => {
			// Arrange
			const user_stub = createUserStub();
			const valid_user = new User({
				...user_stub,
				role: new mongoose.Types.ObjectId(),
			});
			const created_user = await model.create(valid_user);
			const saved_user = await created_user.save();
			expect(saved_user._id).toBeDefined();
			expect(saved_user.first_name).toBe(valid_user.first_name);
			expect(saved_user.last_name).toBe(valid_user.last_name);
			expect(saved_user.email).toBe(valid_user.email);
		});
		it('should insert user successfully, but the field not defined in schema should be undefined', async () => {
			// Arrange
			const user_stub = createUserStub();
			const valid_user = new User({
				...user_stub,
				role: new mongoose.Types.ObjectId(),
			});

			// Act
			// @ts-ignore
			valid_user.unknown_field = 'Some field';
			const created_user = await model.create(valid_user);
			const saved_user = await created_user.save();

			// Assert
			expect(saved_user._id).toBeDefined();
			// @ts-ignore
			expect(saved_user.unknown_field).toBeUndefined();
		});
		it('should throw error if create user without required fields', async () => {
			// Arrange
			const { gender } = createUserStub();
			const invalid_user = new User({ gender });

			// Act & Assert
			try {
				await model.create(invalid_user);
			} catch (error) {
				expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
				expect(error.errors.first_name).toBeDefined();
				expect(error.errors.last_name).toBeDefined();
				expect(error.errors.email).toBeDefined();
				expect(error.errors.username).toBeDefined();
				expect(error.errors.password).toBeDefined();
				expect(error.errors.role).toBeDefined();
			}
		});
		it('should throw error if create user does not pass match option', async () => {
			// Arrange
			const user_stub = createUserStub();
			const invalid_user = new User({
				...user_stub,
				role: new mongoose.Types.ObjectId(),
				email: 'invalid_email',
				phone_number: '123456789a',
			});

			// Act & Assert
			try {
				await model.create(invalid_user);
			} catch (error) {
				expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
				expect(error.errors.email).toBeDefined();
				expect(error.errors.phone_number).toBeDefined();
			}
		});
		it('should throw error if create user does not pass min length option', async () => {
			// Arrange
			const user_stub = createUserStub();
			const invalid_user = new User({
				...user_stub,
				role: new mongoose.Types.ObjectId(),
				first_name: 'a',
				last_name: 'b',
			});

			// Act & Assert
			try {
				await model.create(invalid_user);
			} catch (error) {
				expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
				expect(error.errors.first_name).toBeDefined();
				expect(error.errors.last_name).toBeDefined();
			}
		});
	});
});
