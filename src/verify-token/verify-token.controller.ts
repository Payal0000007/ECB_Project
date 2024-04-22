import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { VerifyTokenService } from './verify-token.service';
import { get } from 'http';

@Controller('verify-token')
export class VerifyTokenController {
    constructor(private verifytokenService:VerifyTokenService){}

    @Get('profile')
    @UseInterceptors(VerifyTokenService)
    getProfile(@Req() request): { profile: any } {
        const user = request.user;
        return { profile: user };
    }
}
