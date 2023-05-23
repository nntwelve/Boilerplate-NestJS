import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Address, AddressSchema } from './address.entity';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { NextFunction } from 'express';
import { FlashCardDocument } from '@modules/flash-cards/entities/flash-card.entity';
import { CollectionDocument } from '@modules/collections/entities/collection.entity';

export type UserDocument = HydratedDocument<User>;

export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export enum LANGUAGES {
	ENGLISH = 'English',
	FRENCH = 'French',
	JAPANESE = 'Japanese',
	KOREAN = 'Korean',
	SPANISH = 'Spanish',
}
@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
	toJSON: {
		getters: true,
		virtuals: true,
	},
})
export class User extends BaseEntity {
	@Prop()
	friendly_id: number;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (first_name: string) => {
			return first_name.trim();
		},
	})
	first_name: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (last_name: string) => {
			return last_name.trim();
		},
	})
	last_name: string;

	@Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	// @Expose({ name: 'mail', toPlainOnly: true })
	email: string;

	@Prop({
		type: [String],
		enum: LANGUAGES,
	})
	interested_languages: LANGUAGES[];

	@Prop({
		match: /^([+]\d{2})?\d{10}$/,
		get: (phone_number: string) => {
			if (!phone_number) {
				return;
			}
			const last_four_digits = phone_number.slice(phone_number.length - 4);
			return `***-***-${last_four_digits}`;
		},
	})
	phone_number: string;

	@Prop({
		required: true,
		unique: true,
	})
	username: string;

	@Exclude()
	@Prop({
		required: true,
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
		type: mongoose.Schema.Types.ObjectId,
		ref: UserRole.name,
	})
	@Type(() => UserRole)
	@Transform((value) => value.obj.role?.name, { toClassOnly: true })
	role: UserRole;

	@Prop()
	headline: string;

	@Prop({
		type: [
			{
				type: AddressSchema,
			},
		],
	})
	@Type(() => Address)
	address: Address[];

	@Prop({
		default: 'cus_mock_id',
	})
	@Exclude()
	stripe_customer_id: string;

	default_address?: string;

	@Prop()
	@Exclude()
	current_refresh_token: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = (
	flash_card_model: Model<FlashCardDocument>,
	collection_model: Model<CollectionDocument>,
) => {
	const user_schema = UserSchema;

	user_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const user = await this.model.findOne(this.getFilter());
		await Promise.all([
			flash_card_model
				.deleteMany({
					user: user._id,
				})
				.exec(),
			collection_model
				.deleteMany({
					user: user._id,
				})
				.exec(),
		]);
		return next();
	});
	user_schema.virtual('default_address').get(function (this: UserDocument) {
		if (this.address.length) {
			return `${(this.address[0].street && ' ') || ''}${this.address[0].city} ${
				this.address[0].state
			} ${this.address[0].country}`;
		}
	});
	return user_schema;
};
