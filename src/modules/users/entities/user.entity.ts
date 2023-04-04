import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Address, AddressSchema } from './address.entity';
import { Type } from 'class-transformer';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { NextFunction } from 'express';
import { FlashCardDocument } from '@modules/flash-cards/entities/flash-card.entity';

export type UserDocument = HydratedDocument<User>;

export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export enum TOPIC {
	NATURE = 'Nature',
	FOOD = 'Food',
	SPORT = 'Sport',
	MUSIC = 'Music',
	MOVIE = 'Movie',
}
@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
})
export class User extends BaseEntity {
	@Prop()
	friendly_id: number;

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
		type: [String],
		enum: TOPIC,
	})
	interested_topics: TOPIC[];

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
		type: mongoose.Schema.Types.ObjectId,
		ref: UserRole.name,
	})
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
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = (
	flash_card_model: Model<FlashCardDocument>,
) => {
	const user_schema = UserSchema;

	user_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const doc = await this.model.findOne(this.getFilter());
		await flash_card_model
			.deleteMany({
				user: doc._id,
			})
			.exec();
		return next();
	});
	return user_schema;
};
