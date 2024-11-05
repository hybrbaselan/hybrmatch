import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Freelancer } from './entities/freelancer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Freelancer])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule {}
