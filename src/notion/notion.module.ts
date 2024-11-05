import { Module } from '@nestjs/common';
import { NotionService } from './notion.service';
import { NotionController } from './notion.controller';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [UsersModule, ProjectsModule],
  providers: [NotionService],
  controllers: [NotionController],
  exports: [NotionService],
})
export class NotionModule {}
