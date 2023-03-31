import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Address, AddressSchema } from './address.entity';

export type UserDocument = HydratedDocument<User>;

export enum USER_ROLE {
	ADMIN = 'Admin',
	USER = 'User',
}

export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export enum TOPIC {}
@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class User extends BaseEntity {
	@Prop({ required: true, minlength: 2, maxlength: 60 })
	first_name: string;

	@Prop({ required: true })
	last_name: string;

	@Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	email: string;

	@Prop({
		match: /^([+]\d{2})?\d{10}$/,
	})
	phone_number: string;

	@Prop({
		required: true,
		unique: true,
	})
	username: string;

	@Prop({
		required: true,
		select: false,
	})
	password: string;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar: string;

	@Prop()
	date_of_birth: Date;

	@Prop({
		enum: GENDER,
	})
	gender: GENDER;

	@Prop({ default: 0 })
	point: number;

	@Prop({
		default: USER_ROLE.USER,
		enum: USER_ROLE,
	})
	role: USER_ROLE;

	@Prop()
	headline: string;

	@Prop({
		type: AddressSchema,
	})
	address: Address;
}

export const UserSchema = SchemaFactory.createForClass(User);
