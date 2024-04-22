import { Module } from '@nestjs/common';
import { VerifyTokenService } from './verify-token.service';
import { VerifyTokenController } from './verify-token.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';



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
  ],
  providers:[VerifyTokenService],
  controllers: [VerifyTokenController]
})
export class VerifyTokenModule {}
