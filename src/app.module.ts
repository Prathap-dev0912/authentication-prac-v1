import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../src/users/users.module';
import { ProfileModule } from '../src/profile/profile.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    UsersModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
