import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/schemas/user.schema';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.registerAsync({
      inject:[ConfigService],
      useFactory:(config:ConfigService)=>{
        return{
          secret:config.get('JWT_SECRET'),
          signOptions:{
            expiresIn:config.get<string | number>('JWT_EXPIRE'),
          },
        };
      },
    }),
    MongooseModule.forFeature([{name:'Users',schema:UserSchema}])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
