import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { CardModule } from './card/card.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MessageModule,
    GroupModule,
    CardModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
