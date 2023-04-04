import { Prop } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';

export class BaseEntity {
	@Transform((value) => value.obj._id.toString())
	_id?: string;

	@Prop({ default: null })
	deleted_at?: Date;
}
