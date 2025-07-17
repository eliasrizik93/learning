import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsModule } from './cat/cats.module';
@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://eliasrizik93:IFKcb08CcdDo7LqN@eduassigncluster.mdcapra.mongodb.net/learning?retryWrites=true&w=majority&appName=EduAssignCluster`,
    ),
    CatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
