import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

// INNER
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchemaFactory } from './entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';

// OUTER
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import {
	FlashCard,
	FlashCardSchema,
} from '@modules/flash-cards/entities/flash-card.entity';
import {
	Collection,
	CollectionSchema,
} from '@modules/collections/entities/collection.entity';
import { DailyCheckInModule } from '@modules/daily-check-in/daily-check-in.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory: UserSchemaFactory,
				inject: [getModelToken(FlashCard.name), getModelToken(Collection.name)],
				imports: [
					MongooseModule.forFeature([
						{ name: FlashCard.name, schema: FlashCardSchema },
						{ name: Collection.name, schema: CollectionSchema },
					]),
				],
			},
		]),
		UserRolesModule,
		DailyCheckInModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		{ provide: 'UsersRepositoryInterface', useClass: UsersRepository },
	],
	exports: [UsersService],
})
export class UsersModule {}
