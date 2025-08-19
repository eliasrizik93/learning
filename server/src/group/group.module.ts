// ...existing code...
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { CardService } from '../card/card.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupController],
  providers: [GroupService, CardService],
  exports: [GroupService],
})
export class GroupModule {}
