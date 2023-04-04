import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserSchemaFactory } from './entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import {
	FlashCard,
	FlashCardSchema,
} from '@modules/flash-cards/entities/flash-card.entity';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory: UserSchemaFactory,
				inject: [getModelToken(FlashCard.name)],
				imports: [
					MongooseModule.forFeature([
						{ name: FlashCard.name, schema: FlashCardSchema },
					]),
				],
			},
		]),
		UserRolesModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		{ provide: 'UsersRepositoryInterface', useClass: UsersRepository },
	],
	exports: [UsersService],
})
export class UsersModule {}
