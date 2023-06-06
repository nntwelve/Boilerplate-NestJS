import { FilterQuery, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';

// OUTER
import { PaginateParams } from 'src/types/common.type';

// INNER
import { UserDocument, User } from '@modules/users/entities/user.entity';
import { createUserStub } from '@modules/users/test/stubs/user.stub';
import { UsersRepository } from '@repositories/users.repository';
import { UserEntity } from './supports/user.entity';

describe('UsersRepository', () => {
	let repository: UsersRepository;
	let model: Model<UserDocument>;

	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				UsersRepository,
				{
					provide: getModelToken(User.name),
					useClass: UserEntity,
				},
			],
		}).compile();
		repository = module_ref.get<UsersRepository>(UsersRepository);
		model = module_ref.get(getModelToken(User.name));
	});

	afterEach(() => jest.clearAllMocks());

	describe('create', () => {
		it('should create new user if data given valid', async () => {
			// Arrange
			const { _id, ...user_stub } = createUserStub();
			// We must spy on all the method of the model because it just a normal method in UserModel
			// Comment this love below to see the error: `Matcher error: received value must be a mock or spy function`
			jest.spyOn(model, 'create');
			// Act
			const result = await repository.create(user_stub);

			// Assert
			expect(model.create).toBeCalled();
			expect(result).toEqual({
				...user_stub,
				_id,
			});
		});
	});

	describe('findOneById', () => {
		it('should return user if id matched', async () => {
			// Arrange
			const user_stub = createUserStub();
			jest.spyOn(model, 'findById');
			// Act
			const result = await repository.findOneById(user_stub._id.toString());
			// Assert
			expect(model.findById).toBeCalled();
			expect(result).toEqual(user_stub);
		});
	});
	describe('findOneByCondition', () => {
		it('should return user if pass filter', async () => {
			// Arrange
			const user_stub = createUserStub();
			const filter: FilterQuery<User> = { first_name: user_stub.first_name };
			jest.spyOn(model, 'findOne');
			// Act
			const result = await repository.findOneByCondition(filter);
			// Assert
			expect(model.findOne).toBeCalled();
			expect(model.findOne).toBeCalledWith({
				...filter,
				deleted_at: null, // Because our logic support soft delete, so we need add this row.
			});
			expect(result).toEqual(user_stub);
		});
	});
	describe('findAll', () => {
		it('should return list of user base on filter', async () => {
			// Arrange
			const options: PaginateParams = { offset: 0, limit: 4 };
			jest.spyOn(model, 'count');
			jest.spyOn(model, 'find');

			// Act
			const result = await repository.findAll({}, options);

			// Assert
			expect(model.count).toBeCalled();
			expect(model.count).toBeCalledWith({ deleted_at: null });
			expect(model.find).toBeCalled();
			expect(model.find).toBeCalledWith(
				{ deleted_at: null },
				undefined,
				options,
			);
			expect(result).toMatchObject({
				count: expect.any(Number),
				items: expect.any(Array),
			});
		});
	});
	describe('update', () => {
		it('should update user with given data', async () => {
			// Arrange
			const { _id, ...user_stub } = createUserStub();
			jest.spyOn(model, 'findOneAndUpdate');

			// Act
			const result = await repository.update(_id.toString(), user_stub);

			// Assert
			expect(model.findOneAndUpdate).toBeCalledWith(
				{ _id, deleted_at: null },
				user_stub,
				{ new: true },
			);
			expect(result).toEqual({ ...user_stub, _id });
		});
	});
	describe('softDelete', () => {
		it('should soft delete user with given id', async () => {
			// Arrange
			const { _id } = createUserStub();
			jest.spyOn(model, 'findByIdAndUpdate').mockReturnThis();

			// Act
			const result = await repository.softDelete(_id.toString());

			// Assert
			expect(model.findByIdAndUpdate).toBeCalledWith(_id, {
				deleted_at: expect.any(Date),
			});
			expect(result).toBeTruthy();
		});
	});
	describe('permanentlyDelete', () => {
		it('should permanently delete user with given id', async () => {
			// Arrange
			const { _id } = createUserStub();
			jest.spyOn(model, 'findByIdAndDelete');

			// Act
			const result = await repository.permanentlyDelete(_id.toString());

			// Assert
			expect(model.findByIdAndDelete).toBeCalledWith(_id);
			expect(result).toBeTruthy();
		});
	});

	describe('findAllWithSubFields', () => {
		it('should return list of user base on filter and populate sub document', async () => {
			// Arrange
			const options: PaginateParams = { offset: 0, limit: 4 };
			const populate = ['role'];
			jest.spyOn(model, 'count');
			// Typescript don't allow assign value directly to mongoose method that return Query
			jest.spyOn(model, 'find').mockReturnThis();
			jest
				.spyOn(model, 'populate')
				.mockImplementationOnce((): any => [createUserStub()]);
			// Act
			const result = await repository.findAllWithSubFields(
				{},
				{
					...options,
					populate,
				},
			);
			// Assert
			expect(model.count).toBeCalled();
			expect(model.count).toBeCalledWith({ deleted_at: null });
			expect(model.find).toBeCalled();
			expect(model.find).toBeCalledWith({ deleted_at: null }, '', {
				skip: options.offset,
				limit: options.limit,
			});
			expect(model.find().populate).toHaveBeenCalledWith(populate);
			expect(result).toMatchObject({
				count: expect.any(Number),
				items: expect.any(Array),
			});
		});
	});
});
