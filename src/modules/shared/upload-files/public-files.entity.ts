import { Prop } from '@nestjs/mongoose';

export class PublicFile {
	@Prop({ required: true })
	url: string;

	@Prop({ required: true })
	key: string;
}
