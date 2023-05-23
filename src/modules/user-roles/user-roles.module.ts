import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRole, UserRoleSchema } from './entities/user-role.entity';
import { UserRolesRepository } from '@repositories/user-roles.repository';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: UserRole.name, schema: UserRoleSchema },
		]),
	],
	controllers: [UserRolesController],
	providers: [
		UserRolesService,
		{
			provide: 'UserRolesRepositoryInterface',
			useClass: UserRolesRepository,
		},
	],
	exports: [UserRolesService],
})
export class UserRolesModule {}
