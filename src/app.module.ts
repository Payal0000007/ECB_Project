import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WalletModule } from './wallet/wallet.module';
import { VerifyTokenModule } from './verify-token/verify-token.module';

@Module({
   imports:[ConfigModule.forRoot({
    envFilePath:'.env',
    isGlobal:true,
   }),
   MongooseModule.forRoot(process.env.DB_URL),
   UsersModule,
   WalletModule,
   VerifyTokenModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
