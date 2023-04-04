import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserRoleDocument = HydratedDocument<UserRole>;

export enum USER_ROLE {
	ADMIN = 'Admin',
	USER = 'User',
}

@Schema({
	collection: 'user-roles',
})
export class UserRole extends BaseEntity {
	@Prop({
		unique: true,
		default: USER_ROLE.USER,
		enum: USER_ROLE,
		required: true,
	})
	name: USER_ROLE;

	@Prop()
	description: string;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
